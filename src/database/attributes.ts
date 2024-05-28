import {
  AdjectiveDegree,
  AdjectiveInflection,
  Attribute,
  AttributeRecord,
  Case,
  NounGender,
  NounNumber,
  PronounFunction,
  VerbMood,
  VerbPronoun,
  VerbTense,
} from './types';

export const attributes: Attribute[] = [
  {
    id: 1,
    name: 'Number',
  },
  {
    id: 2,
    name: 'Gender',
  },
  {
    id: 3,
    name: 'Case',
  },
  {
    id: 4,
    name: 'Pronoun',
  },
  {
    id: 5,
    name: 'Tense',
  },
  {
    id: 6,
    name: 'Mood',
  },
  {
    id: 7,
    name: 'Degree',
  },
  {
    id: 8,
    name: 'Inflection',
  },
  {
    id: 9,
    name: 'Function',
  },
  {
    id: 10,
    name: 'Definiteness',
  },
  {
    id: 11,
    name: 'Speciality',
  },
];

export interface AttributeLocalization {
  lang: string;
  attributeId: number;
  name: string;
}

export const attributeLocalizations: AttributeLocalization[] = [
  { lang: 'de', attributeId: 1, name: 'Numerus' },
  { lang: 'de', attributeId: 2, name: 'Genus' },
  { lang: 'de', attributeId: 3, name: 'Fall' },
  { lang: 'de', attributeId: 4, name: 'Pronomen' },
  { lang: 'de', attributeId: 5, name: 'Tempus' },
  { lang: 'de', attributeId: 6, name: 'Modus' },
  { lang: 'de', attributeId: 7, name: 'Grad' },
  { lang: 'de', attributeId: 8, name: 'Flexion' },
  { lang: 'de', attributeId: 9, name: 'Funktion' },
  { lang: 'de', attributeId: 10, name: 'Definitheit' },
  { lang: 'de', attributeId: 11, name: 'Spezialität' },
];

export interface AttributeRecordLocalization {
  lang: string;
  attributeId: number;
  attributeRecordId: number;
  name: string;
  color?: string;
}

export const attributeRecords: AttributeRecord[] = [
  {
    id: 1,
    attributeId: 1,
    name: 'Singular',
    color: '_lightBlue',
  },
  {
    id: 2,
    attributeId: 1,
    name: 'Plural',
    color: '_green',
  },
  {
    id: 3,
    attributeId: 2,
    name: 'Masculine',
    color: '_blue',
  },
  {
    id: 4,
    attributeId: 2,
    name: 'Feminine',
    color: '_pink',
  },
  {
    id: 5,
    attributeId: 2,
    name: 'Neuter',
    color: '_violet',
  },
  {
    id: 6,
    attributeId: 2,
    name: 'Plural',
    color: '_green',
  },
  {
    id: 7,
    attributeId: 3,
    name: 'Nominative',
    color: '_lightBlue',
  },
  {
    id: 8,
    attributeId: 3,
    name: 'Accusative',
    color: '_orange',
  },
  {
    id: 9,
    attributeId: 3,
    name: 'Dative',
    color: '_green',
  },
  {
    id: 10,
    attributeId: 3,
    name: 'Genitive',
    color: '_pink',
  },
  {
    id: 11,
    attributeId: 4,
    name: 'I',
  },
  {
    id: 12,
    attributeId: 4,
    name: 'you (singular)',
  },
  {
    id: 13,
    attributeId: 4,
    name: 'he',
  },
  {
    id: 14,
    attributeId: 4,
    name: 'she',
  },
  {
    id: 15,
    attributeId: 4,
    name: 'it',
  },
  {
    id: 16,
    attributeId: 4,
    name: 'he/she/it',
  },
  {
    id: 17,
    attributeId: 4,
    name: 'we',
  },
  {
    id: 18,
    attributeId: 4,
    name: 'you (plural)',
  },
  {
    id: 19,
    attributeId: 4,
    name: 'they',
  },
  {
    id: 20,
    attributeId: 4,
    name: 'they/you (plural)',
  },
  {
    id: 21,
    attributeId: 5,
    name: 'Present',
    color: '_lightBlue',
  },
  {
    id: 22,
    attributeId: 5,
    name: 'Perfect',
    color: '_green',
  },
  {
    id: 23,
    attributeId: 5,
    name: 'Preterite',
    color: '_orange',
  },
  {
    id: 24,
    attributeId: 5,
    name: 'Pluperfect',
    color: '_blue',
  },
  {
    id: 25,
    attributeId: 5,
    name: 'Future I',
    color: '_pink',
  },
  {
    id: 26,
    attributeId: 5,
    name: 'Future II',
    color: '_violet',
  },
  {
    id: 27,
    attributeId: 6,
    name: 'Indicative',
  },
  {
    id: 28,
    attributeId: 6,
    name: 'Conjunctive',
  },
  {
    id: 29,
    attributeId: 6,
    name: 'Imperative',
  },
  {
    id: 30,
    attributeId: 7,
    name: 'Positive',
    color: '_lightBlue',
  },
  {
    id: 31,
    attributeId: 7,
    name: 'Comparative',
    color: '_orange',
  },
  {
    id: 32,
    attributeId: 7,
    name: 'Superlative',
    color: '_green',
  },
  {
    id: 33,
    attributeId: 8,
    name: 'Weak',
  },
  {
    id: 34,
    attributeId: 8,
    name: 'Strong',
  },
  {
    id: 35,
    attributeId: 8,
    name: 'Mixed',
  },
  {
    id: 36,
    attributeId: 9,
    name: 'Attributive',
  },
  {
    id: 37,
    attributeId: 9,
    name: 'Non-attributive without article',
  },
  {
    id: 38,
    attributeId: 9,
    name: 'Non-attributive with article',
  },
  {
    id: 39,
    attributeId: 9,
    name: 'Representative',
  },
  {
    id: 40,
    attributeId: 9,
    name: 'Declanation',
  },
  {
    id: 41,
    attributeId: 9,
    name: 'Relative',
  },
  {
    id: 42,
    attributeId: 9,
    name: 'Interrogative',
  },
  {
    id: 43,
    attributeId: 10,
    name: 'Definite',
    color: '_lightBlue',
  },
  {
    id: 44,
    attributeId: 10,
    name: 'Indefinite',
    color: '_green',
  },
  {
    id: 45,
    attributeId: 11,
    name: 'Modal verb',
  },
];

