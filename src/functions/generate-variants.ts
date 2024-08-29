/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/cognitive-complexity */
import type { CardTypeConfiguration, CategoryAttrsMatcher, SortBy, VariantGroup } from '../database/card-types';
import type { StandardCard, StandardCardVariant, IdType, StandardCardAttributes } from '../database/types';
import { isMatch } from '../utils/matcher';
import { SPECIAL_VIEW_IDS } from './consts';
import type { Helper } from './generate-card-content';
import type { Preferences } from './preferences';
import type { StandardTestableCard, StandardTestableCardGroupMeta } from './reviews';
import { getIsStandardFormFn } from './standard-forms';

export function generateTestableCards(
  card: StandardCard,
  helper: Helper,
  preferences: Preferences,
): StandardTestableCard[] {
  const config = helper.getCardType(card.type, card.lang)?.configuration ?? {};

  const displayType = card.mainType === null || card.mainType === undefined ? card.type : card.mainType;
  const unsortedGroups = divideVariantsInGroups(card, config);
  const groups = sortGroups(card, config, unsortedGroups);
  const grandVariants = getNormalizedGroupVariants(card, groups);
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
    const variants = grandVariants[groupIndex];
    // debugger;
    const standardness = variants.map((variant) => isStandardForm(variant));
    const nonStandardCount = standardness.filter((x) => !x).length;
    // if ((grandVariants[groupIndex + 1]?.map((variant) => isStandardForm(variant)).filter((x) => !x).length || 0) > 0) {
    //   debugger;
    // }
    if (nonStandardCount === 0 && group.gr?.skipIfStandard) return;

    const isGroupStandard = nonStandardCount === 0 || nonStandardCount <= maxAllowedNonStandardForms;

    const hasGroupViewMode = variants.length > 1 || !!group.gr?.forcefullyGroup;
    const hasIndividualViewMode = !hasGroupViewMode;
    // TODO: go through all tags and set default tags as well
    const groupMeta: StandardTestableCardGroupMeta = {
      matcherId: group.matcherId,
      groupViewId: group.groupViewId,
      indViewId: group.indViewId,
      testViewId: group.testViewId,
      variants,
      gr: group.gr,
      groupMetaArgs: group.groupMetaArgs,
    };
    group.variants.forEach((_v, i) => {
      const isStandardForm = standardness[i];
      const variant = variants[i];
      testable.push({
        card: newCard,
        type: newCard.type,
        displayType,
        variant,
        caseSensitive: helper.getCardType(displayType, newCard.lang)?.configuration?.caseSensitive ?? false,
        initial: variant.category === 1,
        groupViewKey: hasGroupViewMode ? 'gr-' + (group.matcherId || '').toLocaleLowerCase() : null,
        hasGroupViewMode,
        hasIndividualViewMode,
        skipTest: shouldSkipTest(newCard, group.gr),
        testKey: 'ind-' + variant.id,
        groupMeta,
        groupLevel: lastGroupLevel + 1,
        previousGroupViewKey: lastGroupKey,
        isStandardForm,
        isGroupStandardForm: isGroupStandard,
        forcefullySkipIfStandard: isStandardForm
          ? isOneOfTheMatchers(variant, group.gr?.skipStandardVariantsMatchers)
          : undefined,
      });
    });
    lastGroupLevel++;
    lastGroupKey = hasGroupViewMode ? ('gr-' + (group.matcherId || '')).toLocaleLowerCase() : null;
  });

  if (preferences.testTypingTranslation) {
    const invertedTranslation = getInvertedTestableCard(newCard, displayType, testable);
    if (invertedTranslation) {
      testable.splice(invertedTranslation.index + 1, 0, invertedTranslation.testableCard);
    }
  }

  return testable;
}

const getNormalizedGroupVariants = (card: StandardCard, groups: Group[]) =>
  groups.map((group) =>
    group.variants.map(
      (variant): StandardCardVariant => ({ ...variant, attrs: { ...card.attributes, ...variant.attrs } }),
    ),
  );

