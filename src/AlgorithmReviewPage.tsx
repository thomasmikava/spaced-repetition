import { useCallback, useMemo, useState } from 'react';
import cssModule from './App.module.css';
import { getCardTestContent, getCardViewContent } from './functions/generate-card-content';
import type { CardWithProbability } from './functions/reviewer';
import { Reviewer } from './functions/reviewer';
import { CardViewMode } from './functions/reviews';
import Content from './Content';
import { TestContextProvider } from './contexts/testContext';

const AlgorithmReviewPage = () => {
  const searchParams = new URL(window.location.href).searchParams;
  const mode = !!searchParams.get('mode');
  const courseId = !searchParams.get('courseId') ? undefined : +(searchParams.get('courseId') as string);
  const lessonId = !searchParams.get('lessonId') ? undefined : +(searchParams.get('lessonId') as string);

  const [reviewer] = useState(() => new Reviewer(courseId, lessonId, mode ? 'endless' : 'normal', true));

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
    const cards: CardWithProbability[] = [];
    const questions: NonNullable<ReturnType<typeof getQuestion>>[] = [];
    let lastDate = 0;
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
      lastDate += 5000;
      questions.push(question);
      reviewer.markViewed(currentCard, question.type, true, lastDate);
    } while (cards.length < 100);
    return { cards, questions };
  }, [reviewer, getQuestion]);

  return (
    <div className='body'>
      {entries.questions.map((question, index) => {
        const isView = question.type === CardViewMode.groupView || question.type === CardViewMode.individualView;
        return (
          <div key={index} style={{ margin: '20px 0' }}>
            <TestContextProvider mode={isView ? 'readonly' : 'edit'} onResult={() => {}}>
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
