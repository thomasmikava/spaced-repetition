import type {
  Article,
  CardType,
  Case,
  Noun,
  NounNumber,
  Verb,
  VerbConjugationVariant,
  VerbMood,
  VerbTense,
} from '../database/types';

function calculateHalfLifeCoefficient(halfLife: number) {
  return -halfLife / Math.log(0.5);
}
export function secondsUntilProbabilityIsHalf(T_reviewed: number, T_current: number, S: number) {
  return S * Math.log(2) - (T_current - T_reviewed) / 1000;
}
export const calculateProbability = (t: number, s: number) => Math.exp(-t / s);

export const initialS = calculateHalfLifeCoefficient(45); // after 45 seconds, the probability of remembering the card is 50%
export const initialViewS = calculateHalfLifeCoefficient(20);
export const minS = calculateHalfLifeCoefficient(15);
export const maxS = calculateHalfLifeCoefficient(10 * 60 * 60 * 24 * 30); // 30 days

export interface TestReviewHistory {
  firstDate: number;
  lastDate: number;
  repetition: number;
  lastS: number;
  lastHasFailed?: true;
}
export interface IndividualReviewHistory {
  firstDate: number;
  lastDate: number;
  repetition: number;
}
export type GroupReviewHistory = IndividualReviewHistory;

export type AnyReviewHistory = TestReviewHistory | IndividualReviewHistory | GroupReviewHistory;

export type AllCardsReviewHistory = Record<string, AnyReviewHistory | undefined>;

export enum CardViewMode {
  test,
  individualView,
  groupView,
}

export type CardKeys = {
  testKey: string;
  groupViewKey: string | null;
};
type GeneralTestableCard = CardKeys & {
  hasGroupViewMode: boolean;
  hasIndividualViewMode: boolean;
};

export type VerbTestableCard = GeneralTestableCard & {
  type: CardType.VERB;
  card: Verb;
} & (
    | { initial: true }
    | { initial: false; variant: { mood: VerbMood; tense: VerbTense; conjugation: VerbConjugationVariant } }
  );
export type NounTestableCard = GeneralTestableCard & {
  type: CardType.NOUN;
  card: Noun;
} & ({ initial: true } | { initial: false; variant: { number: NounNumber; case: Case; value: string } });
export type ArticleTestableCard = GeneralTestableCard & {
  type: CardType.ARTICLE;
  card: Article;
} & ({ initial: true } | { initial: false; variant: { case: Case; value: string } });

export type AnyTestableCard = VerbTestableCard | NounTestableCard | ArticleTestableCard;
