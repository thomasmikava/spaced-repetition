/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/cognitive-complexity */
import {
  INIT_GROUP_ID,
  type CardTypeConfiguration,
  type CategoryAttrsMatcher,
  type SortBy,
  type VariantGroup,
} from '../database/card-types';
import type { IdType, StandardCard, StandardCardAttributes, StandardCardVariant } from '../database/types';
import { isNonNullable } from '../utils/array';
import { isMatch } from '../utils/matcher';
import { SPECIAL_VIEW_IDS } from './consts';
import type { Helper } from './generate-card-content';
import { getVariantTestId, shouldSkipTesting, type CardModifiersAccumulator } from './modifier-states';
import type { Preferences } from './preferences';
import type { ReviewBlockManager } from './review-block';
import type { StandardTestableCard, StandardTestableCardGroupMeta } from './reviews';
import { getIsStandardFormFn } from './standard-forms';

export function generateTestableCards(
  card: StandardCard,
  helper: Helper,
  preferences: Preferences,
  cardModifiers: CardModifiersAccumulator | undefined,
  blockManager: ReviewBlockManager,
): StandardTestableCard[] {
  if (shouldSkipTesting(cardModifiers?.fullCard)) return [];
  const config = helper.getCardType(card.type, card.lang)?.configuration ?? {};

  const displayType = card.mainType === null || card.mainType === undefined ? card.type : card.mainType;
  const unsortedGroups = divideVariantsInGroups(card, config);
  const cardTypePreferences = preferences.cardTypeSettings[card.type];
  const userSortLogic = cardTypePreferences.groupOrder;
  const groups = sortGroups(card, config, unsortedGroups, userSortLogic);
  const grandVariants = getNormalizedGroupVariants(card, groups);
  const allStandardizedVariants = grandVariants.flat(1);

  if (config && typeof config.maxNumOfGroups === 'number') {
    groups.splice(config.maxNumOfGroups);
  }

  const maxAllowedNonStandardForms = config.maxAllowedNonStandardForms ?? 0;

  const newCard = { ...card, allStandardizedVariants };

  const couldBeAddedByUser =
    card.variants.length === 1 &&
    !isNonNullable(card.variants[0].category) &&
    (!isNonNullable(card.variants[0].attrs) || Object.keys(card.variants[0].attrs).length === 0);

  const testable: StandardTestableCard[] = [];
  let lastGroupLevel = -1;
  let lastGroupKey: string | undefined | null = undefined;
  const isStandardForm = getIsStandardFormFn(card, allStandardizedVariants);
  groups.forEach((group, groupIndex) => {
    const groupPreferences = cardTypePreferences.groupSettings[group.matcherId ?? '__default'];
    if (group.matcherId && shouldSkipTesting(cardModifiers?.groups?.[group.matcherId])) return;
    if (groupPreferences.hideGroup) return;
    const variants = grandVariants[groupIndex];
    // debugger;
    const standardness = variants.map((variant) => isStandardForm(variant));
    const nonStandardCount = standardness.filter((x) => !x).length;
    // if ((grandVariants[groupIndex + 1]?.map((variant) => isStandardForm(variant)).filter((x) => !x).length || 0) > 0) {
    //   debugger;
    // }
    if (nonStandardCount === 0 && group.gr?.skipIfStandard) return;

    const isGroupStandard = nonStandardCount === 0 || nonStandardCount <= maxAllowedNonStandardForms;

    const hasGroupViewMode =
      (variants.length > 1 || !!group.gr?.forcefullyGroup) && !blockManager.isGroupViewDisabled();
    const hasIndividualViewMode = !hasGroupViewMode && !blockManager.isIndividualViewDisabled();
    const shouldSkipIfNotInitial = !groupPreferences.askNonStandardVariants || groupPreferences.hideGroup;
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
      const standardTestableCard: Omit<StandardTestableCard, 'testKey'> = {
        card: newCard,
        type: newCard.type,
        displayType,
        variant,
        caseSensitive: helper.getCardType(displayType, newCard.lang)?.configuration?.caseSensitive ?? false,
        initial: variant.category === 1 || couldBeAddedByUser,
        groupViewKey: hasGroupViewMode ? 'gr-' + (group.matcherId || '').toLocaleLowerCase() : null,
        hasGroupViewMode,
        hasIndividualViewMode,
        skipTest: shouldSkipTest(newCard, group.gr) || (shouldSkipIfNotInitial && variant.category !== 1),
        groupMeta,
        groupLevel: lastGroupLevel + 1,
        previousGroupViewKey: lastGroupKey,
        isStandardForm,
        isGroupStandardForm: isGroupStandard,
        forcefullySkipIfStandard: isStandardForm
          ? isOneOfTheMatchers(variant, group.gr?.skipStandardVariantsMatchers)
          : undefined,
      };
      const canBeInverted = preferences.testTypingTranslation && standardTestableCard.initial;
      const regeneratedTestableCards = blockManager.regenerateTestableCards({
        testableCard: standardTestableCard,
        translations: card.translations,
        includeReverseCards: canBeInverted,
        getInvertedTestableCard,
      });
      testable.push(...regeneratedTestableCards);
    });
    lastGroupLevel++;
    lastGroupKey = hasGroupViewMode ? ('gr-' + (group.matcherId || '')).toLocaleLowerCase() : null;
  });

  if (cardModifiers?.variants) {
    return testable.filter(
      (t) => !shouldSkipTesting(cardModifiers?.variants[getVariantTestId(t.variant.id, t.groupMeta.testViewId)]),
    );
  }

  normalizeConnectedTestKeys(testable, blockManager.getBlock());

  return testable;
}

