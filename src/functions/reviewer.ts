/* eslint-disable sonarjs/cognitive-complexity */
import type { LessonCard } from '../courses/lessons';
import { courses } from '../courses/lessons';
import type { AnyCard } from '../database/types';
import { generateTestableCards } from './generate-variants';
import { generateIndexedDatabase } from './generateIndexedDatabase';
import { PreviousReviews } from './previous-reviews';
import type { AnyTestableCard, GroupReviewHistory, IndividualReviewHistory, TestReviewHistory } from './reviews';
import {
  CardViewMode,
  DEFAULT_REVIEW_DUE,
  calculateProbability,
  initialViewS,
  dueDateUntilProbabilityIsHalf,
  MAX_NUM_OF_VIEW_CARDS,
  MAX_NUM_OF_GROUP_VIEW_CARDS,
  LAST_CARDS_COUNT_TO_CONSIDER,
  LAST_PERIOD_TO_CONSIDER,
} from './reviews';
import { addUpdatedItemsInStorage, getDbRecord } from './storage';

export interface CardWithProbability {
  record: AnyTestableCard;
  historyRecord?: TestReviewHistory;
  reviewRecord?: TestReviewHistory;
  groupVewRecord?: TestReviewHistory;
  probability: number;
  isCriticalForReview?: boolean;
  isReadyForReview?: boolean;
  reviewCoefficient: number;
  isTested: boolean;
  isIndividuallyViewed: boolean;
  isViewedInGroup: boolean;
  hasGroupViewMode: boolean;
  hasIndividualViewMode: boolean;
  isBlockedByPreviousGroup: boolean;
  reviewDue: number;
  groupLevel: number;
}

export class Reviewer {
  private lessonCards: LessonCard[];
  private allTestableCards: AnyTestableCard[];
  private prevReviews: PreviousReviews;
  // eslint-disable-next-line sonarjs/cognitive-complexity
  constructor(
    courseId: number | undefined = undefined,
    private lessonId: number | undefined = undefined,
    private mode: 'endless' | 'normal' = 'normal',
    private avoidStorage = false,
    private cardsDatabase = generateIndexedDatabase(),
  ) {
    this.prevReviews = new PreviousReviews(avoidStorage);
    this.lessonCards = [];
    this.allTestableCards = [];
    for (const course of courses) {
      if (courseId && course.id !== courseId) continue;
      for (const lesson of course.lessons) {
        if (lessonId && lesson.id !== lessonId) continue;
        for (const lessonCard of lesson.cards) {
          if (lessonCard.hidden) continue;
          const card = this.cardsDatabase[lessonCard.type]?.[lessonCard.value];
          if (!card) continue;
          const testableCards = generateTestableCards(card);
          this.allTestableCards.push(...testableCards);
          this.lessonCards.push(lessonCard);
        }
      }
    }
    console.log('this.allTestableCards', this.allTestableCards);
  }

  getClosestDueDate = (card: AnyCard) => {
    const testableCards = generateTestableCards(card);
    return Math.min(...testableCards.map((record) => this.getDueDate(record)));
  };

  getDueDate = (record: AnyTestableCard, accordingToDate = Date.now()): number => {
    const historyRecord = this.prevReviews.getCardHistory(record, CardViewMode.test);
    if (!historyRecord) return Infinity;
    return dueDateUntilProbabilityIsHalf(
      historyRecord.lastDate,
      Math.floor(accordingToDate / 1000),
      historyRecord.lastS,
    );
  };

  getDueCardsCount = (accordingToDate = Date.now()) => {
    const probabilities = this.calculateProbabilities(accordingToDate);
    const dueReview = probabilities.filter((record) => record.isCriticalForReview || record.isReadyForReview);
    const uniqueCards = new Set(dueReview.map((e) => e.record.card));
    return {
      dueReview: dueReview.length,
      uniqueCards: uniqueCards.size,
    };
  };

