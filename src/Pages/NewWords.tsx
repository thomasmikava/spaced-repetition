import type { FC } from 'react';
import { useMemo, useRef, useState } from 'react';
import Select from '../ui/Select';
import { uniquelize } from '../utils/array';
import { PreviousReviews } from '../functions/previous-reviews';
import { calculateHalfLifeCoefficient } from '../functions/reviews';
import Button from '../ui/Button';
import { useHelper } from './hooks/text-helpers';
import type { Helper } from '../functions/generate-card-content';
import { useMyMainCourses } from '../api/controllers/courses/courses.query';
import { useLocalStorage } from 'usehooks-ts';
import { useLangToLearnOptions } from '../hooks/langs';
import { useDictionary, useWordIds } from '../api/controllers/words/words.query';
import type {
  BaseWordVariantDTO,
  GetLanguageDictionaryResDTO,
  GetWordIdsResDTO,
  WordDTO,
} from '../api/controllers/words/words.schema';
import { CardTypeMapper } from '../database/card-types';
import LoadingPage from './Loading/LoadingPage';

const NewWordsPage: FC<{ helper: Helper }> = () => {
  const [langToLearn, setLangToLearn] = useLocalStorage('lang-to-learn', null as null | string);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [results, setResults] = useState<ReturnType<typeof getTokens>>();

  const { data: mainCourses, isLoading: isLoadingCourses } = useMyMainCourses();
  const { data: wordsInfo, isLoading: isLoadingWordIds } = useWordIds({});

  const { data: dictionary, isLoading: isDictionaryLoading, isError: isDictionaryError } = useDictionary(langToLearn);

  const indexedDictionary = useMemo(() => dictionary && getIndexedDictionary(dictionary), [dictionary]);

  const learnLangOptions = useLangToLearnOptions();

  const courseOptions = useMemo(
    () =>
      !langToLearn || !mainCourses
        ? []
        : mainCourses
            .filter((e) => e.langToLearn === langToLearn)
            .map((course) => ({ value: '' + course.id, label: course.title }))
            .concat([
              { value: 'existing', label: 'Words that I started' },
              { value: 'well-known', label: 'Words that I know well' },
            ]),
    [langToLearn, mainCourses],
  );
  const [currentCourse, setCurrentCourse] = useState('');

  const calculate = () => {
    if (!textAreaRef.current || !wordsInfo || !indexedDictionary) return;

    const courseId = currentCourse ? +currentCourse : '';
    const existingWordIds =
      currentCourse === 'existing'
        ? getMyReviewedWordIds(false)
        : currentCourse === 'well-known'
          ? getMyReviewedWordIds(true)
          : courseId
            ? getCourseWordIds(courseId, wordsInfo)
            : [];
    const value = textAreaRef.current.value;
    console.log('existingTokens', existingWordIds);
    const tokens = getTokens(value, existingWordIds, indexedDictionary);
    console.log('tokens', tokens);
    setResults(tokens);
  };
  const copyResults = () => {
    if (!results) return;
    const text = JSON.stringify(results.knownTokens.map((result) => ({ id: result.word.id, word: result.word })));
    navigator.clipboard.writeText(text);
  };

  if (isLoadingWordIds || isLoadingCourses) return <LoadingPage />;
  if (!mainCourses || !wordsInfo) return <div>No courses</div>;

  return (
    <div className='body'>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <label>language:</label>
        <Select
          options={learnLangOptions}
          onChange={setLangToLearn}
          value={langToLearn}
          style={{ width: 300 }}
          placeholder='Select language'
        />
      </div>
      <textarea ref={textAreaRef} style={{ width: 600, height: 300, maxWidth: '100%' }} />
      <br />
      <Select
        style={{ width: 400 }}
        options={courseOptions}
        value={currentCourse || null}
        allowClear
        onChange={(x) => setCurrentCourse(x || '')}
        placeholder='Choose course'
      />
      <br />
      {isDictionaryError && (
        <div style={{ color: 'red' }}>
          Error loading dictionary
          <br />
        </div>
      )}
      <Button label='Calculate' loading={isDictionaryLoading} onClick={calculate} variant='primary' />
      {results && (
        <div>
          {results.unknownWords.length > 0 && (
            <div>
              <h2>Unknown words ({results.unknownWords.length})</h2>
              <ul>
                {results.unknownWords.map((result, index) => (
                  <li key={index}>{result}</li>
                ))}
              </ul>
            </div>
          )}
          {results.knownTokens.length > 0 && (
            <div>
              <h2>New words that are in dictionary ({results.knownTokens.length})</h2>
              <ul>
                {results.knownTokens.map((result, index) => (
                  <li key={index}>
                    {result.originalToken}
                    {result.word.value !== result.originalToken ? ` (${result.word.value})` : ''}
                  </li>
                ))}
              </ul>
              <button style={{ fontSize: 20 }} onClick={copyResults}>
                Copy
              </button>
            </div>
          )}
        </div>
      )}
      <br />
      <br />
    </div>
  );
};

