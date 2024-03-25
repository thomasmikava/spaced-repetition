import type {
  AllCardsReviewHistory,
  AnyReviewHistory,
  CardKeys,
  GroupReviewHistory,
  IndividualReviewHistory,
  TestReviewHistory,
} from './reviews';
import { CardViewMode, initialS, maxS, minS } from './reviews';

const REVIEWS_HISTORY_KEY = 'lastReviewHistory';

export class PreviousReviews {
  constructor(private avoidStorage = false) {}
  private getLastReviewHistory = (): AllCardsReviewHistory => {
    if (this.avoidStorage) return {};
    try {
      const value = JSON.parse(localStorage.getItem(REVIEWS_HISTORY_KEY) || '');
      if (!value || typeof value !== 'object') return {};
      return value;
    } catch (e) {
      return {};
    }
  };

  private _history?: AllCardsReviewHistory;
  private get history(): AllCardsReviewHistory {
    if (this._history) return this._history;
    return (this._history = this.getLastReviewHistory());
  }
  private set history(value: AllCardsReviewHistory) {
    this._history = value;
    if (!this.avoidStorage) localStorage.setItem(REVIEWS_HISTORY_KEY, JSON.stringify(value));
  }

  getCardHistory(card: CardKeys, mode: CardViewMode.test): TestReviewHistory | undefined;
  getCardHistory(card: CardKeys, mode: CardViewMode.individualView): IndividualReviewHistory | undefined;
  getCardHistory(card: CardKeys, mode: CardViewMode.groupView): GroupReviewHistory | undefined;
  getCardHistory(card: CardKeys, mode: CardViewMode): AnyReviewHistory | undefined {
    const key = this.getFinalKey(card, mode);
    return this.history[key];
  }
  private getFinalKey = (card: CardKeys, mode: CardViewMode) =>
    mode + '@' + (mode === CardViewMode.groupView ? card.groupViewKey : card.testKey);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  saveCardResult = (card: CardKeys, mode: CardViewMode, success: boolean, date = Date.now()) => {
    const key = this.getFinalKey(card, mode);
    const history = { ...this.history };

    if (mode === CardViewMode.groupView || mode === CardViewMode.individualView) {
      const currentValue = history[key] as IndividualReviewHistory | GroupReviewHistory;
      if (currentValue) {
        history[key] = {
          ...currentValue,
          lastDate: date,
          repetition: currentValue.repetition + 1,
        };
      } else {
        history[key] = {
          firstDate: date,
          lastDate: date,
          repetition: 1,
        };
      }
    } else {
      const isGroup = !!card.groupViewKey;
      const currentValue = history[key] as TestReviewHistory;
      if (currentValue) {
        history[key] = {
          ...currentValue,
          lastDate: date,
          repetition: currentValue.repetition + 1,
          lastS: updateS(success, isGroup, currentValue.lastS),
          lastHasFailed: !success ? true : undefined,
        };
      } else {
        history[key] = {
          firstDate: date,
          lastDate: date,
          repetition: 1,
          lastS: updateS(success, isGroup, initialS),
          lastHasFailed: !success ? true : undefined,
        };
      }
    }
    this.history = history;
  };
}

const updateS = (success: boolean, isGroup: boolean, s?: number) => {
  if (!s && success) return initialS;
  const coeffS = s ?? initialS;
  const successMultiplier = isGroup ? 1.6 : 1.2;
  return Math.min(maxS, Math.max(minS, success ? coeffS * successMultiplier : coeffS * 0.8));
};
