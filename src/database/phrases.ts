import type { Phrase } from './types';
import { CardType } from './types';

export const phrases: Phrase[] = [
  {
    type: CardType.PHRASE,
    value: 'Prost',
    translation: 'cheers; to your health',
  },
  {
    type: CardType.PHRASE,
    value: 'Bitte',
    translation:
      "please; You're welcome!; Not at all.; if you please; Don't mention it!; It's all right!; Never mind!; Pardon?; There you go!; Here you are!;",
  },
  {
    type: CardType.PHRASE,
    value: 'Tschüss/Tschüs',
    uniqueValue: 'Tschüss',
    translation: 'goodbye!; Bye-bye!; Bye!; Cheers!',
  },
  {
    type: CardType.PHRASE,
    value: 'Hallo',
    translation: 'Hello!; Hi!;',
  },
  {
    type: CardType.PHRASE,
    value: 'Danke',
    translation: 'thank you; thanks;',
  },
  {
    type: CardType.PHRASE,
    value: 'Los',
    translation: 'Go! [SPORT.]',
  },
  {
    type: CardType.PHRASE,
    value: 'Schade',
    translation: 'What a pity!; What a shame!; Too bad!;',
  },
  {
    type: CardType.PHRASE,
    value: 'Ach',
    translation: 'Oh!; Ah!; Ouch!;',
  },
  {
    type: CardType.PHRASE,
    value: 'Na',
    translation: 'well; why',
  },
];
