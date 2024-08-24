import { useLayoutEffect, useMemo, useState } from 'react';

export const ALL_LANGS = 'all';

export const useTranslationLang = (availableTranslationLangs: null | undefined | string | string[]) => {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  const normalizedLangs = useMemo(
    () => (Array.isArray(availableTranslationLangs) ? availableTranslationLangs.join(',') : availableTranslationLangs),
    [availableTranslationLangs],
  );

  const options = useMemo(() => {
    if (!normalizedLangs) return null;
    return normalizedLangs.split(',');
  }, [normalizedLangs]);

  useLayoutEffect(() => {
    if (!normalizedLangs) return;
    const langs = normalizedLangs.split(',');
    const nextLang = getOptimalLang(langs);
    setSelectedLang(nextLang);
  }, [normalizedLangs]);

  const handleTransLangChange = (lang: string) => {
    pushToHistoryLangs(lang);
    setSelectedLang(lang);
  };

  return {
    translationLang: selectedLang,
    handleTransLangChange,
    shouldShowTranslationLangs: !!normalizedLangs && normalizedLangs.split(',').length > 1,
    options,
  };
};

export const sortByLangs = <T extends { lang: string }>(objects: T[], langs: string | string[]) => {
  const langsArray = typeof langs === 'string' ? langs.split(',') : langs;
  return objects
    .filter((obj) => langsArray.includes(obj.lang))
    .sort((a, b) => langsArray.indexOf(a.lang) - langsArray.indexOf(b.lang));
};

const MAX_HISTORY_LANGS = 7;
const storageKey = 'historyLangs';

const getLastNElements = (langs: string[], n: number) => {
  return langs.slice(langs.length - n);
};

const getInitialHistoryLangs = () => {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return [];
  return getLastNElements(
    stored.split(',').filter((e) => !!e && (e.length === 2 || e === ALL_LANGS)),
    MAX_HISTORY_LANGS,
  );
};

const GLOBAL_HISTORY_LANGS = getInitialHistoryLangs();

const pushToHistoryLangs = (lang: string) => {
  if (GLOBAL_HISTORY_LANGS[GLOBAL_HISTORY_LANGS.length - 1] === lang) return;
  const index = GLOBAL_HISTORY_LANGS.indexOf(lang);
  if (index !== -1) GLOBAL_HISTORY_LANGS.splice(index, 1);
  GLOBAL_HISTORY_LANGS.push(lang);
  if (GLOBAL_HISTORY_LANGS.length > MAX_HISTORY_LANGS) {
    GLOBAL_HISTORY_LANGS.splice(0, GLOBAL_HISTORY_LANGS.length - MAX_HISTORY_LANGS);
  }
  localStorage.setItem(storageKey, GLOBAL_HISTORY_LANGS.join(','));
};

const getOptimalLang = (availableLangs: string[]) => {
  for (let i = GLOBAL_HISTORY_LANGS.length - 1; i >= 0; i--) {
    const lang = GLOBAL_HISTORY_LANGS[i];
    if (availableLangs.includes(lang) || lang === ALL_LANGS) return lang;
  }
  return availableLangs[0] ?? ALL_LANGS;
};
