/* eslint-disable sonarjs/cognitive-complexity */
import {
  AdjectiveDegree,
  AdjectiveInflection,
  Case,
  NounGender,
  NounNumber,
  PronounFunction,
  VerbMood,
  VerbPronoun,
  VerbTense,
} from '../database/types';
import { slashSplit } from '../utils/split';

export const getAdjectiveTrioStandardForm = (
  adjective: string,
  degree: AdjectiveDegree.Komparativ | AdjectiveDegree.Superlativ,
): string | null => {
  if (degree === AdjectiveDegree.Komparativ) {
    if (containsOneUmlautableVowel(adjective)) return null; //can't guess if it should be replaced to umlaut or not
    return addSuffixSafely(adjective, 'er');
  }

  const lastLetter = adjective[adjective.length - 1];
  if (degree === AdjectiveDegree.Superlativ) {
    if (lastLetter === 'u') return `am ${adjective}sten/${adjective}esten`;
    return requiredAddingVowelE(adjective, 't') ? `am ${adjective}esten` : `am ${adjective}sten`;
  }
  return null;
};

/**
 * Checks if the word contains exactly one vowel and that is umlautable vowel - [aou]
 */
const containsOneUmlautableVowel = (word: string): boolean => {
  const vowels = 'aeiouäöü';
  const umlautableVowels = 'aou';
  let vowelsCount = 0;
  let umlautableVowelsCount = 0;
  for (let i = 0; i < word.length; i++) {
    if (umlautableVowels.includes(word[i])) {
      umlautableVowelsCount++;
    }
    if (vowels.includes(word[i])) {
      vowelsCount++;
    }
  }
  return vowelsCount === 1 && umlautableVowelsCount === 1;
};

export const getAdjectiveStandardForm = (
  adjective: string | null,
  nominativeValue: string | null,
  degree: AdjectiveDegree,
  inflection: AdjectiveInflection,
  gender: NounGender,
  case_: Case,
): string | null => {
  if (!adjective) return null;
  if (nominativeValue && nominativeValue.includes('/')) {
    return slashSplit(nominativeValue)
      .map((v) => getAdjectiveStandardForm(adjective, v, degree, inflection, gender, case_))
      .join('/');
  }
  if (nominativeValue) {
    const suffix = AdjectiveSuffixes[inflection][NounGender.Maskulinum][Case.Nominativ];
    if (!nominativeValue.endsWith(suffix)) return null;
    return (
      nominativeValue.substring(0, nominativeValue.length - suffix.length) +
      AdjectiveSuffixes[inflection][gender][case_]
    );
  }

  if (adjective.includes('/')) {
    return slashSplit(adjective)
      .map((v) => getAdjectiveStandardForm(v, nominativeValue, degree, inflection, gender, case_))
      .join('/');
  }
  let word = adjective;
  if (degree === AdjectiveDegree.Superlativ) {
    const [firstValue, secondValue] = separateBySpace(adjective);
    if (firstValue !== 'am' || !secondValue) return null;
    if (!secondValue.endsWith('en')) return null;
    word = secondValue.slice(0, -2);
  } else if (word.endsWith('e')) {
    word = word.slice(0, -1);
  }
  return word + AdjectiveSuffixes[inflection][gender][case_];
};

const AdjectiveSuffixes = {
  [AdjectiveInflection.Strong]: {
    [NounGender.Maskulinum]: {
      [Case.Nominativ]: 'er',
      [Case.Genitiv]: 'en',
      [Case.Dativ]: 'em',
      [Case.Akkusativ]: 'en',
    },
    [NounGender.Femininum]: {
      [Case.Nominativ]: 'e',
      [Case.Genitiv]: 'er',
      [Case.Dativ]: 'er',
      [Case.Akkusativ]: 'e',
    },
    [NounGender.Neutrum]: {
      [Case.Nominativ]: 'es',
      [Case.Genitiv]: 'en',
      [Case.Dativ]: 'em',
      [Case.Akkusativ]: 'es',
    },
    [NounGender.Plural]: {
      [Case.Nominativ]: 'e',
      [Case.Genitiv]: 'er',
      [Case.Dativ]: 'en',
      [Case.Akkusativ]: 'e',
    },
  },
  [AdjectiveInflection.Weak]: {
    [NounGender.Maskulinum]: {
      [Case.Nominativ]: 'e',
      [Case.Genitiv]: 'en',
      [Case.Dativ]: 'en',
      [Case.Akkusativ]: 'en',
    },
    [NounGender.Femininum]: {
      [Case.Nominativ]: 'e',
      [Case.Genitiv]: 'en',
      [Case.Dativ]: 'en',
      [Case.Akkusativ]: 'e',
    },
    [NounGender.Neutrum]: {
      [Case.Nominativ]: 'e',
      [Case.Genitiv]: 'en',
      [Case.Dativ]: 'en',
      [Case.Akkusativ]: 'e',
    },
    [NounGender.Plural]: {
      [Case.Nominativ]: 'en',
      [Case.Genitiv]: 'en',
      [Case.Dativ]: 'en',
      [Case.Akkusativ]: 'en',
    },
  },
  [AdjectiveInflection.Mixed]: {
    [NounGender.Maskulinum]: {
      [Case.Nominativ]: 'er',
      [Case.Genitiv]: 'en',
      [Case.Dativ]: 'en',
      [Case.Akkusativ]: 'en',
    },
    [NounGender.Femininum]: {
      [Case.Nominativ]: 'e',
      [Case.Genitiv]: 'en',
      [Case.Dativ]: 'en',
      [Case.Akkusativ]: 'e',
    },
    [NounGender.Neutrum]: {
      [Case.Nominativ]: 'es',
      [Case.Genitiv]: 'en',
      [Case.Dativ]: 'en',
      [Case.Akkusativ]: 'es',
    },
    [NounGender.Plural]: {
      [Case.Nominativ]: 'en',
      [Case.Genitiv]: 'en',
      [Case.Dativ]: 'en',
      [Case.Akkusativ]: 'en',
    },
  },
};

