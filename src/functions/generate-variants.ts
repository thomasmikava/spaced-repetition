/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/cognitive-complexity */
import type { VariantGroup } from '../database/card-types';
import { CardTypeConfigurationMapper } from '../database/card-types';
import type { StandardCard, StandardCardVariant, IdType, StandardCardAttributes } from '../database/types';
import { groupArray, sortArrayByOriginalArray } from '../utils/array';
import { isMatch } from '../utils/matcher';
import type { GeneralTestableCard, StandardTestableCard, StandardTestableCardGroupMeta } from './reviews';
import { getIsStandardFormFn } from './standard-forms';

function _generateTestableCards(card: StandardCard): StandardTestableCard[] {
  const config = CardTypeConfigurationMapper[card.type];

  const displayType = card.mainType === null || card.mainType === undefined ? card.type : card.mainType;
  const groups = divideVariantsInGroups(card);

  if (config.groupPriorities) {
    const groupPriorities = config.groupPriorities.find(
      (e) => !e.cardMatcher || isMatch({ attrs: card.attributes || {} }, e.cardMatcher),
    );
    if (groupPriorities) {
      groups.sort((a, b) => {
        const aIndex = groupPriorities.groupIds.indexOf(a.matcherId ?? '');
        const bIndex = groupPriorities.groupIds.indexOf(b.matcherId ?? '');
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }
  }

  const grandVariants = groups.map((group) =>
    group.variants.map(
      (variant): StandardCardVariant => ({ ...variant, attrs: { ...card.attributes, ...variant.attrs } }),
    ),
  );
  const allStandardizedVariants = grandVariants.flat(1);

  if (config && typeof config.maxNumOfGroups === 'number') {
    groups.splice(config.maxNumOfGroups);
  }

  const maxAllowedNonStandardForms = config.maxAllowedNonStandardForms ?? 0;

  const newCard = { ...card, allStandardizedVariants };

  const testable: StandardTestableCard[] = [];
  let lastGroupLevel = -1;
  let lastGroupKey: string | undefined | null = undefined;
  const isStandardForm = getIsStandardFormFn(card, allStandardizedVariants);
  groups.forEach((group, groupIndex) => {
    const hasGroupViewMode = group.variants.length > 1 || !!group.gr?.forcefullyGroup;
    const hasIndividualViewMode = !hasGroupViewMode;
    // TODO: go through all tags and set default tags as well
    const variants = grandVariants[groupIndex];
    const groupMeta: StandardTestableCardGroupMeta = {
      matcherId: group.matcherId,
      groupViewId: group.groupViewId,
      indViewId: group.indViewId,
      testViewId: group.testViewId,
      variants,
      gr: group.gr,
    };
    const standardness = group.variants.map((variant) => isStandardForm(variant));
    const nonStandardCount = standardness.filter((x) => !x).length;
    const isGroupStandard =
      nonStandardCount === 0 ? true : nonStandardCount <= maxAllowedNonStandardForms ? undefined : false;
    group.variants.forEach((variant, i) => {
      testable.push({
        card: newCard,
        type: card.type,
        displayType: card.mainType === null || card.mainType === undefined ? card.type : card.mainType,
        variant: variants[i],
        caseSensitive: CardTypeConfigurationMapper[displayType]?.caseSensitive ?? false,
        initial: variant.category === 1,
        groupViewKey: hasGroupViewMode ? 'gr-' + (group.matcherId || '') : null,
        hasGroupViewMode,
        hasIndividualViewMode,
        skipTest: shouldSkipTest(card, group.gr),
        testKey: 'ind-' + variant.id,
        groupMeta,
        groupLevel: lastGroupLevel + 1,
        previousGroupViewKey: lastGroupKey,
        isStandardForm: standardness[i],
        isGroupStandardForm: isGroupStandard,
      });
    });
    lastGroupLevel++;
    lastGroupKey = hasGroupViewMode ? 'gr-' + (group.matcherId || '') : null;
  });
  return addGroupStandardFormFlag(testable);
}

const shouldSkipTest = (card: StandardCard, variantGroup: VariantGroup | null | undefined): boolean => {
  if (!variantGroup || typeof variantGroup.skipTest === 'undefined' || variantGroup.skipTest === null) return false;
  if (typeof variantGroup.skipTest === 'boolean') return true;
  const is1Variant = card.variants.length === 1;
  return variantGroup.skipTest.only1variant === is1Variant;
};

const divideVariantsInGroups = (card: StandardCard) => {
  // debugger;
  const config = CardTypeConfigurationMapper[card.type];
  const freeVariants = [...card.variants];
  const groups: (StandardTestableCardGroupMeta & { variants: StandardCardVariant[] })[] = [];
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
      if (matchedVariants.length && !pr.skip)
        groups.push({
          matcherId: pr.id ?? null,
          groupViewId: pr.groupViewId ?? null,
          indViewId: pr.indViewId ?? null,
          testViewId: pr.testViewId ?? null,
          variants: matchedVariants,
          gr: pr,
        });
    }
  }
  freeVariants.forEach((variant) => {
    groups.push({
      matcherId: null,
      groupViewId: null,
      indViewId: null,
      testViewId: null,
      variants: [variant],
      gr: null,
    });
  });
  return groups;
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
  return removeUnnecessaryGroups(lowercaseKeys(_generateTestableCards(card)));
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
