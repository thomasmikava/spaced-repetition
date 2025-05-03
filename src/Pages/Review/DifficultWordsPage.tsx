import { useMemo, useState, type FC } from 'react';
import { ReviewBlock } from '../../api/controllers/history/history.schema';
import { useUserPreferences } from '../../api/controllers/users/users.query';
import type { UserPreferencesDTO } from '../../api/controllers/users/users.schema';
import { AttributeMapper } from '../../database/attributes';
import type { StandardCard } from '../../database/types';
import { PreviousReviews } from '../../functions/previous-reviews';
import { getWithSymbolArticle } from '../../functions/texts';
import { Table, type TableRow } from '../../ui/Table/Table';
import { isNonNullable, uniquelize } from '../../utils/array';
import { useHelper } from '../hooks/text-helpers';
import LoadingPage from '../Loading/LoadingPage';
import { useWords } from './useWords';
import { getReviewBlockManager } from '../../functions/review-block';
import Button from '../../ui/Button';
import BookOutlined from '@ant-design/icons/lib/icons/BookOutlined';
import { DictionaryLoadedModal } from '../../components/DictionaryModal';
import { TranslationLangsProvider } from '../../contexts/TranslationLangs';
import CopyOutlined from '@ant-design/icons/lib/icons/CopyOutlined';
import Input from '../../ui/Input';
import { calculateHalfLifeCoefficient, secondsUntilProbabilityIsHalf } from '../../functions/reviews';
import { formatTime, roundTime } from '../../utils/time';
import { z } from 'zod';

interface ReviewPageProps {
  words: StandardCard[];
  isInsideLesson: boolean;
  helper: NonNullable<ReturnType<typeof useHelper>>;
  userPreferences: UserPreferencesDTO | null;
}

const DifficultWordsPage: FC<ReviewPageProps> = ({ helper, words }) => {
  const [prevReviews] = useState(() => new PreviousReviews());
  const defaultFilterData = getSavedFilteredDataFromLocalStorage() ?? {
    maxS: calculateHalfLifeCoefficient(60 * 60 * 24 * 5), // 5 days
    minRepetitions: 3,
    maxRatio: 0.7,
  };
  const [maxS, setMaxS] = useState(defaultFilterData.maxS);
  const [minRepetitions, setMinRepetitions] = useState(defaultFilterData.minRepetitions);
  const [maxRatio, setMaxRatio] = useState(defaultFilterData.maxRatio);

  const [displayedWord, setDisplayedWord] = useState<StandardCard | null>(null);

  const wordStats = useMemo(() => {
    const manager = getReviewBlockManager(ReviewBlock.standard);
    return words
      .map((word) => {
        const mainVariant = word.variants.find((variant) => variant.category === 1);
        if (!mainVariant) return null;
        const keys = manager
          .getKeysWithinBlock({
            includeReverseKeys: true,
            isInitial: true,
            translations: word.translations,
            variant: mainVariant,
          })
          .map((e) => e.testKey);
        const stats = prevReviews.getStats(ReviewBlock.standard, word.id, keys);
        if (!stats) return null;
        const closestDueDate = stats.closestDueDate;
        const closestDueIn =
          closestDueDate === Infinity || closestDueDate === null
            ? closestDueDate
            : closestDueDate - Math.floor(Date.now() / 1000);
        return {
          word,
          stats,
          closestDueIn,
        };
      })
      .filter(isNonNullable)
      .sort((a, b) => {
        const aRatio = a.stats.totalCorrect / a.stats.totalRepetition;
        const bRatio = b.stats.totalCorrect / b.stats.totalRepetition;
        return aRatio - bRatio;
      });
  }, [words, prevReviews]);

  const filteredWords = useMemo(() => {
    return wordStats.filter((wordStat) => {
      const { stats } = wordStat;
      const { minS, totalCorrect, totalRepetition } = stats;
      const ratio = totalCorrect / totalRepetition;
      return minS <= maxS && totalRepetition >= minRepetitions && ratio < maxRatio;
    });
  }, [maxS, minRepetitions, maxRatio, wordStats]);

  const wordRows = filteredWords.map((item): TableRow => {
    const { word, stats, closestDueIn } = item;
    const key = word.id;
    const cardTypeHelper = helper.getCardType(word.mainType ?? word.type, word.lang);
    const genderId = word.attributes?.[AttributeMapper.GENDER.id] ?? null;
    return {
      key,
      cells: [
        {
          cellValue: cardTypeHelper?.abbr,
          style: { opacity: 0.5, paddingRight: 30 },
        },
        cardTypeHelper?.includeArticleSymbol && genderId !== null
          ? getWithSymbolArticle(word.lang, word.value, genderId)
          : word.value,
        {
          cellValue: (
            <div>
              {word.translations.map((tr, i) => (
                <div key={tr.lang + '_' + i}>
                  {`${tr.lang}: `}
                  {tr.translation}
                </div>
              ))}
            </div>
          ),
        },
        {
          cellValue: (
            <div>
              {Math.round((stats.totalCorrect / stats.totalRepetition) * 100)}% ({stats.totalCorrect} /{' '}
              {stats.totalRepetition})
            </div>
          ),
          style: { whiteSpace: 'nowrap' },
        },
        {
          cellValue: `HL: ${formatTime(roundTime(calculateHalfLifeCoefficient(stats.minS)))}`,
          style: { textAlign: 'left', whiteSpace: 'nowrap' },
        },
        {
          cellValue:
            closestDueIn === null
              ? null
              : closestDueIn === Infinity
                ? '-'
                : closestDueIn <= 0
                  ? 'Ready'
                  : formatTime(roundTime(closestDueIn)),
          style: {
            opacity: closestDueIn !== null && closestDueIn <= 10 ? 1 : undefined,
            textAlign: 'right',
            whiteSpace: 'nowrap',
          },
        },
        {
          cellValue: <Button label={<BookOutlined />} variant='text' onClick={() => setDisplayedWord(word)} />,
          style: { width: '46px' },
        },
      ],
    };
  });

  const copyWords = () => {
    const words = filteredWords
      .map((item) => {
        if (!item.word) return null;
        return item.word.value;
      })
      .filter(isNonNullable)
      .join('\n');

    navigator.clipboard.writeText(words);
  };

  const onFilterChange = (data: FilterData) => {
    setMaxS(data.maxS);
    setMinRepetitions(data.minRepetitions);
    setMaxRatio(data.maxRatio);
    setSavedFilteredDataToLocalStorage(data);
  };

  const langs = displayedWord
    ? uniquelize(displayedWord.translations.map((tr) => tr.lang).filter((lang) => lang !== displayedWord.lang)) ?? []
    : [];

  return (
    <TranslationLangsProvider translationLangs={langs}>
      <div className='body' style={{ paddingTop: 10, paddingBottom: 10 }}>
        <Button
          label={`Copy words (${filteredWords.length})`}
          icon={<CopyOutlined />}
          variant='text'
          onClick={copyWords}
        />
        <Filter
          defaultMaxS={maxS}
          defaultMinRepetitions={minRepetitions}
          defaultMaxRatio={maxRatio}
          onChange={onFilterChange}
        />
        <Table rows={wordRows} removeEmptyColumns />

        {displayedWord && (
          <DictionaryLoadedModal
            card={displayedWord}
            word={null}
            helper={helper}
            onClose={() => setDisplayedWord(null)}
          />
        )}
      </div>
    </TranslationLangsProvider>
  );
};

