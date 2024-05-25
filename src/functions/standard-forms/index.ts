import type { StandardCard, StandardCardVariant } from '../../database/types';
import { isGermanStandardForm } from './de';

export const isStandardForm = (
  variant: StandardCardVariant,
  card: StandardCard,
  allCardVariants: StandardCardVariant[],
): boolean => {
  if (variant.category === 1) return false; // initial card is never standard form so that we don't skip it
  if (card.lang === 'de') return isGermanStandardForm(variant, card, allCardVariants);
  return false;
};
