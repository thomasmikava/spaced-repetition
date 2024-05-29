import { useMemo } from 'react';
import type { Helper } from '../functions/generate-card-content';

export const useWordTypeChoices = (
  lang: string | null,
  helper: Helper | null,
): { value: number; label: string }[] | null => {
  const getSupportedCardTypes = helper?.getSupportedCardTypes;
  return useMemo(
    () =>
      lang && getSupportedCardTypes ? getSupportedCardTypes(lang).map((e) => ({ value: e.id, label: e.name })) : null,
    [lang, getSupportedCardTypes],
  );
};
