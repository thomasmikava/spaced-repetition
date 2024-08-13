import type { StandardCard, StandardCardVariant } from '../../database/types';
import { getGermanStandardFormFn } from './de';
import { getFrenchStandardFormFn } from './fr';

export const getIsStandardFormFn = (
  card: StandardCard,
  allCardVariants: StandardCardVariant[],
): ((variant: StandardCardVariant) => boolean) => {
  if (card.lang === 'de') return getGermanStandardFormFn(card, allCardVariants);
  if (card.lang === 'fr') return getFrenchStandardFormFn(card, allCardVariants);
  return () => false;
};
