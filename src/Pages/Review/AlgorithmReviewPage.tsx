import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import cssModule from '../../App.module.css';
import Content from '../../Content';
import { TestContextProvider } from '../../contexts/testContext';
import type { StandardCard } from '../../database/types';
import { CardType } from '../../database/types';
import { getCardViewContent } from '../../functions/generate-card-content';
import type { CardWithProbability } from '../../functions/reviewer';
import { Reviewer } from '../../functions/reviewer';
import { CardViewMode, initialTestS, secondsUntilProbabilityIsHalf } from '../../functions/reviews';
import { formatTime } from '../../utils/time';
import { useHelper } from '../hooks/text-helpers';
import { withNoEventAction } from '../../utils/event';
import { useLatestCallback } from '../../utils/hooks';
import { useWords } from './useWords';
import { CardTypeMapper } from '../../database/card-types';
import LoadingPage from '../Loading/LoadingPage';
import { TranslationLangsProvider } from '../../contexts/TranslationLangs';
import { iterateAndModify } from '../../utils/object';
import { useUserPreferences } from '../../api/controllers/users/users.query';
import type { UserPreferencesDTO } from '../../api/controllers/users/users.schema';

interface ReviewPageProps {
  mode: 'normal' | 'endless';
  words: StandardCard[];
  isInsideLesson: boolean;
  helper: NonNullable<ReturnType<typeof useHelper>>;
  userPreferences: UserPreferencesDTO | null;
}

const FAST_REVIEW = false;