interface FilterData {
  maxS: number;
  minRepetitions: number;
  maxRatio: number;
}

export const DifficultWordsPageLoader = () => {
  const searchParams = new URL(window.location.href).searchParams;
  const courseId = !searchParams.get('courseId') ? undefined : +(searchParams.get('courseId') as string);
  const lessonId = !searchParams.get('lessonId') ? undefined : +(searchParams.get('lessonId') as string);
  const helper = useHelper();

  const { data: words, isLoading: areWordsLoading, isFetching } = useWords({ courseId, lessonId });
  const {
    data: userPreferences,
    isLoading: arePreferencesLoading,
    isFetching: isFetchingPreferences,
  } = useUserPreferences();

  const isLoading = !helper || areWordsLoading || isFetching || arePreferencesLoading || isFetchingPreferences;
  if (isLoading) {
    return <LoadingPage />;
  }

  if (!words || !helper || !userPreferences) return <div className='body'>Error...</div>;

  return (
    <DifficultWordsPage
      words={words}
      helper={helper}
      isInsideLesson={!!courseId && !!lessonId}
      userPreferences={userPreferences.result}
    />
  );
};

interface FilterProps {
  defaultMaxS: number;
  defaultMinRepetitions: number;
  defaultMaxRatio: number;
  onChange: (data: FilterData) => void;
}

const Filter = ({ defaultMaxS, defaultMinRepetitions, defaultMaxRatio, onChange }: FilterProps) => {
  const [maxReviewDays, setMaxReviewDays] = useState(() =>
    Math.round(secondsUntilProbabilityIsHalf(defaultMaxS) / 24 / 3600),
  );
  const [minRepetitions, setMinRepetitions] = useState(defaultMinRepetitions);
  const [maxRatioPercentage, setMaxRatioPercentage] = useState(defaultMaxRatio * 100);
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-end' }}>
      <Input
        type='number'
        label={'Max Half Life (in days)'}
        value={maxReviewDays}
        size='middle'
        onChange={(e) => setMaxReviewDays(+e.target.value)}
      />
      <Input
        type='number'
        label={'Min Times Asked'}
        value={minRepetitions}
        size='middle'
        onChange={(e) => setMinRepetitions(+e.target.value)}
      />
      <Input
        type='number'
        label={'Max Correctness Ratio %'}
        value={maxRatioPercentage}
        size='middle'
        onChange={(e) => setMaxRatioPercentage(+e.target.value)}
        inputProps={{ step: 0.1, min: 0, max: 1 }}
      />
      <Button
        label='Apply'
        variant='primary'
        onClick={() => {
          onChange({
            maxS: calculateHalfLifeCoefficient(Math.round(maxReviewDays * 60 * 60 * 24)),
            minRepetitions,
            maxRatio: maxRatioPercentage * 0.01,
          });
        }}
      />
    </div>
  );
};

const filterDataSchema = z.object({
  maxS: z.number().min(0),
  minRepetitions: z.number().min(0),
  maxRatio: z.number().min(0).max(1),
});

const getSavedFilteredDataFromLocalStorage = (): FilterData | null => {
  const savedData = localStorage.getItem('difficultWordsFilterData');
  if (!savedData) return null;
  try {
    return filterDataSchema.parse(JSON.parse(savedData));
  } catch (e) {
    console.error('Error parsing saved data:', e);
    return null;
  }
};

const setSavedFilteredDataToLocalStorage = (data: FilterData) => {
  try {
    const parsedData = filterDataSchema.parse(data);
    localStorage.setItem('difficultWordsFilterData', JSON.stringify(parsedData));
  } catch (e) {
    console.error('Error saving data:', e);
  }
};
