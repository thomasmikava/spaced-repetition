/* eslint-disable no-debugger */
/* eslint-disable sonarjs/cognitive-complexity */
import type { UserPreferencesDTO } from '../api/controllers/users/users.schema';
import type { StandardCard } from '../database/types';
import { uniquelize } from '../utils/array';
import type { Helper } from './generate-card-content';
import { generateTestableCards } from './generate-variants';
import { calculatePreferences } from './preferences';
import { PreviousReviews } from './previous-reviews';
import type { StandardTestableCard, AnyReviewHistory } from './reviews';
import {
  CardViewMode,
  DEFAULT_REVIEW_DUE,
  LAST_CARDS_COUNT_TO_CONSIDER,
  LAST_PERIOD_TO_CONSIDER,
  LAST_PERIOD_TO_CONSIDER_SMALL,
  MAX_NUM_OF_GROUP_VIEW_CARDS,
  MAX_NUM_OF_VIEW_CARDS,
  REVIEW_MAX_DUE,
  REVIEW_MAX_DUE_FOR_HIGH_PROB,
  calculateProbability,
  dueDateUntilProbabilityIsHalf,
  getRecordUniqueKey,
  initialTestS,
  initialViewS,
} from './reviews';
import { addUpdatedItemsInStorage, getDbRecord } from './storage';

export interface CardWithProbability {
  record: StandardTestableCard;
  historyRecord?: AnyReviewHistory;
  reviewRecord?: AnyReviewHistory;
  groupVewRecord?: AnyReviewHistory;
  probability: number;
  isCriticalForReview?: boolean;
  isReadyForReview?: boolean;
  reviewCoefficient: number;
  isTested: boolean;
  willBeTested: boolean;
  wasLastTestCorrect: boolean | undefined;
  isIndividuallyViewed: boolean;
  isViewedInGroup: boolean;
  hasGroupViewMode: boolean;
  hasIndividualViewMode: boolean;
  isBlockedByPreviousGroup: boolean;
  reviewDue: number;
  groupLevel: number;
  dueDate: number;
}

const HISTORY_ID_TO_OBSERVE = -2876;

export class Reviewer {
  private allTestableCards: StandardTestableCard[];
  prevReviews: PreviousReviews;
  // eslint-disable-next-line sonarjs/cognitive-complexity
  constructor(
    cards: StandardCard[],
    helper: Helper,
    private userPreferences: UserPreferencesDTO | null,
    private isInsideLesson: boolean,
    private mode: 'endless' | 'normal' | 'only-new' = 'normal',
    private avoidStorage = false,
  ) {
    this.prevReviews = new PreviousReviews(avoidStorage);
    this.allTestableCards = [];
    for (const card of cards) {
      const preference = calculatePreferences(this.userPreferences, card.lang);
      const testableCards = generateTestableCards(card, helper, preference);
      if (mode === 'only-new') {
        const hasAlreadySeen = testableCards.some((record) =>
          this.prevReviews.getCardHistory(record, CardViewMode.individualView),
        );
        if (hasAlreadySeen) continue; // skip the card if it has been reviewed before
      }
      this.allTestableCards.push(...testableCards);
    }
    console.log('this.allTestableCards', this.allTestableCards);
  }

  getAllTestableCards() {
    return [...this.allTestableCards];
  }

  getClosestDueIn = (wordId: number) => {
    return this.prevReviews.getClosestDueDate(wordId);
  };

