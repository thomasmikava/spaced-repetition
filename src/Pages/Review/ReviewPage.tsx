import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Content from '../../Content';
import { TestContextProvider } from '../../contexts/testContext';
import type { StandardCard } from '../../database/types';
import { getCardViewContent2 } from '../../functions/generate-card-content';
import { Reviewer } from '../../functions/reviewer';
import { CardViewMode } from '../../functions/reviews';
import { withNoEventAction } from '../../utils/event';
import cssModule from '../../App.module.css';
import { useHelper } from '../hooks/text-helpers';
import { useWords } from './useWords';

interface ReviewPageProps {
  mode: 'normal' | 'endless';
  words: StandardCard[];
  isInsideLesson: boolean;
  helper: ReturnType<typeof useHelper>;
}

const ReviewPage: FC<ReviewPageProps> = ({ helper, isInsideLesson, mode, words }) => {
  const [reviewer] = useState(() => new Reviewer(words, isInsideLesson, mode));
  const [questionNumber, setQuestionNumber] = useState(0);

  const [currentCard, setCurrentCard] = useState(() => reviewer.getNextCard());
  const [wasWrong, setWasWrong] = useState(false);

  const question = useMemo(() => {
    if (!helper || !currentCard) return null;
    if (currentCard.hasGroupViewMode && !currentCard.isViewedInGroup) {
      return {
        type: CardViewMode.groupView,
        content: getCardViewContent2(currentCard.record, CardViewMode.groupView, helper),
      };
    } else if (
      !currentCard.hasGroupViewMode &&
      currentCard.hasIndividualViewMode &&
      !currentCard.isIndividuallyViewed
    ) {
      return {
        type: CardViewMode.individualView,
        content: getCardViewContent2(currentCard.record, CardViewMode.individualView, helper),
      };
    }
    return {
      type: CardViewMode.test,
      content: getCardViewContent2(currentCard.record, CardViewMode.test, helper),
    };
  }, [currentCard, helper]);

  const [isInAnswerReviewMode, setIsInAnswerReviewMode] = useState(false);

  const gotoNextCard = () => {
    if (!currentCard || !question) return;
    reviewer.markViewed(currentCard, question.type, !wasWrong);
    const nextCard = reviewer.getNextCard();
    setCurrentCard(nextCard);
    setIsInAnswerReviewMode(false);
    setQuestionNumber((x) => x + 1);
    setWasWrong(false);
  };

  const checkAnswer = () => {
    if (!currentCard || !question) return;
    setIsInAnswerReviewMode(true);
  };

  const handleResult = (areAllCorrect: boolean) => {
    setWasWrong(!areAllCorrect);
  };

  const isEnded = !currentCard;

  const isView = question?.type === CardViewMode.groupView || question?.type === CardViewMode.individualView;
  const canGoToNextCard = isView || isInAnswerReviewMode;
  const onSubmit = canGoToNextCard ? gotoNextCard : checkAnswer;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEnded && canGoToNextCard && e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (isEnded) {
    return <div className='body'>Done</div>;
  }

  if (!question) {
    return <div className='body'>No question...</div>;
  }

  return (
    <div className='body' style={{ paddingTop: 10, paddingBottom: 10 }}>
      <TestContextProvider
        key={questionNumber}
        mode={!isInAnswerReviewMode && !isView ? 'edit' : 'readonly'}
        onResult={handleResult}
      >
        <WithNextButton onClick={onSubmit}>
          <ViewCard>
            <form onSubmit={withNoEventAction(onSubmit)}>
              <Content content={question.content} />
            </form>
          </ViewCard>
        </WithNextButton>
      </TestContextProvider>
    </div>
  );
};

export const ReviewPageLoader = () => {
  const searchParams = new URL(window.location.href).searchParams;
  const mode = !!searchParams.get('mode');
  const courseId = !searchParams.get('courseId') ? undefined : +(searchParams.get('courseId') as string);
  const lessonId = !searchParams.get('lessonId') ? undefined : +(searchParams.get('lessonId') as string);
  const helper = useHelper();

  const { data: words, isLoading: areWordsLoading } = useWords({ courseId, lessonId });

  const isLoading = !helper || areWordsLoading;
  if (isLoading) {
    return <div className='body'>Loading...</div>;
  }

  if (!words || !helper) return <div className='body'>Error...</div>;

  return (
    <ReviewPage
      mode={mode ? 'endless' : 'normal'}
      words={words}
      helper={helper}
      isInsideLesson={!!courseId && !!lessonId}
    />
  );
};

const WithNextButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
  return (
    <div className={cssModule.withNextButton}>
      {children}
      <div className={cssModule.nextButtonContainer}>
        <button onClick={onClick} className={cssModule.nextButton}>
          <span>›</span>
        </button>
      </div>
    </div>
  );
};

const ViewCard = ({ children }: { children: React.ReactNode }) => {
  return <div className={cssModule.viewCard}>{children}</div>;
};