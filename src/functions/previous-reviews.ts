/* eslint-disable sonarjs/cognitive-complexity */
import {
  ReviewBlock,
  type MinimalReviewRecordDTO,
  type ReviewWithOptionalDTO,
} from '../api/controllers/history/history.schema';
import type { ModifierState } from '../Pages/Review/StateModifier';
import { arrayToObject, isNonNullable } from '../utils/array';
import { formatTime } from '../utils/time';
import { globalHistory } from './history';
import { getVariantTestId } from './modifier-states';
import type { AllCardsReviewHistory, AnyReviewHistory, CardKeys, StandardTestableCard } from './reviews';
import {
  CardViewMode,
  calculateHalfLifeCoefficient,
  calculateProbability,
  dueDateUntilProbabilityIsHalf,
  getRecordUniqueKey,
  initialTestS,
  maxS,
  minS,
  secondsUntilProbabilityIsHalf,
} from './reviews';

type SessionHistory = { card: CardKeys; mode: CardViewMode; success: boolean; date: number; key: string };

type WordIndexHistory = Record<number, AnyReviewHistory[] | undefined>;

export class PreviousReviews {
  constructor(private avoidStorage = false) {
    if (!this.avoidStorage) {
      globalHistory.subscribe((value) => {
        if (value.updater !== this.id) {
          this._history = value.data;
        }
      });
    }
  }
  private id = Math.random();
  getLastReviewHistory = (): AllCardsReviewHistory => {
    if (this.avoidStorage) return {};
    try {
      return globalHistory.getMetaData() || {};
    } catch (e) {
      return {};
    }
  };

  private historyWordsIndexObj = new WeakMap<AllCardsReviewHistory, WordIndexHistory>();
  private getWordsIndexObject = (history: AllCardsReviewHistory) => {
    const record = this.historyWordsIndexObj.get(history);
    if (record === undefined) {
      const newRecord = Object.entries(history).reduce<WordIndexHistory>((acc, [, value]) => {
        if (value) {
          const wordId = value.wordId;
          if (wordId) {
            if (!acc[wordId]) acc[wordId] = [];
            acc[wordId]!.push(value);
          }
        }
        return acc;
      }, {});
      this.historyWordsIndexObj.set(history, newRecord);
      return newRecord;
    }
    return record;
  };

  getWordsIndex = () => {
    return this.getWordsIndexObject(this.history);
  };

  /**
   * null - no record is found
   * Infinity - word is studied and there will be no review
   */
  getClosestDueDate = (block: number, wordId: number) => {
    const wordsIndex = this.getWordsIndexObject(this.history);
    const wordHistory = wordsIndex[wordId];
    if (!wordHistory) return null;
    const dueDates = wordHistory
      .filter((e) => e.block === block || e.block === ReviewBlock.universal)
      .map((e) => e.dueDate ?? Infinity);
    if (dueDates.length === 0) return null;
    return Math.min(...dueDates);
  };
  getDueCardsCount = (block: number, wordId: number, accordingToDate = new Date()) => {
    const wordsIndex = this.getWordsIndexObject(this.history);
    const wordHistory = wordsIndex[wordId];
    if (!wordHistory) return 0;
    const dueDateSec = Math.floor(accordingToDate.getTime() / 1000);
    return wordHistory.filter(
      (e) => (e.block === block || e.block === ReviewBlock.universal) && e.dueDate && e.dueDate < dueDateSec,
    ).length;
  };

  markAsSavedInDb = (keys: string[]) => {
    if (!keys.length) return;
    const history = { ...this.history };
    for (const key of keys) {
      const value = history[key];
      if (value) {
        history[key] = { ...value, savedInDb: true };
      }
    }
    this.history = history;
  };

  loadInDb = (data: MinimalReviewRecordDTO[], notSavedData: ReviewWithOptionalDTO[], overwrite: boolean) => {
    const history = overwrite ? {} : { ...this.history };
    for (const record of data) {
      const key = getRecordUniqueKey(record);
      history[key] = {
        ...record,
        uniqueKey: key,
        savedInDb: true,
      };
    }
    for (const record of notSavedData) {
      const key = getRecordUniqueKey(record);
      history[key] = {
        ...record,
        uniqueKey: key,
        savedInDb: false,
      };
    }
    this.history = history;
  };

