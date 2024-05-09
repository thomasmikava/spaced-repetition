import { useMemo, useRef, useState } from 'react';
import { generateAllVariants } from '../functions/generateIndexedDatabase';
import type { IdType } from '../database/types';
import Select from '../ui/Select';
import { courses } from '../courses/lessons';
import { uniquelize } from '../utils/array';
import { PreviousReviews } from '../functions/previous-reviews';
import { CardViewMode, calculateHalfLifeCoefficient } from '../functions/reviews';
import { Reviewer } from '../functions/reviewer';

const NewWordsPage = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [database] = useState(() => generateAllVariants());
  const [results, setResults] = useState<ReturnType<typeof getTokens>>();

  const courseOptions = useMemo(
    () =>
      courses
        .map((course) => ({ value: '' + course.id, label: course.title }))
        .concat([
          { value: 'existing', label: 'Words that I started' },
          { value: 'well-known', label: 'Words that I know well' },
        ]),
    [],
  );
  const [currentCourse, setCurrentCourse] = useState('');

  const calculate = () => {
    if (!textAreaRef.current) return;
    const courseId = currentCourse ? +currentCourse : '';
    const existingTokens =
      currentCourse === 'existing'
        ? getExistingTokens(false)
        : currentCourse === 'well-known'
          ? getExistingTokens(true)
          : courseId
            ? getCourseTokens(courseId)
            : [];
    const value = textAreaRef.current.value;
    console.log('existingTokens', existingTokens);
    const tokens = getTokens(value, existingTokens, database);
    console.log('tokens', tokens);
    setResults(tokens);
  };
  const copyResults = () => {
    if (!results) return;
    const text = JSON.stringify(
      results.knownTokens.map((result) => ({ type: result.type, value: result.value })),
    ).replace(/({"type":)"(.+?)"/g, '$1CardType.$2');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className='body'>
      <textarea ref={textAreaRef} style={{ width: 600, height: 300, maxWidth: '100%' }} />
      <br />
      <Select options={courseOptions} value={currentCourse} onChange={setCurrentCourse} />
      <br />
      <button
        style={{ fontSize: 20, cursor: 'pointer', padding: '10px 20px', borderRadius: 10, border: 'none' }}
        onClick={calculate}
      >
        Calculate
      </button>
      {results && (
        <div>
          {results.unknownWords.length > 0 && (
            <div>
              <h2>New words ({results.unknownWords.length})</h2>
              <ul>
                {results.unknownWords.map((result, index) => (
                  <li key={index}>{result}</li>
                ))}
              </ul>
            </div>
          )}
          {results.knownTokens.length > 0 && (
            <div>
              <h2>In database ({results.knownTokens.length})</h2>
              <ul>
                {results.knownTokens.map((result, index) => (
                  <li key={index}>
                    {result.originalToken}
                    {result.value !== result.originalToken ? ` (${result.value})` : ''}
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

const getCourseTokens = (courseId: number) => {
  const course = courses.find((course) => course.id === courseId);
  if (!course) return [];
  const tokens: { type: IdType; value: string }[] = [];
  for (const lesson of course.lessons) {
    for (const card of lesson.cards) {
      tokens.push({ type: card.type, value: card.value });
    }
  }
  return tokens;
};

const getExistingTokens = (wellKnown: boolean) => {
  const tokens: { type: IdType; value: string }[] = [];
  const prevReviews = new PreviousReviews(false);
  const reviewer = new Reviewer();
  const testableCards = reviewer.getAllTestableCards();
  const wellKnownCoefficient = calculateHalfLifeCoefficient(60 * 60 * 24);
  for (const card of testableCards) {
    if (!card.initial) continue;
    const testHistory = prevReviews.getCardHistory(card, CardViewMode.test);
    if (!testHistory) continue;
    if (wellKnown && testHistory.lastS < wellKnownCoefficient) continue;
    tokens.push({ type: card.type ?? CardType.PHRASE, value: card.card.value });
  }
  return tokens;
};

const ignoredWords: string[] = ["geht's", "gibt's", 'Neues', 'los', 'Hause', 'am'];

const getTokens = (
  value: string,
  existingTokens: { type: IdType; value: string }[],
  database: ReturnType<typeof generateAllVariants>,
) => {
  const lines = value.split(/[\n+.?!]/);
  const unknownTokens: string[] = [];
  const knownTokens: { type: IdType; value: string; originalToken: string }[] = [];
  const allWords = new Set<string>(existingTokens.map((token) => token.value));
  ignoredWords.forEach((word) => allWords.add(word));
  for (const line of lines) {
    let tokens = line
      .split(' ')
      .map((token) => token.replace(/[.,?!:"()]/g, ''))
      .filter((e) => e.length > 0 && e.match(/[a-zA-ZäöüÄÖÜß]/));
    if (tokens.length > 0 && !database.NOUN.has(tokens[0]) && isInDatabase(tokens[0].toLocaleLowerCase(), database)) {
      tokens[0] = tokens[0].toLocaleLowerCase();
    }
    tokens = uniquelize(tokens.filter((token) => !allWords.has(token)));
    unknownTokens.push(...tokens.filter((e) => !isInDatabase(e, database)));
    knownTokens.push(
      ...tokens
        .map((token) => getDatabaseValuePath(token, database))
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
        .filter(<T extends unknown>(e: T): e is NonNullable<T> => !!e)
        .filter(
          (e) =>
            !allWords.has(e.value) &&
            !database.ARTICLE.has(e.value) &&
            !database.NUMBER.has(e.value) &&
            !database.PRONOUN.has(e.value),
        ),
    );
    tokens.forEach((token) => allWords.add(token));
  }
  return { unknownWords: uniquelize(unknownTokens), knownTokens: uniquelize(knownTokens, (e) => e.value) };
};

function isInDatabase(token: string, database: ReturnType<typeof generateAllVariants>) {
  return Object.values(database).some((indexedObject) => indexedObject.has(token));
}
function getDatabaseValuePath(token: string, database: ReturnType<typeof generateAllVariants>) {
  for (const [key, value] of Object.entries(database)) {
    if (value.has(token)) {
      return { type: key as IdType, value: value.get(token) as string, originalToken: token };
    }
  }
  return null;
}

export default NewWordsPage;
