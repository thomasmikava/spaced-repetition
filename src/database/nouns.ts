import { CardType, Case, Noun, NounGender, NounNumber } from './types';

export const nouns: Noun[] = [
  {
    type: CardType.NOUN,
    value: 'Jahr',
    translation: 'year',
    gender: NounGender.Neutrum,
    variants: [
      { number: NounNumber.singular, case: Case.Nominativ, value: 'Jahr' },
      { number: NounNumber.singular, case: Case.Genitiv, value: 'Jahrs/Jahres' },
      { number: NounNumber.singular, case: Case.Dativ, value: 'Jahr' },
      { number: NounNumber.singular, case: Case.Akkusativ, value: 'Jahr' },
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Jahre' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Jahre' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Jahren' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Jahre' },
    ],
  },
  {
    type: CardType.NOUN,
    value: 'Mal',
    translation: 'time',
    gender: NounGender.Neutrum,
    variants: [
      { number: NounNumber.singular, case: Case.Nominativ, value: 'Mal' },
      { number: NounNumber.singular, case: Case.Genitiv, value: 'Mals/Males' },
      { number: NounNumber.singular, case: Case.Dativ, value: 'Mal' },
      { number: NounNumber.singular, case: Case.Akkusativ, value: 'Mal' },
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Male' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Male' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Malen' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Male' },
    ],
  },
  {
    type: CardType.NOUN,
    value: 'Beispiel',
    translation: 'example',
    gender: NounGender.Neutrum,
    variants: [
      { number: NounNumber.singular, case: Case.Nominativ, value: 'Beispiel' },
      { number: NounNumber.singular, case: Case.Genitiv, value: 'Beispiels/Beispieles' },
      { number: NounNumber.singular, case: Case.Dativ, value: 'Beispiel' },
      { number: NounNumber.singular, case: Case.Akkusativ, value: 'Beispiel' },
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Beispiele' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Beispiele' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Beispielen' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Beispiele' },
    ],
  },
  {
    type: CardType.NOUN,
    value: 'Zeit',
    translation: 'time; period',
    gender: NounGender.Femininum,
    variants: [
      { number: NounNumber.singular, case: Case.Nominativ, value: 'Beispiel' },
      { number: NounNumber.singular, case: Case.Genitiv, value: 'Beispiels/Beispieles' },
      { number: NounNumber.singular, case: Case.Dativ, value: 'Beispiel' },
      { number: NounNumber.singular, case: Case.Akkusativ, value: 'Beispiel' },
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Beispiele' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Beispiele' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Beispielen' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Beispiele' },
    ],
  },
  {
    type: CardType.NOUN,
    value: 'Frau',
    translation: 'wife; woman; Mrs.',
    gender: NounGender.Femininum,
    variants: [
      { number: NounNumber.singular, case: Case.Nominativ, value: 'Frau' },
      { number: NounNumber.singular, case: Case.Genitiv, value: 'Frau' },
      { number: NounNumber.singular, case: Case.Dativ, value: 'Frau' },
      { number: NounNumber.singular, case: Case.Akkusativ, value: 'Frau' },
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Frauen' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Frauen' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Frauen' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Frauen' },
    ],
  },
  {
    type: CardType.NOUN,
    value: 'Mensch',
    translation: 'human; person; man',
    gender: NounGender.Maskulinum,
    variants: [
      { number: NounNumber.singular, case: Case.Nominativ, value: 'Frau' },
      { number: NounNumber.singular, case: Case.Genitiv, value: 'Frau' },
      { number: NounNumber.singular, case: Case.Dativ, value: 'Frau' },
      { number: NounNumber.singular, case: Case.Akkusativ, value: 'Frau' },
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Frauen' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Frauen' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Frauen' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Frauen' },
    ],
  },
  {
    type: CardType.NOUN,
    value: 'Deutsch',
    translation: 'German (language)',
    gender: NounGender.Neutrum,
    variants: [
      { number: NounNumber.singular, case: Case.Nominativ, value: 'Frau' },
      { number: NounNumber.singular, case: Case.Genitiv, value: 'Frau' },
      { number: NounNumber.singular, case: Case.Dativ, value: 'Frau' },
      { number: NounNumber.singular, case: Case.Akkusativ, value: 'Frau' },
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Frauen' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Frauen' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Frauen' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Frauen' },
    ],
  },
  {
    type: CardType.NOUN,
    value: 'Kind',
    translation: 'child; kid',
    gender: NounGender.Neutrum,
    variants: [
      { number: NounNumber.singular, case: Case.Nominativ, value: 'Kind' },
      { number: NounNumber.singular, case: Case.Genitiv, value: 'Kinds/Kindes' },
      { number: NounNumber.singular, case: Case.Dativ, value: 'Kind' },
      { number: NounNumber.singular, case: Case.Akkusativ, value: 'Kind' },
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Kinder' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Kinder' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Kindern' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Kinder' },
    ],
  },
  {
    type: CardType.NOUN,
    value: 'Tag',
    translation: 'day',
    gender: NounGender.Maskulinum,
    variants: [
      { number: NounNumber.singular, case: Case.Nominativ, value: 'Tag' },
      { number: NounNumber.singular, case: Case.Genitiv, value: 'Tags/Tages' },
      { number: NounNumber.singular, case: Case.Dativ, value: 'Tag' },
      { number: NounNumber.singular, case: Case.Akkusativ, value: 'Tag' },
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Tage' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Tage' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Tagen' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Tage' },
    ],
  },
  {
    type: CardType.NOUN,
    value: 'Mann',
    translation: 'man; guy',
    gender: NounGender.Maskulinum,
    variants: [
      { number: NounNumber.singular, case: Case.Nominativ, value: 'Mann' },
      { number: NounNumber.singular, case: Case.Genitiv, value: 'Manns/Mannes' },
      { number: NounNumber.singular, case: Case.Dativ, value: 'Mann' },
      { number: NounNumber.singular, case: Case.Akkusativ, value: 'Mann' },
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Männer' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Männer' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Männern' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Männer' },
    ],
  },
  {
    type: CardType.NOUN,
    value: 'Land',
    translation: 'country; ground; land',
    gender: NounGender.Neutrum,
    variants: [
      { number: NounNumber.singular, case: Case.Nominativ, value: 'Land' },
      { number: NounNumber.singular, case: Case.Genitiv, value: 'Lands/Landes' },
      { number: NounNumber.singular, case: Case.Dativ, value: 'Land' },
      { number: NounNumber.singular, case: Case.Akkusativ, value: 'Land' },
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Länder' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Länder' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Ländern' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Länder' },
    ],
  },
  {
    type: CardType.NOUN,
    value: 'Frage',
    translation: 'question; issue; matter',
    gender: NounGender.Femininum,
    variants: [
      { number: NounNumber.singular, case: Case.Nominativ, value: 'Frage' },
      { number: NounNumber.singular, case: Case.Genitiv, value: 'Frage' },
      { number: NounNumber.singular, case: Case.Dativ, value: 'Frage' },
      { number: NounNumber.singular, case: Case.Akkusativ, value: 'Frage' },
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Fragen' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Fragen' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Fragen' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Fragen' },
    ],
  },
  {
    type: CardType.NOUN,
    value: 'Haus',
    translation: 'home; house',
    gender: NounGender.Neutrum,
    variants: [
      { number: NounNumber.singular, case: Case.Nominativ, value: 'Haus' },
      { number: NounNumber.singular, case: Case.Genitiv, value: 'Hauses' },
      { number: NounNumber.singular, case: Case.Dativ, value: 'Haus' },
      { number: NounNumber.singular, case: Case.Akkusativ, value: 'Haus' },
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Häuser' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Häuser' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Häusern' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Häuser' },
    ],
  },
  {
    type: CardType.NOUN,
    value: 'Fall',
    translation: 'drop; case',
    gender: NounGender.Maskulinum,
    variants: [
      { number: NounNumber.singular, case: Case.Nominativ, value: 'Fall' },
      { number: NounNumber.singular, case: Case.Genitiv, value: 'Falls/Falles' },
      { number: NounNumber.singular, case: Case.Dativ, value: 'Fall' },
      { number: NounNumber.singular, case: Case.Akkusativ, value: 'Fall' },
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Fälle' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Fälle' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Fällen' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Fälle' },
    ],
  },
  {
    type: CardType.NOUN,
    value: 'Leute',
    translation: 'people; folk',
    gender: NounGender.Plural,
    variants: [
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Leute' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Leute' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Leuten' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Leute' },
    ],
  },
  {
    type: CardType.NOUN,
    value: 'Arbeit',
    translation: 'job; work; labor; chore; task',
    gender: NounGender.Femininum,
    variants: [
      { number: NounNumber.singular, case: Case.Nominativ, value: 'Arbeit' },
      { number: NounNumber.singular, case: Case.Genitiv, value: 'Arbeit' },
      { number: NounNumber.singular, case: Case.Dativ, value: 'Arbeit' },
      { number: NounNumber.singular, case: Case.Akkusativ, value: 'Arbeit' },
      { number: NounNumber.plural, case: Case.Nominativ, value: 'Arbeiten' },
      { number: NounNumber.plural, case: Case.Genitiv, value: 'Arbeiten' },
      { number: NounNumber.plural, case: Case.Dativ, value: 'Arbeiten' },
      { number: NounNumber.plural, case: Case.Akkusativ, value: 'Arbeiten' },
    ],
  },
];
