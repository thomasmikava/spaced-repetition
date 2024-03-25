import type { LessonCard } from '../courses/lessons';
import { courses } from '../courses/lessons';
import type { AnyCard } from '../database/types';
import { generateTestableCards } from './generate-variants';
import { generateIndexedDatabase } from './generateIndexedDatabase';
import { PreviousReviews } from './previous-reviews';
import type { AnyTestableCard, GroupReviewHistory, IndividualReviewHistory, TestReviewHistory } from './reviews';
import { CardViewMode, calculateProbability, initialViewS, secondsUntilProbabilityIsHalf } from './reviews';

interface WithProbability {
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
  reviewDue: number;
}

export class Reviewer {
  private lessonCards: LessonCard[];
  private allTestableCards: AnyTestableCard[];
  // eslint-disable-next-line sonarjs/cognitive-complexity
  constructor(
    courseId: number | undefined = undefined,
    lessonId: number | undefined = undefined,
    private mode: 'endless' | 'normal' = 'normal',
    private cardsDatabase = generateIndexedDatabase(),
  ) {
    console.log(courseId, lessonId);
    this.lessonCards = [];
    this.allTestableCards = [];
    for (const course of courses) {
      if (courseId && course.id !== courseId) continue;
      for (const lesson of course.lessons) {
        if (lessonId && lesson.id !== lessonId) continue;
        for (const lessonCard of lesson.cards) {
          const card = this.cardsDatabase[lessonCard.type]?.[lessonCard.value];
          if (!card) continue;
          const testableCards = generateTestableCards(card);
          this.allTestableCards.push(...testableCards);
          this.lessonCards.push(lessonCard);
        }
      }
    }
  }

  getClosestDueDate = (card: AnyCard) => {
    const testableCards = generateTestableCards(card);
    return Math.min(...testableCards.map((record) => this.getDueDate(record)));
  };

  getDueDate = (record: AnyTestableCard): number => {
    const historyRecord = PreviousReviews.getCardHistory(record, CardViewMode.test);
    if (!historyRecord) return Infinity;
    return secondsUntilProbabilityIsHalf(historyRecord.lastDate, Date.now(), historyRecord.lastS);
  };

  getDueCardsCount = () => {
    const probabilities = this.calculateProbabilities();
    return probabilities.filter((record) => record.isReadyForReview).length;
  };

  private calculateProbabilities = () => {
    const groupLastViewDates: { [key in string]?: number } = {};
    return this.allTestableCards
      .map((record) => {
        const historyRecord = PreviousReviews.getCardHistory(record, CardViewMode.test);
        const individualViewRecord = PreviousReviews.getCardHistory(record, CardViewMode.individualView);
        const groupVewRecord = PreviousReviews.getCardHistory(record, CardViewMode.groupView);
        if (record.groupViewKey) {
          const lastViewDate = historyRecord
            ? historyRecord.lastDate
            : (groupVewRecord ?? individualViewRecord)?.lastDate;
          if (lastViewDate) {
            groupLastViewDates[record.groupViewKey] = Math.max(
              lastViewDate,
              groupLastViewDates[record.groupViewKey] ?? 0,
            );
          }
        }
        return { record, historyRecord, individualViewRecord, groupVewRecord };
      })
      .map(({ record, historyRecord, individualViewRecord, groupVewRecord }, i): WithProbability => {
        if (i === 0) console.log(groupLastViewDates);
        const lastGroupViewDate =
          record.groupViewKey && record.hasGroupViewMode ? groupLastViewDates[record.groupViewKey] : undefined;
        const lastNormalizedViewDate = lastGroupViewDate ?? historyRecord?.lastDate;
        const probability =
          historyRecord && lastNormalizedViewDate
            ? calculateProbability(Math.floor((Date.now() - lastNormalizedViewDate) / 1000), historyRecord.lastS)
            : 0;
        const reviewDue = historyRecord
          ? getReviewDue(historyRecord, lastNormalizedViewDate)
          : getFirstDue(groupVewRecord, individualViewRecord, record.hasGroupViewMode, lastNormalizedViewDate);
        return {
          record,
          historyRecord,
          probability,
          isCriticalForReview: historyRecord && isCriticalToBeReviewed(probability, reviewDue),
          isReadyForReview: historyRecord && isReadyToBeReviewed(probability, reviewDue),
          reviewCoefficient: historyRecord
            ? probability
            : calculateViewCoefficient(groupVewRecord, individualViewRecord, record.hasGroupViewMode),
          reviewDue,
          isTested: !!historyRecord,
          isIndividuallyViewed: !!individualViewRecord,
          isViewedInGroup: !!groupVewRecord,
          hasGroupViewMode: record.hasGroupViewMode,
          hasIndividualViewMode: record.hasIndividualViewMode,
          ...{ lastNormalizedViewDate, lastGroupViewDate },
        };
      });
  };

  getNextCard = () => {
    const sorted = this.calculateProbabilities().sort((a, b) => {
      if (a.isCriticalForReview && !b.isCriticalForReview) return -1;
      if (!a.isCriticalForReview && b.isCriticalForReview) return 1;
      if (a.isReadyForReview && !b.isReadyForReview) return -1;
      if (!a.isReadyForReview && b.isReadyForReview) return 1;
      return a.reviewDue - b.reviewDue;
    });
    console.log(sorted);
    if (this.mode === 'endless') return sorted[0];
    if (!sorted[0].isTested || sorted[0].isCriticalForReview || sorted[0].isReadyForReview) return sorted[0];
    return undefined;
  };

  markViewed = (card: WithProbability, mode: CardViewMode, success: boolean) => {
    PreviousReviews.saveCardResult(card.record, mode, success);
  };
}

function getReviewDue(record: TestReviewHistory, lastGroupViewDate: number | undefined) {
  return secondsUntilProbabilityIsHalf(lastGroupViewDate ?? record.lastDate, Date.now(), record.lastS);
}

const DEFAULT_REVIEW_DUE = 30;
function getFirstDue(
  groupRecord: GroupReviewHistory | undefined,
  individualRecord: IndividualReviewHistory | undefined,
  hasGroupViewMode: boolean,
  groupLastView: number | undefined,
) {
  const mainRecord = hasGroupViewMode ? groupRecord : individualRecord;
  if (!mainRecord) return DEFAULT_REVIEW_DUE;
  if (hasGroupViewMode && groupLastView) return secondsUntilProbabilityIsHalf(groupLastView, Date.now(), initialViewS);
  return secondsUntilProbabilityIsHalf(mainRecord.lastDate, Date.now(), initialViewS);
}

function isCriticalToBeReviewed(probability: number, reviewDue: number) {
  return probability <= 0.55 && probability >= 0.45 && reviewDue <= 90;
}

function isReadyToBeReviewed(probability: number, reviewDue: number) {
  return probability <= 0.6 && reviewDue <= 5 * 60;
}

// function calculateReviewCoefficient(probability: number) {
//   return 1 - (2 * (0.5 - probability)) ** 2;
// }

function calculateViewCoefficient(
  groupRecord: GroupReviewHistory | undefined,
  individualRecord: IndividualReviewHistory | undefined,
  hasGroupViewMode: boolean,
) {
  const mainRecord = hasGroupViewMode ? groupRecord : individualRecord;
  if (!mainRecord) return initialViewCoefficient;
  return calculateProbability(Math.floor((Date.now() - mainRecord.lastDate) / 1000), initialViewS);
}
const initialViewCoefficient = 0.8;