  private calculateProbabilities = (currentDate = Date.now()) => {
    const lastCards = this.prevReviews.getHistoryForLastPeriod(LAST_PERIOD_TO_CONSIDER, currentDate);

    const lastNCards = this.prevReviews.getLastNHistory(LAST_CARDS_COUNT_TO_CONSIDER);

    const numOfViewedCard = lastCards.filter(
      (e) => e.mode === CardViewMode.groupView || e.mode === CardViewMode.individualView,
    ).length;
    const numOfGroupViewedCard = Math.max(
      lastCards.filter((e) => e.mode === CardViewMode.groupView).length,
      lastNCards.filter((e) => e.mode === CardViewMode.groupView).length,
    );

    type GroupMeta = {
      lastViewDate: number;
      numOfCards: number;
      numOfTestableCards: number;
      numOfTestedCards: number;
      minReviewDue: number;
      prevGroupMetaKey: string | null | undefined;
    };
    const groupsMetaData: {
      [key in string]?: GroupMeta;
    } = {};
    const getSingleKey = (card: AnyTestableCard['card']) => card.type + '*' + (card.uniqueValue ?? card.value);
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
    return this.allTestableCards
      .map((record) => {
        const historyRecord = this.prevReviews.getCardHistory(record, CardViewMode.test);
        const individualViewRecord = this.prevReviews.getCardHistory(record, CardViewMode.individualView);
        const groupVewRecord = this.prevReviews.getCardHistory(record, CardViewMode.groupView);

        const prevKey = record.previousGroupViewKey
          ? record.previousGroupViewKey
          : record.initial
            ? undefined
            : getSingleKey(record.card);

        if (record.groupViewKey) {
          const isTestable = !record.isStandardForm || record.isGroupStandardForm === false ? 1 : 0;
          const groupRecord: GroupMeta = groupsMetaData[record.groupViewKey] || {
            lastViewDate: 0,
            numOfCards: 0,
            numOfTestedCards: 0,
            numOfTestableCards: 0,
            minReviewDue: Infinity,
            prevGroupMetaKey: prevKey,
          };
          groupRecord.numOfCards++;
          if (historyRecord) groupRecord.numOfTestedCards++;
          if (isTestable) groupRecord.numOfTestableCards++;
          const lastViewDate = historyRecord
            ? historyRecord.lastDate
            : (groupVewRecord ?? individualViewRecord)?.lastDate;
          if (lastViewDate) {
            groupRecord.lastViewDate = Math.max(lastViewDate, groupRecord.lastViewDate);
          }
          groupsMetaData[record.groupViewKey] = groupRecord;
        } else if (record.initial) {
          groupsMetaData[getSingleKey(record.card)] = {
            lastViewDate: historyRecord?.lastDate ?? individualViewRecord?.lastDate ?? 0,
            numOfCards: 1,
            numOfTestableCards: !record.isStandardForm || record.isGroupStandardForm === false ? 1 : 0,
            numOfTestedCards: historyRecord ? 1 : 0,
            minReviewDue: Infinity,
            prevGroupMetaKey: prevKey,
          };
        }
        return {
          record,
          historyRecord,
          individualViewRecord,
          groupVewRecord,
        };
      })
      .map(({ record, historyRecord, individualViewRecord, groupVewRecord }) => {
        const lastGroupViewDate =
          record.groupViewKey && record.hasGroupViewMode
            ? groupsMetaData[record.groupViewKey]?.lastViewDate
            : undefined;
        const lastNormalizedViewDate = lastGroupViewDate ?? historyRecord?.lastDate;
        const probability =
          historyRecord && lastNormalizedViewDate
            ? calculateProbability(Math.floor(currentDate / 1000) - lastNormalizedViewDate, historyRecord.lastS)
            : 0;
        const reviewDue = historyRecord
          ? getReviewDue(historyRecord, lastNormalizedViewDate, currentDate)
          : getFirstDue(
              groupVewRecord,
              individualViewRecord,
              record.hasGroupViewMode,
              lastNormalizedViewDate,
              currentDate,
            );

        if (record.groupViewKey) {
          const groupRecord = groupsMetaData[record.groupViewKey];
          if (groupRecord) groupRecord.minReviewDue = Math.min(groupRecord.minReviewDue, reviewDue);
        } else if (record.initial) {
          const meta = groupsMetaData[getSingleKey(record.card)];
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
        };
      })
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
        }): CardWithProbability => {
          // if (i === 0) console.log(groupLastViewDates);
          const isTested = !!historyRecord;
          const prevKey = record.previousGroupViewKey
            ? record.previousGroupViewKey
            : record.initial
              ? undefined
              : getSingleKey(record.card);
          const prevGroupMeta = prevKey ? groupsMetaData[prevKey] : undefined;
          const isAnyPrevGroupBlocked = prevKey ? updateIsAnyPrevGroupBlocked(prevKey) : false;
          const isBlockedByPreviousGroup =
            isAnyPrevGroupBlocked ||
            (prevGroupMeta ? prevGroupMeta.numOfTestedCards < prevGroupMeta.numOfTestableCards : false);
          const prevGroupReviewDue = prevKey ? (groupsMetaData[prevKey]?.minReviewDue ?? -Infinity) - 1 : -Infinity;
          // console.log(minReviewDue);
          const finalReviewDue =
            isTested && prevGroupReviewDue !== -Infinity && prevGroupReviewDue - reviewDue <= 60
              ? Math.max(reviewDue, prevGroupReviewDue + 1)
              : reviewDue;
          return {
            record,
            historyRecord,
            probability,
            isCriticalForReview: historyRecord && isCriticalToBeReviewed(probability, reviewDue),
            isReadyForReview: historyRecord && isReadyToBeReviewed(probability, reviewDue),
            reviewCoefficient: historyRecord
              ? probability
              : calculateViewCoefficient(groupVewRecord, individualViewRecord, record.hasGroupViewMode, currentDate),
            reviewDue: finalReviewDue,
            isTested,
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
        const viewMode = getCardViewMode(a);
        let isTestNotRecommended = false;
        let isViewNotRecommended = false;
        if (
          (viewMode !== CardViewMode.test && numOfViewedCard >= MAX_NUM_OF_VIEW_CARDS) ||
          (viewMode === CardViewMode.groupView && numOfGroupViewedCard >= MAX_NUM_OF_GROUP_VIEW_CARDS)
        ) {
          isViewNotRecommended = true;
          isTestNotRecommended = true;
        } else if (
          this.prevReviews.isInSession(a.record, viewMode, lastNCards) ||
          this.prevReviews.isInSession(a.record, CardViewMode.individualView, lastNCards)
        ) {
          isTestNotRecommended = true;
        }
        return { ...a, isViewNotRecommended, isTestNotRecommended, viewMode };
      })
      .filter((a) => {
        return (
          a.viewMode !== CardViewMode.test ||
          !a.record.isStandardForm ||
          (a.record.isGroupStandardForm === false && !a.isTested)
        );
      })
      .sort((a, b) => {
        if (!a.isTestNotRecommended && b.isTestNotRecommended) return -1;
        if (a.isTestNotRecommended && !b.isTestNotRecommended) return 1;
        if (!a.isViewNotRecommended && b.isViewNotRecommended) return -1;
        if (a.isViewNotRecommended && !b.isViewNotRecommended) return 1;
        return 0;
      });
  };

  getNextCard = (currentDate = Date.now()) => {
    console.log('#q', this.prevReviews.getLastNHistory(Infinity).length + 1);

    const sorted = this.calculateProbabilities(currentDate);
    console.log(sorted);
    const topCard = sorted[0];
    const shouldFinish =
      this.mode === 'normal' &&
      sorted.every((card) => card.isTested && !card.isCriticalForReview && !card.isReadyForReview);
    if (!topCard || shouldFinish) {
      return undefined;
    }
    const topCardViewType = getCardViewMode(topCard);
    if (
      typeof this.lessonId === 'number' &&
      (topCardViewType === CardViewMode.groupView || topCardViewType === CardViewMode.individualView)
    ) {
      // only prioritize next cards of lower group-level in case user is inside the specific lesson
      const newSorted = sorted.filter(
        (e) => e.viewMode === CardViewMode.groupView || e.viewMode === CardViewMode.individualView,
      );
      newSorted.sort((a, b) => {
        if (a.groupLevel !== b.groupLevel) return (a.groupLevel ?? 0) - (b.groupLevel ?? 0);
        return 0;
      });
      if (newSorted[0]) return newSorted[0];
    }
    return topCard;
  };

  markViewed = (card: CardWithProbability, mode: CardViewMode, success: boolean, currentDate = Date.now()) => {
    const { newValue, key } = this.prevReviews.saveCardResult(card.record, mode, success, currentDate);
    if (!this.avoidStorage) {
      addUpdatedItemsInStorage([getDbRecord(key, newValue)]);
    }
  };
}

