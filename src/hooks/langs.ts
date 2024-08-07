import { useMemo } from 'react';

interface Option<T> {
  value: T;
  label: string;
}

export const useLangToLearnOptions = () => {
  return useMemo(
    (): Option<string>[] => [
      { value: 'en', label: 'English' },
      { value: 'ka', label: 'Georgian' },
      { value: 'de', label: 'German' },
      { value: 'fr', label: 'French' },
    ],
    [],
  );
};

export const useTranslationLangOptions = () => {
  return useMemo(
    (): Option<string>[] => [
      { value: 'en', label: 'English' },
      { value: 'ka', label: 'Georgian' },
      { value: 'de', label: 'German' },
      { value: 'fr', label: 'French' },
      { value: 'ru', label: 'Russian' },
    ],
    [],
  );
};
