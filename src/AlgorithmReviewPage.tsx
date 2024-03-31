import { useCallback, useMemo, useState } from 'react';
import cssModule from './App.module.css';
import { getCardTestContent, getCardViewContent } from './functions/generate-card-content';
import type { CardWithProbability } from './functions/reviewer';
import { Reviewer } from './functions/reviewer';
import { CardViewMode, secondsUntilProbabilityIsHalf } from './functions/reviews';
import Content from './Content';
import { TestContextProvider } from './contexts/testContext';
import { CardType } from './database/types';
import { formatTime } from './utils/time';

const AlgorithmReviewPage = () => {
  const searchParams = new URL(window.location.href).searchParams;
  const mode = !!searchParams.get('mode');
  const courseId = !searchParams.get('courseId') ? undefined : +(searchParams.get('courseId') as string);
  const lessonId = !searchParams.get('lessonId') ? undefined : +(searchParams.get('lessonId') as string);
  const [mainKey, setMainKey] = useState(0);

  const [correctness, setCorrectness] = useState<boolean[]>([]);

  const getQuestion = useCallback((currentCard: CardWithProbability) => {
    if (!currentCard) return null;
    if (currentCard.hasGroupViewMode && !currentCard.isViewedInGroup) {
      return {
        type: CardViewMode.groupView,
        content: getCardViewContent(currentCard.record, CardViewMode.groupView),
      };
    } else if (
      !currentCard.hasGroupViewMode &&
      currentCard.hasIndividualViewMode &&
      !currentCard.isIndividuallyViewed
    ) {
      return {
        type: CardViewMode.individualView,
        content: getCardViewContent(currentCard.record, CardViewMode.individualView),
      };
    }
    return {
      type: CardViewMode.test,
      content: getCardTestContent(currentCard.record),
    };
  }, []);

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
    } while (cards.length < 400);
    return { cards, questions };
  }, [courseId, lessonId, mode, getQuestion, correctness]);

  const changeCorrectness = (index: number, currentValue: boolean) => {
    const nextValue = currentValue === false ? true : false;
    const newCorrectness = [...correctness];
    newCorrectness[index] = nextValue;
    setCorrectness(newCorrectness.slice(0, index + 1));
    setMainKey(mainKey + 1);
  };

  return (
    <div className='body'>
      {entries.questions.map((question, index) => {
        const isView = question.type === CardViewMode.groupView || question.type === CardViewMode.individualView;
        return (
          <div key={mainKey + '_' + index} style={{ margin: '20px 0' }}>
            <TestContextProvider mode={isView ? 'readonly' : 'edit'} onResult={() => {}}>
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
                  <button onClick={() => changeCorrectness(index, correctness[index])}>
                    {correctness[index] === false ? 'Mark as correct' : 'Mark as wrong'}
                  </button>
                )}
              </div>
              <ViewCard>
                <Content content={question.content} />
              </ViewCard>
            </TestContextProvider>
          </div>
        );
      })}
    </div>
  );
};

const ViewCard = ({ children }: { children: React.ReactNode }) => {
  return <div className={cssModule.viewCard}>{children}</div>;
};

export default AlgorithmReviewPage;
