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
    return this.allTestableCards.map((record): WithProbability => {
      const historyRecord = PreviousReviews.getCardHistory(record, CardViewMode.test);
      const individualViewRecord = PreviousReviews.getCardHistory(record, CardViewMode.individualView);
      const groupVewRecord = PreviousReviews.getCardHistory(record, CardViewMode.groupView);
      const probability = historyRecord
        ? calculateProbability(Math.floor((Date.now() - historyRecord.lastDate) / 1000), historyRecord.lastS)
        : 0;
      return {
        record,
        historyRecord,
        probability,
        isCriticalForReview: historyRecord && isCriticalToBeReviewed(probability),
        isReadyForReview: historyRecord && isReadyToBeReviewed(probability),
        reviewCoefficient: historyRecord
          ? calculateReviewCoefficient(probability)
          : calculateViewCoefficient(groupVewRecord, individualViewRecord, record.hasGroupViewMode),
        isTested: !!historyRecord,
        isIndividuallyViewed: !!individualViewRecord,
        isViewedInGroup: !!groupVewRecord,
        hasGroupViewMode: record.hasGroupViewMode,
        hasIndividualViewMode: record.hasIndividualViewMode,
      };
    });
  };

  getNextCard = () => {
    const sorted = this.calculateProbabilities().sort((a, b) => {
      if (a.isCriticalForReview && !b.isCriticalForReview) return -1;
      if (!a.isCriticalForReview && b.isCriticalForReview) return 1;
      if (a.isReadyForReview && !b.isReadyForReview) return -1;
      if (!a.isReadyForReview && b.isReadyForReview) return 1;
      return b.reviewCoefficient - a.reviewCoefficient;
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

function isCriticalToBeReviewed(probability: number) {
  return probability <= 0.55 && probability >= 0.45;
}

function isReadyToBeReviewed(probability: number) {
  return probability <= 0.6;
}

function calculateReviewCoefficient(probability: number) {
  return 1 - (2 * (0.5 - probability)) ** 2;
}

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