export const attributeRecordLocalizations: AttributeRecordLocalization[] = [
  { lang: 'de', attributeId: 1, attributeRecordId: 1, name: 'Singular' },
  { lang: 'de', attributeId: 1, attributeRecordId: 2, name: 'Plural' },
  { lang: 'de', attributeId: 2, attributeRecordId: 3, name: 'Maskulinum' },
  { lang: 'de', attributeId: 2, attributeRecordId: 4, name: 'Femininum' },
  { lang: 'de', attributeId: 2, attributeRecordId: 5, name: 'Neutrum' },
  { lang: 'de', attributeId: 2, attributeRecordId: 6, name: 'Plural' },
  { lang: 'de', attributeId: 3, attributeRecordId: 7, name: 'Nominativ' },
  { lang: 'de', attributeId: 3, attributeRecordId: 8, name: 'Akkusativ' },
  { lang: 'de', attributeId: 3, attributeRecordId: 9, name: 'Dativ' },
  { lang: 'de', attributeId: 3, attributeRecordId: 10, name: 'Genitiv' },
  { lang: 'de', attributeId: 4, attributeRecordId: 11, name: 'ich' },
  { lang: 'de', attributeId: 4, attributeRecordId: 12, name: 'du' },
  { lang: 'de', attributeId: 4, attributeRecordId: 15, name: 'es' },
  { lang: 'de', attributeId: 4, attributeRecordId: 16, name: 'er/sie/es' },
  { lang: 'de', attributeId: 4, attributeRecordId: 17, name: 'wir' },
  { lang: 'de', attributeId: 4, attributeRecordId: 18, name: 'ihr' },
  { lang: 'de', attributeId: 4, attributeRecordId: 20, name: 'sie/Sie' },
  { lang: 'de', attributeId: 5, attributeRecordId: 21, name: 'Präsens' },
  { lang: 'de', attributeId: 5, attributeRecordId: 22, name: 'Perfekt' },
  { lang: 'de', attributeId: 5, attributeRecordId: 23, name: 'Präteritum' },
  { lang: 'de', attributeId: 5, attributeRecordId: 24, name: 'Plusquamperfekt' },
  { lang: 'de', attributeId: 5, attributeRecordId: 25, name: 'Futur I' },
  { lang: 'de', attributeId: 5, attributeRecordId: 26, name: 'Futur II' },
  { lang: 'de', attributeId: 6, attributeRecordId: 27, name: 'Indikativ' },
  { lang: 'de', attributeId: 6, attributeRecordId: 28, name: 'Konjunktiv' },
  { lang: 'de', attributeId: 6, attributeRecordId: 29, name: 'Imperativ' },
  { lang: 'de', attributeId: 7, attributeRecordId: 30, name: 'Positiv' },
  { lang: 'de', attributeId: 7, attributeRecordId: 31, name: 'Komparativ' },
  { lang: 'de', attributeId: 7, attributeRecordId: 32, name: 'Superlativ' },
  { lang: 'de', attributeId: 8, attributeRecordId: 33, name: 'Schwach' },
  { lang: 'de', attributeId: 8, attributeRecordId: 34, name: 'Stark' },
  { lang: 'de', attributeId: 8, attributeRecordId: 35, name: 'Gemischt' },
  { lang: 'de', attributeId: 9, attributeRecordId: 36, name: 'Attributiv (vor Nomen)' },
  { lang: 'de', attributeId: 9, attributeRecordId: 37, name: 'Nicht-attributiv, ohne Artikel' },
  { lang: 'de', attributeId: 9, attributeRecordId: 38, name: 'Nicht-attributiv, mit Artikel' },
  { lang: 'de', attributeId: 9, attributeRecordId: 39, name: 'Stellvertretend' },
  { lang: 'de', attributeId: 9, attributeRecordId: 40, name: 'Deklination' },
  { lang: 'de', attributeId: 9, attributeRecordId: 41, name: 'Relativ' },
  { lang: 'de', attributeId: 9, attributeRecordId: 42, name: 'Interrogativ' },
  { lang: 'de', attributeId: 10, attributeRecordId: 43, name: 'Bestimmter' },
  { lang: 'de', attributeId: 10, attributeRecordId: 44, name: 'Unbestimmter' },
  { lang: 'de', attributeId: 11, attributeRecordId: 45, name: 'Modalverb' },
];