const getNormalizedGroupVariants = (card: StandardCard, groups: Group[]) =>
  groups.map((group) =>
    group.variants.map(
      (variant): StandardCardVariant => ({ ...variant, attrs: { ...card.attributes, ...variant.attrs } }),
    ),
  );

const sortGroups = (
  card: StandardCard,
  config: CardTypeConfiguration,
  groups: Group[],
  userSortLogic: string[] | undefined,
) => {
  const groupPriorities = config.groupPriorities?.find(
    (e) =>
      !e.cardMatcher ||
      isMatch({ attrs: card.attributes ?? undefined, labels: card.labels ?? undefined }, e.cardMatcher),
  );
  const groupIds = (userSortLogic ? [INIT_GROUP_ID, ...userSortLogic] : null) ?? groupPriorities?.groupIds ?? [];
  if (groupIds) {
    groups.sort((a, b) => {
      const aIndex = groupIds.indexOf(a.matcherId ?? '');
      const bIndex = groupIds.indexOf(b.matcherId ?? '');
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

const getInvertedTestableCard = (testableCard: StandardTestableCard, invertedTestKey: string): StandardTestableCard => {
  const invertedVariantTestKey = invertedTestKey;
  return {
    ...testableCard,
    caseSensitive: false,
    initial: false,
    groupViewKey: null,
    hasGroupViewMode: false,
    hasIndividualViewMode: false,
    skipTest: false,
    testKey: invertedVariantTestKey,
    groupMeta: {
      matcherId: null,
      groupViewId: null,
      indViewId: null,
      testViewId: SPECIAL_VIEW_IDS.inverseTest,
      variants: [testableCard.variant],
      gr: null,
      groupMetaArgs: undefined,
    },
    isStandardForm: false,
    isGroupStandardForm: false,
    forcefullySkipIfStandard: false,
  };
};

const normalizeConnectedTestKeys = (testable: StandardTestableCard[], block: number) => {
  for (const testableCard of testable) {
    if (testableCard.connectedTestKeys) {
      const array = testableCard.connectedTestKeys.filter(
        (each) => each.key !== testableCard.testKey || each.block !== block,
      );
      if (array.length === 0) {
        delete testableCard.connectedTestKeys;
      } else {
        testableCard.connectedTestKeys = array;
      }
    }
  }
};
