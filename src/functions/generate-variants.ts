/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/cognitive-complexity */
import type { Matcher } from '../database/card-types';
import { CardTypeConfigurationMapper } from '../database/card-types';
import type {
  AnyCard,
  StandardCard,
  NounGender,
  NounNumber,
  StandardCardVariant,
  IdType,
  StandardCardAttributes,
} from '../database/types';
import { AdjectiveDegree, CardType, Case, PronounFunction, VerbPronoun } from '../database/types';
import { groupArray, isNonNullable, sortArrayByOriginalArray } from '../utils/array';
import type {
  AdjectiveTestableCard,
  AnyTestableCard,
  ArticleTestableCard,
  GeneralTestableCard,
  NounTestableCard,
  PronounTestableCard,
  StandardTestableCard,
  VerbTestableCard,
} from './reviews';
import {
  generateNounStandardVariant,
  getAdjectiveStandardForm,
  getAdjectiveTrioStandardForm,
  getPronounStandardForm,
  getVerbStandardForm,
  isStandard,
} from './standard-forms';
import { getPartOfSentenceNames } from './texts';

const VERB_MAX_TENSES = 2;

function isArticleVariantDisabled(number: NounNumber, gender: NounGender, case_: Case): boolean {
  return number !== undefined && gender !== undefined && case_ === Case.Nominativ;
}

function _generateTestableCards(card: StandardCard): StandardTestableCard[] {
  const testable: StandardTestableCard[] = [];
  const displayType = card.mainType === null || card.mainType === undefined ? card.type : card.mainType;
  const groups = divideVariantsInGroups(card);
  const cardIdentifier = card.type + '-' + (card.uniqueValue ?? card.value) + '-' + card.id;
  groups.forEach((group) => {
    const hasGroupViewMode = group.variants.length > 1;
    const hasIndividualViewMode = group.variants.length <= 1;
    // TODO: go through all tags and set default tags as well
    group.variants.forEach((variant) => {
      testable.push({
        card,
        type: card.type,
        displayType: card.mainType === null || card.mainType === undefined ? card.type : card.mainType,
        variant: { ...variant, attrs: { ...card.attributes, ...variant.attrs } },
        translation: card.translation,
        caseSensitive: CardTypeConfigurationMapper[displayType]?.caseSensitive ?? false,
        initial: variant.category === 1,
        isTopLevel: !isNonNullable(variant.category),
        groupViewKey: hasGroupViewMode ? cardIdentifier + '-gr-' + group.matcherId : null,
        hasGroupViewMode,
        hasIndividualViewMode,
        testKey: cardIdentifier + '-' + (group.matcherId || '') + '#' + variant.value, // TODO: replace with variant.id,
      });
    });
  });
  return addGroupStandardFormFlag(testable);
}

const divideVariantsInGroups = (card: StandardCard) => {
  const config = CardTypeConfigurationMapper[card.type];
  const freeVariants = [...card.variants];
  const groups: { matcherId: string | null; variants: StandardCardVariant[] }[] = [];
  if (config && config.variantGroups) {
    for (const pr of config.variantGroups) {
      const matchedVariants: StandardCardVariant[] = [];
      // debugger;
      for (let i = 0; i < freeVariants.length; i++) {
        const variant = freeVariants[i];
        const variantValue: { category?: IdType | null; attrs?: StandardCardAttributes | null } = variant;
        if (!pr.matcher || isMatch(variantValue, pr.matcher)) {
          matchedVariants.push(variant);
          freeVariants.splice(i, 1);
          i--;
        }
      }
      if (matchedVariants.length && !pr.skip) groups.push({ matcherId: pr.id ?? null, variants: matchedVariants });
    }
  }
  freeVariants.forEach((variant) => {
    groups.push({ matcherId: null, variants: [variant] });
  });
  console.log('groups', groups);
  // TODO: sort groups
  return groups;
};

export const isMatch = <T extends {}>(comparisonValue: T, matcher: Matcher<T>): boolean => {
  const rule = matcher as unknown;
  if (rule === comparisonValue) return true;
  if (rule === null) {
    return comparisonValue === null || comparisonValue === undefined;
  }
  if (Array.isArray(rule)) {
    return rule.includes(comparisonValue);
  }
  if (typeof rule === 'object' && isMatcherObject(rule)) {
    const op = Object.keys(rule)[0] as '$not' | '$and' | '$or';
    if (op === '$not') return !isMatch(comparisonValue, rule[op] as never);
    if (op === '$and') return (rule[op] as Matcher<T>[]).every((m) => isMatch(comparisonValue, m));
    if (op === '$or') return (rule[op] as Matcher<T>[]).some((m) => isMatch(comparisonValue, m));
    return false;
  }
  if (typeof rule === 'object') {
    if (typeof comparisonValue !== 'object' || comparisonValue === null) return false;
    for (const key in rule) {
      if (!isMatch(comparisonValue[key as never], rule[key as never] as never)) return false;
    }
    return true;
  }
  if (Array.isArray(comparisonValue)) {
    return comparisonValue.includes(rule);
  }
  return false;
};

const isMatcherObject = (obj: unknown): obj is Matcher<any> => {
  if (typeof obj !== 'object' || obj === null) return false;
  const keys = Object.keys(obj);
  return keys.length === 1 && keys[0].startsWith('$');
};

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

function addPreviousGroups<T extends GeneralTestableCard>(allVariants: T[]): T[] {
  let lastGroupKey: string | null = null;
  let currentGroupKey: string | null = null;
  let groupLevel = 0;
  const levels = new Map<string, { prevKey: string | null; level: number }>();
  return allVariants
    .map((variant): T => {
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

function removeUnnecessaryGroups<T extends GeneralTestableCard>(allVariants: T[]): T[] {
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

export function generateTestableCards(card: StandardCard): StandardTestableCard[] {
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
