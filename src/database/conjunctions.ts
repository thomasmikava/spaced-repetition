import { CardType, Conjunction } from './types';

export const conjunctions: Conjunction[] = [
  { type: CardType.CONJUNCTION, value: 'wenn', translation: 'if; when; whether; by the time; if and when' },
  { type: CardType.CONJUNCTION, value: 'und', translation: 'and' },
  { type: CardType.CONJUNCTION, value: 'oder', translation: 'or' },
  { type: CardType.CONJUNCTION, value: 'aber', translation: 'but; yet; only' },
  { type: CardType.CONJUNCTION, value: 'sondern', translation: 'but' },
  {
    type: CardType.CONJUNCTION,
    value: 'denn',
    translation: 'because',
  },
  { type: CardType.CONJUNCTION, value: 'dass', translation: 'that' },
  {
    type: CardType.CONJUNCTION,
    value: 'weil',
    translation:
      'because; as; since; due to the fact that; in that - insofar as; \'cause - short for "because" [ugs.]; whereas [JURA]; by reason that selten',
  },
  {
    type: CardType.CONJUNCTION,
    value: 'obwohl',
    translation:
      'although; though; while; notwithstanding that; even though; altho - informal spelling of "although" (Amer.) [ugs.]; tho\' [ugs.]',
  },
  { type: CardType.CONJUNCTION, value: 'bevor', translation: 'before' },
  { type: CardType.CONJUNCTION, value: 'nachdem', translation: 'after; whereas [JURA]' },
  { type: CardType.CONJUNCTION, value: 'während', translation: 'while; whereas; when; as; throughout Präp.' },
  { type: CardType.CONJUNCTION, value: 'als', translation: 'as; than; when; while' },
  { type: CardType.CONJUNCTION, value: 'sobald', translation: 'once; as soon as; the minute (that)' },
  {
    type: CardType.CONJUNCTION,
    value: 'sofern',
    translation: 'provided (that); providing (that); if; provided - if; in case',
  },
  { type: CardType.CONJUNCTION, value: 'entweder', translation: 'either' },
  { type: CardType.CONJUNCTION, value: 'weder', translation: 'neither' },
  { type: CardType.CONJUNCTION, value: 'noch', translation: 'nor' },
  { type: CardType.CONJUNCTION, value: 'sowohl', translation: 'as well - ... as' },
  { type: CardType.CONJUNCTION, value: 'seitdem', translation: 'since; ever since; since then' },
  { type: CardType.CONJUNCTION, value: 'jedoch', translation: 'only' },
  { type: CardType.CONJUNCTION, value: 'hingegen', translation: 'whereas' },
  { type: CardType.CONJUNCTION, value: 'wie', translation: 'as; such as; like; how' },
  { type: CardType.CONJUNCTION, value: 'wo', translation: 'where; when' },
  { type: CardType.CONJUNCTION, value: 'soweit', translation: 'as far as; insofar (auch: in so far) as' },
  { type: CardType.CONJUNCTION, value: 'ob', translation: 'if; whether' },
];
