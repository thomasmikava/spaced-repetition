/* eslint-disable sonarjs/cognitive-complexity */
import type { AnyCard } from '../database/types';
import { NounGender, AdjectiveInflection, PronounFunction, VerbPronoun } from '../database/types';
import { AdjectiveDegree, CardType, Case, NounNumber, VerbMood, VerbTense } from '../database/types';
import type {
  AdjectiveTestableCard,
  AnyTestableCard,
  ArticleTestableCard,
  NounTestableCard,
  PronounTestableCard,
  VerbTestableCard,
} from './reviews';

const VERB_MAX_TENSES = 2;

function isNounVariantDisabled(number: NounNumber, case_: Case): boolean {
  if (number === NounNumber.singular) return case_ !== Case.Genitiv;
  return case_ !== Case.Nominativ && case_ !== Case.Dativ;
}

function isArticleVariantDisabled(number: NounNumber, gender: NounGender, case_: Case): boolean {
  return number !== undefined && gender !== undefined && case_ === Case.Nominativ;
}

function isAdjectiveVariantDisabled(degree: AdjectiveDegree, inflection: AdjectiveInflection): boolean {
  return degree !== AdjectiveDegree.Positiv || inflection !== AdjectiveInflection.Strong;
}

function _generateTestableCards(card: AnyCard): AnyTestableCard[] {
  const value = card.uniqueValue ?? card.value;
  const valueKey = `#${value}`;
  if (card.type === CardType.VERB) {
    const allVariants: VerbTestableCard[] = [
      {
        type: CardType.VERB,
        card,
        initial: true,
        testKey: valueKey,
        groupViewKey: null,
        hasGroupViewMode: false,
        hasIndividualViewMode: true,
      },
    ];
    const tenseVariants = card.variants
      .flatMap((mood) => mood.tenses.map((tense) => ({ mood: mood.mood, tense })))
      .sort((a, b) => {
        if (typeof a.tense.priority === 'number' && typeof b.tense.priority === 'number') {
          return a.tense.priority - b.tense.priority;
        }
        if (typeof a.tense.priority === 'number') return -1;
        if (typeof b.tense.priority === 'number') return 1;
        // TODO: build object of default priorities
        return 0;
      })
      .slice(0, VERB_MAX_TENSES);
    for (const { mood, tense } of tenseVariants) {
      const firstPronounForm = tense.conjugations.find((e) => e.pronoun === VerbPronoun.ich)?.value;
      const standardness = tense.conjugations.map(
        (conjugation) =>
          conjugation.value === getVerbStandardForm(value, mood, tense.tense, conjugation.pronoun, firstPronounForm),
      );
      const areAllConjugationsStandard = standardness.every((correct) => !!correct);
      for (let i = 0; i < tense.conjugations.length; i++) {
        const conjugation = tense.conjugations[i];
        allVariants.push({
          type: CardType.VERB,
          card,
          initial: false,
          variant: {
            mood,
            tense: tense.tense,
            conjugation,
          },
          testKey: `${valueKey}#${mood}.${tense.tense}.${conjugation.pronoun}.${conjugation.value}`,
          groupViewKey: `${valueKey}#${mood}.${tense.tense}`,
          hasGroupViewMode: true,
          hasIndividualViewMode: false,
          isStandardForm: standardness[i],
          isGroupStandardForm: areAllConjugationsStandard,
        });
      }
    }
    return allVariants;
  } else if (card.type === CardType.NOUN) {
    const allVariants: NounTestableCard[] = [
      {
        type: CardType.NOUN,
        card,
        initial: true,
        testKey: valueKey,
        groupViewKey: null,
        hasGroupViewMode: false,
        hasIndividualViewMode: true,
      },
    ];
    for (const variant of card.variants) {
      if (isNounVariantDisabled(variant.number, variant.case)) continue;
      const standardVariant = generateNounStandardVariant(card.value, card.gender, variant.number, variant.case);
      allVariants.push({
        type: CardType.NOUN,
        card,
        initial: false,
        variant,
        testKey: `${valueKey}#${variant.number}.${variant.case}.${variant.value}`,
        groupViewKey: `${valueKey}#${variant.number}`,
        hasGroupViewMode: true,
        hasIndividualViewMode: false,
        isStandardForm: standardVariant === variant.value,
      });
    }
    return allVariants;
  } else if (card.type === CardType.ARTICLE) {
    const allVariants: ArticleTestableCard[] = [
      {
        type: CardType.ARTICLE,
        card,
        initial: true,
        testKey: valueKey,
        groupViewKey: null,
        hasGroupViewMode: false,
        hasIndividualViewMode: true,
      },
    ];
    for (const variant of card.variants) {
      if (isArticleVariantDisabled(card.number, card.gender, variant.case)) continue;
      allVariants.push({
        type: CardType.ARTICLE,
        card,
        initial: false,
        variant,
        testKey: `${valueKey}#${card.number}.${card.gender}.${variant.case}.${variant.value}`,
        groupViewKey: `${valueKey}#${card.number}.${card.gender}`,
        hasGroupViewMode: true,
        hasIndividualViewMode: false,
      });
    }
    return allVariants;
  } else if (card.type === CardType.ADJECTIVE) {
    const allVariants: AdjectiveTestableCard[] = [
      {
        type: CardType.ADJECTIVE,
        card,
        initial: true,
        isInitialTrio: true,
        degree: AdjectiveDegree.Positiv,
        testKey: `${valueKey}#${AdjectiveDegree.Positiv}`,
        value: card.value,
        groupViewKey: null,
        hasGroupViewMode: false,
        hasIndividualViewMode: true,
      },
    ];
    if (card.komparativ) {
      allVariants.push({
        ...allVariants[0],
        initial: false,
        degree: AdjectiveDegree.Komparativ,
        testKey: `${valueKey}#${AdjectiveDegree.Komparativ}`,
        groupViewKey: `${valueKey}#${AdjectiveDegree.Komparativ}`,
        value: card.komparativ,
        isStandardForm: card.komparativ === getAdjectiveStandardForm(card.value, AdjectiveDegree.Komparativ),
      } as never);
    }
    if (card.superlativ) {
      allVariants.push({
        ...allVariants[0],
        initial: false,
        degree: AdjectiveDegree.Superlativ,
        testKey: `${valueKey}#${AdjectiveDegree.Superlativ}`,
        groupViewKey: `${valueKey}#${AdjectiveDegree.Superlativ}`,
        value: card.superlativ,
        isStandardForm: card.superlativ === getAdjectiveStandardForm(card.value, AdjectiveDegree.Superlativ),
      } as never);
    }
    const genders = [NounGender.Maskulinum, NounGender.Femininum, NounGender.Neutrum, NounGender.Plural];
    for (const variant of card.variants) {
      if (isAdjectiveVariantDisabled(variant.degree, variant.inflection)) continue;
      for (const [case_, ...rest] of variant.values) {
        rest.forEach((value, index) => {
          const gender = genders[index];
          allVariants.push({
            type: CardType.ADJECTIVE,
            card,
            initial: false,
            isInitialTrio: false,
            testKey: `${valueKey}#${variant.degree}.${variant.inflection}.${gender}.${case_}.${value}`,
            groupViewKey: `${valueKey}#${variant.degree}.${variant.inflection}.${gender}`,
            hasGroupViewMode: true,
            hasIndividualViewMode: false,
            isStandardForm: false, // TODO: implement
            variant: {
              case: case_,
              degree: variant.degree,
              gender,
              inflection: variant.inflection,
              number: index > 2 ? NounNumber.plural : NounNumber.singular,
              value,
            },
          });
        });
      }
    }
    return allVariants;
  } else if (card.type === CardType.PHRASE) {
    return [
      {
        type: null,
        typeTag: 'Phrase',
        initial: true,
        card: { value: card.value, type: CardType.PHRASE, translation: card.translation, caseSensitive: false },
        testKey: valueKey,
        groupViewKey: null,
        hasGroupViewMode: false,
        hasIndividualViewMode: true,
      },
    ];
  } else if (card.type === CardType.CONJUNCTION) {
    return [
      {
        type: null,
        typeTag: 'Konjunktion',
        initial: true,
        card: { value: card.value, type: CardType.CONJUNCTION, translation: card.translation, caseSensitive: false },
        testKey: valueKey,
        groupViewKey: null,
        hasGroupViewMode: false,
        hasIndividualViewMode: true,
      },
    ];
  } else if (card.type === CardType.PREPOSITION) {
    return [
      {
        type: CardType.PREPOSITION,
        card,
        initial: true,
        testKey: valueKey,
        groupViewKey: null,
        hasGroupViewMode: false,
        hasIndividualViewMode: true,
      },
    ];
  } else if (card.type === CardType.PRONOUN) {
    const allVariants: PronounTestableCard[] = [];
    const genders = [NounGender.Maskulinum, NounGender.Femininum, NounGender.Neutrum, NounGender.Plural];
    for (const variant of card.variants) {
      for (const [case_, ...rest] of variant.values) {
        rest.forEach((value, index, arr) => {
          if (value === null) return;
          const gender = variant.function === PronounFunction.Declanation ? null : genders[index];
          const pluralIndex = arr.length - 1;
          const number = index >= pluralIndex ? NounNumber.plural : NounNumber.singular;
          allVariants.push({
            type: CardType.PRONOUN,
            card,
            initial: false,
            testKey: `${valueKey}#${variant.function}.${number}.${gender}.${case_}.${value}`,
            groupViewKey: `${valueKey}#${variant.function}.${number}.${gender}.${case_}`,
            hasGroupViewMode: true,
            hasIndividualViewMode: false,
            function: variant.function,
            variant: {
              case: case_,
              gender,
              function: variant.function,
              number,
              value,
            },
          });
        });
      }
    }
    return allVariants;
  }
  throw new Error('Unsupported card type ' + (card as Record<string, unknown>).type);
}