const sortGroups = (card: StandardCard, config: CardTypeConfiguration, groups: Group[]) => {
  const groupPriorities = config.groupPriorities?.find(
    (e) =>
      !e.cardMatcher ||
      isMatch({ attrs: card.attributes ?? undefined, labels: card.labels ?? undefined }, e.cardMatcher),
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
  return groups;
};

const isOneOfTheMatchers = (
  variant: StandardCardVariant,
  matchers: CategoryAttrsMatcher[] | undefined | null,
): boolean | undefined => {
  if (!matchers) return undefined;
  const variantValue: { category?: IdType | null; attrs?: StandardCardAttributes | null } = variant;
  return matchers.some((matcher) => isMatch(variantValue, matcher));
};

const shouldSkipTest = (card: StandardCard, variantGroup: VariantGroup | null | undefined): boolean => {
  if (!variantGroup || typeof variantGroup.skipTest === 'undefined' || variantGroup.skipTest === null) return false;
  if (typeof variantGroup.skipTest === 'boolean') return variantGroup.skipTest;
  const is1Variant = card.variants.length === 1;
  return variantGroup.skipTest.only1variant === is1Variant;
};

const divideVariantsInGroups = (card: StandardCard, config: CardTypeConfiguration) => {
  // debugger;
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
      if (matchedVariants.length && !pr.skip) {
        groups.push({
          matcherId: pr.id ?? null,
          groupViewId: pr.groupViewId ?? null,
          indViewId: pr.indViewId ?? null,
          testViewId: pr.testViewId ?? null,
          variants: pr.sortBy ? sortVariants(pr.sortBy, matchedVariants) : matchedVariants,
          gr: pr,
          groupMetaArgs: pr.groupMetaArgs,
        });
      }
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

type Group = ReturnType<typeof divideVariantsInGroups>[0];

const sortVariants = (sortStrategy: SortBy[], variants: StandardCardVariant[]): StandardCardVariant[] => {
  const compare = (a: StandardCardVariant, b: StandardCardVariant, strategyIndex: number = 0): number => {
    if (strategyIndex >= sortStrategy.length) return 0;

    const { attrId, attrRecords } = sortStrategy[strategyIndex];
    const attrA = a.attrs?.[attrId];
    const attrB = b.attrs?.[attrId];

    const indexA = attrA ? attrRecords.indexOf(attrA) : -1;
    const indexB = attrB ? attrRecords.indexOf(attrB) : -1;

    if (indexA !== -1 && indexB !== -1) {
      if (indexA < indexB) return -1;
      if (indexA > indexB) return 1;
      return compare(a, b, strategyIndex + 1);
    }

    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return compare(a, b, strategyIndex + 1);
  };

  return variants.sort((a, b) => compare(a, b));
};

const getInvertedTestableCard = (
  card: StandardTestableCard['card'],
  displayType: number,
  testable: StandardTestableCard[],
): { testableCard: StandardTestableCard; index: number } | null => {
  const invertedVariantIndex = testable.findIndex((v) => v.variant.category === 1);
  if (invertedVariantIndex === -1) return null;
  const invertedVariant = testable[invertedVariantIndex];
  if (!invertedVariant) return null;
  return {
    testableCard: {
      card,
      type: card.type,
      displayType,
      variant: invertedVariant.variant,
      caseSensitive: false,
      initial: false,
      groupViewKey: null,
      hasGroupViewMode: false,
      hasIndividualViewMode: false,
      skipTest: false,
      testKey: 'ind-t-' + invertedVariant.variant.id,
      groupMeta: {
        matcherId: null,
        groupViewId: null,
        indViewId: null,
        testViewId: SPECIAL_VIEW_IDS.inverseTest,
        variants: [invertedVariant.variant],
        gr: null,
        groupMetaArgs: undefined,
      },
      groupLevel: invertedVariant.groupLevel,
      previousGroupViewKey: invertedVariant.previousGroupViewKey,
      isStandardForm: false,
      isGroupStandardForm: false,
      forcefullySkipIfStandard: false,
    },
    index: invertedVariantIndex,
  };
};
