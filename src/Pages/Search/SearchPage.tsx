import { useLocalStorage } from 'usehooks-ts';
import { useLangToLearnOptions, useTranslationLangOptions } from '../../hooks/langs';
import Select from '../../ui/Select';
import Input from '../../ui/Input';
import type { FC } from 'react';
import { Fragment, useState } from 'react';
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

const SearchPage: FC<{ helper: Helper }> = ({ helper }) => {
  const navigate = useNavigate();
  const [langToLearn, setLangToLearn] = useLocalStorage('lang-to-learn', null as null | string);
  const [translationLang, setTranslationLang] = useLocalStorage('translation-lang', null as null | string);

  const wordTypeChoices = useWordTypeChoices(langToLearn, helper);
  const [wordType, setWordType] = useLocalStorage<number | null>('search-word-type', null, {
    deserializer: (v) => (!v ? null : +v),
    serializer: (v) => (v === null || v === undefined ? '' : v.toString()),
  });

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
          translationLang,
          limit: 15,
          searchValue: searchQuery.trim(),
          wordType: wordType ?? undefined,
        },
  );

  const learnLangOptions = useLangToLearnOptions();
  const translationLangOptions = useTranslationLangOptions();

  if (!wordTypeChoices) return null;

  const areResultsFound = data && (data.pages.length > 0 || data.pages[0].words.length > 0);

  return (
    <div className='body' style={{ justifyContent: 'flex-start', padding: 10 }}>
      <div style={{ maxWidth: 1000 }}>
        <div style={{ textAlign: 'center', marginBottom: 20, cursor: 'pointer' }} onClick={goToMainPage}>
          <ArrowLeftOutlined style={{ cursor: 'pointer' }} /> <span>Back to home page</span>
        </div>
        <div style={{ display: 'flex', gap: 40 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <label>Main language:</label>
            <Select
              options={learnLangOptions}
              onChange={setLangToLearn}
              value={langToLearn}
              style={{ width: 300 }}
              placeholder='Select language'
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
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

        <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 5 }}>
          <Input fullWidth placeholder='search' onChange={(e) => setInput(e.target.value)} value={input} />
          <Select<number>
            options={wordTypeChoices}
            value={wordType}
            allowClear
            onChange={setWordType}
            style={{ width: 200 }}
          />
        </div>

        <div style={{ width: '100%', marginTop: 5 }}>
          {searchQuery && (
            <div>
              {status === 'pending' && <LoadingOutlined />}
              {status === 'error' && <span>Error</span>}
              {status === 'success' && data && areResultsFound && (
                <div>
                  {data.pages.map((page, index) => (
                    <Fragment key={index}>
                      {page.words.map((word) => (
                        <div key={word.id}>
                          <span style={{ marginRight: 5, opacity: 0.5 }}>
                            {helper.getCardType(word.type, word.lang)?.abbr}
                          </span>
                          <span>{word.value}</span>
                          <span style={{ margin: '0 10px' }}> - </span>
                          <span>{word.translation}</span>
                        </div>
                      ))}
                    </Fragment>
                  ))}
                  {hasNextPage && (
                    <Button onClick={() => fetchNextPage()} label='Load more words' loading={isFetchingNextPage} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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
