/* eslint-disable sonarjs/cognitive-complexity */
import type { MinimalReviewRecordDTO, ReviewWithOptionalDTO } from '../api/controllers/history/history.schema';
import { isNonNullable } from '../utils/array';
import { formatTime } from '../utils/time';
import { globalHistory } from './history';
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

  getClosestDueDate = (wordId: number) => {
    const wordsIndex = this.getWordsIndexObject(this.history);
    const wordHistory = wordsIndex[wordId];
    if (!wordHistory) return Infinity;
    const dueDates = wordHistory.map((e) => e.dueDate ?? Infinity);
    if (dueDates.length === 0) return Infinity;
    return Math.min(...dueDates);
  };
  getDueCardsCount = (wordId: number, accordingToDate = new Date()) => {
    const wordsIndex = this.getWordsIndexObject(this.history);
    const wordHistory = wordsIndex[wordId];
    if (!wordHistory) return 0;
    const dueDateSec = Math.floor(accordingToDate.getTime() / 1000);
    return wordHistory.filter((e) => e.dueDate && e.dueDate < dueDateSec).length;
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

  getCardHistory(card: StandardTestableCard, mode: CardViewMode): AnyReviewHistory | undefined {
    const key = this.getFinalKey(card, mode);
    if (!key) return undefined;
    return this.history[key];
  }

  private getFinalKey(card: StandardTestableCard, mode: CardViewMode): string | null {
    const sKey = this.getSKey(card, mode);
    if (!sKey) return null;
    return getRecordUniqueKey({ wordId: card.card.id, sKey });
  }

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

  saveCardResult = (
    card: StandardTestableCard,
    mode: CardViewMode,
    success: boolean,
    willThereBeAnotherRepetition: boolean,
    date = Date.now(),
  ) => {
    const dateInSec = Math.floor(date / 1000);
    const sKey = this.getSKey(card, mode);
    if (!sKey) throw new Error('sKey is not defined');
    const key = getRecordUniqueKey({ wordId: card.card.id, sKey });
    this.currentSessionCards.push({ card, mode, success, date, key });
    const history = { ...this.history };

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
          lastS: null,
          dueDate: null,
          savedInDb: false,
        };
      }
    } else {
      const isGroup = !!card.groupViewKey;
      const currentValue = history[key];
      if (currentValue) {
        const passedTime = dateInSec - currentValue.lastDate;
        const newS = updateS(success, isGroup, currentValue.lastS ?? initialTestS, passedTime);
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
        const newS = updateS(success, isGroup, undefined, undefined);
        const dueDate = willThereBeAnotherRepetition
          ? dateInSec + dueDateUntilProbabilityIsHalf(dateInSec, dateInSec, newS)
          : null;
        newValue = history[key] = {
          uniqueKey: key,
          sKey,
          // viewMode: mode,
          lc: success,
          lastDate: dateInSec,
          corr: success ? 1 : 0,
          rep: 1,
          wordId: card.card.id,
          lastS: newS,
          dueDate,
          savedInDb: false,
        };
      }
    }
    this.history = history;
    return { newValue, key };
  };
}

const updateS = (
  success: boolean,
  isGroup: boolean,
  s: number | undefined,
  passedTimeInSeconds: number | undefined,
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  if (!s && success) return initialTestS;
  else if (!s) return getSAfterIncorrectAnswer(initialTestS);
  if (!success) return getSAfterIncorrectAnswer(s);

  const newS = getRegularSAfterSuccess(isGroup, s, passedTimeInSeconds);
  const sBasedOnLastAnswerValue = getSBasedOnLastAnswer(s, passedTimeInSeconds ?? 0);

  return Math.min(maxS, Math.max(minS, newS, sBasedOnLastAnswerValue));
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
    currentS = updateS(true, false, currentS, passedTimeInSeconds);
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
    currentS = updateS(true, false, currentS, passedTimeInSeconds);
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
    currentS = updateS(true, false, currentS, passedTimeInSeconds);
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