  getDueCardsCount = (accordingToDate = Date.now()) => {
    const probabilities = this.calculateProbabilities(accordingToDate).probabilities;
    const dueReview = probabilities.filter(
      (record) =>
        record.isCriticalForReview || (record.reviewDue <= REVIEW_MAX_DUE && record.viewMode === CardViewMode.test),
    );
    const uniqueCards = new Set(dueReview.map((e) => e.record.card));
    return {
      dueReview: dueReview.length,
      uniqueCards: uniqueCards.size,
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private calculateProbabilities = (currentDate = Date.now(), _qOrder = 0) => {
    const currentDateInS = Math.floor(currentDate / 1000);
    const askedCards = this.prevReviews.getCurrentSessionCardsCount();
    const lastCards = this.prevReviews.getHistoryForLastPeriod(
      askedCards <= 15 ? LAST_PERIOD_TO_CONSIDER_SMALL : LAST_PERIOD_TO_CONSIDER,
      currentDate,
    );

    const lastNCards = this.prevReviews.getLastNHistory(LAST_CARDS_COUNT_TO_CONSIDER);

    const numOfViewedCard = Math.max(
      lastCards.filter((e) => e.mode === CardViewMode.groupView || e.mode === CardViewMode.individualView).length,
      lastNCards.filter((e) => e.mode === CardViewMode.groupView || e.mode === CardViewMode.individualView).length,
    );
    const numOfGroupViewedCard = Math.max(
      lastCards.filter((e) => e.mode === CardViewMode.groupView).length,
      lastNCards.filter((e) => e.mode === CardViewMode.groupView).length,
    );

    type GroupMeta = {
      lastViewDate: number | undefined;
      numOfCards: number;
      numOfTestableCards: number;
      numOfTestedCards: number;
      minReviewDue: number;
      prevGroupMetaKey: string | null | undefined;
    };
    const groupsMetaData: {
      [key in string]?: GroupMeta;
    } = {};
    const getSingleKey = (card: StandardTestableCard['card']) => card.id + '*sngl*';
    const blockCache: Record<string, boolean | undefined> = {};
    const updateIsAnyPrevGroupBlocked = (groupKey: string): boolean => {
      if (typeof blockCache[groupKey] === 'boolean') return blockCache[groupKey] ?? false;
      let isBlocked: boolean;
      const groupRecord = groupsMetaData[groupKey];
      if (!groupRecord) isBlocked = false;
      else if (groupRecord.numOfTestedCards < groupRecord.numOfTestableCards) isBlocked = true;
      else if (groupRecord.prevGroupMetaKey) isBlocked = updateIsAnyPrevGroupBlocked(groupRecord.prevGroupMetaKey);
      else isBlocked = false;
      blockCache[groupKey] = isBlocked;
      return isBlocked;
    };
    const removableDueDatesCardKeys = new Set<string>();
    const probabilities = this.allTestableCards
      .map((record) => {
        const historyRecord = this.prevReviews.getCardHistory(record, CardViewMode.test);
        const individualViewRecord = this.prevReviews.getCardHistory(record, CardViewMode.individualView);
        const groupVewRecord = this.prevReviews.getCardHistory(record, CardViewMode.groupView);

        const prevGroupGlobalKey = record.previousGroupViewKey
          ? record.card.id + '__' + record.previousGroupViewKey
          : record.initial
            ? undefined
            : getSingleKey(record.card);

        const groupGlobalKey = record.groupViewKey
          ? record.card.id + '__' + record.groupViewKey
          : getSingleKey(record.card);

        const willBeTested = this.hasAnotherRepetition(record, CardViewMode.test, historyRecord?.lc);
        if (record.groupViewKey) {
          const groupRecord: GroupMeta = groupsMetaData[groupGlobalKey] || {
            lastViewDate: undefined,
            numOfCards: 0,
            numOfTestedCards: 0,
            numOfTestableCards: 0,
            minReviewDue: Infinity,
            prevGroupMetaKey: prevGroupGlobalKey,
          };
          groupRecord.numOfCards++;
          if (willBeTested) groupRecord.numOfTestableCards++;
          if (willBeTested && historyRecord) groupRecord.numOfTestedCards++;
          if (!willBeTested && historyRecord && typeof historyRecord.dueDate === 'number') {
            // the history has due date while it shouldn't have
            removableDueDatesCardKeys.add(getRecordUniqueKey(historyRecord));
          }
          const lastViewDate = historyRecord
            ? historyRecord.lastDate
            : (groupVewRecord ?? individualViewRecord)?.lastDate;
          if (typeof lastViewDate === 'number') {
            groupRecord.lastViewDate = getMaxDate(lastViewDate, groupRecord.lastViewDate);
          }
          groupsMetaData[groupGlobalKey] = groupRecord;
        } else if (record.initial) {
          groupsMetaData[groupGlobalKey] = {
            lastViewDate: historyRecord?.lastDate ?? individualViewRecord?.lastDate,
            numOfCards: 1,
            numOfTestableCards: willBeTested ? 1 : 0,
            numOfTestedCards: willBeTested && historyRecord ? 1 : 0,
            minReviewDue: Infinity,
            prevGroupMetaKey: prevGroupGlobalKey,
          };
        }
        return {
          record,
          historyRecord,
          individualViewRecord,
          groupVewRecord,
          willBeTested,
          groupGlobalKey,
          prevGroupGlobalKey,
        };
      })
      .map(
        ({
          record,
          historyRecord,
          individualViewRecord,
          groupVewRecord,
          willBeTested,
          groupGlobalKey,
          prevGroupGlobalKey,
        }) => {
          const lastGroupViewDate =
            record.groupViewKey && record.hasGroupViewMode ? groupsMetaData[groupGlobalKey]?.lastViewDate : undefined;
          const connectedVariantsMaxLastViewDate = record.connectedTestKeys
            ? this.prevReviews.getMaxViewDate(record)
            : undefined;
          const maxViewDate = getMaxDate(connectedVariantsMaxLastViewDate, historyRecord?.lastDate);
          const lastNormalizedViewDate = getMaxDate(lastGroupViewDate, maxViewDate);
          const probability =
            lastNormalizedViewDate !== undefined
              ? calculateProbability(
                  Math.floor(currentDate / 1000) - lastNormalizedViewDate,
                  historyRecord?.lastS ?? initialTestS,
                )
              : 0;
          if (historyRecord?.id === HISTORY_ID_TO_OBSERVE) {
            debugger;
          }
          const reviewDue = historyRecord
            ? getOptimalReviewDue(historyRecord, maxViewDate as number, lastNormalizedViewDate, currentDate)
            : getFirstDue(
                groupVewRecord,
                individualViewRecord,
                record.hasGroupViewMode,
                lastNormalizedViewDate,
                currentDate,
              );

          if (record.groupViewKey) {
            const groupRecord = groupsMetaData[groupGlobalKey];
            if (groupRecord) groupRecord.minReviewDue = Math.min(groupRecord.minReviewDue, reviewDue);
          } else if (record.initial) {
            const meta = groupsMetaData[groupGlobalKey];
            if (meta) meta.minReviewDue = reviewDue;
          }

          return {
            record,
            historyRecord,
            individualViewRecord,
            groupVewRecord,
            probability,
            reviewDue,
            lastNormalizedViewDate,
            lastGroupViewDate,
            willBeTested,
            prevGroupGlobalKey,
          };
        },
      )
      .map(
        ({
          record,
          historyRecord,
          individualViewRecord,
          groupVewRecord,
          probability,
          reviewDue,
          lastNormalizedViewDate,
          lastGroupViewDate,
          willBeTested,
          prevGroupGlobalKey,
        }): CardWithProbability => {
          const isTested = !!historyRecord;
          if (historyRecord?.id === HISTORY_ID_TO_OBSERVE) {
            debugger;
          }
          const prevGroupMeta = prevGroupGlobalKey ? groupsMetaData[prevGroupGlobalKey] : undefined;
          const isAnyPrevGroupBlocked = prevGroupGlobalKey ? updateIsAnyPrevGroupBlocked(prevGroupGlobalKey) : false;
          const isBlockedByPreviousGroup =
            isAnyPrevGroupBlocked ||
            (prevGroupMeta ? prevGroupMeta.numOfTestedCards < prevGroupMeta.numOfTestableCards : false);
          const prevGroupReviewDue = prevGroupGlobalKey
            ? (groupsMetaData[prevGroupGlobalKey]?.minReviewDue ?? -Infinity) - 1
            : -Infinity;
          const finalReviewDue =
            isTested && prevGroupReviewDue !== -Infinity && prevGroupReviewDue - reviewDue <= 60
              ? Math.max(reviewDue, prevGroupReviewDue + 1)
              : reviewDue;

          return {
            record,
            historyRecord,
            probability,
            isCriticalForReview: historyRecord && isCriticalToBeReviewed(probability, finalReviewDue),
            isReadyForReview: historyRecord && isReadyToBeReviewed(probability, finalReviewDue),
            reviewCoefficient: historyRecord
              ? probability
              : calculateViewCoefficient(groupVewRecord, individualViewRecord, record.hasGroupViewMode, currentDate),
            reviewDue: finalReviewDue,
            dueDate: currentDateInS + finalReviewDue,
            isTested,
            wasLastTestCorrect: historyRecord?.lc,
            willBeTested,
            isIndividuallyViewed: !!individualViewRecord,
            isViewedInGroup: !!groupVewRecord,
            hasGroupViewMode: record.hasGroupViewMode,
            hasIndividualViewMode: record.hasIndividualViewMode,
            isBlockedByPreviousGroup,
            groupLevel: record.groupLevel ?? 0,
            ...{ lastNormalizedViewDate, lastGroupViewDate, reviewDue1: reviewDue, finalReviewDue, prevGroupReviewDue },
          };
        },
      )
      .filter((e) => !e.isBlockedByPreviousGroup)
      .sort((a, b) => {
        if (a.isCriticalForReview && !b.isCriticalForReview) return -1;
        if (!a.isCriticalForReview && b.isCriticalForReview) return 1;
        // if (a.isReadyForReview && !b.isReadyForReview) return -1;
        // if (!a.isReadyForReview && b.isReadyForReview) return 1;
        return a.reviewDue - b.reviewDue;
      })
      .map((a) => {
        if (a.historyRecord?.id === HISTORY_ID_TO_OBSERVE) {
          debugger;
        }
        const viewMode = getCardViewMode(a);
        let isTestNotRecommended = false;
        let isViewNotRecommended = false;
        if (
          viewMode !== CardViewMode.test &&
          (numOfViewedCard >= MAX_NUM_OF_VIEW_CARDS ||
            (viewMode === CardViewMode.groupView && numOfGroupViewedCard >= MAX_NUM_OF_GROUP_VIEW_CARDS))
        ) {
          // already viewed too much cards
          isViewNotRecommended = true;
          isTestNotRecommended = true;
        } else if (
          viewMode === CardViewMode.test &&
          (this.prevReviews.isInSession(a.record, CardViewMode.test, lastNCards) ||
            this.prevReviews.isInSession(a.record, CardViewMode.individualView, lastNCards))
        ) {
          // I was just tested in it or I have just seen it, so there's no point it being tested again
          isTestNotRecommended = true;
        }
        return { ...a, isViewNotRecommended, isTestNotRecommended, viewMode };
      })
      .filter((a) => {
        if (a.viewMode !== CardViewMode.test) return true;
        return a.willBeTested;
      })
      .sort((a, b) => {
        if (!a.isTestNotRecommended && b.isTestNotRecommended) return -1;
        if (a.isTestNotRecommended && !b.isTestNotRecommended) return 1;
        if (!a.isViewNotRecommended && b.isViewNotRecommended) return -1;
        if (a.isViewNotRecommended && !b.isViewNotRecommended) return 1;
        return 0;
      });
    return {
      probabilities,
      removableDueDatesCardKeys: removableDueDatesCardKeys.size > 0 ? [...removableDueDatesCardKeys] : undefined,
    };
  };

  private getHistoryFlaws = (reviewCards: ReviewerCard[]) => {
    const wordsIndex = this.prevReviews.getWordsIndex();
    const historyIdToRecord: Record<number, ReviewerCard | undefined> = {};
    for (const record of reviewCards) {
      if (record.historyRecord && typeof record.historyRecord.id === 'number') {
        historyIdToRecord[record.historyRecord.id] = record;
      }
    }

    const updates: { hId: number; dueDate: number | null }[] = [];

    const allWordIds = uniquelize(this.allTestableCards.map((e) => e.card.id));
    for (const wordId of allWordIds) {
      const wordHistoryObjects = wordsIndex[wordId];
      if (!wordHistoryObjects) continue;
      for (const hist of wordHistoryObjects) {
        if (typeof hist.id !== 'number') continue;
        const variantRecord = historyIdToRecord[hist.id];
        const dueDate = variantRecord ? variantRecord.dueDate : null;
        if (areDueDatesSame(hist, dueDate)) continue;
        updates.push({ hId: hist.id, dueDate });
      }
    }
    debugger;
    if (updates.length > 0) console.log('updates', updates);
    return updates;
  };

  getNextCard = (currentDate = Date.now()) => {
    const qOrder = this.prevReviews.getCurrentSessionCardsCount() + 1;
    console.log('#q', qOrder);

    const { probabilities: sorted, removableDueDatesCardKeys } = this.calculateProbabilities(currentDate, qOrder);
    if (removableDueDatesCardKeys) {
      this.prevReviews.removeDueDates(removableDueDatesCardKeys);
    }
    if (qOrder) {
      const flaws = this.getHistoryFlaws(sorted);
      this.prevReviews.fixDueDates(flaws);
    } else if (this.prevViewedCard && this.prevViewedCard.record.connectedTestKeys) {
      const connectedCards = sorted.filter((e) =>
        this.prevViewedCard!.record.connectedTestKeys!.includes(e.record.testKey),
      );
      const flaws = this.getHistoryFlaws(connectedCards);
      this.prevReviews.fixDueDates(flaws);
    }
    console.log(sorted.slice(0, 100), sorted.length);
    const topCard = sorted[0];
    const shouldFinish =
      this.mode === 'normal' &&
      sorted.every((card) => card.isTested && !card.isCriticalForReview && !card.isReadyForReview);
    if (!topCard || shouldFinish) {
      return undefined;
    }
    const topCardViewType = getCardViewMode(topCard);
    if (
      (this.isInsideLesson || this.mode === 'only-new') &&
      (topCardViewType === CardViewMode.groupView || topCardViewType === CardViewMode.individualView)
    ) {
      // only prioritize next cards of lower group-level in case user is inside the specific lesson
      const minViewGroupLevel = sorted
        .filter((e) => {
          const viewMode = getCardViewMode(e);
          return viewMode === CardViewMode.groupView || viewMode === CardViewMode.individualView;
        })
        .map((e) => e.groupLevel)
        .reduce((a, b) => Math.min(a, b), Infinity);
      const newSorted = sorted.filter((e) => {
        const viewMode = getCardViewMode(e);
        return viewMode === CardViewMode.test || e.groupLevel === minViewGroupLevel;
      });
      if (newSorted[0]) return newSorted[0];
    }
    return topCard;
  };

  private prevViewedCard: CardWithProbability | undefined = undefined;
  markViewed = (
    card: CardWithProbability,
    mode: CardViewMode,
    success: boolean,
    currentDate = Date.now(),
    newS: number | undefined = undefined,
  ) => {
    this.prevViewedCard = card;
    const { newValue } = this.prevReviews.saveCardResult(
      card.record,
      mode,
      success,
      this.hasAnotherRepetition(card.record, mode, success),
      currentDate,
      newS,
    );
    if (!this.avoidStorage) {
      addUpdatedItemsInStorage([getDbRecord(newValue)]);
    }
  };
  hasAnotherRepetition = (
    card: StandardTestableCard,
    mode: CardViewMode,
    wasLastCorrect: boolean | undefined | null,
  ): boolean => {
    if (mode === CardViewMode.individualView || mode === CardViewMode.groupView) return false;
    if (card.skipTest) return false;
    if (!card.isStandardForm) return true;
    if (card.isGroupStandardForm || card.forcefullySkipIfStandard) return false;
    const wasTested = wasLastCorrect !== undefined && wasLastCorrect !== null;
    if (!wasTested) return true;
    return !wasLastCorrect;
  };
}

export type ReviewerCard = NonNullable<ReturnType<Reviewer['getNextCard']>>;

function getReviewDue(record: AnyReviewHistory, lastGroupViewDate: number | undefined, currentDateMS: number) {
  return dueDateUntilProbabilityIsHalf(
    lastGroupViewDate ?? record.lastDate,
    Math.floor(currentDateMS / 1000),
    record.lastS ?? initialTestS,
  );
}

function getFirstDue(
  groupRecord: AnyReviewHistory | undefined,
  individualRecord: AnyReviewHistory | undefined,
  hasGroupViewMode: boolean,
  lastDate: number | undefined,
  currentDateMS: number,
) {
  const mainRecord = hasGroupViewMode ? groupRecord : individualRecord;
  const lastReviewTime = lastDate ?? mainRecord?.lastDate;
  if (typeof lastReviewTime !== 'number') return DEFAULT_REVIEW_DUE;
  return dueDateUntilProbabilityIsHalf(lastReviewTime, Math.floor(currentDateMS / 1000), initialViewS);
}

function isCriticalToBeReviewed(probability: number, reviewDue: number) {
  return probability <= 0.55 && probability >= 0.45 && reviewDue <= 90;
}

function isReadyToBeReviewed(probability: number, reviewDue: number) {
  if (probability <= 0.5 || reviewDue <= REVIEW_MAX_DUE) return true;
  return probability <= 0.55 && reviewDue <= REVIEW_MAX_DUE_FOR_HIGH_PROB;
}

function calculateViewCoefficient(
  groupRecord: AnyReviewHistory | undefined,
  individualRecord: AnyReviewHistory | undefined,
  hasGroupViewMode: boolean,
  currentDate: number,
) {
  const mainRecord = hasGroupViewMode ? groupRecord : individualRecord;
  if (!mainRecord) return initialViewCoefficient;
  return calculateProbability(Math.floor(currentDate / 1000) - mainRecord.lastDate, initialViewS);
}
const initialViewCoefficient = 0.8;

export const getCardViewMode = (a: CardWithProbability) => {
  if (a.hasGroupViewMode && !a.isViewedInGroup) {
    return CardViewMode.groupView;
  } else if (!a.hasGroupViewMode && a.hasIndividualViewMode && !a.isIndividuallyViewed) {
    return CardViewMode.individualView;
  } else {
    return CardViewMode.test;
  }
};

const getOptimalReviewDue = (
  historyRecord: AnyReviewHistory,
  lastDate: number,
  groupViewMaxLastDate: number | undefined,
  currentDateMS: number,
) => {
  const t1 = getReviewDue(historyRecord, lastDate, currentDateMS);
  if (!groupViewMaxLastDate || groupViewMaxLastDate <= lastDate) return t1;
  const t2 = getReviewDue(historyRecord, groupViewMaxLastDate, currentDateMS);
  if (t2 - t1 >= 240) return t1 + 120;
  return Math.floor(t1 + t2 / 2);
};

const getMaxDate = (...dates: (number | undefined | null)[]) => {
  let maxDate = undefined;
  for (const date of dates) {
    if (typeof date === 'number' && (maxDate === undefined || date > maxDate)) {
      maxDate = date;
    }
  }
  return maxDate;
};

const areDueDatesSame = (hist: AnyReviewHistory, dueDate: number | null) => {
  if (hist.dueDate === null || dueDate === null) return hist.dueDate === dueDate;

  const diff = Math.abs(hist.dueDate - dueDate);
  const THRESHOLD = 60;
  return diff <= THRESHOLD;
};
