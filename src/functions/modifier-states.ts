import { SecondOption, type ModifierState } from '../Pages/Review/StateModifier';
import { arrayToObject } from '../utils/array';
import { SPECIAL_VIEW_IDS } from './consts';
import type { AnyReviewHistory } from './reviews';

type V = { value: number };

export type CardModifiersAccumulator = {
  fullCard?: V;
  variants: Record<string, V>;
  groups: Record<string, V>;
};

type CardModifiersAccumulatorRecord = Record<number, CardModifiersAccumulator | undefined>;

export const calculateModifiers = (cardIds: number[], historyRecords: AnyReviewHistory[]) => {
  const historyByCardIds = arrayToObject(historyRecords, 'wordId', true);
  const cardModifiers: CardModifiersAccumulatorRecord = {};
  for (const cardId of cardIds) {
    const reviews = historyByCardIds[cardId];
    if (!reviews) continue;
    const accumulator: CardModifiersAccumulator = {
      fullCard: undefined,
      variants: {},
      groups: {},
    };
    let wasUpdated = false;
    for (const review of reviews) {
      const decoded = decodeModifierKey(review.sKey);
      if (!decoded) continue;
      wasUpdated = true;
      if (decoded.type === 'card') accumulator.fullCard = { value: review.corr };
      else if (decoded.type === 'variant') accumulator.variants[decoded.variantTestId] = { value: review.corr };
      else accumulator.groups[decoded.groupId] = { value: review.corr };
    }
    if (wasUpdated) {
      cardModifiers[cardId] = accumulator;
    }
  }
  return cardModifiers;
};

export const convertToCardModifiers = (modifierStates: ModifierState[]): CardModifiersAccumulator => {
  const accumulator: CardModifiersAccumulator = {
    fullCard: undefined,
    variants: {},
    groups: {},
  };
  for (const state of modifierStates) {
    if (state.type === 'card') accumulator.fullCard = { value: state.value };
    else if (state.type === 'variant')
      accumulator.variants[getVariantTestId(state.variantId, state.testViewId)] = { value: state.value };
    else accumulator.groups[state.groupId] = { value: state.value };
  }
  return accumulator;
};

export const shouldSkipTesting = (value?: V) => {
  if (!value) return false;
  if ((value.value & SecondOption.IGNORE) === SecondOption.IGNORE) return true;
  return (value.value & SecondOption.I_KNOW) === SecondOption.I_KNOW;
};

export const getVariantTestId = (variantId: number, testViewId: string | null) =>
  `${testViewId === SPECIAL_VIEW_IDS.inverseTest ? 't-' : ''}${variantId}`;

const decodeModifierKey = (sKey: string) => {
  if (!sKey.startsWith('m@')) return null;
  if (sKey === 'm@f') return { type: 'card' } satisfies { type: ModifierState['type'] };

  const groupRegex = /^m@g_(.+?)$/;
  const groupMatch = sKey.match(groupRegex);
  if (groupMatch) {
    return { type: 'group', groupId: groupMatch[1] } satisfies { type: ModifierState['type']; groupId: string };
  }

  const variantRegex = /^m@v_(.+?)$/;
  const variantMatch = sKey.match(variantRegex);
  if (variantMatch) {
    return { type: 'variant', variantTestId: variantMatch[1] } satisfies {
      type: ModifierState['type'];
      variantTestId: string;
    };
  }
};