  private _history?: AllCardsReviewHistory;
  private get history(): AllCardsReviewHistory {
    if (this._history) return this._history;
    return (this._history = this.getLastReviewHistory());
  }
  private set history(value: AllCardsReviewHistory) {
    this._history = value;
    if (!this.avoidStorage) {
      globalHistory.broadcast({ updater: this.id, data: value });
      globalHistory.setMetaData(value);
    }
  }

  getHistoryRecords = () => {
    return Object.values(this.history).filter(isNonNullable);
  };

  getCardHistory(card: StandardTestableCard, mode: CardViewMode, block: number): AnyReviewHistory | undefined {
    const key = this.getFinalKey(card, mode, block);
    if (!key) return undefined;
    return this.history[key];
  }

  private getFinalKey(card: StandardTestableCard, mode: CardViewMode, block: number): string | null {
    const sKey = this.getSKey(card, mode);
    if (!sKey) return null;
    return getRecordUniqueKey({ wordId: card.card.id, sKey, block });
  }

  private getTestSKey = (testKey: string) => {
    return `${CardViewMode.test}@${testKey}`;
  };

  private getSKey = (card: StandardTestableCard, mode: CardViewMode) => {
    if (mode === CardViewMode.test || mode === CardViewMode.individualView) {
      if (!card.testKey) return null;
      return `${mode}@${card.testKey}`;
    } else if (mode === CardViewMode.groupView) {
      if (!card.groupViewKey) return null;
      return `${mode}@${card.groupViewKey}`;
    }
    throw new Error('Unknown card view mode: ' + mode);
  };

  private getModifierSKey = (modifier: ModifierState) => {
    switch (modifier.type) {
      case 'card':
        return `m@f`;
      case 'group':
        return `m@g_${modifier.groupId}`;
      case 'variant':
        return `m@v_${getVariantTestId(modifier.variantId, modifier.testViewId)}`;
      default:
        throw new Error('Unknown modifier type: ' + (modifier as ModifierState).type);
    }
  };

  private currentSessionCards: SessionHistory[] = [];

  getHistoryForLastPeriod = (period: number, currentDate = Date.now()) => {
    return this.currentSessionCards.filter((x) => x.date >= currentDate - period * 1000).reverse();
  };

  getLastNHistory = (n: number) => {
    return this.currentSessionCards.slice(-n).reverse();
  };

  getCurrentSessionCardsCount = () => this.currentSessionCards.length;

  isInSession(card: CardKeys, mode: CardViewMode, sessions = this.currentSessionCards) {
    return sessions.some((x) => x.card === card && x.mode === mode);
  }

  removeDueDates = (recordKeys: string[]) => {
    if (recordKeys.length === 0) return;
    console.log('removing due dates from', recordKeys);

    const history = { ...this.history };

    for (const key of recordKeys) {
      const value = history[key];
      if (value && value.dueDate !== null && value.dueDate !== undefined) {
        history[key] = {
          ...value,
          dueDate: null,
          savedInDb: false,
        };
      }
    }

    this.history = history;
  };

  fixDueDates = (updates: { hId: number; dueDate: number | null }[]) => {
    if (updates.length === 0) return;
    console.log('fixing due dates', updates);
    const historyIdToKey = arrayToObject(Object.entries(this.history), ([key, value]) => ({
      key: value?.id ?? '',
      value: key,
    }));
    const history = { ...this.history };

    for (const update of updates) {
      const key = historyIdToKey[update.hId];
      if (!key) continue;
      const record = this.history[key];
      if (!record) continue;
      history[key] = {
        ...record,
        dueDate: update.dueDate,
        savedInDb: false,
      };
    }
    this.history = history;
  };

  convertConnectedKeysToTestKeys = (card: StandardTestableCard) => {
    if (!card.connectedTestKeys) return undefined;
    return card.connectedTestKeys
      .map(({ block, key }) => {
        return getRecordUniqueKey({ wordId: card.card.id, sKey: this.getTestSKey(key), block });
      })
      .filter(isNonNullable);
  };

  getMaxS = (card: StandardTestableCard): number | undefined => {
    const historyKeys = this.convertConnectedKeysToTestKeys(card);
    const tests = historyKeys?.map((key) => this.history[key]?.lastS).filter(isNonNullable);
    if (!tests || tests.length === 0) return undefined;
    return tests.reduce((acc, cur) => Math.max(acc, cur), 0);
  };

