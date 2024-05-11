import { useEffect, useMemo, useRef, useState } from 'react';
import cssModule from '../App.module.css';
import Content from '../Content';
import { TestContextProvider } from '../contexts/testContext';
import { CardType } from '../database/types';
import { getCardViewContent2 } from '../functions/generate-card-content';
import type { CardWithProbability } from '../functions/reviewer';
import { Reviewer } from '../functions/reviewer';
import { CardViewMode, secondsUntilProbabilityIsHalf } from '../functions/reviews';
import { formatTime } from '../utils/time';
import { useHelper } from './hooks/text-helpers';
import { withNoEventAction } from '../utils/event';
import { useLatestCallback } from '../utils/hooks';

const AlgorithmReviewPage = () => {
  const searchParams = new URL(window.location.href).searchParams;
  const mode = !!searchParams.get('mode');
  const courseId = !searchParams.get('courseId') ? undefined : +(searchParams.get('courseId') as string);
  const lessonId = !searchParams.get('lessonId') ? undefined : +(searchParams.get('lessonId') as string);
  const [mainKey, setMainKey] = useState(0);
  const [maxCards, setMaxCards] = useState(400);
  const helper = useHelper();

  const [correctness, setCorrectness] = useState<boolean[]>([]);

  const getQuestion = useLatestCallback((currentCard: CardWithProbability) => {
    if (!helper || !currentCard) return null;
    if (currentCard.hasGroupViewMode && !currentCard.isViewedInGroup) {
      return {
        type: CardViewMode.groupView,
        content: getCardViewContent2(currentCard.record, CardViewMode.groupView, helper),
        record: currentCard.record,
      };
    } else if (
      !currentCard.hasGroupViewMode &&
      currentCard.hasIndividualViewMode &&
      !currentCard.isIndividuallyViewed
    ) {
      return {
        type: CardViewMode.individualView,
        content: getCardViewContent2(currentCard.record, CardViewMode.individualView, helper),
        record: currentCard.record,
      };
    }
    return {
      type: CardViewMode.test,
      content: getCardViewContent2(currentCard.record, CardViewMode.test, helper),
      record: currentCard.record,
    };
  });

  const [submitted, setSubmitted] = useState<boolean[]>([]);

  useLogs({ courseId, lessonId, mode, getQuestion, correctness, maxCards });

  const entries = useMemo(() => {
    const reviewer = new Reviewer(courseId, lessonId, mode ? 'endless' : 'normal', true);
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
      question.content = JSON.parse(
        JSON.stringify(question.content)
          .replace(/"autoplay":true/g, '"autoplay":false')
          .replace(/"autoFocus":true/g, '"autoFocus":false'),
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tagLength = (question as any).content?.[0]?.content?.[0]?.content?.length || 1;
      lastDate += 5000 + (tagLength - 1) * 3000;
      if (question.type === CardViewMode.groupView) {
        lastDate += currentCard.record.card.type === CardType.VERB ? 10000 : 5000;
      }
      questions.push(question);
      reviewer.markViewed(currentCard, question.type, correctness[index] !== false, lastDate);
      index++;
    } while (cards.length < maxCards);
    return { cards, questions };
  }, [courseId, lessonId, mode, getQuestion, correctness, maxCards]);

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
        return (
          <form
            onSubmit={withNoEventAction(handleResult(index))}
            key={mainKey + '_' + index}
            style={{ margin: '20px 0' }}
          >
            <TestContextProvider
              mode={isView || typeof submitted[index] === 'boolean' ? 'readonly' : 'edit'}
              onResult={(areAllCorrect) => changeCorrectness(index, !areAllCorrect, false)}
            >
              <div style={{ display: 'flex', marginBottom: 5 }}>
                <span style={{ flex: 1 }}>#{index + 1}</span>
                {entries.cards[index].historyRecord && (
                  <span>prob: {Math.floor(entries.cards[index].probability * 1000) / 10}%; </span>
                )}
                <span>due: {formatTime(entries.cards[index].reviewDue)}; </span>
                {entries.cards[index].historyRecord && (
                  <span>
                    Half: {formatTime(secondsUntilProbabilityIsHalf(entries.cards[index].historyRecord!.lastS))}
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

export default AlgorithmReviewPage;