function addPreviousGroups(allVariants: AnyTestableCard[]): AnyTestableCard[] {
  let lastGroupKey: string | null = null;
  let currentGroupKey: string | null = null;
  let groupLevel = 0;
  return allVariants.map((variant): AnyTestableCard => {
    if (variant.groupViewKey !== lastGroupKey) {
      if (variant.groupViewKey !== currentGroupKey) {
        lastGroupKey = currentGroupKey;
        groupLevel++;
      }
      currentGroupKey = variant.groupViewKey;
      return { ...variant, previousGroupViewKey: lastGroupKey, groupLevel };
    }
    currentGroupKey = variant.groupViewKey;
    return variant;
  });
}

export function generateTestableCards(card: AnyCard): AnyTestableCard[] {
  return addPreviousGroups(_generateTestableCards(card));
}

const generateNounStandardVariant = (
  noun: string,
  gender: NounGender,
  number: NounNumber,
  case_: Case,
): string | null => {
  if (number === NounNumber.singular && case_ === Case.Nominativ) return noun;
  if (gender === NounGender.Femininum && number === NounNumber.singular) return noun;

  const lastLetter = noun[noun.length - 1];

  if (gender === NounGender.Femininum && number === NounNumber.plural) {
    if (lastLetter === 'e') return noun + 'n';
    return noun + 'en';
  }
  if ((gender === NounGender.Maskulinum || gender === NounGender.Neutrum) && number === NounNumber.singular) {
    if (lastLetter === 'e' && case_ === Case.Genitiv) return noun + 's';
    if (case_ === Case.Genitiv) return `${noun}s/${noun}es`;
    return noun;
  }

  if ((gender === NounGender.Maskulinum || gender === NounGender.Neutrum) && number === NounNumber.plural) {
    if (lastLetter === 'e' && case_ === Case.Dativ) return noun + 'n';
    if (case_ === Case.Dativ) return noun + 'en';
    return noun + 'e';
  }

  return null;
};