  getMaxViewDate = (card: StandardTestableCard): number | undefined => {
    const historyKeys = this.convertConnectedKeysToTestKeys(card);
    const tests = historyKeys?.map((key) => this.history[key]?.lastDate).filter(isNonNullable);
    if (!tests || tests.length === 0) return undefined;
    return tests.reduce((acc, cur) => Math.max(acc, cur), 0);
  };

  saveCardResult = (
    block: number,
    card: StandardTestableCard,
    mode: CardViewMode,
    success: boolean,
    willThereBeAnotherRepetition: boolean,
    date = Date.now(),
    customNewS: number | undefined = undefined,
  ) => {
    const dateInSec = Math.floor(date / 1000);
    const sKey = this.getSKey(card, mode);
    if (!sKey) throw new Error('sKey is not defined');
    const key = getRecordUniqueKey({ wordId: card.card.id, sKey, block });
    this.currentSessionCards.push({ card, mode, success, date, key });
    const history = { ...this.history };
    const newS = customNewS ?? this.getNewS(card, mode, success, block, date);

    let newValue: AnyReviewHistory;

    if (mode === CardViewMode.groupView || mode === CardViewMode.individualView) {
      const currentValue = history[key];
      if (currentValue) {
        newValue = history[key] = {
          ...currentValue,
          lc: success,
          lastDate: dateInSec,
          corr: success ? currentValue.corr + 1 : currentValue.corr,
          rep: currentValue.rep + 1,
          lastS: newS,
          savedInDb: false,
        };
      } else {
        newValue = history[key] = {
          uniqueKey: key,
          sKey,
          // viewMode: mode,
          corr: success ? 1 : 0,
          rep: 1,
          lc: success,
          lastDate: dateInSec,
          wordId: card.card.id,
          block,
          lastS: newS,
          dueDate: null,
          savedInDb: false,
        };
      }
    } else {
      if (typeof newS !== 'number') throw new Error('new S must be number');
      const currentValue = history[key];

      if (currentValue) {
        const dueDate = willThereBeAnotherRepetition
          ? dateInSec + dueDateUntilProbabilityIsHalf(dateInSec, dateInSec, newS)
          : null;
        newValue = history[key] = {
          ...currentValue,
          lc: success,
          lastDate: dateInSec,
          corr: success ? currentValue.corr + 1 : currentValue.corr,
          rep: currentValue.rep + 1,
          lastS: newS,
          dueDate,
          savedInDb: false,
        };
      } else {
        const dueDate = willThereBeAnotherRepetition
          ? dateInSec + dueDateUntilProbabilityIsHalf(dateInSec, dateInSec, newS)
          : null;
        newValue = history[key] = {
          uniqueKey: key,
          sKey,
          lc: success,
          lastDate: dateInSec,
          corr: success ? 1 : 0,
          rep: 1,
          wordId: card.card.id,
          block,
          lastS: newS,
          dueDate,
          savedInDb: false,
        };
      }
    }
    this.history = history;
    return { newValue, key };
  };

  saveModifierStates = (
    card: StandardTestableCard,
    modifierStates: ModifierState[],
    date = Date.now(),
    block = ReviewBlock.universal,
  ) => {
    if (!modifierStates.length) return [];
    const dateInSec = Math.floor(date / 1000);
    const history = { ...this.history };

    const result: { newValue: AnyReviewHistory; key: string }[] = [];

    for (const modifierState of modifierStates) {
      const sKey = this.getModifierSKey(modifierState);
      const key = getRecordUniqueKey({ wordId: card.card.id, sKey, block });

      const newValue: AnyReviewHistory = {
        uniqueKey: key,
        sKey,
        lc: true,
        lastDate: dateInSec,
        corr: modifierState.value,
        rep: 0,
        wordId: card.card.id,
        block,
        lastS: null,
        dueDate: null,
        savedInDb: false,
      };
      history[key] = newValue;
      result.push({ newValue, key });
    }

    this.history = history;
    return result;
  };

  getCurrentS = (card: StandardTestableCard, mode: CardViewMode, block: number) => {
    const sKey = this.getSKey(card, mode);
    if (!sKey) throw new Error('sKey is not defined');
    const key = getRecordUniqueKey({ wordId: card.card.id, sKey, block });

    const currentValue = this.history[key];
    if (currentValue) {
      return currentValue.lastS ?? null;
    } else {
      return null;
    }
  };