export const AttributeMapper = {
  NUMBER: {
    id: 1,
    records: {
      [NounNumber.singular]: 1,
      [NounNumber.plural]: 2,
    },
  },
  GENDER: {
    id: 2,
    records: {
      [NounGender.Maskulinum]: 3,
      [NounGender.Femininum]: 4,
      [NounGender.Neutrum]: 5,
      [NounGender.Plural]: 6,
    },
  },
  CASE: {
    id: 3,
    records: {
      [Case.Nominativ]: 7,
      [Case.Akkusativ]: 8,
      [Case.Dativ]: 9,
      [Case.Genitiv]: 10,
    },
  },
  PRONOUN: {
    id: 4,
    records: {
      [VerbPronoun.ich]: 11,
      [VerbPronoun.du]: 12,
      [VerbPronoun.er_sie_es]: 16,
      [VerbPronoun.es]: 15,
      [VerbPronoun.wir]: 17,
      [VerbPronoun.ihr]: 18,
      [VerbPronoun.sie_Sie]: 20,
    },
  },
  TENSE: {
    id: 5,
    records: {
      [VerbTense.Präsens]: 21,
      [VerbTense.Perfekt]: 22,
      [VerbTense.Präteritum]: 23,
      [VerbTense.Plusquamperfekt]: 24,
      [VerbTense.Futur1]: 25,
      [VerbTense.Futur2]: 26,
      [VerbTense.Futur2_1]: 25,
      [VerbTense.Futur2_2]: 26,
    },
  },
  MOOD: {
    id: 6,
    records: {
      [VerbMood.Indikativ]: 27,
      [VerbMood.Konjunktiv]: 28,
      [VerbMood.Imperativ]: 29,
    },
  },
  DEGREE: {
    id: 7,
    records: {
      [AdjectiveDegree.Positiv]: 30,
      [AdjectiveDegree.Komparativ]: 31,
      [AdjectiveDegree.Superlativ]: 32,
    },
  },
  INFLECTION: {
    id: 8,
    records: {
      [AdjectiveInflection.Weak]: 33,
      [AdjectiveInflection.Strong]: 34,
      [AdjectiveInflection.Mixed]: 35,
    },
  },
  FUNCTION: {
    id: 9,
    records: {
      [PronounFunction.Attributive]: 36,
      [PronounFunction.NonAttributiveWithoutArticle]: 37,
      [PronounFunction.NonAttributiveWithArticle]: 38,
      [PronounFunction.Representative]: 39,
      [PronounFunction.Declanation]: 40,
      [PronounFunction.Relative]: 41,
      [PronounFunction.Interrogative]: 42,
    },
  },
  DEFINITENESS: {
    id: 10,
    records: {
      ['true']: 43,
      ['false']: 44,
    },
  },
  SPECIALITY: {
    id: 11,
    records: {
      modalVerb: 45,
    },
  },
};
