import type { FC, ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';
import { useTranslationLang } from '../Pages/hooks/useTranslationLang';

interface TranslationLangsData {
  options: string[];
  value: string | null;
  onChange: (lang: string) => void;
}
const TranslationLangsContext = createContext<TranslationLangsData | undefined>(undefined);

interface TranslationLangsProviderProps {
  translationLangs: string | string[] | null | undefined;
}

export const TranslationLangsProvider: FC<TranslationLangsProviderProps & { children: ReactNode | ReactNode[] }> = ({
  translationLangs,
  children,
}) => {
  const { handleTransLangChange, translationLang, options } = useTranslationLang(translationLangs);

  const data = useMemo((): TranslationLangsData => {
    return { options: options || [], value: translationLang, onChange: handleTransLangChange };
  }, [handleTransLangChange, options, translationLang]);

  return <TranslationLangsContext.Provider value={data}>{children}</TranslationLangsContext.Provider>;
};

export const useTranslationLangSettings = (): TranslationLangsData => {
  const context = useContext(TranslationLangsContext);
  if (!context) throw new Error('useTranslationLangs must be used within a TranslationLangsProvider');
  return context;
};