  getNewS = (card: StandardTestableCard, mode: CardViewMode, success: boolean, block: number, date = Date.now()) => {
    const dateInSec = Math.floor(date / 1000);

    const sKey = this.getSKey(card, mode);
    if (!sKey) throw new Error('sKey is not defined');
    const key = getRecordUniqueKey({ wordId: card.card.id, sKey, block });

    if (mode === CardViewMode.groupView || mode === CardViewMode.individualView) {
      return null;
    }

    const isGroup = !!card.groupViewKey;
    const currentValue = this.history[key];

    const maxConnectedTestS = this.getMaxS(card);

    if (currentValue) {
      const updatedCorrectnessRatio = (success ? currentValue.corr + 1 : currentValue.corr) / (currentValue.rep + 1);
      const passedTime = dateInSec - currentValue.lastDate;
      return updateS(
        success,
        isGroup,
        currentValue.lastS ?? initialTestS,
        passedTime,
        maxConnectedTestS,
        updatedCorrectnessRatio,
      );
    } else {
      const updatedCorrectnessRatio = success ? 1 : 0;
      return updateS(success, isGroup, undefined, undefined, maxConnectedTestS, updatedCorrectnessRatio);
    }
  };
}

const updateS = (
  success: boolean,
  isGroup: boolean,
  s: number | undefined,
  passedTimeInSeconds: number | undefined,
  maxConnectedTestS: number | undefined,
  correctnessRatio?: number,
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const sBasedOnConnectedVariants = getSBasedOnConnectedVariants(maxConnectedTestS, correctnessRatio);

  if (!s && success)
    return Math.max(initialTestS, sBasedOnConnectedVariants, getSBasedOnLastAnswer(0, passedTimeInSeconds ?? 0));
  else if (!s) return getSAfterIncorrectAnswer(initialTestS);
  if (!success) return getSAfterIncorrectAnswer(s);

  const newNormalS = getRegularSAfterSuccess(isGroup, s, passedTimeInSeconds);
  const sBasedOnLastAnswerValue = getSBasedOnLastAnswer(s, passedTimeInSeconds ?? 0);
  const newS = Math.max(newNormalS, sBasedOnLastAnswerValue);
  const fluctuatedNewS = getFluctuatedS(s, newS);

  return Math.min(maxS, Math.max(minS, fluctuatedNewS));
};

const getFluctuatedS = (oldS: number, newS: number): number => {
  const diffTime = secondsUntilProbabilityIsHalf(newS) - secondsUntilProbabilityIsHalf(oldS);
  const diffTimeAbs = Math.abs(diffTime);

  let range = 0.03;
  if (diffTimeAbs < 60 * 5) range = 0.1;
  else if (diffTimeAbs < 60 * 60) range = 0.15;
  else if (diffTimeAbs < 24 * 60 * 60) range = 0.2;
  else if (diffTimeAbs < 10 * 24 * 60 * 60) range = 0.1;

  const random = 2 * Math.random() * range - range;
  const timeToAdd = diffTime * (1 + random);
  const sToAdd = calculateHalfLifeCoefficient(timeToAdd);
  return oldS + sToAdd;
};

const getSBasedOnConnectedVariants = (
  maxConnectedTestS: number | undefined,
  correctnessRatio: number | undefined,
): number => {
  return maxConnectedTestS &&
    typeof maxConnectedTestS === 'number' &&
    !isNaN(maxConnectedTestS) &&
    typeof correctnessRatio === 'number'
    ? ((maxConnectedTestS * 2) / 3) * correctnessRatio
    : -Infinity;
};

const getSAfterIncorrectAnswer = (s: number) => {
  return Math.max(minS, s * 0.5);
};