const getAdjectiveStandardForm = (
  adjective: string,
  degree: AdjectiveDegree.Komparativ | AdjectiveDegree.Superlativ,
): string | null => {
  const lastLetter = adjective[adjective.length - 1];
  if (degree === AdjectiveDegree.Komparativ) return lastLetter === 'e' ? `${adjective}r` : `${adjective}er`;
  if (degree === AdjectiveDegree.Superlativ) {
    return lastLetter === 'u' ? `am ${adjective}sten/${adjective}esten` : `am ${adjective}sten`;
  }
  return null;
};

function getVerbStandardForm(
  verb: string,
  mood: VerbMood,
  tense: VerbTense,
  pronoun: VerbPronoun,
  firstPronounForm?: string,
): string | null {
  const lastLetters = verb.slice(-2);
  if (lastLetters !== 'en') return null;
  if (firstPronounForm && pronoun !== VerbPronoun.ich) {
    const guessValue = getVerbStandardFormBasedOnFirstPronoun(verb, mood, tense, pronoun, firstPronounForm);
    if (guessValue) return guessValue;
  }
  const root = verb.slice(0, -2);
  // const rootLastLetter = root.slice(-1);
  if ((mood === VerbMood.Indikativ || mood === VerbMood.Konjunktiv) && tense === VerbTense.Präsens) {
    return getDefaultPresentConjugation(verb, pronoun);
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
  if (pronoun === VerbPronoun.du) return rootLastLetter === 's' || rootLastLetter === 'ß' ? root + 't' : root + 'st';
  if (pronoun === VerbPronoun.er_sie_es) return root + 't';
  if (pronoun === VerbPronoun.wir) return root + 'en';
  if (pronoun === VerbPronoun.ihr) return root + 't';
  if (pronoun === VerbPronoun.sie_Sie) return root + 'en';
  return null;
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