const getCourseWordIds = (courseId: number, wordsInfo: GetWordIdsResDTO): number[] => {
  const course = wordsInfo.find((course) => course.courseId === courseId);
  if (!course) return [];
  return course.lessons.map((e) => e.words.map((w) => w.id)).flat();
};

type IndexedDatabase = {
  wordMap: Map<string, { id: number; variantId: number; word: WordDTO; variant: BaseWordVariantDTO }[]>;
  wordsByIds: Map<number, WordDTO>;
  wordsAllValues: Map<number, string[]>;
};

const getIndexedDictionary = (dictionary: GetLanguageDictionaryResDTO): IndexedDatabase => {
  const wordMap: IndexedDatabase['wordMap'] = new Map();
  const wordsByIds: IndexedDatabase['wordsByIds'] = new Map();
  const wordsAllValues: IndexedDatabase['wordsAllValues'] = new Map();
  for (const word of dictionary) {
    const variants = word.variants || [];
    wordsByIds.set(word.id, word);
    if (!wordsAllValues.has(word.id)) wordsAllValues.set(word.id, []);
    for (const variant of variants) {
      const key = variant.value;
      if (!wordMap.has(key)) wordMap.set(key, []);
      wordMap.get(key)!.push({ id: word.id, variantId: variant.id, word, variant });
      wordsAllValues.get(word.id)!.push(variant.value);
    }
  }
  return { wordMap, wordsByIds, wordsAllValues };
};

const getMyReviewedWordIds = (wellKnown: boolean): number[] => {
  const histRecords = new PreviousReviews().getHistoryRecords();

  const wordIds = new Set<number>();
  const wellKnownCoefficient = calculateHalfLifeCoefficient(60 * 60 * 24);

  for (const histRecord of histRecords) {
    if (typeof histRecord.lastS !== 'number') continue;
    if (wellKnown && histRecord.lastS < wellKnownCoefficient) continue;
    wordIds.add(histRecord.wordId);
  }

  return [...wordIds];
};

const ignoredWords: string[] = ["geht's", "gibt's", 'Neues', 'los', 'Hause', 'am'];

const getTokens = (value: string, existingWordIds: number[], database: IndexedDatabase) => {
  const lines = value.split(/[\n+.?!]/);
  const unknownTokens: string[] = [];
  const matchedKnownWordIds: { word: WordDTO; originalToken: string }[] = [];
  const usedWordTokens = new Set<string>(existingWordIds.map((id) => database.wordsAllValues.get(id) || []).flat());
  for (const line of lines) {
    let tokens = line
      .split(' ')
      .map((token) => token.replace(/[.,?!:"()]/g, ''))
      .filter((e) => e.length > 0 && e.match(/[a-zA-ZäöüÄÖÜß]/) && ignoredWords.indexOf(e) === -1);
    const firstToken = tokens[0];
    const isFirstTokenNoun = firstToken
      ? getAllMatchingVariants(firstToken, database).some(
          (e) => (e.word.mainType ?? e.word.type) === CardTypeMapper.NOUN,
        )
      : false;
    if (tokens.length > 0 && !isFirstTokenNoun && isInDatabase(tokens[0].toLocaleLowerCase(), database)) {
      tokens[0] = tokens[0].toLocaleLowerCase();
    }
    tokens = uniquelize(tokens.filter((token) => !usedWordTokens.has(token)));
    // debugger;
    unknownTokens.push(...tokens.filter((e) => !isInDatabase(e, database)));
    const matchedKnown = tokens
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
      .filter(<T extends unknown>(e: T): e is NonNullable<T> => !!e)
      .map((token) => ({ token, matches: getAllMatchingVariants(token, database) }))
      .filter(
        (e) =>
          e.matches.length > 0 &&
          e.matches.every(
            (x) =>
              !usedWordTokens.has(x.variant.value) &&
              x.word.type !== CardTypeMapper.ARTICLE &&
              x.word.type !== CardTypeMapper.NUMBER &&
              x.word.type !== CardTypeMapper.PRONOUN,
          ),
      );
    matchedKnownWordIds.push(
      ...matchedKnown.map((x) => {
        const bestVariant = x.matches.sort((a, b) => {
          if (typeof a.variant.categoryId === 'number' && typeof b.variant.categoryId === 'number') {
            return a.variant.categoryId - b.variant.categoryId;
          }
          if (typeof a.variant.categoryId === 'number') return -1;
          if (typeof b.variant.categoryId === 'number') return 1;
          return a.word.id - b.word.id;
        })[0];
        return { word: bestVariant.word, originalToken: x.token };
      }),
    );
    tokens.forEach((token) => usedWordTokens.add(token));
  }
  return { unknownWords: uniquelize(unknownTokens), knownTokens: uniquelize(matchedKnownWordIds, (e) => e.word.id) };
};

function getAllMatchingVariants(token: string, database: IndexedDatabase) {
  return database.wordMap.get(token) || [];
}

function isInDatabase(token: string, database: IndexedDatabase) {
  return getAllMatchingVariants(token, database).length > 0;
}

const NewWordsPageLoader = () => {
  const helper = useHelper();
  if (!helper) return null;
  return <NewWordsPage helper={helper} />;
};

export default NewWordsPageLoader;
