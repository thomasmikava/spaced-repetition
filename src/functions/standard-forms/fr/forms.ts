import { ImperativePronoun } from '../../../database/types';
import { VerbPronoun } from '../../../database/types';
import { VerbMood, VerbTense } from '../../../database/types';
import { NounNumber } from '../../../database/types';
import { AdjectiveDegree, NounGender } from '../../../database/types';
import { uniquelize } from '../../../utils/array';
import { mergeSplitted, slashSplit } from '../../../utils/split';

export const generateNounPluralStandardVariant = (singularForm: string): string | null => {
  if (singularForm.endsWith('al')) {
    return singularForm.slice(0, -2) + 'aux';
  }
  if (singularForm.endsWith('au') || singularForm.endsWith('eu')) {
    return singularForm + 'x';
  }
  const lastLetter = singularForm[singularForm.length - 1];
  if (lastLetter === 's' || lastLetter === 'x' || lastLetter === 'z') {
    return singularForm;
  }
  return singularForm + 's';
};

export const getAdjectiveTrioStandardForm = (
  adjective: string,
  degree: AdjectiveDegree.Komparativ | AdjectiveDegree.Superlativ,
): string | null => {
  if (degree === AdjectiveDegree.Komparativ) {
    return `plus ${adjective} que`;
  }

  return `le ${adjective} grand`;
};

export const getAdjectiveStandardForm = (
  singularMasculine: string,
  singularFeminine: string | null,
  gender: NounGender,
  number: NounNumber,
  // eslint-disable-next-line sonarjs/cognitive-complexity
): string | null => {
  if (!singularMasculine) return null;
  if (gender === NounGender.Maskulinum && singularMasculine && singularMasculine.includes('/')) {
    return mergeSplitted(
      slashSplit(singularMasculine).map((v) => getAdjectiveStandardForm(v, singularFeminine, gender, number)),
    );
  }
  if (gender === NounGender.Femininum && singularFeminine && singularFeminine.includes('/')) {
    return mergeSplitted(
      slashSplit(singularFeminine).map((v) => getAdjectiveStandardForm(singularMasculine, v, gender, number)),
    );
  }

  if (number === NounNumber.singular && gender === NounGender.Maskulinum) {
    return null;
  }
  if (number === NounNumber.plural && gender === NounGender.Maskulinum) {
    const singularForm = singularMasculine;
    const lastLetter = singularForm[singularForm.length - 1];
    if (lastLetter === 's' || lastLetter === 'x' || lastLetter === 'z') {
      return singularForm;
    }
    if (singularForm.endsWith('eau') || singularForm.endsWith('eu')) {
      return singularForm + 'x';
    }
    if (singularForm.endsWith('al')) {
      return singularForm.slice(0, -2) + 'aux';
    }
    return singularForm + 's';
  }
  if (number === NounNumber.singular && gender === NounGender.Femininum) {
    const lastLetter = singularMasculine[singularMasculine.length - 1];
    if (lastLetter === 'e') {
      return singularMasculine;
    }
    if (lastLetter === 'f') {
      return singularMasculine.slice(0, -1) + 've';
    }
    if (singularMasculine.endsWith('er')) {
      return singularMasculine.slice(0, -2) + 'ère';
    }
    if (lastLetter === 's' || lastLetter === 'x') {
      return singularMasculine.slice(0, -1) + 'se';
    }
    return singularMasculine + 'e';
  }
  if (number === NounNumber.plural && gender === NounGender.Femininum) {
    const singularForm = singularFeminine;
    if (!singularForm) return null;
    const lastLetter = singularForm[singularForm.length - 1];
    if (lastLetter === 's') {
      return singularForm;
    }
    return singularForm + 's';
  }
  return null;
};

export const getParticiplePresentForm = (present1stPlural: string | undefined | null): string | null => {
  if (!present1stPlural) return null;
  if (present1stPlural.includes('/')) {
    return mergeSplitted(uniquelize(slashSplit(present1stPlural).map(getParticiplePresentForm)));
  }
  const lastWord = present1stPlural.split(' ').pop();
  if (!lastWord) return null;
  return lastWord.endsWith('ons') ? lastWord.slice(0, -3) + 'ant' : lastWord + 'ant';
};