export function getVerbStandardForm(
  verb: string,
  mood: VerbMood,
  tense: VerbTense,
  pronoun: VerbPronoun,
  firstPronounForm?: string,
): string | null {
  if (firstPronounForm && pronoun !== VerbPronoun.ich) {
    const guessValue = getVerbStandardFormBasedOnFirstPronoun(verb, mood, tense, pronoun, firstPronounForm);
    if (guessValue) return guessValue;
  }
  const root = verb.slice(0, -2);
  // const rootLastLetter = root.slice(-1);
  if ((mood === VerbMood.Indikativ || mood === VerbMood.Konjunktiv) && tense === VerbTense.Präsens) {
    return getDefaultPresentConjugation(verb, pronoun);
  } else if ((mood === VerbMood.Indikativ || mood === VerbMood.Konjunktiv) && tense === VerbTense.Präteritum) {
    return getDefaultPastConjugation(verb, pronoun);
  } else if ((mood === VerbMood.Indikativ || mood === VerbMood.Konjunktiv) && tense === VerbTense.Perfekt) {
    const perfectRoot = 'ge' + root + 't';
    return DEFAULT_VERBS.haben_present[pronoun] + ' ' + perfectRoot;
  }
  return null;
}

const getDefaultPresentConjugation = (verb: string, pronoun: VerbPronoun): string | null => {
  const root = verb.slice(0, -2);
  const rootLastLetter = root.slice(-1);
  if (pronoun === VerbPronoun.ich) return root + 'e';
  if (pronoun === VerbPronoun.du) {
    if (rootLastLetter === 's' || rootLastLetter === 'ß') return root + 't';
    return requiredAddingVowelE(root, 't') ? root + 'est' : root + 'st';
  }
  if (pronoun === VerbPronoun.er_sie_es) return requiredAddingVowelE(root, 't') ? root + 'et' : root + 't';
  if (pronoun === VerbPronoun.wir) return verb;
  if (pronoun === VerbPronoun.ihr) return requiredAddingVowelE(root, 't') ? root + 'et' : root + 't';
  if (pronoun === VerbPronoun.sie_Sie) return verb;
  return null;
};

const getDefaultPastConjugation = (verb: string, pronoun: VerbPronoun): string | null => {
  const root = verb.slice(0, -2);
  const pastRoot = requiredAddingVowelE(root, 't') ? root + 'et' : root + 't';
  return getConjugatedPastFromRoot(pastRoot, pronoun);
};
const getConjugatedPastFromRoot = (pastRoot: string, pronoun: VerbPronoun) => {
  if (pronoun === VerbPronoun.ich) return pastRoot + 'e';
  if (pronoun === VerbPronoun.du) return requiredAddingVowelE(pastRoot, 't') ? pastRoot + 'est' : pastRoot + 'st';
  if (pronoun === VerbPronoun.er_sie_es) return pastRoot + 'e'; // different from present form
  if (pronoun === VerbPronoun.wir) return pastRoot + 'en';
  if (pronoun === VerbPronoun.ihr) return requiredAddingVowelE(pastRoot, 't') ? pastRoot + 'et' : pastRoot + 't';
  if (pronoun === VerbPronoun.sie_Sie) return pastRoot + 'en';
  return null;
};

const requiredAddingVowelE = (word: string, toAdd: string): boolean => {
  const lastLetter = word.slice(-1);
  if (toAdd === 't') {
    return lastLetter === 't' || lastLetter === 'd';
  }
  return false;
};