function getReviewDue(record: TestReviewHistory, lastGroupViewDate: number | undefined, currentDateMS: number) {
  return dueDateUntilProbabilityIsHalf(
    lastGroupViewDate ?? record.lastDate,
    Math.floor(currentDateMS / 1000),
    record.lastS,
  );
}

function getFirstDue(
  groupRecord: GroupReviewHistory | undefined,
  individualRecord: IndividualReviewHistory | undefined,
  hasGroupViewMode: boolean,
  groupLastView: number | undefined,
  currentDateMS: number,
) {
  const mainRecord = hasGroupViewMode ? groupRecord : individualRecord;
  if (!mainRecord) return DEFAULT_REVIEW_DUE;
  if (hasGroupViewMode && groupLastView) {
    return dueDateUntilProbabilityIsHalf(groupLastView, Math.floor(currentDateMS / 1000), initialViewS);
  }
  return dueDateUntilProbabilityIsHalf(mainRecord.lastDate, Math.floor(currentDateMS / 1000), initialViewS);
}

function isCriticalToBeReviewed(probability: number, reviewDue: number) {
  return probability <= 0.55 && probability >= 0.45 && reviewDue <= 90;
}

function isReadyToBeReviewed(probability: number, reviewDue: number) {
  return probability <= 0.55 || reviewDue <= 4 * 60;
}

// function calculateReviewCoefficient(probability: number) {
//   return 1 - (2 * (0.5 - probability)) ** 2;
// }

function calculateViewCoefficient(
  groupRecord: GroupReviewHistory | undefined,
  individualRecord: IndividualReviewHistory | undefined,
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
