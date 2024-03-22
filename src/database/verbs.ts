import type { Verb } from './types';
import { CardType, VerbMood, VerbPronoun, VerbTense } from './types';

export const verbs: Verb[] = [
  {
    type: CardType.VERB,
    value: 'sein',
    translation: 'to be',
    variants: [
      {
        mood: VerbMood.Indikativ,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'bin' },
              { pronoun: VerbPronoun.du, value: 'bist' },
              { pronoun: VerbPronoun.er_sie_es, value: 'ist' },
              { pronoun: VerbPronoun.wir, value: 'sind' },
              { pronoun: VerbPronoun.ihr, value: 'seid' },
              { pronoun: VerbPronoun.sie_Sie, value: 'sind' },
            ],
          },
          {
            tense: VerbTense.Perfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'bin gewesen' },
              { pronoun: VerbPronoun.du, value: 'bist gewesen' },
              { pronoun: VerbPronoun.er_sie_es, value: 'ist gewesen' },
              { pronoun: VerbPronoun.wir, value: 'sind gewesen' },
              { pronoun: VerbPronoun.ihr, value: 'seid gewesen' },
              { pronoun: VerbPronoun.sie_Sie, value: 'sind gewesen' },
            ],
          },
          {
            tense: VerbTense.Präteritum,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'war' },
              { pronoun: VerbPronoun.du, value: 'warst' },
              { pronoun: VerbPronoun.er_sie_es, value: 'war' },
              { pronoun: VerbPronoun.wir, value: 'waren' },
              { pronoun: VerbPronoun.ihr, value: 'wart' },
              { pronoun: VerbPronoun.sie_Sie, value: 'waren' },
            ],
          },
          {
            tense: VerbTense.Plusquamperfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'war gewesen' },
              { pronoun: VerbPronoun.du, value: 'warst gewesen' },
              { pronoun: VerbPronoun.er_sie_es, value: 'war gewesen' },
              { pronoun: VerbPronoun.wir, value: 'waren gewesen' },
              { pronoun: VerbPronoun.ihr, value: 'wart gewesen' },
              { pronoun: VerbPronoun.sie_Sie, value: 'waren gewesen' },
            ],
          },
          {
            tense: VerbTense.Futur1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde sein' },
              { pronoun: VerbPronoun.du, value: 'wirst sein' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wird sein' },
              { pronoun: VerbPronoun.wir, value: 'werden sein' },
              { pronoun: VerbPronoun.ihr, value: 'werdet sein' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden sein' },
            ],
          },
          {
            tense: VerbTense.Futur2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde gewesen sein' },
              { pronoun: VerbPronoun.du, value: 'wirst gewesen sein' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wird gewesen sein' },
              { pronoun: VerbPronoun.wir, value: 'werden gewesen sein' },
              { pronoun: VerbPronoun.ihr, value: 'werdet gewesen sein' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden gewesen sein' },
            ],
          },
        ],
      },
      {
        mood: VerbMood.Konjunktiv,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'sei' },
              { pronoun: VerbPronoun.du, value: 'seist/seiest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'sei' },
              { pronoun: VerbPronoun.wir, value: 'seien' },
              { pronoun: VerbPronoun.ihr, value: 'seiet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'seien' },
            ],
          },
          {
            tense: VerbTense.Perfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'sei gewesen' },
              { pronoun: VerbPronoun.du, value: 'seist gewesen' },
              { pronoun: VerbPronoun.er_sie_es, value: 'sei gewesen' },
              { pronoun: VerbPronoun.wir, value: 'seien gewesen' },
              { pronoun: VerbPronoun.ihr, value: 'seiet gewesen' },
              { pronoun: VerbPronoun.sie_Sie, value: 'seien gewesen' },
            ],
          },
          {
            tense: VerbTense.Präteritum,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'wäre' },
              { pronoun: VerbPronoun.du, value: 'wärst/wärest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wäre' },
              { pronoun: VerbPronoun.wir, value: 'wären' },
              { pronoun: VerbPronoun.ihr, value: 'wärt/wäret' },
              { pronoun: VerbPronoun.sie_Sie, value: 'wären' },
            ],
          },
          {
            tense: VerbTense.Plusquamperfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'wäre gewesen' },
              { pronoun: VerbPronoun.du, value: 'wärest gewesen' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wäre gewesen' },
              { pronoun: VerbPronoun.wir, value: 'wären gewesen' },
              { pronoun: VerbPronoun.ihr, value: 'wäret gewesen' },
              { pronoun: VerbPronoun.sie_Sie, value: 'wären gewesen' },
            ],
          },
          {
            tense: VerbTense.Futur1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde sein' },
              { pronoun: VerbPronoun.du, value: 'werdest sein' },
              { pronoun: VerbPronoun.er_sie_es, value: 'werde sein' },
              { pronoun: VerbPronoun.wir, value: 'werden sein' },
              { pronoun: VerbPronoun.ihr, value: 'werdet sein' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden sein' },
            ],
          },
          {
            tense: VerbTense.Futur2_1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'würde sein' },
              { pronoun: VerbPronoun.du, value: 'würdest sein' },
              { pronoun: VerbPronoun.er_sie_es, value: 'würde sein' },
              { pronoun: VerbPronoun.wir, value: 'würden sein' },
              { pronoun: VerbPronoun.ihr, value: 'würdet sein' },
              { pronoun: VerbPronoun.sie_Sie, value: 'würden sein' },
            ],
          },
          {
            tense: VerbTense.Futur2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde gewesen sein' },
              { pronoun: VerbPronoun.du, value: 'werdest gewesen sein' },
              { pronoun: VerbPronoun.er_sie_es, value: 'werde gewesen sein' },
              { pronoun: VerbPronoun.wir, value: 'werden gewesen sein' },
              { pronoun: VerbPronoun.ihr, value: 'werdet gewesen sein' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden gewesen sein' },
            ],
          },
          {
            tense: VerbTense.Futur2_2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'würde gewesen sein' },
              { pronoun: VerbPronoun.du, value: 'würdest gewesen sein' },
              { pronoun: VerbPronoun.er_sie_es, value: 'würde gewesen sein' },
              { pronoun: VerbPronoun.wir, value: 'würden gewesen sein' },
              { pronoun: VerbPronoun.ihr, value: 'würdet gewesen sein' },
              { pronoun: VerbPronoun.sie_Sie, value: 'würden gewesen sein' },
            ],
          },
        ],
      },
      {
        mood: VerbMood.Imperativ,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.du, value: 'sei' },
              { pronoun: VerbPronoun.wir, value: 'seien' },
              { pronoun: VerbPronoun.ihr, value: 'seid' },
              { pronoun: VerbPronoun.sie_Sie, value: 'seien' },
            ],
          },
        ],
      },
    ],
  },
  {
    type: CardType.VERB,
    value: 'haben',
    translation: 'to have',
    variants: [
      {
        mood: VerbMood.Indikativ,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'habe' },
              { pronoun: VerbPronoun.du, value: 'hast' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hat' },
              { pronoun: VerbPronoun.wir, value: 'haben' },
              { pronoun: VerbPronoun.ihr, value: 'habt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'haben' },
            ],
          },
          {
            tense: VerbTense.Perfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'habe gehabt' },
              { pronoun: VerbPronoun.du, value: 'hast gehabt' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hat gehabt' },
              { pronoun: VerbPronoun.wir, value: 'haben gehabt' },
              { pronoun: VerbPronoun.ihr, value: 'habt gehabt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'haben gehabt' },
            ],
          },
          {
            tense: VerbTense.Präteritum,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'hatte' },
              { pronoun: VerbPronoun.du, value: 'hattest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hatte' },
              { pronoun: VerbPronoun.wir, value: 'hatten' },
              { pronoun: VerbPronoun.ihr, value: 'hattet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'hatten' },
            ],
          },
          {
            tense: VerbTense.Plusquamperfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'hatte gehabt' },
              { pronoun: VerbPronoun.du, value: 'hattest gehabt' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hatte gehabt' },
              { pronoun: VerbPronoun.wir, value: 'hatten gehabt' },
              { pronoun: VerbPronoun.ihr, value: 'hattet gehabt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'hatten gehabt' },
            ],
          },
          {
            tense: VerbTense.Futur1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde haben' },
              { pronoun: VerbPronoun.du, value: 'wirst haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wird haben' },
              { pronoun: VerbPronoun.wir, value: 'werden haben' },
              { pronoun: VerbPronoun.ihr, value: 'werdet haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden haben' },
            ],
          },
          {
            tense: VerbTense.Futur2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde gehabt haben' },
              { pronoun: VerbPronoun.du, value: 'wirst gehabt haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wird gehabt haben' },
              { pronoun: VerbPronoun.wir, value: 'werden gehabt haben' },
              { pronoun: VerbPronoun.ihr, value: 'werdet gehabt haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden gehabt haben' },
            ],
          },
        ],
      },
      {
        mood: VerbMood.Konjunktiv,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'habe' },
              { pronoun: VerbPronoun.du, value: 'habest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'habe' },
              { pronoun: VerbPronoun.wir, value: 'haben' },
              { pronoun: VerbPronoun.ihr, value: 'habet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'haben' },
            ],
          },
          {
            tense: VerbTense.Perfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'habe gehabt' },
              { pronoun: VerbPronoun.du, value: 'habest gehabt' },
              { pronoun: VerbPronoun.er_sie_es, value: 'habe gehabt' },
              { pronoun: VerbPronoun.wir, value: 'haben gehabt' },
              { pronoun: VerbPronoun.ihr, value: 'habet gehabt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'haben gehabt' },
            ],
          },
          {
            tense: VerbTense.Präteritum,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'hätte' },
              { pronoun: VerbPronoun.du, value: 'hättest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hätte' },
              { pronoun: VerbPronoun.wir, value: 'hätten' },
              { pronoun: VerbPronoun.ihr, value: 'hättet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'hätten' },
            ],
          },
          {
            tense: VerbTense.Plusquamperfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'hätte gehabt' },
              { pronoun: VerbPronoun.du, value: 'hättest gehabt' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hätte gehabt' },
              { pronoun: VerbPronoun.wir, value: 'hätten gehabt' },
              { pronoun: VerbPronoun.ihr, value: 'hättet gehabt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'hätten gehabt' },
            ],
          },
          {
            tense: VerbTense.Futur1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde haben' },
              { pronoun: VerbPronoun.du, value: 'werdest haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'werde haben' },
              { pronoun: VerbPronoun.wir, value: 'werden haben' },
              { pronoun: VerbPronoun.ihr, value: 'werdet haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden haben' },
            ],
          },
          {
            tense: VerbTense.Futur2_1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'würde haben' },
              { pronoun: VerbPronoun.du, value: 'würdest haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'würde haben' },
              { pronoun: VerbPronoun.wir, value: 'würden haben' },
              { pronoun: VerbPronoun.ihr, value: 'würdet haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'würden haben' },
            ],
          },
          {
            tense: VerbTense.Futur2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde gehabt haben' },
              { pronoun: VerbPronoun.du, value: 'werdest gehabt haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'werde gehabt haben' },
              { pronoun: VerbPronoun.wir, value: 'werden gehabt haben' },
              { pronoun: VerbPronoun.ihr, value: 'werdet gehabt haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden gehabt haben' },
            ],
          },
          {
            tense: VerbTense.Futur2_2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'würde gehabt haben' },
              { pronoun: VerbPronoun.du, value: 'würdest gehabt haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'würde gehabt haben' },
              { pronoun: VerbPronoun.wir, value: 'würden gehabt haben' },
              { pronoun: VerbPronoun.ihr, value: 'würdet gehabt haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'würden gehabt haben' },
            ],
          },
        ],
      },
      {
        mood: VerbMood.Imperativ,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.du, value: 'habe/hab' },
              { pronoun: VerbPronoun.wir, value: 'haben' },
              { pronoun: VerbPronoun.ihr, value: 'habt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'haben' },
            ],
          },
        ],
      },
    ],
  },
  {
    type: CardType.VERB,
    value: 'werden',
    translation: 'to become',
    variants: [
      {
        mood: VerbMood.Indikativ,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde' },
              { pronoun: VerbPronoun.du, value: 'wirst' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wird' },
              { pronoun: VerbPronoun.wir, value: 'werden' },
              { pronoun: VerbPronoun.ihr, value: 'werdet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden' },
            ],
          },
          {
            tense: VerbTense.Perfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'bin geworden/worden' },
              { pronoun: VerbPronoun.du, value: 'bist geworden/worden' },
              { pronoun: VerbPronoun.er_sie_es, value: 'ist geworden/worden' },
              { pronoun: VerbPronoun.wir, value: 'sind geworden/worden' },
              { pronoun: VerbPronoun.ihr, value: 'seid geworden/worden' },
              { pronoun: VerbPronoun.sie_Sie, value: 'sind geworden/worden' },
            ],
          },
          {
            tense: VerbTense.Präteritum,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'wurde' },
              { pronoun: VerbPronoun.du, value: 'wurdest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wurde' },
              { pronoun: VerbPronoun.wir, value: 'wurden' },
              { pronoun: VerbPronoun.ihr, value: 'wurdet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'wurden' },
            ],
          },
          {
            tense: VerbTense.Plusquamperfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'war geworden/worden' },
              { pronoun: VerbPronoun.du, value: 'warst geworden/worden' },
              { pronoun: VerbPronoun.er_sie_es, value: 'war geworden/worden' },
              { pronoun: VerbPronoun.wir, value: 'waren geworden/worden' },
              { pronoun: VerbPronoun.ihr, value: 'wart geworden/worden' },
              { pronoun: VerbPronoun.sie_Sie, value: 'waren geworden/worden' },
            ],
          },
          {
            tense: VerbTense.Futur1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde werden' },
              { pronoun: VerbPronoun.du, value: 'wirst werden' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wird werden' },
              { pronoun: VerbPronoun.wir, value: 'werden werden' },
              { pronoun: VerbPronoun.ihr, value: 'werdet werden' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden werden' },
            ],
          },
          {
            tense: VerbTense.Futur2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde geworden/worden sein' },
              { pronoun: VerbPronoun.du, value: 'wirst geworden/worden sein' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wird geworden/worden sein' },
              { pronoun: VerbPronoun.wir, value: 'werden geworden/worden sein' },
              { pronoun: VerbPronoun.ihr, value: 'werdet geworden/worden sein' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden geworden/worden sein' },
            ],
          },
        ],
      },
      {
        mood: VerbMood.Konjunktiv,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde' },
              { pronoun: VerbPronoun.du, value: 'werdest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'werde' },
              { pronoun: VerbPronoun.wir, value: 'werden' },
              { pronoun: VerbPronoun.ihr, value: 'werdet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden' },
            ],
          },
          {
            tense: VerbTense.Perfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'sei geworden/worden' },
              { pronoun: VerbPronoun.du, value: 'seist geworden/worden' },
              { pronoun: VerbPronoun.er_sie_es, value: 'sei geworden/worden' },
              { pronoun: VerbPronoun.wir, value: 'seien geworden/worden' },
              { pronoun: VerbPronoun.ihr, value: 'seiet geworden/worden' },
              { pronoun: VerbPronoun.sie_Sie, value: 'seien geworden/worden' },
            ],
          },
          {
            tense: VerbTense.Präteritum,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'würde' },
              { pronoun: VerbPronoun.du, value: 'würdest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'würde' },
              { pronoun: VerbPronoun.wir, value: 'würden' },
              { pronoun: VerbPronoun.ihr, value: 'würdet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'würden' },
            ],
          },
          {
            tense: VerbTense.Plusquamperfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'wäre geworden/worden' },
              { pronoun: VerbPronoun.du, value: 'wärest geworden/worden' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wäre geworden/worden' },
              { pronoun: VerbPronoun.wir, value: 'wären geworden/worden' },
              { pronoun: VerbPronoun.ihr, value: 'wäret geworden/worden' },
              { pronoun: VerbPronoun.sie_Sie, value: 'wären geworden/worden' },
            ],
          },
          {
            tense: VerbTense.Futur1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde werden' },
              { pronoun: VerbPronoun.du, value: 'werdest werden' },
              { pronoun: VerbPronoun.er_sie_es, value: 'werde werden' },
              { pronoun: VerbPronoun.wir, value: 'werden werden' },
              { pronoun: VerbPronoun.ihr, value: 'werdet werden' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden werden' },
            ],
          },
          {
            tense: VerbTense.Futur2_1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'würde werden' },
              { pronoun: VerbPronoun.du, value: 'würdest werden' },
              { pronoun: VerbPronoun.er_sie_es, value: 'würde werden' },
              { pronoun: VerbPronoun.wir, value: 'würden werden' },
              { pronoun: VerbPronoun.ihr, value: 'würdet werden' },
              { pronoun: VerbPronoun.sie_Sie, value: 'würden werden' },
            ],
          },
          {
            tense: VerbTense.Futur2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde geworden/(worden sein)' },
              { pronoun: VerbPronoun.du, value: 'werdest geworden/(worden sein)' },
              { pronoun: VerbPronoun.er_sie_es, value: 'werde geworden/(worden sein)' },
              { pronoun: VerbPronoun.wir, value: 'werden geworden/(worden sein)' },
              { pronoun: VerbPronoun.ihr, value: 'werdet geworden/(worden sein)' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden geworden/(worden sein)' },
            ],
          },
          {
            tense: VerbTense.Futur2_2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'würde geworden/(worden sein)' },
              { pronoun: VerbPronoun.du, value: 'würdest geworden/(worden sein)' },
              { pronoun: VerbPronoun.er_sie_es, value: 'würde geworden/(worden sein)' },
              { pronoun: VerbPronoun.wir, value: 'würden geworden/(worden sein)' },
              { pronoun: VerbPronoun.ihr, value: 'würdet geworden/(worden sein)' },
              { pronoun: VerbPronoun.sie_Sie, value: 'würden geworden/(worden sein)' },
            ],
          },
        ],
      },
      {
        mood: VerbMood.Imperativ,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.du, value: 'werd/werde' },
              { pronoun: VerbPronoun.wir, value: 'werden' },
              { pronoun: VerbPronoun.ihr, value: 'werdet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden' },
            ],
          },
        ],
      },
    ],
  },
  {
    type: CardType.VERB,
    value: 'können',
    translation: 'can; to be able to',
    variants: [
      {
        mood: VerbMood.Indikativ,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'kann' },
              { pronoun: VerbPronoun.du, value: 'kannst' },
              { pronoun: VerbPronoun.er_sie_es, value: 'kann' },
              { pronoun: VerbPronoun.wir, value: 'können' },
              { pronoun: VerbPronoun.ihr, value: 'könnt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'können' },
            ],
          },
          {
            tense: VerbTense.Perfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'habe gekonnt' },
              { pronoun: VerbPronoun.du, value: 'hast gekonnt' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hat gekonnt' },
              { pronoun: VerbPronoun.wir, value: 'haben gekonnt' },
              { pronoun: VerbPronoun.ihr, value: 'habt gekonnt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'haben gekonnt' },
            ],
          },
          {
            tense: VerbTense.Präteritum,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'konnte' },
              { pronoun: VerbPronoun.du, value: 'konntest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'konnte' },
              { pronoun: VerbPronoun.wir, value: 'konnten' },
              { pronoun: VerbPronoun.ihr, value: 'konntet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'konnten' },
            ],
          },
          {
            tense: VerbTense.Plusquamperfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'hatte gekonnt' },
              { pronoun: VerbPronoun.du, value: 'hattest gekonnt' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hatte gekonnt' },
              { pronoun: VerbPronoun.wir, value: 'hatten gekonnt' },
              { pronoun: VerbPronoun.ihr, value: 'hattet gekonnt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'hatten gekonnt' },
            ],
          },
          {
            tense: VerbTense.Futur1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde können' },
              { pronoun: VerbPronoun.du, value: 'wirst können' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wird können' },
              { pronoun: VerbPronoun.wir, value: 'werden können' },
              { pronoun: VerbPronoun.ihr, value: 'werdet können' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden können' },
            ],
          },
          {
            tense: VerbTense.Futur2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde gekonnt haben' },
              { pronoun: VerbPronoun.du, value: 'wirst gekonnt haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wird gekonnt haben' },
              { pronoun: VerbPronoun.wir, value: 'werden gekonnt haben' },
              { pronoun: VerbPronoun.ihr, value: 'werdet gekonnt haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden gekonnt haben' },
            ],
          },
        ],
      },
      {
        mood: VerbMood.Konjunktiv,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'könne' },
              { pronoun: VerbPronoun.du, value: 'könnest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'könne' },
              { pronoun: VerbPronoun.wir, value: 'können' },
              { pronoun: VerbPronoun.ihr, value: 'könnet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'können' },
            ],
          },
          {
            tense: VerbTense.Perfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'habe gekonnt' },
              { pronoun: VerbPronoun.du, value: 'habest gekonnt' },
              { pronoun: VerbPronoun.er_sie_es, value: 'habe gekonnt' },
              { pronoun: VerbPronoun.wir, value: 'haben gekonnt' },
              { pronoun: VerbPronoun.ihr, value: 'habet gekonnt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'haben gekonnt' },
            ],
          },
          {
            tense: VerbTense.Präteritum,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'könnte' },
              { pronoun: VerbPronoun.du, value: 'könntest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'könnte' },
              { pronoun: VerbPronoun.wir, value: 'könnten' },
              { pronoun: VerbPronoun.ihr, value: 'könntet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'könnten' },
            ],
          },
          {
            tense: VerbTense.Plusquamperfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'hätte gekonnt' },
              { pronoun: VerbPronoun.du, value: 'hättest gekonnt' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hätte gekonnt' },
              { pronoun: VerbPronoun.wir, value: 'hätten gekonnt' },
              { pronoun: VerbPronoun.ihr, value: 'hättet gekonnt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'hätten gekonnt' },
            ],
          },
          {
            tense: VerbTense.Futur1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde können' },
              { pronoun: VerbPronoun.du, value: 'werdest können' },
              { pronoun: VerbPronoun.er_sie_es, value: 'werde können' },
              { pronoun: VerbPronoun.wir, value: 'werden können' },
              { pronoun: VerbPronoun.ihr, value: 'werdet können' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden können' },
            ],
          },
          {
            tense: VerbTense.Futur2_1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'würde können' },
              { pronoun: VerbPronoun.du, value: 'würdest können' },
              { pronoun: VerbPronoun.er_sie_es, value: 'würde können' },
              { pronoun: VerbPronoun.wir, value: 'würden können' },
              { pronoun: VerbPronoun.ihr, value: 'würdet können' },
              { pronoun: VerbPronoun.sie_Sie, value: 'würden können' },
            ],
          },
          {
            tense: VerbTense.Futur2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde gekonnt haben' },
              { pronoun: VerbPronoun.du, value: 'werdest gekonnt haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'werde gekonnt haben' },
              { pronoun: VerbPronoun.wir, value: 'werden gekonnt haben' },
              { pronoun: VerbPronoun.ihr, value: 'werdet gekonnt haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden gekonnt haben' },
            ],
          },
          {
            tense: VerbTense.Futur2_2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'würde gekonnt haben' },
              { pronoun: VerbPronoun.du, value: 'würdest gekonnt haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'würde gekonnt haben' },
              { pronoun: VerbPronoun.wir, value: 'würden gekonnt haben' },
              { pronoun: VerbPronoun.ihr, value: 'würdet gekonnt haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'würden gekonnt haben' },
            ],
          },
        ],
      },
      { mood: VerbMood.Imperativ, tenses: [{ tense: VerbTense.Präsens, conjugations: [] }] },
    ],
  },
  {
    type: CardType.VERB,
    value: 'müssen',
    translation: 'must; to have to',
    variants: [
      {
        mood: VerbMood.Indikativ,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'muss' },
              { pronoun: VerbPronoun.du, value: 'musst' },
              { pronoun: VerbPronoun.er_sie_es, value: 'muss' },
              { pronoun: VerbPronoun.wir, value: 'müssen' },
              { pronoun: VerbPronoun.ihr, value: 'müsst' },
              { pronoun: VerbPronoun.sie_Sie, value: 'müssen' },
            ],
          },
          {
            tense: VerbTense.Perfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'habe gemusst' },
              { pronoun: VerbPronoun.du, value: 'hast gemusst' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hat gemusst' },
              { pronoun: VerbPronoun.wir, value: 'haben gemusst' },
              { pronoun: VerbPronoun.ihr, value: 'habt gemusst' },
              { pronoun: VerbPronoun.sie_Sie, value: 'haben gemusst' },
            ],
          },
          {
            tense: VerbTense.Präteritum,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'musste' },
              { pronoun: VerbPronoun.du, value: 'musstest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'musste' },
              { pronoun: VerbPronoun.wir, value: 'mussten' },
              { pronoun: VerbPronoun.ihr, value: 'musstet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'mussten' },
            ],
          },
          {
            tense: VerbTense.Plusquamperfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'hatte gemusst' },
              { pronoun: VerbPronoun.du, value: 'hattest gemusst' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hatte gemusst' },
              { pronoun: VerbPronoun.wir, value: 'hatten gemusst' },
              { pronoun: VerbPronoun.ihr, value: 'hattet gemusst' },
              { pronoun: VerbPronoun.sie_Sie, value: 'hatten gemusst' },
            ],
          },
          {
            tense: VerbTense.Futur1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde müssen' },
              { pronoun: VerbPronoun.du, value: 'wirst müssen' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wird müssen' },
              { pronoun: VerbPronoun.wir, value: 'werden müssen' },
              { pronoun: VerbPronoun.ihr, value: 'werdet müssen' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden müssen' },
            ],
          },
          {
            tense: VerbTense.Futur2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde gemusst haben' },
              { pronoun: VerbPronoun.du, value: 'wirst gemusst haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wird gemusst haben' },
              { pronoun: VerbPronoun.wir, value: 'werden gemusst haben' },
              { pronoun: VerbPronoun.ihr, value: 'werdet gemusst haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden gemusst haben' },
            ],
          },
        ],
      },
      {
        mood: VerbMood.Konjunktiv,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'müsse' },
              { pronoun: VerbPronoun.du, value: 'müssest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'müsse' },
              { pronoun: VerbPronoun.wir, value: 'müssen' },
              { pronoun: VerbPronoun.ihr, value: 'müsset' },
              { pronoun: VerbPronoun.sie_Sie, value: 'müssen' },
            ],
          },
          {
            tense: VerbTense.Perfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'habe gemusst' },
              { pronoun: VerbPronoun.du, value: 'habest gemusst' },
              { pronoun: VerbPronoun.er_sie_es, value: 'habe gemusst' },
              { pronoun: VerbPronoun.wir, value: 'haben gemusst' },
              { pronoun: VerbPronoun.ihr, value: 'habet gemusst' },
              { pronoun: VerbPronoun.sie_Sie, value: 'haben gemusst' },
            ],
          },
          {
            tense: VerbTense.Präteritum,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'müsste' },
              { pronoun: VerbPronoun.du, value: 'müsstest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'müsste' },
              { pronoun: VerbPronoun.wir, value: 'müssten' },
              { pronoun: VerbPronoun.ihr, value: 'müsstet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'müssten' },
            ],
          },
          {
            tense: VerbTense.Plusquamperfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'hätte gemusst' },
              { pronoun: VerbPronoun.du, value: 'hättest gemusst' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hätte gemusst' },
              { pronoun: VerbPronoun.wir, value: 'hätten gemusst' },
              { pronoun: VerbPronoun.ihr, value: 'hättet gemusst' },
              { pronoun: VerbPronoun.sie_Sie, value: 'hätten gemusst' },
            ],
          },
          {
            tense: VerbTense.Futur1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde müssen' },
              { pronoun: VerbPronoun.du, value: 'werdest müssen' },
              { pronoun: VerbPronoun.er_sie_es, value: 'werde müssen' },
              { pronoun: VerbPronoun.wir, value: 'werden müssen' },
              { pronoun: VerbPronoun.ihr, value: 'werdet müssen' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden müssen' },
            ],
          },
          {
            tense: VerbTense.Futur2_1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'würde müssen' },
              { pronoun: VerbPronoun.du, value: 'würdest müssen' },
              { pronoun: VerbPronoun.er_sie_es, value: 'würde müssen' },
              { pronoun: VerbPronoun.wir, value: 'würden müssen' },
              { pronoun: VerbPronoun.ihr, value: 'würdet müssen' },
              { pronoun: VerbPronoun.sie_Sie, value: 'würden müssen' },
            ],
          },
          {
            tense: VerbTense.Futur2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde gemusst haben' },
              { pronoun: VerbPronoun.du, value: 'werdest gemusst haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'werde gemusst haben' },
              { pronoun: VerbPronoun.wir, value: 'werden gemusst haben' },
              { pronoun: VerbPronoun.ihr, value: 'werdet gemusst haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden gemusst haben' },
            ],
          },
          {
            tense: VerbTense.Futur2_2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'würde gemusst haben' },
              { pronoun: VerbPronoun.du, value: 'würdest gemusst haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'würde gemusst haben' },
              { pronoun: VerbPronoun.wir, value: 'würden gemusst haben' },
              { pronoun: VerbPronoun.ihr, value: 'würdet gemusst haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'würden gemusst haben' },
            ],
          },
        ],
      },
      { mood: VerbMood.Imperativ, tenses: [{ tense: VerbTense.Präsens, conjugations: [] }] },
    ],
  },
  {
    type: CardType.VERB,
    value: 'sagen',
    translation: 'to say',
    variants: [
      {
        mood: VerbMood.Indikativ,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'sage' },
              { pronoun: VerbPronoun.du, value: 'sagst' },
              { pronoun: VerbPronoun.er_sie_es, value: 'sagt' },
              { pronoun: VerbPronoun.wir, value: 'sagen' },
              { pronoun: VerbPronoun.ihr, value: 'sagt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'sagen' },
            ],
          },
          {
            tense: VerbTense.Perfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'habe gesagt' },
              { pronoun: VerbPronoun.du, value: 'hast gesagt' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hat gesagt' },
              { pronoun: VerbPronoun.wir, value: 'haben gesagt' },
              { pronoun: VerbPronoun.ihr, value: 'habt gesagt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'haben gesagt' },
            ],
          },
          {
            tense: VerbTense.Präteritum,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'sagte' },
              { pronoun: VerbPronoun.du, value: 'sagtest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'sagte' },
              { pronoun: VerbPronoun.wir, value: 'sagten' },
              { pronoun: VerbPronoun.ihr, value: 'sagtet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'sagten' },
            ],
          },
          {
            tense: VerbTense.Plusquamperfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'hatte gesagt' },
              { pronoun: VerbPronoun.du, value: 'hattest gesagt' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hatte gesagt' },
              { pronoun: VerbPronoun.wir, value: 'hatten gesagt' },
              { pronoun: VerbPronoun.ihr, value: 'hattet gesagt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'hatten gesagt' },
            ],
          },
          {
            tense: VerbTense.Futur1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde sagen' },
              { pronoun: VerbPronoun.du, value: 'wirst sagen' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wird sagen' },
              { pronoun: VerbPronoun.wir, value: 'werden sagen' },
              { pronoun: VerbPronoun.ihr, value: 'werdet sagen' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden sagen' },
            ],
          },
          {
            tense: VerbTense.Futur2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde gesagt haben' },
              { pronoun: VerbPronoun.du, value: 'wirst gesagt haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wird gesagt haben' },
              { pronoun: VerbPronoun.wir, value: 'werden gesagt haben' },
              { pronoun: VerbPronoun.ihr, value: 'werdet gesagt haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden gesagt haben' },
            ],
          },
        ],
      },
      {
        mood: VerbMood.Konjunktiv,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'sage' },
              { pronoun: VerbPronoun.du, value: 'sagest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'sage' },
              { pronoun: VerbPronoun.wir, value: 'sagen' },
              { pronoun: VerbPronoun.ihr, value: 'saget' },
              { pronoun: VerbPronoun.sie_Sie, value: 'sagen' },
            ],
          },
          {
            tense: VerbTense.Perfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'habe gesagt' },
              { pronoun: VerbPronoun.du, value: 'habest gesagt' },
              { pronoun: VerbPronoun.er_sie_es, value: 'habe gesagt' },
              { pronoun: VerbPronoun.wir, value: 'haben gesagt' },
              { pronoun: VerbPronoun.ihr, value: 'habet gesagt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'haben gesagt' },
            ],
          },
          {
            tense: VerbTense.Präteritum,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'sagte' },
              { pronoun: VerbPronoun.du, value: 'sagtest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'sagte' },
              { pronoun: VerbPronoun.wir, value: 'sagten' },
              { pronoun: VerbPronoun.ihr, value: 'sagtet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'sagten' },
            ],
          },
          {
            tense: VerbTense.Plusquamperfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'hätte gesagt' },
              { pronoun: VerbPronoun.du, value: 'hättest gesagt' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hätte gesagt' },
              { pronoun: VerbPronoun.wir, value: 'hätten gesagt' },
              { pronoun: VerbPronoun.ihr, value: 'hättet gesagt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'hätten gesagt' },
            ],
          },
          {
            tense: VerbTense.Futur1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde sagen' },
              { pronoun: VerbPronoun.du, value: 'werdest sagen' },
              { pronoun: VerbPronoun.er_sie_es, value: 'werde sagen' },
              { pronoun: VerbPronoun.wir, value: 'werden sagen' },
              { pronoun: VerbPronoun.ihr, value: 'werdet sagen' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden sagen' },
            ],
          },
          {
            tense: VerbTense.Futur2_1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'würde sagen' },
              { pronoun: VerbPronoun.du, value: 'würdest sagen' },
              { pronoun: VerbPronoun.er_sie_es, value: 'würde sagen' },
              { pronoun: VerbPronoun.wir, value: 'würden sagen' },
              { pronoun: VerbPronoun.ihr, value: 'würdet sagen' },
              { pronoun: VerbPronoun.sie_Sie, value: 'würden sagen' },
            ],
          },
          {
            tense: VerbTense.Futur2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde gesagt haben' },
              { pronoun: VerbPronoun.du, value: 'werdest gesagt haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'werde gesagt haben' },
              { pronoun: VerbPronoun.wir, value: 'werden gesagt haben' },
              { pronoun: VerbPronoun.ihr, value: 'werdet gesagt haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden gesagt haben' },
            ],
          },
          {
            tense: VerbTense.Futur2_2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'würde gesagt haben' },
              { pronoun: VerbPronoun.du, value: 'würdest gesagt haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'würde gesagt haben' },
              { pronoun: VerbPronoun.wir, value: 'würden gesagt haben' },
              { pronoun: VerbPronoun.ihr, value: 'würdet gesagt haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'würden gesagt haben' },
            ],
          },
        ],
      },
      {
        mood: VerbMood.Imperativ,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.du, value: 'sag/sage' },
              { pronoun: VerbPronoun.wir, value: 'sagen' },
              { pronoun: VerbPronoun.ihr, value: 'sagt' },
              { pronoun: VerbPronoun.sie_Sie, value: 'sagen' },
            ],
          },
        ],
      },
    ],
  },
  {
    type: CardType.VERB,
    value: 'machen',
    translation: 'to do',
    variants: [
      {
        mood: VerbMood.Indikativ,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'mache' },
              { pronoun: VerbPronoun.du, value: 'machst' },
              { pronoun: VerbPronoun.er_sie_es, value: 'macht' },
              { pronoun: VerbPronoun.wir, value: 'machen' },
              { pronoun: VerbPronoun.ihr, value: 'macht' },
              { pronoun: VerbPronoun.sie_Sie, value: 'machen' },
            ],
          },
          {
            tense: VerbTense.Perfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'habe gemacht' },
              { pronoun: VerbPronoun.du, value: 'hast gemacht' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hat gemacht' },
              { pronoun: VerbPronoun.wir, value: 'haben gemacht' },
              { pronoun: VerbPronoun.ihr, value: 'habt gemacht' },
              { pronoun: VerbPronoun.sie_Sie, value: 'haben gemacht' },
            ],
          },
          {
            tense: VerbTense.Präteritum,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'machte' },
              { pronoun: VerbPronoun.du, value: 'machtest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'machte' },
              { pronoun: VerbPronoun.wir, value: 'machten' },
              { pronoun: VerbPronoun.ihr, value: 'machtet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'machten' },
            ],
          },
          {
            tense: VerbTense.Plusquamperfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'hatte gemacht' },
              { pronoun: VerbPronoun.du, value: 'hattest gemacht' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hatte gemacht' },
              { pronoun: VerbPronoun.wir, value: 'hatten gemacht' },
              { pronoun: VerbPronoun.ihr, value: 'hattet gemacht' },
              { pronoun: VerbPronoun.sie_Sie, value: 'hatten gemacht' },
            ],
          },
          {
            tense: VerbTense.Futur1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde machen' },
              { pronoun: VerbPronoun.du, value: 'wirst machen' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wird machen' },
              { pronoun: VerbPronoun.wir, value: 'werden machen' },
              { pronoun: VerbPronoun.ihr, value: 'werdet machen' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden machen' },
            ],
          },
          {
            tense: VerbTense.Futur2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde gemacht haben' },
              { pronoun: VerbPronoun.du, value: 'wirst gemacht haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'wird gemacht haben' },
              { pronoun: VerbPronoun.wir, value: 'werden gemacht haben' },
              { pronoun: VerbPronoun.ihr, value: 'werdet gemacht haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden gemacht haben' },
            ],
          },
        ],
      },
      {
        mood: VerbMood.Konjunktiv,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'mache' },
              { pronoun: VerbPronoun.du, value: 'machest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'mache' },
              { pronoun: VerbPronoun.wir, value: 'machen' },
              { pronoun: VerbPronoun.ihr, value: 'machet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'machen' },
            ],
          },
          {
            tense: VerbTense.Perfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'habe gemacht' },
              { pronoun: VerbPronoun.du, value: 'habest gemacht' },
              { pronoun: VerbPronoun.er_sie_es, value: 'habe gemacht' },
              { pronoun: VerbPronoun.wir, value: 'haben gemacht' },
              { pronoun: VerbPronoun.ihr, value: 'habet gemacht' },
              { pronoun: VerbPronoun.sie_Sie, value: 'haben gemacht' },
            ],
          },
          {
            tense: VerbTense.Präteritum,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'machte' },
              { pronoun: VerbPronoun.du, value: 'machtest' },
              { pronoun: VerbPronoun.er_sie_es, value: 'machte' },
              { pronoun: VerbPronoun.wir, value: 'machten' },
              { pronoun: VerbPronoun.ihr, value: 'machtet' },
              { pronoun: VerbPronoun.sie_Sie, value: 'machten' },
            ],
          },
          {
            tense: VerbTense.Plusquamperfekt,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'hätte gemacht' },
              { pronoun: VerbPronoun.du, value: 'hättest gemacht' },
              { pronoun: VerbPronoun.er_sie_es, value: 'hätte gemacht' },
              { pronoun: VerbPronoun.wir, value: 'hätten gemacht' },
              { pronoun: VerbPronoun.ihr, value: 'hättet gemacht' },
              { pronoun: VerbPronoun.sie_Sie, value: 'hätten gemacht' },
            ],
          },
          {
            tense: VerbTense.Futur1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde machen' },
              { pronoun: VerbPronoun.du, value: 'werdest machen' },
              { pronoun: VerbPronoun.er_sie_es, value: 'werde machen' },
              { pronoun: VerbPronoun.wir, value: 'werden machen' },
              { pronoun: VerbPronoun.ihr, value: 'werdet machen' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden machen' },
            ],
          },
          {
            tense: VerbTense.Futur2_1,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'würde machen' },
              { pronoun: VerbPronoun.du, value: 'würdest machen' },
              { pronoun: VerbPronoun.er_sie_es, value: 'würde machen' },
              { pronoun: VerbPronoun.wir, value: 'würden machen' },
              { pronoun: VerbPronoun.ihr, value: 'würdet machen' },
              { pronoun: VerbPronoun.sie_Sie, value: 'würden machen' },
            ],
          },
          {
            tense: VerbTense.Futur2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'werde gemacht haben' },
              { pronoun: VerbPronoun.du, value: 'werdest gemacht haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'werde gemacht haben' },
              { pronoun: VerbPronoun.wir, value: 'werden gemacht haben' },
              { pronoun: VerbPronoun.ihr, value: 'werdet gemacht haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'werden gemacht haben' },
            ],
          },
          {
            tense: VerbTense.Futur2_2,
            conjugations: [
              { pronoun: VerbPronoun.ich, value: 'würde gemacht haben' },
              { pronoun: VerbPronoun.du, value: 'würdest gemacht haben' },
              { pronoun: VerbPronoun.er_sie_es, value: 'würde gemacht haben' },
              { pronoun: VerbPronoun.wir, value: 'würden gemacht haben' },
              { pronoun: VerbPronoun.ihr, value: 'würdet gemacht haben' },
              { pronoun: VerbPronoun.sie_Sie, value: 'würden gemacht haben' },
            ],
          },
        ],
      },
      {
        mood: VerbMood.Imperativ,
        tenses: [
          {
            tense: VerbTense.Präsens,
            conjugations: [
              { pronoun: VerbPronoun.du, value: 'mach/mache' },
              { pronoun: VerbPronoun.wir, value: 'machen' },
              { pronoun: VerbPronoun.ihr, value: 'macht' },
              { pronoun: VerbPronoun.sie_Sie, value: 'machen' },
            ],
          },
        ],
      },
    ],
  },
];