const getRegularSAfterSuccess = (isGroup: boolean, s: number, passedTimeInSeconds: number | undefined) => {
  let successMultiplier;

  const probability =
    passedTimeInSeconds === undefined ? 0 : calculateProbability(Math.max(30, passedTimeInSeconds), s);
  let minDoubleCoeff = 0.05;

  if (s >= calculateHalfLifeCoefficient(60 * 20) && s < calculateHalfLifeCoefficient(60 * 60 * 4)) {
    minDoubleCoeff = 0.02;
  }

  let successDoubleCoeff = Math.max(minDoubleCoeff, 1 - Math.max(0, probability - 0.5) * 2);

  if (s < calculateHalfLifeCoefficient(60 * 6)) {
    successMultiplier = isGroup ? calcMultiplierToAdd(s, 60 * 4) : calcMultiplierToAdd(s, 60 * 3); // add minutes to the half-life
  } else if (s < calculateHalfLifeCoefficient(60 * 20)) successMultiplier = isGroup ? 3 : 2.5;
  else if (s < calculateHalfLifeCoefficient(60 * 60 * 4)) successMultiplier = isGroup ? 6 : 4;
  else if (s < calculateHalfLifeCoefficient(60 * 60 * 24)) successMultiplier = isGroup ? 5 : 3;
  else if (s < calculateHalfLifeCoefficient(60 * 60 * 24 * 2)) successMultiplier = isGroup ? 3 : 2;
  else successMultiplier = isGroup ? 1.8 : 1.5;

  if (s < calculateHalfLifeCoefficient(60 * 20)) {
    successDoubleCoeff = Math.max(0.8, successDoubleCoeff);
  }

  const finalMultiplier = (successMultiplier - 1) * successDoubleCoeff + 1;

  return s * finalMultiplier;
};
const getSBasedOnLastAnswer = (s: number, passedTimeInSeconds: number) => {
  const halfLife = secondsUntilProbabilityIsHalf(s);

  if (halfLife * 1.2 > passedTimeInSeconds) {
    return s; // let's not alter s if half life is still in future
  }

  let maxHalfLife: number;
  if (passedTimeInSeconds < 60 * 60 * 24) {
    maxHalfLife = passedTimeInSeconds;
  } else if (passedTimeInSeconds < 5 * 60 * 60 * 24) {
    maxHalfLife = Math.min(
      Math.max(halfLife * 4, 60 * 60 * 24),
      60 * 60 * 24 + (passedTimeInSeconds - 60 * 60 * 24) * 0.5,
    );
  } else maxHalfLife = Math.min(Math.max(halfLife * 2, 3 * 60 * 60 * 24), 10 * 60 * 60 * 24);

  return calculateHalfLifeCoefficient(Math.min(maxHalfLife, passedTimeInSeconds));
};
console.log('x', getSBasedOnLastAnswer(0, 0));

const calcMultiplierToAdd = (s: number, addedHalfTimeSeconds: number) => {
  const currentHalfLife = secondsUntilProbabilityIsHalf(s);
  const newHalfLife = currentHalfLife + addedHalfTimeSeconds;
  const newS = calculateHalfLifeCoefficient(newHalfLife);
  return newS / s;
};

function getFirstNS(n: number) {
  let currentS = initialTestS;
  let passedTimeInSeconds = secondsUntilProbabilityIsHalf(currentS);
  const result = [passedTimeInSeconds];
  for (let i = 1; i < n; i++) {
    currentS = updateS(true, false, currentS, passedTimeInSeconds, undefined);
    passedTimeInSeconds = secondsUntilProbabilityIsHalf(currentS);
    result.push(passedTimeInSeconds);
  }
  return result;
}

function getFirstNSFast(n: number, multiplyBy2 = true) {
  let currentS = initialTestS;
  let passedTimeInSeconds = 5;
  const result = [secondsUntilProbabilityIsHalf(currentS)];
  for (let i = 1; i < n; i++) {
    currentS = updateS(true, false, currentS, passedTimeInSeconds, undefined);
    if (multiplyBy2) {
      passedTimeInSeconds *= 2;
      passedTimeInSeconds = Math.min(passedTimeInSeconds, 60 * 60 * 24 * 15);
    }
    result.push(secondsUntilProbabilityIsHalf(currentS));
  }
  return result;
}

function getFirstNSSlow(n: number) {
  let currentS = initialTestS;
  let passedTimeInSeconds = 60 * 60 * 5;
  const result = [secondsUntilProbabilityIsHalf(currentS)];
  for (let i = 1; i < n; i++) {
    currentS = updateS(true, false, currentS, passedTimeInSeconds, undefined);
    passedTimeInSeconds *= 2;
    passedTimeInSeconds = Math.min(passedTimeInSeconds, 60 * 60 * 24 * 15);
    result.push(secondsUntilProbabilityIsHalf(currentS));
  }
  return result;
}
// eslint-disable-next-line no-constant-condition
if (1 > 2) {
  console.log('zzzz', getFirstNS(15).map(formatTime));
  console.log('zzzz super fast', getFirstNSFast(20, false).map(formatTime));
  console.log('zzzz fast', getFirstNSFast(20).map(formatTime));
  console.log('zzzz slow', getFirstNSSlow(20).map(formatTime));
}
// (window as any).formatTime = formatTime;
