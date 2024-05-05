import { CardType, Case, Preposition } from './types';

export const prepositions: Preposition[] = [
  {
    type: CardType.PREPOSITION,
    value: 'durch',
    translation:
      'by; through; per; via; by means of; by dint of; by the use of; thru - informal, simplified spelling of "through" (Amer.) [ugs.]',
    variations: [
      {
        translation:
          'by; through; per; via; by means of; by dint of; by the use of; thru - informal, simplified spelling of "through" (Amer.) [ugs.]',
        cases: [Case.Akkusativ],
      },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'für',
    translation: 'for; per; pro; in favor, of in favour, of; in exchange for; in place of; instead of; on behalf of',
    variations: [
      {
        translation:
          'for; per; pro; in favor, of in favour, of; in exchange for; in place of; instead of; on behalf of',
        cases: [Case.Akkusativ],
      },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'gegen',
    uniqueValue: 'pre-gegen',
    translation:
      'against; towardesp, towardsesp,; versus [Abk.: v., vs.] [JURA][SPORT]; contrary to; compared with; contra; in comparison with; anti; to; in countercurrent with [TECH.]',
    variations: [
      {
        translation:
          'against; towardesp, towardsesp,; versus [Abk.: v., vs.] [JURA][SPORT]; contrary to; compared with; contra; in comparison with; anti; to; in countercurrent with [TECH.]',
        cases: [Case.Akkusativ],
      },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'ohne',
    translation: 'without [Abk.: w/o]; but for; excluding; ex; exclusive of',
    variations: [{ translation: 'without [Abk.: w/o]; but for; excluding; ex; exclusive of', cases: [Case.Akkusativ] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'um',
    translation: 'at; around; about',
    variations: [{ translation: 'at; around; about', cases: [Case.Akkusativ] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'aus',
    translation: 'from; out of; of; in; made of; ex; for',
    variations: [{ translation: 'from; out of; of; in; made of; ex; for', cases: [Case.Dativ] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'bei',
    translation:
      'near; at; with; by; in; on; during; among; despite; for; in spite of; in case of; in the case of; next to',
    variations: [
      {
        translation:
          'near; at; with; by; in; on; during; among; despite; for; in spite of; in case of; in the case of; next to',
        cases: [Case.Dativ],
      },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'mit',
    translation: 'with; cum - Latin for "with"; including; together with',
    variations: [{ translation: 'with; cum - Latin for "with"; including; together with', cases: [Case.Dativ] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'nach',
    translation:
      'after; for; past - to or on the other side of; to; towardesp, towardsesp,; on; past - later than; in; onto; according as',
    variations: [
      {
        translation:
          'after; for; past - to or on the other side of; to; towardesp, towardsesp,; on; past - later than; in; onto; according as',
        cases: [Case.Dativ],
      },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'von',
    translation: 'by; of; from; off; in; out of',
    variations: [{ translation: 'by; of; from; off; in; out of', cases: [Case.Dativ] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'zu',
    uniqueValue: 'pre-zu',
    translation: 'to; towardesp, towardsesp,; in; at; for; onto',
    variations: [{ translation: 'to; towardesp, towardsesp,; in; at; for; onto', cases: [Case.Dativ] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'während',
    translation: 'over a period of time; during; for',
    variations: [
      { translation: 'over a period of time', cases: [Case.Genitiv] },
      { translation: 'during; for', cases: [Case.Dativ, Case.Genitiv] },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'wegen',
    translation:
      're; concerning; by reason of; over - on account of; thanks to; because of; due to; on account of; owing to; regarding; about; for; for the sake of',
    variations: [
      { translation: 're; concerning; by reason of; over - on account of; thanks to', cases: [Case.Genitiv] },
      {
        translation: 'because of; due to; on account of; owing to; regarding; about; for; for the sake of',
        cases: [Case.Dativ, Case.Genitiv],
      },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'trotz',
    translation: 'despite; in spite of; notwithstanding; for all; in face of',
    variations: [
      { translation: 'despite; in spite of; notwithstanding; for all; in face of', cases: [Case.Dativ, Case.Genitiv] },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'außerhalb',
    translation: 'outside; beyond; outside of',
    variations: [{ translation: 'outside; beyond; outside of', cases: [Case.Genitiv] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'innerhalb',
    translation: 'inside; within; in; in the space of; during; inside of',
    variations: [{ translation: 'inside; within; in; in the space of; during; inside of', cases: [Case.Genitiv] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'statt',
    translation: "instead of; in so.'s place; in place of",
    variations: [{ translation: "instead of; in so.'s place; in place of", cases: [Case.Dativ, Case.Genitiv] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'anstatt',
    translation: 'instead of; in lieu of; in place of',
    variations: [{ translation: 'instead of; in lieu of; in place of', cases: [Case.Genitiv] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'an',
    translation: 'about; against; to; in; upon; of',
    variations: [
      { translation: 'about', cases: [Case.Dativ] },
      { translation: 'against; to; in; upon; of', cases: [Case.Akkusativ, Case.Dativ] },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'auf',
    translation: 'to; onto; for; on to; at; in; during; on; upon [form.]; atop [poet.]',
    variations: [
      { translation: 'to; onto; for; on to', cases: [Case.Akkusativ] },
      { translation: 'at; in; during', cases: [Case.Dativ] },
      { translation: 'on; upon [form.]; atop [poet.]', cases: [Case.Akkusativ, Case.Dativ] },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'hinter',
    translation:
      'to the back of; to the other side of; after; at the back of; at the end of; on the other side of; abaft [NAUT.]; behind; beyond',
    variations: [
      { translation: 'to the back of; to the other side of', cases: [Case.Akkusativ] },
      { translation: 'after; at the back of; at the end of; on the other side of; abaft [NAUT.]', cases: [Case.Dativ] },
      { translation: 'behind; beyond', cases: [Case.Akkusativ, Case.Dativ] },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'in',
    translation: 'into; at; in; on; to',
    variations: [
      { translation: 'into', cases: [Case.Akkusativ] },
      { translation: 'at; in; on; to', cases: [Case.Akkusativ, Case.Dativ] },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'neben',
    translation: 'by; contiguous to; in addition to; adjacent to; beside; next to; alongside',
    variations: [
      { translation: 'by; contiguous to; in addition to; adjacent to', cases: [Case.Dativ] },
      { translation: 'beside; next to; alongside', cases: [Case.Akkusativ, Case.Dativ] },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'über',
    translation: 'about; on; via; across; beyond; by way of; above; over',
    variations: [
      { translation: 'about; on; via; across; beyond; by way of', cases: [Case.Akkusativ] },
      { translation: 'above; over', cases: [Case.Akkusativ, Case.Dativ] },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'unter',
    translation: 'among; beneath; between; in; amongst; in the midst of; below; underneath; under',
    variations: [
      { translation: 'among; beneath; between; in; amongst; in the midst of', cases: [Case.Dativ] },
      { translation: 'below; underneath; under', cases: [Case.Akkusativ, Case.Dativ] },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'vor',
    translation:
      'from - indicating prevention; in the presence of; in the eyes of; outside; previous to; before; in front of; ahead of',
    variations: [
      {
        translation: 'from - indicating prevention; in the presence of; in the eyes of; outside; previous to',
        cases: [Case.Dativ],
      },
      { translation: 'before; in front of; ahead of', cases: [Case.Akkusativ, Case.Dativ] },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'zwischen',
    translation: 'among; between; amongst; atween - dialect; in between',
    variations: [
      { translation: 'among; between; amongst; atween - dialect; in between', cases: [Case.Akkusativ, Case.Dativ] },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'bis',
    translation:
      'to; by; through (Amer.); up to; until; by the time; as far as; till; thru - informal spelling of "through" (Amer.) [ugs.]',
    variations: [
      {
        translation:
          'to; by; through (Amer.); up to; until; by the time; as far as; till; thru - informal spelling of "through" (Amer.) [ugs.]',
        cases: [Case.Akkusativ],
      },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'angesichts',
    translation: 'given; in the face of; in view of; in light of; in the light of; in contrast to; in sight of',
    variations: [
      {
        translation: 'given; in the face of; in view of; in light of; in the light of; in contrast to; in sight of',
        cases: [Case.Genitiv],
      },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'beiderseits',
    translation: 'on both sides of',
    variations: [{ translation: 'on both sides of', cases: [Case.Genitiv] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'diesseits',
    translation: 'on this side of; this side of',
    variations: [{ translation: 'on this side of; this side of', cases: [Case.Genitiv] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'jenseits',
    translation: 'beyond; across; over; on the other side of; on the other side',
    variations: [
      { translation: 'beyond; across; over; on the other side of; on the other side', cases: [Case.Genitiv] },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'laut',
    uniqueValue: 'pre-laut',
    translation:
      'under - provisions, regulations, terms; according to; in accordance with; as per; in conformity with; by virtue of; in pursuance of; on the strength of; pursuant to',
    variations: [
      {
        translation:
          'under - provisions, regulations, terms; according to; in accordance with; as per; in conformity with; by virtue of; in pursuance of; on the strength of; pursuant to',
        cases: [Case.Dativ, Case.Genitiv],
      },
    ],
  },
  {
    type: CardType.PREPOSITION,
    value: 'seit',
    translation: 'since; for; ever since; in',
    variations: [{ translation: 'since; for; ever since; in', cases: [Case.Dativ] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'gleich',
    uniqueValue: 'pre-gleich',
    translation: 'like',
    variations: [{ translation: 'like', cases: [Case.Dativ] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'zuwider',
    translation: 'contrary to; against; in defiance of; opposed to',
    variations: [{ translation: 'contrary to; against; in defiance of; opposed to', cases: [Case.Dativ] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'nah/nahe',
    uniqueValue: 'pre-nah',
    translation: 'near; close to; on the verge of',
    variations: [{ translation: 'near; close to; on the verge of', cases: [Case.Dativ] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'per',
    translation: 'by',
    variations: [{ translation: 'by', cases: [Case.Akkusativ] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'pro',
    translation: 'a; per; for',
    variations: [{ translation: 'a; per; for', cases: [Case.Akkusativ] }],
  },
  {
    type: CardType.PREPOSITION,
    value: 'hinsichtlich',
    translation:
      'as to sth.; with regard to; concerning; in terms of sth.; in view of; regarding; in respect of; in consideration of; in reference to; in regard to; with respect to [Abk.: w. r. t.]',
    variations: [
      {
        translation:
          'as to sth.; with regard to; concerning; in terms of sth.; in view of; regarding; in respect of; in consideration of; in reference to; in regard to; with respect to [Abk.: w. r. t.]',
        cases: [Case.Genitiv],
      },
    ],
  },
];