const AlgorithmReviewPage: FC<ReviewPageProps> = ({ helper, isInsideLesson, mode, words, userPreferences }) => {
  const [mainKey, setMainKey] = useState(0);
  const [maxCards, setMaxCards] = useState(400);

  const [correctness, setCorrectness] = useState<boolean[]>([]);

  const getQuestion = useLatestCallback((currentCard: CardWithProbability) => {
    if (!helper || !currentCard) return null;
    if (currentCard.hasGroupViewMode && !currentCard.isViewedInGroup) {
      return {
        type: CardViewMode.groupView,
        content: getCardViewContent(currentCard.record, CardViewMode.groupView, helper, userPreferences),
        record: currentCard.record,
      };
    } else if (
      !currentCard.hasGroupViewMode &&
      currentCard.hasIndividualViewMode &&
      !currentCard.isIndividuallyViewed
    ) {
      return {
        type: CardViewMode.individualView,
        content: getCardViewContent(currentCard.record, CardViewMode.individualView, helper, userPreferences),
        record: currentCard.record,
      };
    }
    return {
      type: CardViewMode.test,
      content: getCardViewContent(currentCard.record, CardViewMode.test, helper, userPreferences),
      record: currentCard.record,
    };
  });

  const [submitted, setSubmitted] = useState<boolean[]>([]);

  useLogs({ mode, getQuestion, correctness, maxCards });

  const entries = useMemo(() => {
    const reviewer = new Reviewer(words, helper, isInsideLesson, mode, true);
    const cards: CardWithProbability[] = [];
    const questions: NonNullable<ReturnType<typeof getQuestion>>[] = [];
    let lastDate = 0;
    let index = 0;
    do {
      const currentCard = reviewer.getNextCard(lastDate);
      if (!currentCard) break;
      cards.push(currentCard);
      const question = getQuestion(currentCard);
      if (!question) break;
      question.content = iterateAndModify(question.content, (key, value, obj) => {
        if (key === 'autoplay' && obj?.type === 'voice') return false;
        if (key === 'autoFocus' && obj?.type === 'input') return false;
        return value;
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tagLength = (question as any).content?.[0]?.content?.[0]?.content?.length || 1; // TODO: it's very fragile strategy
      if (FAST_REVIEW) lastDate += 1000 + (tagLength - 1) * 1000;
      else lastDate += 5000 + (tagLength - 1) * 3000;

      if (question.type === CardViewMode.groupView) {
        lastDate += currentCard.record.card.type === CardTypeMapper[CardType.VERB] ? 10000 : 5000;
      }
      questions.push(question);
      reviewer.markViewed(currentCard, question.type, correctness[index] !== false, lastDate);
      index++;
    } while (cards.length < maxCards);
    return { cards, questions };
  }, [words, isInsideLesson, mode, getQuestion, correctness, helper, maxCards]);

  const showMore = (count: number) => {
    setMaxCards(maxCards + count);
  };

  const changeCorrectness = useLatestCallback((index: number, currentValue: boolean, shouldModifySubmission = true) => {
    const nextValue = currentValue === false ? true : false;
    if ((correctness[index] ?? true) === nextValue) return;
    const newCorrectness = [...correctness];
    newCorrectness[index] = nextValue;
    setCorrectness(newCorrectness.slice(0, index + 1));
    if (shouldModifySubmission) {
      setSubmitted((prev) => {
        const newLength = index - 1;
        if (prev.length <= newLength) return prev;
        return prev.slice(0, newLength);
      });
    }
    setMainKey(mainKey + 1);
  });

  const handleResult = useLatestCallback((index: number) => () => {
    setSubmitted((prev) => {
      const newAnswers = [...prev];
      newAnswers[index] = true;
      newAnswers.splice(index + 1);
      return newAnswers;
    });
  });

  const questionCards = useMemo(() => {
    return entries.questions.map((question) => {
      return (
        <ViewCard {...{ record: question.record }}>
          <Content content={question.content} />
        </ViewCard>
      );
    });
  }, [entries.questions]);

  const children = useMemo(
    () =>
      entries.questions.map((question, index) => {
        const isView = question.type === CardViewMode.groupView || question.type === CardViewMode.individualView;
        const record = entries.cards[index];
        const availableLangs = record.record.card.translations.map((x) => x.lang);
        return (
          <TranslationLangsProvider translationLangs={availableLangs} key={mainKey + '_' + index}>
            <form onSubmit={withNoEventAction(handleResult(index))} style={{ margin: '20px 0' }}>
              <TestContextProvider
                mode={isView || typeof submitted[index] === 'boolean' ? 'readonly' : 'edit'}
                onResult={(areAllCorrect) => changeCorrectness(index, !areAllCorrect, false)}
              >
                <div style={{ display: 'flex', marginBottom: 5 }}>
                  <span style={{ flex: 1 }}>#{index + 1}</span>
                  {record.historyRecord && <span>prob: {Math.floor(record.probability * 1000) / 10}%; </span>}
                  <span>due: {formatTime(record.reviewDue)}</span>
                  {record.historyRecord && (
                    <span>
                      Half: {formatTime(secondsUntilProbabilityIsHalf(record.historyRecord!.lastS ?? initialTestS))}
                    </span>
                  )}
                  {!isView && (
                    <button type='button' onClick={() => changeCorrectness(index, correctness[index])}>
                      {correctness[index] === false ? 'Mark as correct' : 'Mark as wrong'}
                    </button>
                  )}
                </div>
                {questionCards[index]}
              </TestContextProvider>
            </form>
          </TranslationLangsProvider>
        );
      }),
    [changeCorrectness, handleResult, correctness, entries.cards, questionCards, entries.questions, mainKey, submitted],
  );

  return (
    <div className='body'>
      {children}
      {entries.questions.length === maxCards && (
        <div>
          <br />
          <br />
          <button
            onClick={() => showMore(100)}
            style={{ fontSize: 20, padding: '10px 20px', cursor: 'pointer', marginRight: 5 }}
          >
            Show +100
          </button>
          <button onClick={() => showMore(300)} style={{ fontSize: 20, padding: '10px 20px', cursor: 'pointer' }}>
            Show +300
          </button>
          <br />
          <br />
        </div>
      )}
    </div>
  );
};

const ViewCard = ({ children }: { children: React.ReactNode }) => {
  return <div className={cssModule.viewCard}>{children}</div>;
};

const useLogs = (rec: Record<string, unknown>) => {
  const keys = Object.keys(rec);
  const isMountedRef = useRef(false);
  for (const key of keys) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMemo(() => {
      if (!isMountedRef.current) return;
      console.log('ჭჭ: ლოგი', key, rec[key]);
    }, [rec[key]]);
  }

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
};

export const AlgorithmReviewPageLoader = () => {
  const searchParams = new URL(window.location.href).searchParams;
  const mode = !!searchParams.get('mode');
  const courseId = !searchParams.get('courseId') ? undefined : +(searchParams.get('courseId') as string);
  const lessonId = !searchParams.get('lessonId') ? undefined : +(searchParams.get('lessonId') as string);
  const helper = useHelper();

  const { data: words, isLoading: areWordsLoading } = useWords({ courseId, lessonId });
  const {
    data: userPreferences,
    isLoading: arePreferencesLoading,
    isFetching: isFetchingPreferences,
  } = useUserPreferences();

  const isLoading = !helper || areWordsLoading || arePreferencesLoading || isFetchingPreferences;
  if (isLoading) {
    return <LoadingPage />;
  }

  if (!words || !helper || !userPreferences) return <div className='body'>Error...</div>;

  return (
    <AlgorithmReviewPage
      mode={mode ? 'endless' : 'normal'}
      words={words}
      helper={helper}
      isInsideLesson={!!courseId && !!lessonId}
      userPreferences={userPreferences.result}
    />
  );
};
