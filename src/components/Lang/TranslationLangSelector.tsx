import type { FC } from 'react';
import { ALL_LANGS } from '../../Pages/hooks/useTranslationLang';
import styles from './styles.module.css';
import { useTranslationLangSettings } from '../../contexts/TranslationLangs';

interface Props {
  options: string | string[];
  value: string | null;
  onChange: (lang: string) => void;
  style?: React.CSSProperties;
}

export const TranslationLangSelector: FC<Props> = ({ options, value, onChange, style }) => {
  const allLangs = typeof options === 'string' ? options.split(',') : options;
  if (allLangs.length <= 1) return null;

  return (
    <div className={styles.container} style={style}>
      <span className={styles.legend}>translations:</span>
      <div className={styles.langContainer}>
        <button
          className={styles.allOption + ' ' + (ALL_LANGS === value ? styles.selected : '')}
          onClick={() => onChange(ALL_LANGS)}
        >
          all
        </button>
        {allLangs.map((lang) => (
          <button
            key={lang}
            onClick={() => onChange(lang)}
            className={styles.langSelector + ' ' + (lang === value ? styles.selected : '')}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};

export const TranslationLangSelectorConnected = ({ style }: { style?: React.CSSProperties }) => {
  const { value, options, onChange } = useTranslationLangSettings();
  if (value === null) return null;
  return <TranslationLangSelector value={value} options={options} onChange={onChange} style={style} />;
};
