/* eslint-disable sonarjs/cognitive-complexity */
import type { AnyCard } from '../database/types';
import {
  AdjectiveDegree,
  CardType,
  Case,
  NounGender,
  NounNumber,
  PronounFunction,
  VerbPronoun,
  VerbTense,
} from '../database/types';
import { groupArray, sortArrayByOriginalArray } from '../utils/array';
import { areSplittedEqual } from '../utils/split';
import type {
  AdjectiveTestableCard,
  AnyTestableCard,
  ArticleTestableCard,
  GeneralTestableCard,
  NounTestableCard,
  PronounTestableCard,
  VerbTestableCard,
} from './reviews';
import {
  generateNounStandardVariant,
  getAdjectiveStandardForm,
  getAdjectiveTrioStandardForm,
  getPronounStandardForm,
  getVerbStandardForm,
} from './standard-forms';
import { getPartOfSentenceNames } from './texts';

const VERB_MAX_TENSES = 2;

function isArticleVariantDisabled(number: NounNumber, gender: NounGender, case_: Case): boolean {
  return number !== undefined && gender !== undefined && case_ === Case.Nominativ;
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
      const standardness = tense.conjugations.map((conjugation) =>
        areSplittedEqual(
          conjugation.value,
          getVerbStandardForm(value, mood, tense.tense, conjugation.pronoun, firstPronounForm),
        ),
      );
      const isGroupStandardFormDisabled = tense.tense === VerbTense.Perfekt;
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
          isGroupStandardForm: isGroupStandardFormDisabled ? undefined : areAllConjugationsStandard,
          ...{ standardValue: getVerbStandardForm(value, mood, tense.tense, conjugation.pronoun, firstPronounForm) },
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
    const pluralNominative = card.variants.find(
      (e) => e.case === Case.Nominativ && e.number === NounNumber.plural,
    )?.value;
    for (const variant of card.variants) {
      const standardVariant = generateNounStandardVariant(
        card.value,
        variant.case === Case.Nominativ && variant.number === NounNumber.plural ? undefined : pluralNominative,
        card.gender,
        variant.number,
        variant.case,
      );
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
        isStandardForm: card.komparativ === getAdjectiveTrioStandardForm(card.value, AdjectiveDegree.Komparativ),
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
        isStandardForm: card.superlativ === getAdjectiveTrioStandardForm(card.value, AdjectiveDegree.Superlativ),
      } as never);
    }
    const genders = [NounGender.Maskulinum, NounGender.Femininum, NounGender.Neutrum, NounGender.Plural];
    for (const variant of card.variants) {
      const nominativeCase = variant.values.find((e) => e[0] === Case.Nominativ);
      const nominativeMasculine = (nominativeCase as string[] | undefined)?.[1] ?? null;
      for (const [case_, ...rest] of variant.values) {
        const additionalVariants: AdjectiveTestableCard[] = [];
        rest.forEach((value, index) => {
          let rootValue: string | null = card.value;
          if (variant.degree === AdjectiveDegree.Komparativ) rootValue = card.komparativ;
          if (variant.degree === AdjectiveDegree.Superlativ) rootValue = card.superlativ;
          const gender = genders[index];
          additionalVariants.push({
            type: CardType.ADJECTIVE,
            card,
            initial: false,
            isInitialTrio: false,
            testKey: `${valueKey}#${variant.degree}.${variant.inflection}.${gender}.${case_}.${value}`,
            groupViewKey: `${valueKey}#${variant.degree}.${variant.inflection}.${gender}`,
            hasGroupViewMode: true,
            hasIndividualViewMode: false,
            isStandardForm:
              value ===
              getAdjectiveStandardForm(
                rootValue,
                case_ === Case.Nominativ && gender === NounGender.Maskulinum ? null : nominativeMasculine,
                variant.degree,
                variant.inflection,
                gender,
                case_,
              ),
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
        const areAllStandard = additionalVariants.every((e) => e.isStandardForm);
        if (!areAllStandard) allVariants.push(...additionalVariants);
      }
    }
    return allVariants;
  } else if (card.type === CardType.PHRASE) {
    return [
      {
        type: null,
        typeTag: card.mainType !== undefined ? getPartOfSentenceNames(card.mainType) : 'Phrase',
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
    const allVariants: AnyTestableCard[] = [];
    const initial: AnyTestableCard = {
      type: null,
      typeTag: getPartOfSentenceNames(CardType.PRONOUN),
      initial: true,
      card: { value: card.value, type: CardType.PRONOUN, translation: card.translation, caseSensitive: false },
      groupViewKey: null,
      hasGroupViewMode: false,
      hasIndividualViewMode: true,
      testKey: valueKey,
    };
    if (!card.variants.length) {
      return [initial];
    }
    const genders = [NounGender.Maskulinum, NounGender.Femininum, NounGender.Neutrum, NounGender.Plural];
    const restVariants: PronounTestableCard[] = [];
    for (const variant of card.variants) {
      const nominativeCase = variant.values.find((e) => e[0] === Case.Nominativ);
      const nominativeMasculine = (nominativeCase as string[] | undefined)?.[1] ?? null;
      for (const [case_, ...rest] of variant.values) {
        rest.forEach((value, index, arr) => {
          if (value === null) return;
          const gender = variant.function === PronounFunction.Declanation && rest.length < 4 ? null : genders[index];
          const pluralIndex = arr.length - 1;
          const number = index >= pluralIndex ? NounNumber.plural : NounNumber.singular;
          const nominativeValue = (nominativeCase as string[] | undefined)?.[index + 1] ?? null;
          restVariants.push({
            type: CardType.PRONOUN,
            card,
            initial: false,
            testKey: `${valueKey}#${variant.function}.${number}.${gender}.${case_}.${value}`,
            groupViewKey: `${valueKey}#${variant.function}.${number}.${gender}.${case_}`,
            hasGroupViewMode: true,
            hasIndividualViewMode: false,
            function: variant.function,
            isStandardForm:
              getPronounStandardForm(
                card.value,
                case_ === Case.Nominativ ? null : nominativeValue,
                (case_ === Case.Nominativ && gender === NounGender.Maskulinum) || gender === null
                  ? null
                  : nominativeMasculine,
                variant.function,
                number,
                gender,
                case_,
              ) === value,
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
    if (restVariants.every((e) => e.isStandardForm)) {
      allVariants.push(initial);
    }
    const standardFormed = addGroupStandardFormFlag(restVariants);
    allVariants.push(...standardFormed);
    return allVariants;
  }
  throw new Error('Unsupported card type ' + (card as Record<string, unknown>).type);
}

const addGroupStandardFormFlag = <T extends GeneralTestableCard>(variants: T[]): T[] => {
  return groupArray(
    variants,
    (e) => e.groupViewKey,
    (grouped): T[] => {
      const areAllStandard = grouped.every((e) => e.isStandardForm);
      if (!areAllStandard) return grouped;
      return grouped.map((e) => ({ ...e, isGroupStandardForm: true }));
    },
  ).flat(1);
};

function addPreviousGroups(allVariants: AnyTestableCard[]): AnyTestableCard[] {
  let lastGroupKey: string | null = null;
  let currentGroupKey: string | null = null;
  let groupLevel = 0;
  const levels = new Map<string, { prevKey: string | null; level: number }>();
  return allVariants
    .map((variant): AnyTestableCard => {
      const cachedVariant = levels.get(variant.groupViewKey ?? '');
      if (typeof variant.groupViewKey === 'string' && !!cachedVariant) {
        return { ...variant, previousGroupViewKey: cachedVariant.prevKey, groupLevel: cachedVariant.level };
      }
      if (variant.groupViewKey !== lastGroupKey) {
        if (variant.groupViewKey !== currentGroupKey) {
          lastGroupKey = currentGroupKey;
          groupLevel++;
        }
        currentGroupKey = variant.groupViewKey;
        levels.set(variant.groupViewKey ?? '', { level: groupLevel, prevKey: lastGroupKey });
        return { ...variant, previousGroupViewKey: lastGroupKey, groupLevel };
      }
      currentGroupKey = variant.groupViewKey;
      return variant;
    })
    .sort((a, b) => {
      return (a.groupLevel ?? -1) - (b.groupLevel ?? -1);
    });
}

function removeUnnecessaryGroups(allVariants: AnyTestableCard[]): AnyTestableCard[] {
  const nullGroup = '#J@*@!';
  const grouped = groupArray(
    allVariants,
    (variant) => variant.groupViewKey ?? nullGroup,
    (groupedElements) => {
      if (groupedElements[0].isGroupStandardForm !== false) {
        const filtered = groupedElements.filter((e) => !e.isStandardForm);
        return filtered.length > 0 ? filtered : [groupedElements[0]];
      }
      return groupedElements;
    },
  );
  const newVariants = grouped.flat(1);
  if (newVariants.length === allVariants.length) return allVariants;
  return sortArrayByOriginalArray(newVariants, allVariants);
}

export function generateTestableCards(card: AnyCard): AnyTestableCard[] {
  return removeUnnecessaryGroups(addPreviousGroups(lowercaseKeys(_generateTestableCards(card))));
}

const lowercaseKeys = <T extends GeneralTestableCard>(variants: T[]): T[] => {
  return variants.map((variant) => {
    return {
      ...variant,
      groupViewKey: variant.groupViewKey?.toLowerCase() ?? null,
      testKey: variant.testKey.toLowerCase(),
      previousGroupViewKey: variant.previousGroupViewKey?.toLowerCase() ?? null,
    };
  });
};
