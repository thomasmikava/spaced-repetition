import type { FC } from 'react';
import { useMemo, useRef, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { useMyMainCourses } from '../api/controllers/courses/courses.query';
import { wordController } from '../api/controllers/words/words.controller';
import { useWordIds } from '../api/controllers/words/words.query';
import type { GetWordIdsResDTO, WordDTO, WordWithTranslationDTO } from '../api/controllers/words/words.schema';
import { CardTypeMapper } from '../database/card-types';
import type { Searcher } from '../functions/dictionary';
import { getSearcher } from '../functions/dictionary';
import type { Helper } from '../functions/generate-card-content';
import { PreviousReviews } from '../functions/previous-reviews';
import { calculateHalfLifeCoefficient } from '../functions/reviews';
import { useLangToLearnOptions } from '../hooks/langs';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { chunkArray, uniquelize } from '../utils/array';
import { removeKeys } from '../utils/object';
import type { AddNewWordInfo, JSONPasteWords } from './Course/EditContent/Form';
import LoadingPage from './Loading/LoadingPage';
import { useHelper } from './hooks/text-helpers';

const NewWordsPage: FC<{ helper: Helper }> = () => {
  const [langToLearn, setLangToLearn] = useLocalStorage('lang-to-learn', null as null | string);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [results, setResults] = useState<ReturnType<typeof getTokens>>();

  const { data: mainCourses, isLoading: isLoadingCourses } = useMyMainCourses();
  const { data: wordsInfo, isLoading: isLoadingWordIds } = useWordIds({});

  const [isDictionaryLoading, setIsDictionaryLoading] = useState(false);

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

  const calculate = async () => {
    if (!langToLearn || !textAreaRef.current || !wordsInfo) return;

    setIsDictionaryLoading(true);

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
    const textTokens = uniquelize(getTextTokens(value));
    const { wordIds, wordToSearches } = await searchWordIds(langToLearn, textTokens);
    const dictionary = await getDictionary(wordIds);
    const saercher = getSearcher(dictionary, wordToSearches);
    const tokens = getTokens(value, existingWordIds, saercher);
    console.log('tokens', tokens);
    setResults(tokens);
    setIsDictionaryLoading(false);
  };
  const copyResults = () => {
    if (!results) return;
    const texts = results.knownTokens.map(
      (e): AddNewWordInfo => ({
        word: removeKeys(e.word as WordWithTranslationDTO, 'translation', 'advancedTranslation'),
      }),
    );
    const data: JSONPasteWords = {
      type: 'internal-paste',
      words: texts,
    };
    navigator.clipboard.writeText(JSON.stringify(data));
  };

  const copyUnknowns = () => {
    if (!results) return;
    const texts = results.unknownWords.map(
      (e): AddNewWordInfo => ({
        wordValue: e,
      }),
    );
    const data: JSONPasteWords = {
      type: 'internal-paste',
      words: texts,
    };
    navigator.clipboard.writeText(JSON.stringify(data));
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
              <Button label='Copy' onClick={copyUnknowns} variant='primary' />
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
              <Button label='Copy' onClick={copyResults} variant='primary' />
            </div>
          )}
        </div>
      )}
      <br />
      <br />
    </div>
  );
};

const searchWordIds = async (
  lang: string,
  tokens: string[],
): Promise<{ wordIds: number[]; wordToSearches: Map<string, number[]> }> => {
  const searchChunks = chunkArray(tokens, 30);

  const results = await Promise.all(
    searchChunks.map((queries) => {
      return wordController.multiSearchWordIds({
        lang,
        searchValues: queries,
      });
    }),
  );

  const wordIds = results.flatMap((e) => e.queries.flatMap((r) => r.wordIds));
  const wordToSearches = new Map<string, number[]>();
  for (const result of results) {
    for (const query of result.queries) {
      wordToSearches.set(query.searchValue, query.wordIds);
    }
  }
  return { wordIds, wordToSearches };
};

const getDictionary = async (wordIds: number[]) => {
  const searchChunks = chunkArray(wordIds, 100);

  const results = await Promise.all(
    searchChunks.map((ids) => {
      return wordController.getWordsByIds({
        ids,
        includeAllOfficialTranslations: true,
      });
    }),
  );

  return results.flatMap((e) => e.words);
};

const getCourseWordIds = (courseId: number, wordsInfo: GetWordIdsResDTO): number[] => {
  const course = wordsInfo.find((course) => course.courseId === courseId);
  if (!course) return [];
  return course.lessons.map((e) => e.words.map((w) => w.id)).flat();
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

const getLineTokens = (line: string) => {
  return line
    .split(' ')
    .map((token) => token.replace(/[.,?!:"()]/g, ''))
    .filter((e) => e.length > 0 && e.match(/[a-zA-ZäöüÄÖÜß]/) && ignoredWords.indexOf(e) === -1);
};

const divideByLines = (text: string) => text.split(/[\n+.?!]/);

const getTextTokens = (text: string) => {
  return divideByLines(text).flatMap(getLineTokens);
};

const getTokens = (value: string, existingWordIds: number[], searcher: Searcher) => {
  const lines = divideByLines(value);
  const unknownTokens: string[] = [];
  const matchedKnownWordIds: { word: WordDTO; originalToken: string }[] = [];
  const usedWordTokens = new Set<string>(existingWordIds.map((id) => searcher.wordsAllValues.get(id) || []).flat());
  for (const line of lines) {
    let tokens = getLineTokens(line);
    const firstToken = tokens[0];
    const isFirstTokenNoun = firstToken
      ? searcher.search(firstToken).some((e) => (e.word.mainType ?? e.word.type) === CardTypeMapper.NOUN)
      : false;
    if (tokens.length > 0 && !isFirstTokenNoun && searcher.hasMatch(tokens[0].toLocaleLowerCase())) {
      tokens[0] = tokens[0].toLocaleLowerCase();
    }
    tokens = uniquelize(tokens.filter((token) => !usedWordTokens.has(token)));
    // debugger;
    unknownTokens.push(...tokens.filter((e) => !searcher.hasMatch(e)));
    const matchedKnown = tokens
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
      .filter(<T extends unknown>(e: T): e is NonNullable<T> => !!e)
      .map((token) => ({ token, matches: searcher.search(token) }))
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

const NewWordsPageLoader = () => {
  const helper = useHelper();
  if (!helper) return null;
  return <NewWordsPage helper={helper} />;
};

export default NewWordsPageLoader;
