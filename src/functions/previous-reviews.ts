import { formatTime } from '../utils/time';
import type { StrictOmit } from '../utils/types';
import { globalHistory } from './history';
import type {
  AllCardsReviewHistory,
  AnyReviewHistory,
  CardKeys,
  GroupReviewHistory,
  IndividualReviewHistory,
  TestReviewHistory,
} from './reviews';
import {
  CardViewMode,
  calculateHalfLifeCoefficient,
  calculateProbability,
  initialTestS,
  maxS,
  minS,
  secondsUntilProbabilityIsHalf,
} from './reviews';

type SessionHistory = { card: CardKeys; mode: CardViewMode; success: boolean; date: number; key: string };

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

  loadInDb = (
    data: (StrictOmit<AnyReviewHistory, 'savedInDb'> & { key: string })[],
    notSavedData: (StrictOmit<AnyReviewHistory, 'savedInDb'> & { key: string })[],
    overwrite: boolean,
  ) => {
    const history = overwrite ? {} : { ...this.history };
    for (const record of data) {
      history[record.key.toLowerCase()] = {
        ...record,
        ...{ key: record.key.toLowerCase() },
        savedInDb: true,
      };
    }
    for (const record of notSavedData) {
      history[record.key.toLowerCase()] = {
        ...record,
        ...{ key: record.key.toLowerCase() },
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

  getCardHistory(card: CardKeys, mode: CardViewMode.test): TestReviewHistory | undefined;
  getCardHistory(card: CardKeys, mode: CardViewMode.individualView): IndividualReviewHistory | undefined;
  getCardHistory(card: CardKeys, mode: CardViewMode.groupView): GroupReviewHistory | undefined;
  getCardHistory(card: CardKeys, mode: CardViewMode): AnyReviewHistory | undefined {
    const key = this.getFinalKey(card, mode);
    return this.history[key];
  }
  private getFinalKey = (card: CardKeys, mode: CardViewMode) =>
    mode + '@' + (mode === CardViewMode.groupView ? card.groupViewKey : card.testKey)?.toLowerCase();

  private currentSessionCards: SessionHistory[] = [];

  getHistoryForLastPeriod = (period: number, currentDate = Date.now()) => {
    return this.currentSessionCards.filter((x) => x.date >= currentDate - period * 1000).reverse();
  };

  getLastNHistory = (n: number) => {
    return this.currentSessionCards.slice(-n).reverse();
  };

  isInSession(card: CardKeys, mode: CardViewMode, sessions = this.currentSessionCards) {
    return sessions.some((x) => x.card === card && x.mode === mode);
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  saveCardResult = (card: CardKeys, mode: CardViewMode, success: boolean, date = Date.now()) => {
    const dateInSec = Math.floor(date / 1000);
    const key = this.getFinalKey(card, mode);
    this.currentSessionCards.push({ card, mode, success, date, key });
    const history = { ...this.history };

    let newValue: AnyReviewHistory;

    if (mode === CardViewMode.groupView || mode === CardViewMode.individualView) {
      const currentValue = history[key] as IndividualReviewHistory | GroupReviewHistory;
      if (currentValue) {
        newValue = history[key] = {
          ...currentValue,
          lastDate: dateInSec,
          repetition: currentValue.repetition + 1,
          savedInDb: false,
        };
      } else {
        newValue = history[key] = {
          firstDate: dateInSec,
          lastDate: dateInSec,
          repetition: 1,
          savedInDb: false,
        };
      }
    } else {
      const isGroup = !!card.groupViewKey;
      const currentValue = history[key] as TestReviewHistory;
      if (currentValue) {
        const passedTime = dateInSec - currentValue.lastDate;
        newValue = history[key] = {
          ...currentValue,
          lastDate: dateInSec,
          repetition: currentValue.repetition + 1,
          lastS: updateS(success, isGroup, currentValue.lastS, passedTime),
          lastHasFailed: !success,
          savedInDb: false,
        };
      } else {
        newValue = history[key] = {
          firstDate: dateInSec,
          lastDate: dateInSec,
          repetition: 1,
          lastS: updateS(success, isGroup, undefined, undefined),
          lastHasFailed: !success,
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
  else if (!s) return Math.max(minS, initialTestS * 0.5);

  const probability = passedTimeInSeconds === undefined ? 0 : calculateProbability(passedTimeInSeconds, s);
  const successDoubleCoeff = Math.max(0.1, 1 - Math.max(0, probability - 0.5) * 2);

  const coeffS = s;
  let successMultiplier;
  if (coeffS < calculateHalfLifeCoefficient(60 * 3)) {
    successMultiplier = isGroup ? calcMultipler(coeffS, 60 * 3) : calcMultipler(coeffS, 60 * 2);
  } else if (coeffS < calculateHalfLifeCoefficient(60 * 6)) {
    successMultiplier = isGroup ? calcMultipler(coeffS, 60 * 4) : calcMultipler(coeffS, 60 * 3);
  } else if (coeffS < calculateHalfLifeCoefficient(60 * 20)) successMultiplier = isGroup ? 3 : 2.5;
  else if (coeffS < calculateHalfLifeCoefficient(60 * 60 * 4)) successMultiplier = isGroup ? 9 : 6;
  else if (coeffS < calculateHalfLifeCoefficient(60 * 60 * 24)) successMultiplier = isGroup ? 5 : 3;
  else if (coeffS < calculateHalfLifeCoefficient(60 * 60 * 24 * 2)) successMultiplier = isGroup ? 3 : 2;
  else successMultiplier = isGroup ? 1.8 : 1.5;

  successMultiplier = (successMultiplier - 1) * successDoubleCoeff + 1;

  return Math.min(maxS, Math.max(minS, success ? coeffS * successMultiplier : coeffS * 0.5));
};

const calcMultipler = (s: number, addedHalfTimeSeconds: number) => {
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
// eslint-disable-next-line no-constant-condition
if (1 > 2) {
  console.log('zzzz', getFirstNS(15).map(formatTime));
}
