import type { StandardCard, StandardCardVariant } from '../../database/types';
import { getGermanStandardFormFn } from './de';

export const getIsStandardFormFn = (
  card: StandardCard,
  allCardVariants: StandardCardVariant[],
): ((variant: StandardCardVariant) => boolean) => {
  if (card.lang === 'de') return getGermanStandardFormFn(card, allCardVariants);
  return () => false;
};