function getVerbStandardFormBasedOnFirstPronoun(
  verb: string,
  mood: VerbMood,
  tense: VerbTense,
  pronoun: VerbPronoun,
  firstPronounForm: string,
): string | null {
  if ((mood === VerbMood.Indikativ || mood === VerbMood.Konjunktiv) && tense === VerbTense.Präsens) {
    const [, secondPart] = separateBySpace(firstPronounForm);
    if (secondPart === DEFAULT_PRONOUNS.a[VerbPronoun.ich]) {
      return getDefaultPresentConjugation(verb, pronoun) + ' ' + DEFAULT_PRONOUNS.a[pronoun];
    }
  }
  if ((mood === VerbMood.Indikativ || mood === VerbMood.Konjunktiv) && tense === VerbTense.Präteritum) {
    if (pronoun === VerbPronoun.er_sie_es || pronoun === VerbPronoun.es) return firstPronounForm;
    const firstRoot = firstPronounForm.endsWith('e') ? firstPronounForm.slice(0, -1) : firstPronounForm;
    return getConjugatedPastFromRoot(firstRoot, pronoun);
  }
  if ((mood === VerbMood.Indikativ || mood === VerbMood.Konjunktiv) && tense === VerbTense.Perfekt) {
    const [firstPart, secondPart] = separateBySpace(firstPronounForm);
    let prefix = '';
    if (firstPart === 'habe') {
      prefix = DEFAULT_VERBS.haben_present[pronoun];
    } else if (firstPart === 'bin') {
      prefix = DEFAULT_VERBS.sein_present[pronoun];
    }
    if (!prefix) return null;
    const [part2, part3] = separateBySpace(secondPart);
    if (part3 && part2 === DEFAULT_PRONOUNS.a[VerbPronoun.ich]) {
      return prefix + ' ' + DEFAULT_PRONOUNS.a[pronoun] + ' ' + part3;
    }
    return prefix + ' ' + secondPart;
  }
  return null;
}

const separateBySpace = (value: string): [string, string] => {
  const spaceIndex = value.indexOf(' ');
  return [value.substring(0, spaceIndex), value.substring(spaceIndex + 1)];
};

const DEFAULT_VERBS = {
  haben_present: {
    [VerbPronoun.ich]: 'habe',
    [VerbPronoun.du]: 'hast',
    [VerbPronoun.er_sie_es]: 'hat',
    [VerbPronoun.es]: 'hat',
    [VerbPronoun.wir]: 'haben',
    [VerbPronoun.ihr]: 'habt',
    [VerbPronoun.sie_Sie]: 'haben',
  },
  sein_present: {
    [VerbPronoun.ich]: 'bin',
    [VerbPronoun.du]: 'bist',
    [VerbPronoun.er_sie_es]: 'ist',
    [VerbPronoun.es]: 'ist',
    [VerbPronoun.wir]: 'sind',
    [VerbPronoun.ihr]: 'seid',
    [VerbPronoun.sie_Sie]: 'sind',
  },
};

const DEFAULT_PRONOUNS = {
  a: {
    [VerbPronoun.ich]: 'mich',
    [VerbPronoun.du]: 'dich',
    [VerbPronoun.er_sie_es]: 'sich',
    [VerbPronoun.es]: 'sich',
    [VerbPronoun.wir]: 'uns',
    [VerbPronoun.ihr]: 'euch',
    [VerbPronoun.sie_Sie]: 'sich',
  },
};

export const generateNounStandardVariant = (
  noun: string,
  pluralNominative: string | undefined,
  gender: NounGender,
  number: NounNumber,
  case_: Case,
): string | null => {
  if (number === NounNumber.singular && case_ === Case.Nominativ) return noun;
  if (gender === NounGender.Femininum && number === NounNumber.singular) return noun;

  const lastLetter = noun[noun.length - 1];

  if (gender === NounGender.Femininum && number === NounNumber.plural) {
    if (pluralNominative && case_ !== Case.Nominativ) return pluralNominative;
    return addSuffixSafely(noun, 'en');
  }
  if ((gender === NounGender.Maskulinum || gender === NounGender.Neutrum) && number === NounNumber.singular) {
    if (lastLetter === 'e' && case_ === Case.Genitiv) return noun + 's';
    if (case_ === Case.Genitiv) return `${noun}s/${noun}es`;
    return noun;
  }

  if ((gender === NounGender.Maskulinum || gender === NounGender.Neutrum) && number === NounNumber.plural) {
    if (pluralNominative && case_ !== Case.Nominativ) {
      if (case_ === Case.Dativ) return addSuffixSafely(pluralNominative, 'n');
      return pluralNominative;
    }
    if (lastLetter === 'e') return noun + 'n';
    if (case_ === Case.Dativ) return noun + 'en';
    return noun + 'e';
  }

  return null;
};

const addSuffixSafely = (word: string, suffix: string): string => {
  if (word.endsWith(suffix[0])) return word + suffix.substring(1);
  return word + suffix;
};

export const getPronounStandardForm = (
  pronoun: string,
  _nominativeValue: string | null,
  nominativeMasculineValue: string | null,
  function_: PronounFunction,
  _number: NounNumber,
  gender: NounGender | null,
  case_: Case,
): string | null => {
  if (function_ === PronounFunction.Declanation && gender !== null) {
    return getAdjectiveStandardForm(
      pronoun,
      nominativeMasculineValue,
      AdjectiveDegree.Positiv,
      AdjectiveInflection.Strong,
      gender,
      case_,
    );
  }
  return null;
};