export const getParticiplePastForm = (verb: string): string | null => {
  if (verb.includes('/')) {
    return mergeSplitted(slashSplit(verb).map(getParticiplePresentForm));
  }
  if (verb.endsWith('er')) {
    return verb.slice(0, -2) + 'é';
  }
  if (verb.endsWith('ir')) {
    return verb.slice(0, -1);
  }
  if (verb.endsWith('re')) {
    return verb.slice(0, -2) + 'u';
  }
  return null;
};

export const getVerbStandardForm = (
  verb: string,
  mood: VerbMood,
  tense: VerbTense,
  pronoun: VerbPronoun,
  firstPronounForm: string | undefined,
): string | null => {
  if (firstPronounForm && pronoun !== VerbPronoun.ich && firstPronounForm.includes('/')) {
    return mergeSplitted(slashSplit(firstPronounForm).map((v) => getVerbStandardForm(verb, mood, tense, pronoun, v)));
  }
  const lastTwoLetters = verb.slice(-2);
  if (firstPronounForm) {
    const [firstPart, secondPart] = separateBySpace(firstPronounForm);
    if (firstPart === DEFAULT_PRONOUNS.a[VerbPronoun.ich] && secondPart) {
      return `${DEFAULT_PRONOUNS.a[pronoun as never]} ${getVerbStandardForm(verb, mood, tense, pronoun, secondPart)}`;
    } else {
      // in case first pronoun form duplicates two letters or something, we can apply same logic to the rest pronoun conjugations as well
      const firstPronounEnding = endings[mood as never]?.[tense]?.[lastTwoLetters]?.[VerbPronoun.ich] as
        | string
        | undefined;
      if (firstPronounEnding) {
        return getVerbStandardForm(
          firstPronounForm.substring(0, firstPronounForm.length - firstPronounEnding.length) + lastTwoLetters,
          mood,
          tense,
          pronoun,
          undefined,
        );
      }
    }
  }
  const myEnding = endings[mood as never]?.[tense]?.[lastTwoLetters]?.[pronoun];
  if (myEnding === undefined) return null;
  return combineParts(verb.slice(0, -2), myEnding);
};
const separateBySpace = (value: string): [string, string] => {
  const spaceIndex = value.indexOf(' ');
  return [value.substring(0, spaceIndex), value.substring(spaceIndex + 1)];
};
export const isOneOfVariantsWithPronouns = (firstPronounConjugatedForm: string) => {
  const forms = firstPronounConjugatedForm.includes('/')
    ? slashSplit(firstPronounConjugatedForm)
    : [firstPronounConjugatedForm];
  return forms.some((form) => form.includes(' ') && separateBySpace(form)[0] === DEFAULT_PRONOUNS.a[VerbPronoun.ich]);
};

export const combineParts = (firstPart: string, secondPart: string): string => {
  const lastLetter = firstPart[firstPart.length - 1];
  const firstLetter = secondPart[0];
  if (canLettersBeMerged(lastLetter, firstLetter)) {
    return firstPart.slice(0, -1) + secondPart;
  }
  return firstPart + secondPart;
};

const accentsMap = {
  a: ['a', 'à', 'â', 'ä', 'á', 'ã', 'å', 'æ'],
  e: ['e', 'é', 'è', 'ê', 'ë', 'æ'],
  i: ['i', 'î', 'ï', 'í'],
  o: ['o', 'ô', 'ö', 'ò', 'ó', 'õ', 'ø'],
  u: ['u', 'ù', 'û', 'ü', 'ú'],
  c: ['c', 'ç'],
  y: ['y', 'ÿ'],
} as Record<string, string[]>;

const canLettersBeMerged = (lastLetter: string, firstLetter: string): boolean => {
  if (lastLetter === firstLetter) {
    return true;
  }
  if (accentsMap[lastLetter]) {
    return accentsMap[lastLetter].includes(firstLetter);
  } else if (accentsMap[firstLetter]) {
    return accentsMap[firstLetter].includes(lastLetter);
  }
  return false;
};

export const DEFAULT_PRONOUNS = {
  a: {
    [VerbPronoun.ich]: 'me',
    [VerbPronoun.du]: 'te',
    [VerbPronoun.er_sie_es]: 'se',
    [VerbPronoun.wir]: 'nous',
    [VerbPronoun.ihr]: 'vous',
    [VerbPronoun.they]: 'se',
  },
};

