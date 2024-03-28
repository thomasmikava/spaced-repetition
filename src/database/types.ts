export enum CardType {
  ARTICLE = 'ARTICLE',
  NOUN = 'NOUN',
  VERB = 'VERB',
  PRONOUNS = 'PRONOUNS',
  ADJECTIVE = 'ADJECTIVE',
  ADVERB = 'ADVERB',
  PREPOSITION = 'PREPOSITION',
  CONJUNCTION = 'CONJUNCTION',
  INTERJECTION = 'INTERJECTION',
  NUMBERS = 'NUMBERS',
}

export enum VerbTense {
  Präsens,
  Perfekt,
  Präteritum,
  Plusquamperfekt,
  Futur1,
  Futur2,
  Futur2_1,
  Futur2_2,
}

export enum VerbMood {
  Indikativ,
  Konjunktiv,
  Imperativ,
}

export enum VerbPronoun {
  ich,
  du,
  er_sie_es,
  wir,
  ihr,
  sie_Sie,
}

export interface VerbConjugationVariant {
  pronoun: VerbPronoun;
  value: string;
}

interface VerbTenseVariants {
  tense: VerbTense;
  conjugations: VerbConjugationVariant[];
}

export interface VerbVariant {
  mood: VerbMood;
  tenses: VerbTenseVariants[];
}

export interface Verb extends Card {
  type: CardType.VERB;
  value: string;
  translation: string;
  variants: VerbVariant[];
}

export enum NounNumber {
  singular,
  plural,
}

export enum Case {
  Nominativ,
  Akkusativ,
  Dativ,
  Genitiv,
}

export interface NounVariant {
  number: NounNumber;
  case: Case;
  value: string;
}

interface Card {
  guessFromTranslation?: boolean;
  uniqueValue?: string;
}

export enum NounGender {
  Maskulinum,
  Femininum,
  Neutrum,
  Plural,
}

export interface Noun extends Card {
  type: CardType.NOUN;
  value: string;
  translation: string;
  gender: NounGender;
  variants: NounVariant[];
}

export interface ArticleVariant {
  case: Case;
  value: string;
}

export interface Article extends Card {
  type: CardType.ARTICLE;
  value: string;
  translation: string;
  gender: NounGender;
  number: NounNumber;
  isDefinite: boolean;
  variants: ArticleVariant[];
}

export enum AdjectiveDegree {
  Positiv,
  Komparativ,
  Superlativ,
}

export enum AdjectiveInflection {
  Weak,
  Strong,
  Mixed,
}

export interface AdjectiveVariant {
  degree: AdjectiveDegree;
  inflection: AdjectiveInflection;
  values: [Case, masculineValue: string, feminineValue: string, neutralValue: string, pluralValue: string][];
}

export interface Adjective extends Card {
  type: CardType.ADJECTIVE;
  value: string;
  translation: string;
  komparativ: string | null;
  superlativ: string | null;
  variants: AdjectiveVariant[];
}

export type AnyCard = Verb | Noun | Article | Adjective;
