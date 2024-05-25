export enum CardType {
  ARTICLE = 'ARTICLE',
  NOUN = 'NOUN',
  VERB = 'VERB',
  PRONOUN = 'PRONOUN',
  ADJECTIVE = 'ADJECTIVE',
  PREPOSITION = 'PREPOSITION',
  CONJUNCTION = 'CONJUNCTION',
  NUMBER = 'NUMBER',
  PHRASE = 'PHRASE',
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
  es,
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
  priority?: number;
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
  translations: [schema: string, translation: string][];
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

export interface Phrase extends Card {
  type: CardType.PHRASE;
  mainType?: CardType;
  value: string;
  translation: string;
}

export interface Conjunction extends Card {
  type: CardType.CONJUNCTION;
  value: string;
  translation: string;
}

export interface Preposition extends Card {
  type: CardType.PREPOSITION;
  value: string;
  translation: string;
  variations: { cases: Case[]; translation: string }[];
}

export enum PronounFunction {
  Attributive,
  NonAttributiveWithoutArticle,
  NonAttributiveWithArticle,
  Representative,
  Declanation,
  Relative,
  Interrogative,
}

interface PronounVariantDeclaration {
  function: PronounFunction.Declanation;
  values: (
    | [Case, singularValue: string | null, pluralValue: string | null]
    | [Case, masculineValue: string, feminineValue: string, neutralValue: string, pluralValue: string]
  )[];
}
interface PronounVariantRegular {
  function:
    | PronounFunction.Attributive
    | PronounFunction.NonAttributiveWithArticle
    | PronounFunction.NonAttributiveWithoutArticle
    | PronounFunction.Representative
    | PronounFunction.Relative
    | PronounFunction.Interrogative;
  values: [
    Case,
    masculineValue: string | null,
    feminineValue: string | null,
    neutralValue: string | null,
    pluralValue: string | null,
  ][];
}

export type PronounVariant = PronounVariantDeclaration | PronounVariantRegular;

export interface Pronoun extends Card {
  type: CardType.PRONOUN;
  value: string;
  translation: string;
  variants: PronounVariant[];
}

export type AnyCard = Verb | Noun | Article | Adjective | Phrase | Conjunction | Preposition | Pronoun;

/// New standard types

export type IdType = number;

export type StandardCardType = IdType;
export type StandardCardAttributes = Record<string, IdType>; // key: attribute id, value: attribute record id
export type StandardCardVariant = {
  id: IdType;
  attrs?: StandardCardAttributes | null;
  category?: IdType | null;
  value: string;
};

export type TranslationVariant = {
  schema?: string;
  attrs?: Record<string, IdType | IdType[]>;
  translation: string;
};

export type StandardCard = {
  id: IdType;
  lang: string;
  type: StandardCardType;
  mainType?: StandardCardType | null;
  value: string;
  /** @deprecated needs to be removed */
  uniqueValue?: string | undefined;
  attributes?: StandardCardAttributes | null;
  variants: StandardCardVariant[];
  /** Should be moved into separate table */
  translation: string;
  /** Should be moved into separate table */
  advancedTranslation?: TranslationVariant[] | null;
};

export interface Attribute {
  id: IdType;
  name: string;
}

export interface AttributeRecord {
  id: IdType;
  attributeId: IdType;
  name: string;
  color?: string;
}

export interface Category {
  id: IdType;
  name: string;
}