export const getVerbImperativeStandardForm = (
  verb: string,
  tense: VerbTense,
  imperativePronoun: ImperativePronoun,
  firstPronounForm: string | undefined,
): string | null => {
  if (firstPronounForm && imperativePronoun !== ImperativePronoun.Pers2Sing && firstPronounForm.includes('/')) {
    return mergeSplitted(
      slashSplit(firstPronounForm).map((v) => getVerbImperativeStandardForm(verb, tense, imperativePronoun, v)),
    );
  }
  let suffix = '';
  if (firstPronounForm && firstPronounForm.endsWith('-toi')) {
    suffix = imperativePronoun === ImperativePronoun.Pers1Plr ? '-nous' : '-vous';
  }
  const lastTwoLetters = verb.slice(-2);
  const myEnding = imperativeEndings[tense as never]?.[lastTwoLetters]?.[imperativePronoun];
  if (myEnding === undefined) return null;
  return verb.slice(0, -2) + myEnding + suffix;
};

const endings = {
  [VerbMood.Indikativ]: {
    [VerbTense.Präsens]: {
      er: {
        [VerbPronoun.ich]: 'e',
        [VerbPronoun.du]: 'es',
        [VerbPronoun.er_sie_es]: 'e',
        [VerbPronoun.wir]: 'ons',
        [VerbPronoun.ihr]: 'ez',
        [VerbPronoun.they]: 'ent',
      },
      ir: {
        [VerbPronoun.ich]: 'is',
        [VerbPronoun.du]: 'is',
        [VerbPronoun.er_sie_es]: 'it',
        [VerbPronoun.wir]: 'issons',
        [VerbPronoun.ihr]: 'issez',
        [VerbPronoun.they]: 'issent',
      },
      re: {
        [VerbPronoun.ich]: 's',
        [VerbPronoun.du]: 's',
        [VerbPronoun.er_sie_es]: '',
        [VerbPronoun.wir]: 'ons',
        [VerbPronoun.ihr]: 'ez',
        [VerbPronoun.they]: 'ent',
      },
    },
    [VerbTense.Imparfait]: {
      er: {
        [VerbPronoun.ich]: 'ais',
        [VerbPronoun.du]: 'ais',
        [VerbPronoun.er_sie_es]: 'ait',
        [VerbPronoun.wir]: 'ions',
        [VerbPronoun.ihr]: 'iez',
        [VerbPronoun.they]: 'aient',
      },
      ir: {
        [VerbPronoun.ich]: 'issais',
        [VerbPronoun.du]: 'issais',
        [VerbPronoun.er_sie_es]: 'issait',
        [VerbPronoun.wir]: 'issions',
        [VerbPronoun.ihr]: 'issiez',
        [VerbPronoun.they]: 'issaient',
      },
      re: {
        [VerbPronoun.ich]: 'ais',
        [VerbPronoun.du]: 'ais',
        [VerbPronoun.er_sie_es]: 'ait',
        [VerbPronoun.wir]: 'ions',
        [VerbPronoun.ihr]: 'iez',
        [VerbPronoun.they]: 'aient',
      },
    },
    [VerbTense.PastSimple]: {
      er: {
        [VerbPronoun.ich]: 'ai',
        [VerbPronoun.du]: 'as',
        [VerbPronoun.er_sie_es]: 'a',
        [VerbPronoun.wir]: 'âmes',
        [VerbPronoun.ihr]: 'âtes',
        [VerbPronoun.they]: 'èrent',
      },
      ir: {
        [VerbPronoun.ich]: 'is',
        [VerbPronoun.du]: 'is',
        [VerbPronoun.er_sie_es]: 'it',
        [VerbPronoun.wir]: 'îmes',
        [VerbPronoun.ihr]: 'îtes',
        [VerbPronoun.they]: 'irent',
      },
      re: {
        [VerbPronoun.ich]: 'is',
        [VerbPronoun.du]: 'is',
        [VerbPronoun.er_sie_es]: 'it',
        [VerbPronoun.wir]: 'îmes',
        [VerbPronoun.ihr]: 'îtes',
        [VerbPronoun.they]: 'irent',
      },
    },
    [VerbTense.FutureSimple]: {
      er: {
        [VerbPronoun.ich]: 'erai',
        [VerbPronoun.du]: 'eras',
        [VerbPronoun.er_sie_es]: 'era',
        [VerbPronoun.wir]: 'erons',
        [VerbPronoun.ihr]: 'erez',
        [VerbPronoun.they]: 'eront',
      },
      ir: {
        [VerbPronoun.ich]: 'irai',
        [VerbPronoun.du]: 'iras',
        [VerbPronoun.er_sie_es]: 'ira',
        [VerbPronoun.wir]: 'irons',
        [VerbPronoun.ihr]: 'irez',
        [VerbPronoun.they]: 'iront',
      },
      re: {
        [VerbPronoun.ich]: 'rai',
        [VerbPronoun.du]: 'ras',
        [VerbPronoun.er_sie_es]: 'ra',
        [VerbPronoun.wir]: 'rons',
        [VerbPronoun.ihr]: 'rez',
        [VerbPronoun.they]: 'ront',
      },
    },
  },
  [VerbMood.Subjunctive]: {
    [VerbTense.Präsens]: {
      er: {
        [VerbPronoun.ich]: 'e',
        [VerbPronoun.du]: 'es',
        [VerbPronoun.er_sie_es]: 'e',
        [VerbPronoun.wir]: 'ions',
        [VerbPronoun.ihr]: 'iez',
        [VerbPronoun.they]: 'ent',
      },
      ir: {
        [VerbPronoun.ich]: 'isse',
        [VerbPronoun.du]: 'isses',
        [VerbPronoun.er_sie_es]: 'isse',
        [VerbPronoun.wir]: 'issions',
        [VerbPronoun.ihr]: 'issiez',
        [VerbPronoun.they]: 'issent',
      },
      re: {
        [VerbPronoun.ich]: 'e',
        [VerbPronoun.du]: 'es',
        [VerbPronoun.er_sie_es]: 'e',
        [VerbPronoun.wir]: 'ions',
        [VerbPronoun.ihr]: 'iez',
        [VerbPronoun.they]: 'ent',
      },
    },
    [VerbTense.Imparfait]: {
      er: {
        [VerbPronoun.ich]: 'asse',
        [VerbPronoun.du]: 'asses',
        [VerbPronoun.er_sie_es]: 'ât',
        [VerbPronoun.wir]: 'assions',
        [VerbPronoun.ihr]: 'assiez',
        [VerbPronoun.they]: 'assent',
      },
      ir: {
        [VerbPronoun.ich]: 'isse',
        [VerbPronoun.du]: 'isses',
        [VerbPronoun.er_sie_es]: 'ît',
        [VerbPronoun.wir]: 'issions',
        [VerbPronoun.ihr]: 'issiez',
        [VerbPronoun.they]: 'issent',
      },
      re: {
        [VerbPronoun.ich]: 'isse',
        [VerbPronoun.du]: 'isses',
        [VerbPronoun.er_sie_es]: 'ît',
        [VerbPronoun.wir]: 'issions',
        [VerbPronoun.ihr]: 'issiez',
        [VerbPronoun.they]: 'issent',
      },
    },
  },
  [VerbMood.Conditional]: {
    [VerbTense.Präsens]: {
      er: {
        [VerbPronoun.ich]: 'erais',
        [VerbPronoun.du]: 'erais',
        [VerbPronoun.er_sie_es]: 'erait',
        [VerbPronoun.wir]: 'erions',
        [VerbPronoun.ihr]: 'eriez',
        [VerbPronoun.they]: 'eraient',
      },
      ir: {
        [VerbPronoun.ich]: 'irais',
        [VerbPronoun.du]: 'irais',
        [VerbPronoun.er_sie_es]: 'irait',
        [VerbPronoun.wir]: 'irions',
        [VerbPronoun.ihr]: 'iriez',
        [VerbPronoun.they]: 'iraient',
      },
      re: {
        [VerbPronoun.ich]: 'rais',
        [VerbPronoun.du]: 'rais',
        [VerbPronoun.er_sie_es]: 'rait',
        [VerbPronoun.wir]: 'rions',
        [VerbPronoun.ihr]: 'riez',
        [VerbPronoun.they]: 'raient',
      },
    },
  },
};

const imperativeEndings = {
  [VerbTense.Präsens]: {
    er: {
      [ImperativePronoun.Pers2Sing]: 'e',
      [ImperativePronoun.Pers1Plr]: 'ons',
      [ImperativePronoun.Pers2Plr]: 'ez',
    },
    ir: {
      [ImperativePronoun.Pers2Sing]: 'is',
      [ImperativePronoun.Pers1Plr]: 'issons',
      [ImperativePronoun.Pers2Plr]: 'issez',
    },
    re: {
      [ImperativePronoun.Pers2Sing]: 's',
      [ImperativePronoun.Pers1Plr]: 'ons',
      [ImperativePronoun.Pers2Plr]: 'ez',
    },
  },
};
