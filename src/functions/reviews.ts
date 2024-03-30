/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Adjective,
  AdjectiveDegree,
  AdjectiveInflection,
  Article,
  CardType,
  Case,
  Noun,
  NounGender,
  NounNumber,
  Preposition,
  Pronoun,
  PronounFunction,
  Verb,
  VerbConjugationVariant,
  VerbMood,
  VerbTense,
} from '../database/types';

export function calculateHalfLifeCoefficient(halfLife: number) {
  return -halfLife / Math.log(0.5);
}
export function dueDateUntilProbabilityIsHalf(T_reviewed_S: number, T_current_S: number, S: number) {
  return Math.round(S * Math.log(2) - (T_current_S - T_reviewed_S));
}
export function secondsUntilProbabilityIsHalf(S: number) {
  return Math.round(S * Math.log(2));
}
// function secondsUntil
(window as any).calculateHalfLifeCoefficient = calculateHalfLifeCoefficient;
(window as any).dueDateUntilProbabilityIsHalf = dueDateUntilProbabilityIsHalf;
(window as any).secondsUntilProbabilityIsHalf = secondsUntilProbabilityIsHalf;
export const calculateProbability = (t: number, s: number) => Math.exp(-t / s);

export const initialTestS = calculateHalfLifeCoefficient(120); // after 120 seconds of being tested, the probability of remembering the card is 50%
export const initialViewS = calculateHalfLifeCoefficient(40);
export const minS = calculateHalfLifeCoefficient(30);
export const maxS = calculateHalfLifeCoefficient(60 * 60 * 24 * 60); // 60 days
export const DEFAULT_REVIEW_DUE = 30;

export const MAX_NUM_OF_VIEW_CARDS = 2;
export const MAX_NUM_OF_GROUP_VIEW_CARDS = 1;
export const LAST_CARDS_COUNT_TO_CONSIDER = 3;
export const LAST_PERIOD_TO_CONSIDER = 20; // seconds

export interface TestReviewHistory {
  firstDate: number; // in seconds
  lastDate: number; // in seconds
  repetition: number;
  lastS: number;
  lastHasFailed?: boolean;
  savedInDb: boolean;
}
export interface IndividualReviewHistory {
  firstDate: number; // in seconds
  lastDate: number; // in seconds
  repetition: number;
  savedInDb: boolean;
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
  previousGroupViewKey?: string | null;
  groupLevel?: number;
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

export type AdjectiveTestableCard = GeneralTestableCard & {
  type: CardType.ADJECTIVE;
  card: Adjective;
} & (
    | { initial: true; isInitialTrio: true; degree: AdjectiveDegree.Positiv; value: string }
    | {
        initial: false;
        isInitialTrio: true;
        degree: AdjectiveDegree.Komparativ | AdjectiveDegree.Superlativ;
        value: string;
      }
    | {
        initial: false;
        isInitialTrio: false;
        variant: {
          case: Case;
          gender: NounGender;
          number: NounNumber;
          degree: AdjectiveDegree;
          inflection: AdjectiveInflection;
          value: string;
        };
      }
  );

export type SingleTestableCard = GeneralTestableCard & {
  type: null;
  initial: true;
  typeTag: string | null;
  card: { type: CardType | null; value: string; uniqueValue?: string; translation: string; caseSensitive: boolean };
};

export type PrepositionTestableCard = GeneralTestableCard & {
  type: CardType.PREPOSITION;
  card: Preposition;
  initial: true;
};

export type PronounTestableCard = GeneralTestableCard & {
  type: CardType.PRONOUN;
  card: Pronoun;
} & {
  initial: false;
  function: PronounFunction;
  variant: {
    case: Case;
    gender: NounGender | null;
    number: NounNumber;
    function: PronounFunction;
    value: string;
  };
};

export type AnyTestableCard =
  | VerbTestableCard
  | NounTestableCard
  | ArticleTestableCard
  | AdjectiveTestableCard
  | SingleTestableCard
  | PrepositionTestableCard
  | PronounTestableCard;
