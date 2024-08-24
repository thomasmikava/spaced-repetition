import { useLocalStorage } from 'usehooks-ts';
import { useLangToLearnOptions, useTranslationLangOptions } from '../../hooks/langs';
import Select from '../../ui/Select';
import Input from '../../ui/Input';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useSearchWords } from '../../api/controllers/words/words.query';
import { useWordTypeChoices } from '../../hooks/cards';
import { useHelper } from '../hooks/text-helpers';
import type { Helper } from '../../functions/generate-card-content';
import LoadingOutlined from '@ant-design/icons/lib/icons/LoadingOutlined';
import Button from '../../ui/Button';
import ArrowLeftOutlined from '@ant-design/icons/lib/icons/ArrowLeftOutlined';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../routes/paths';
import LoadingPage from '../Loading/LoadingPage';
import type { TableRow } from '../../ui/Table/Table';
import Table from '../../ui/Table';
import { BookOutlined } from '@ant-design/icons';
import DictionaryModal from '../../components/DictionaryModal';
import styles from './styles.module.css';
import { TranslationLangsProvider } from '../../contexts/TranslationLangs';

const SearchPage: FC<{ helper: Helper }> = ({ helper }) => {
  const navigate = useNavigate();
  const [langToLearn, setLangToLearn] = useLocalStorage('lang-to-learn', null as null | string);
  const [translationLang, setTranslationLang] = useLocalStorage('translation-lang', null as null | string);

  const wordTypeChoices = useWordTypeChoices(langToLearn, helper);

  const goToMainPage = () => {
    navigate(paths.app.main());
  };

  const [input, setInput] = useState('');

  const [searchQuery] = useDebounce(input, 300);

  const { data, status, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchWords(
    !langToLearn || !translationLang
      ? undefined
      : {
          lang: langToLearn,
          translationLangs: [translationLang],
          limit: 15,
          searchValue: searchQuery.trim(),
        },
  );

  const learnLangOptions = useLangToLearnOptions();
  const translationLangOptions = useTranslationLangOptions();

  const [displayedWordId, setDisplayedWordId] = useState<number | null>(null);

  const areResultsFound = data && (data.pages.length > 0 || data.pages[0].words.length > 0);

  const rows = useMemo(() => {
    if (status === 'error' || !data || !areResultsFound) return null;
    return data.pages
      .map((e) => e.words)
      .flat(1)
      .map((word): TableRow => {
        const key = word.id;
        return {
          key,
          cells: [
            {
              cellValue: helper.getCardType(word.mainType ?? word.type, word.lang)?.abbr,
              style: { opacity: 0.5, paddingRight: 5 },
            },
            word.value,
            word.translations[0]?.translation ?? '',
            {
              cellValue: <Button label={<BookOutlined />} variant='text' onClick={() => setDisplayedWordId(word.id)} />,
              style: { width: '46px' },
            },
          ],
        };
      });
  }, [areResultsFound, data, helper, status]);

  return (
    <div className='body' style={{ justifyContent: 'flex-start', padding: 10 }}>
      <TranslationLangsProvider translationLangs={translationLang}>
        <div style={{ maxWidth: 1000 }}>
          <div style={{ textAlign: 'center', marginBottom: 20, cursor: 'pointer' }} onClick={goToMainPage}>
            <ArrowLeftOutlined style={{ cursor: 'pointer' }} /> <span>Back to home page</span>
          </div>
          <div className={styles.searchOptionsHeader}>
            <div className={styles.langSelectContainer}>
              <label>Main language:</label>
              <Select
                options={learnLangOptions}
                onChange={setLangToLearn}
                value={langToLearn}
                style={{ width: 300 }}
                placeholder='Select language'
              />
            </div>
            <div className={styles.langSelectContainer}>
              <label>Translation language:</label>
              <Select
                options={translationLangOptions}
                onChange={setTranslationLang}
                value={translationLang}
                style={{ width: 300 }}
                placeholder='Select language'
              />
            </div>
          </div>

          {wordTypeChoices && (
            <>
              <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 5 }}>
                <Input fullWidth placeholder='Type word' onChange={(e) => setInput(e.target.value)} value={input} />
              </div>

              <div style={{ width: '100%', marginTop: 5 }}>
                {searchQuery && (
                  <div>
                    {status === 'pending' && <LoadingOutlined />}
                    {status === 'error' && <span>Error</span>}
                    {rows && (
                      <div>
                        {rows && <Table rows={rows} removeEmptyColumns fullWidth />}
                        {hasNextPage && (
                          <Button
                            onClick={() => fetchNextPage()}
                            label='Load more words'
                            loading={isFetchingNextPage}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {displayedWordId && !!translationLang && (
            <DictionaryModal
              wordId={displayedWordId}
              helper={helper}
              onClose={() => setDisplayedWordId(null)}
              translationLangs={[translationLang]}
            />
          )}
        </div>
      </TranslationLangsProvider>
    </div>
  );
};

const SearchPageLoader = () => {
  const helper = useHelper();

  if (!helper) {
    return <LoadingPage />;
  }

  return <SearchPage helper={helper} />;
};

export default SearchPageLoader;
