import { CardType, Case, Pronoun, PronounFunction } from './types';

export const pronouns: Pronoun[] = [
  {
    type: CardType.PRONOUN,
    value: 'kein',
    translation: 'no Adj. - determiner',
    variants: [
      {
        function: PronounFunction.Attributive,
        values: [
          [Case.Nominativ, 'kein', 'keine', 'kein', 'keine'],
          [Case.Genitiv, 'keines', 'keiner', 'keines', 'keiner'],
          [Case.Dativ, 'keinem', 'keiner', 'keinem', 'keinen'],
          [Case.Akkusativ, 'keinen', 'keine', 'kein', 'keine'],
        ],
      },
      {
        function: PronounFunction.Representative,
        values: [
          [Case.Nominativ, 'keiner', 'keine', 'keines/keins', 'keine'],
          [Case.Genitiv, 'keines', 'keiner', 'keines', 'keiner'],
          [Case.Dativ, 'keinem', 'keiner', 'keinem', 'keinen'],
          [Case.Akkusativ, 'keinen', 'keine', 'keines/keins', 'keine'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'wer',
    translation: 'who; somebody; someone',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, 'wer', null],
          [Case.Genitiv, 'wessen', null],
          [Case.Dativ, 'wem', null],
          [Case.Akkusativ, 'wen', null],
        ],
      },
    ],
  },
  { type: CardType.PRONOUN, value: 'uns', translation: 'ourselves', variants: [] },
  {
    type: CardType.PRONOUN,
    value: 'ich',
    translation: 'I',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, 'ich', null],
          [Case.Genitiv, 'meiner', null],
          [Case.Dativ, 'mir', null],
          [Case.Akkusativ, 'mich', null],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'du',
    translation: 'you (singular)',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, 'du/Du', null],
          [Case.Genitiv, 'deiner/Deiner', null],
          [Case.Dativ, 'dir/Dir', null],
          [Case.Akkusativ, 'dich/Dich', null],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'er',
    translation: 'he',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, 'er', null],
          [Case.Genitiv, 'seiner', null],
          [Case.Dativ, 'ihm', null],
          [Case.Akkusativ, 'ihn', null],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'es',
    translation: 'it',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, 'es', null],
          [Case.Genitiv, 'seiner', null],
          [Case.Dativ, 'ihm', null],
          [Case.Akkusativ, 'es', null],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'wir',
    translation: 'we',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, null, 'wir'],
          [Case.Genitiv, null, 'unser'],
          [Case.Dativ, null, 'uns'],
          [Case.Akkusativ, null, 'uns'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'ihr',
    translation: 'you (plural)',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, null, 'ihr'],
          [Case.Genitiv, null, 'euer'],
          [Case.Dativ, null, 'euch'],
          [Case.Akkusativ, null, 'euch'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'sie/Sie',
    translation: 'they; You (formal)',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, null, 'sie'],
          [Case.Genitiv, null, 'ihrer'],
          [Case.Dativ, null, 'ihnen'],
          [Case.Akkusativ, null, 'sie'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'mein',
    translation: 'my',
    variants: [
      {
        function: PronounFunction.Attributive,
        values: [
          [Case.Nominativ, 'mein', 'meine', 'mein', 'meine'],
          [Case.Genitiv, 'meines', 'meiner', 'meines', 'meiner'],
          [Case.Dativ, 'meinem', 'meiner', 'meinem', 'meinen'],
          [Case.Akkusativ, 'meinen', 'meine', 'mein', 'meine'],
        ],
      },
      {
        function: PronounFunction.NonAttributiveWithoutArticle,
        values: [
          [Case.Nominativ, 'meiner', 'meine', 'meines/meins', 'meine'],
          [Case.Genitiv, 'meines', 'meiner', 'meines', 'meiner'],
          [Case.Dativ, 'meinem', 'meiner', 'meinem', 'meinen'],
          [Case.Akkusativ, 'meinen', 'meine', 'meines/meins', 'meine'],
        ],
      },
      {
        function: PronounFunction.NonAttributiveWithArticle,
        values: [
          [Case.Nominativ, 'meine', 'meine', 'meine', 'meinen'],
          [Case.Genitiv, 'meinen', 'meinen', 'meinen', 'meinen'],
          [Case.Dativ, 'meinen', 'meinen', 'meinen', 'meinen'],
          [Case.Akkusativ, 'meinen', 'meinen', 'meinen', 'meinen'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'dein',
    translation: 'your',
    variants: [
      {
        function: PronounFunction.Attributive,
        values: [
          [Case.Nominativ, 'dein', 'deine', 'dein', 'deine'],
          [Case.Genitiv, 'deines', 'deiner', 'deines', 'deiner'],
          [Case.Dativ, 'deinem', 'deiner', 'deinem', 'deinen'],
          [Case.Akkusativ, 'deinen', 'deine', 'dein', 'deine'],
        ],
      },
      {
        function: PronounFunction.NonAttributiveWithoutArticle,
        values: [
          [Case.Nominativ, 'deiner', 'deine', 'deines/deins', 'deine'],
          [Case.Genitiv, 'deines', 'deiner', 'deines', 'deiner'],
          [Case.Dativ, 'deinem', 'deiner', 'deinem', 'deinen'],
          [Case.Akkusativ, 'deinen', 'deine', 'deines/deins', 'deine'],
        ],
      },
      {
        function: PronounFunction.NonAttributiveWithArticle,
        values: [
          [Case.Nominativ, 'deine', 'deine', 'deine', 'deinen'],
          [Case.Genitiv, 'deinen', 'deinen', 'deinen', 'deinen'],
          [Case.Dativ, 'deinen', 'deinen', 'deinen', 'deinen'],
          [Case.Akkusativ, 'deinen', 'deinen', 'deinen', 'deinen'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'sein',
    uniqueValue: 'pr-sein',
    translation: "his; its; one's",
    variants: [
      {
        function: PronounFunction.Attributive,
        values: [
          [Case.Nominativ, 'sein', 'seine', 'sein', 'seine'],
          [Case.Genitiv, 'seines', 'seiner', 'seines', 'seiner'],
          [Case.Dativ, 'seinem', 'seiner', 'seinem', 'seinen'],
          [Case.Akkusativ, 'seinen', 'seine', 'sein', 'seine'],
        ],
      },
      {
        function: PronounFunction.NonAttributiveWithoutArticle,
        values: [
          [Case.Nominativ, 'seiner', 'seine', 'seines/seins', 'seine'],
          [Case.Genitiv, 'seines', 'seiner', 'seines', 'seiner'],
          [Case.Dativ, 'seinem', 'seiner', 'seinem', 'seinen'],
          [Case.Akkusativ, 'seinen', 'seine', 'seines/seins', 'seine'],
        ],
      },
      {
        function: PronounFunction.NonAttributiveWithArticle,
        values: [
          [Case.Nominativ, 'seine', 'seine', 'seine', 'seinen'],
          [Case.Genitiv, 'seinen', 'seinen', 'seinen', 'seinen'],
          [Case.Dativ, 'seinen', 'seinen', 'seinen', 'seinen'],
          [Case.Akkusativ, 'seinen', 'seinen', 'seinen', 'seinen'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'ihr/ihre',
    uniqueValue: 'ihrer',
    translation: 'her; their; Your (formal)',
    variants: [
      {
        function: PronounFunction.Attributive,
        values: [
          [Case.Nominativ, 'ihr', 'ihre', 'ihr', 'ihre'],
          [Case.Genitiv, 'ihres', 'ihrer', 'ihres', 'ihrer'],
          [Case.Dativ, 'ihrem', 'ihrer', 'ihrem', 'ihren'],
          [Case.Akkusativ, 'ihren', 'ihre', 'ihr', 'ihre'],
        ],
      },
      {
        function: PronounFunction.NonAttributiveWithoutArticle,
        values: [
          [Case.Nominativ, 'ihrer', 'ihre', 'ihres/ihrs', 'ihre'],
          [Case.Genitiv, 'ihres', 'ihrer', 'ihres', 'ihrer'],
          [Case.Dativ, 'ihrem', 'ihrer', 'ihrem', 'ihren'],
          [Case.Akkusativ, 'ihren', 'ihre', 'ihres/ihrs', 'ihre'],
        ],
      },
      {
        function: PronounFunction.NonAttributiveWithArticle,
        values: [
          [Case.Nominativ, 'ihre', 'ihre', 'ihre', 'ihren'],
          [Case.Genitiv, 'ihren', 'ihren', 'ihren', 'ihren'],
          [Case.Dativ, 'ihren', 'ihren', 'ihren', 'ihren'],
          [Case.Akkusativ, 'ihren', 'ihren', 'ihren', 'ihren'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'unser',
    translation: 'our',
    variants: [
      {
        function: PronounFunction.Attributive,
        values: [
          [Case.Nominativ, 'unser', 'unsere', 'unser', 'unsere'],
          [Case.Genitiv, 'unseres', 'unserer', 'unseres', 'unserer'],
          [Case.Dativ, 'unserem', 'unserer', 'unserem', 'unseren'],
          [Case.Akkusativ, 'unseren', 'unsere', 'unser', 'unsere'],
        ],
      },
      {
        function: PronounFunction.NonAttributiveWithoutArticle,
        values: [
          [Case.Nominativ, 'unserer', 'unsere', 'unseres/unsers', 'unsere'],
          [Case.Genitiv, 'unseres', 'unserer', 'unseres', 'unserer'],
          [Case.Dativ, 'unserem', 'unserer', 'unserem', 'unseren'],
          [Case.Akkusativ, 'unseren', 'unsere', 'unseres/unsers', 'unsere'],
        ],
      },
      {
        function: PronounFunction.NonAttributiveWithArticle,
        values: [
          [Case.Nominativ, 'unsere', 'unsere', 'unsere', 'unseren'],
          [Case.Genitiv, 'unseren', 'unseren', 'unseren', 'unseren'],
          [Case.Dativ, 'unseren', 'unseren', 'unseren', 'unseren'],
          [Case.Akkusativ, 'unseren', 'unseren', 'unseren', 'unseren'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'euer',
    translation: 'your (plural)',
    variants: [
      {
        function: PronounFunction.Attributive,
        values: [
          [Case.Nominativ, 'euer', 'euere/eure', 'euer', 'euere/eure'],
          [Case.Genitiv, 'eueres/eures', 'euerer/eurer', 'eueres/eures', 'euerer/eurer'],
          [Case.Dativ, 'euerem/euerm/eurem', 'euerer/eurer', 'euerem/euerm/eurem', 'eueren/euern/euren'],
          [Case.Akkusativ, 'eueren/euern/euren', 'euere/eure', 'euer', 'euere/eure'],
        ],
      },
      {
        function: PronounFunction.NonAttributiveWithoutArticle,
        values: [
          [Case.Nominativ, 'euerer/eurer', 'euere/eure', 'eueres/eures', 'euere/eure'],
          [Case.Genitiv, 'eueres/eures', 'euerer/eurer', 'eueres/eures', 'euerer/eurer'],
          [Case.Dativ, 'euerem/euerm/eurem', 'euerer/eurer', 'euerem/euerm/eurem', 'eueren/euern/euren'],
          [Case.Akkusativ, 'eueren/euern/euren', 'euere/eure', 'eueres/eures', 'euere/eure'],
        ],
      },
      {
        function: PronounFunction.NonAttributiveWithArticle,
        values: [
          [Case.Nominativ, 'euere/eure', 'euere/eure', 'euere/eure', 'eueren/euern/euren'],
          [Case.Genitiv, 'eueren/euern/euren', 'eueren/euern/euren', 'eueren/euern/euren', 'eueren/euern/euren'],
          [Case.Dativ, 'eueren/euern/euren', 'eueren/euern/euren', 'eueren/euern/euren', 'eueren/euern/euren'],
          [Case.Akkusativ, 'eueren/euern/euren', 'euere/eure', 'euere/eure', 'eueren/euern/euren'],
        ],
      },
    ],
  },
  { type: CardType.PRONOUN, value: 'welch', translation: 'what', variants: [] },
  { type: CardType.PRONOUN, value: 'einander', translation: 'each other; one another', variants: [] },
  {
    type: CardType.PRONOUN,
    value: 'nichts',
    translation: 'nothing; nil - nothing; bubkes auch: bupkes, bupkis, bupkus jiddisch',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, 'nichts', 'nichts'],
          [Case.Genitiv, 'nichts', 'nichts'],
          [Case.Dativ, 'nichts', 'nichts'],
          [Case.Akkusativ, 'nichts', 'nichts'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'jemand',
    translation: 'anybody; anyone; somebody; someone',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, 'jemand', null],
          [Case.Genitiv, 'jemands/jemandes', null],
          [Case.Dativ, 'jemand/jemandem', null],
          [Case.Akkusativ, 'jemand/jemanden', null],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'sich',
    translation: 'herself; himself; itself; themselves; oneself; each other; Yourself (formal)',
    variants: [],
  },
  {
    type: CardType.PRONOUN,
    value: 'dieser',
    translation: 'this Adj.; that',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, 'dieser', 'diese'],
          [Case.Genitiv, 'dieses', 'dieser'],
          [Case.Dativ, 'diesem', 'dieser'],
          [Case.Akkusativ, 'diesen', 'diese'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'alles',
    translation:
      'all - the only thing; followed by a relative clause; anything; everything; all Adj. - used before noun; owt - northern English dialect: "anything"; the whole lot',
    variants: [],
  },
  {
    type: CardType.PRONOUN,
    value: 'alle',
    translation: 'everybody; everyone; all and sundry; all of them',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, 'aller', 'alle', 'alles', 'alle'],
          [Case.Genitiv, 'allen', 'aller', 'allen', 'aller'],
          [Case.Dativ, 'allem', 'aller', 'allem', 'allen'],
          [Case.Akkusativ, 'allen', 'alle', 'alles', 'alle'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'der',
    uniqueValue: 'pr-der',
    translation: 'which; who; that (masc)',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, 'der', 'die'],
          [Case.Genitiv, 'dessen', 'derer/deren'],
          [Case.Dativ, 'dem', 'denen'],
          [Case.Akkusativ, 'den', 'die'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'die',
    uniqueValue: 'pr-die',
    translation: 'which; who; that (fem)',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, 'die', 'die'],
          [Case.Genitiv, 'deren', 'derer/deren'],
          [Case.Dativ, 'der', 'denen'],
          [Case.Akkusativ, 'die', 'die'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'das',
    uniqueValue: 'pr-das',
    translation: 'which; that (neut.)',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, 'das', 'die'],
          [Case.Genitiv, 'dessen', 'derer/deren'],
          [Case.Dativ, 'dem', 'denen'],
          [Case.Akkusativ, 'das', 'die'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'welcher',
    translation: 'which; whichever; whichsoever; whatever',
    variants: [
      {
        function: PronounFunction.Relative,
        values: [
          [Case.Nominativ, 'welcher', 'welche', 'welches', 'welche'],
          [Case.Genitiv, null, null, null, null],
          [Case.Dativ, 'welchem', 'welcher', 'welchem', 'welchen'],
          [Case.Akkusativ, 'welchen', 'welche', 'welches', 'welche'],
        ],
      },
      {
        function: PronounFunction.Interrogative,
        values: [
          [Case.Nominativ, 'welcher', 'welche', 'welches', 'welche'],
          [Case.Genitiv, 'welches/welchen', 'welcher', 'welches/welchen', 'welcher'],
          [Case.Dativ, 'welchem', 'welcher', 'welchem', 'welchen'],
          [Case.Akkusativ, 'welchen', 'welche', 'welches', 'welche'],
        ],
      },
    ],
  },
  {
    type: CardType.PRONOUN,
    value: 'etwas',
    translation:
      'anything; something; a little; a bit (of); slightly Adv.; owt - northern English dialect: "anything"; some - small quantity of; a trifle',
    variants: [
      {
        function: PronounFunction.Declanation,
        values: [
          [Case.Nominativ, 'etwas', 'etwas'],
          [Case.Genitiv, 'etwas', 'etwas'],
          [Case.Dativ, 'etwas', 'etwas'],
          [Case.Akkusativ, 'etwas', 'etwas'],
        ],
      },
    ],
  },
];
