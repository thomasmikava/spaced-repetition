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
  private static getLastReviewHistory = (): AllCardsReviewHistory => {
    try {
      const value = JSON.parse(localStorage.getItem(REVIEWS_HISTORY_KEY) || '');
      if (!value || typeof value !== 'object') return {};
      return value;
    } catch (e) {
      return {};
    }
  };

  private static _history?: AllCardsReviewHistory;
  private static get history(): AllCardsReviewHistory {
    if (this._history) return this._history;
    return (this._history = this.getLastReviewHistory());
  }
  private static set history(value: AllCardsReviewHistory) {
    this._history = value;
    localStorage.setItem(REVIEWS_HISTORY_KEY, JSON.stringify(value));
  }

  static getCardHistory(card: CardKeys, mode: CardViewMode.test): TestReviewHistory | undefined;
  static getCardHistory(card: CardKeys, mode: CardViewMode.individualView): IndividualReviewHistory | undefined;
  static getCardHistory(card: CardKeys, mode: CardViewMode.groupView): GroupReviewHistory | undefined;
  static getCardHistory(card: CardKeys, mode: CardViewMode): AnyReviewHistory | undefined {
    const key = this.getFinalKey(card, mode);
    return this.history[key];
  }
  private static getFinalKey = (card: CardKeys, mode: CardViewMode) =>
    mode + '@' + (mode === CardViewMode.groupView ? card.groupViewKey : card.testKey);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  static saveCardResult = (card: CardKeys, mode: CardViewMode, success: boolean) => {
    const key = this.getFinalKey(card, mode);
    const history = { ...this.history };

    if (mode === CardViewMode.groupView || mode === CardViewMode.individualView) {
      const currentValue = history[key] as IndividualReviewHistory | GroupReviewHistory;
      if (currentValue) {
        history[key] = {
          ...currentValue,
          lastDate: Date.now(),
          repetition: currentValue.repetition + 1,
        };
      } else {
        history[key] = {
          firstDate: Date.now(),
          lastDate: Date.now(),
          repetition: 1,
        };
      }
    } else {
      const currentValue = history[key] as TestReviewHistory;
      if (currentValue) {
        history[key] = {
          ...currentValue,
          lastDate: Date.now(),
          repetition: currentValue.repetition + 1,
          lastS: Math.min(maxS, Math.max(minS, success ? currentValue.lastS * 1.2 : currentValue.lastS * 0.8)),
          lastHasFailed: !success ? true : undefined,
        };
      } else {
        history[key] = {
          firstDate: Date.now(),
          lastDate: Date.now(),
          repetition: 1,
          lastS: initialS,
          lastHasFailed: !success ? true : undefined,
        };
      }
    }
    this.history = history;
  };
}
