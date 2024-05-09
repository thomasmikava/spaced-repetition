import {
  AdjectiveDegree,
  AdjectiveInflection,
  Attribute,
  AttributeRecord,
  CardType,
  Case,
  NounGender,
  NounNumber,
  PronounFunction,
  VerbMood,
  VerbPronoun,
  VerbTense,
} from './types';

export const attrbiutes: Attribute[] = [
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
];

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
  },
  {
    id: 22,
    attributeId: 5,
    name: 'Perfect',
  },
  {
    id: 23,
    attributeId: 5,
    name: 'Preterite',
  },
  {
    id: 24,
    attributeId: 5,
    name: 'Pluperfect',
  },
  {
    id: 25,
    attributeId: 5,
    name: 'Future I',
  },
  {
    id: 26,
    attributeId: 5,
    name: 'Future II',
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
  },
  {
    id: 44,
    attributeId: 10,
    name: 'Indefinite',
  },
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
};

export const CardTypeMapper = {
  [CardType.ARTICLE]: 1,
  [CardType.NOUN]: 2,
  [CardType.VERB]: 3,
  [CardType.PRONOUN]: 4,
  [CardType.ADJECTIVE]: 5,
  [CardType.PREPOSITION]: 6,
  [CardType.CONJUNCTION]: 7,
  [CardType.NUMBER]: 8,
  [CardType.PHRASE]: 9,
};
