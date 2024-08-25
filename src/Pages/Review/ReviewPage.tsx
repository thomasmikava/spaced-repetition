import type { FC, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Content from '../../Content';
import { TestContextProvider } from '../../contexts/testContext';
import type { StandardCard } from '../../database/types';
import type { Helper } from '../../functions/generate-card-content';
import { getCardViewContent } from '../../functions/generate-card-content';
import { Reviewer } from '../../functions/reviewer';
import { CardViewMode } from '../../functions/reviews';
import { withNoEventAction } from '../../utils/event';
import cssModule from '../../App.module.css';
import { useHelper } from '../hooks/text-helpers';
import { useWords } from './useWords';
import LoadingPage from '../Loading/LoadingPage';
import { BookOutlined } from '@ant-design/icons/lib/icons';
import { DictionaryLoadedModal } from '../../components/DictionaryModal';
import { TranslationLangsProvider } from '../../contexts/TranslationLangs';
import { TranslationLangSelectorConnected } from '../../components/Lang/TranslationLangSelector';
import styles from './styles.module.css';
import { useUserPreferences } from '../../api/controllers/users/users.query';
import type { UserPreferencesDTO } from '../../api/controllers/users/users.schema';

interface ReviewPageProps {
  mode: 'normal' | 'endless';
  words: StandardCard[];
  isInsideLesson: boolean;
  helper: NonNullable<ReturnType<typeof useHelper>>;
  userPreferences: UserPreferencesDTO | null;
}

const ReviewPage: FC<ReviewPageProps> = ({ helper, isInsideLesson, mode, words, userPreferences }) => {
  const [reviewer] = useState(() => new Reviewer(words, helper, isInsideLesson, mode));
  const [questionNumber, setQuestionNumber] = useState(0);

  const [currentCard, setCurrentCard] = useState(() => reviewer.getNextCard());
  const [wasWrong, setWasWrong] = useState(false);

  const question = useMemo(() => {
    if (!helper || !currentCard) return null;
    if (currentCard.hasGroupViewMode && !currentCard.isViewedInGroup) {
      return {
        type: CardViewMode.groupView,
        content: getCardViewContent(currentCard.record, CardViewMode.groupView, helper, userPreferences),
      };
    } else if (
      !currentCard.hasGroupViewMode &&
      currentCard.hasIndividualViewMode &&
      !currentCard.isIndividuallyViewed
    ) {
      return {
        type: CardViewMode.individualView,
        content: getCardViewContent(currentCard.record, CardViewMode.individualView, helper, userPreferences),
      };
    }
    return {
      type: CardViewMode.test,
      content: getCardViewContent(currentCard.record, CardViewMode.test, helper, userPreferences),
    };
  }, [currentCard, helper, userPreferences]);

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

  const testMode = !isInAnswerReviewMode && !isView ? 'edit' : 'readonly';

  const availableLangs = currentCard.record.card.translations.map((e) => e.lang);

  return (
    <div className='body' style={{ paddingTop: 10, paddingBottom: 10 }}>
      <TranslationLangsProvider translationLangs={availableLangs}>
        <TestContextProvider key={questionNumber} mode={testMode} onResult={handleResult}>
          <WithNextButton
            onClick={onSubmit}
            rest={
              testMode === 'readonly' && currentCard && currentCard.record.card.variants.length > 1 ? (
                <DictionaryIcon card={currentCard.record.card} helper={helper} />
              ) : null
            }
          >
            <div>
              {availableLangs.length > 0 && (
                <div className={styles.transLangsContainer}>
                  <TranslationLangSelectorConnected />
                </div>
              )}
              <ViewCard>
                <form onSubmit={withNoEventAction(onSubmit)}>
                  <Content content={question.content} />
                </form>
              </ViewCard>
            </div>
          </WithNextButton>
        </TestContextProvider>
      </TranslationLangsProvider>
    </div>
  );
};

export const ReviewPageLoader = () => {
  const searchParams = new URL(window.location.href).searchParams;
  const mode = !!searchParams.get('mode');
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
    <ReviewPage
      mode={mode ? 'endless' : 'normal'}
      words={words}
      helper={helper}
      isInsideLesson={!!courseId && !!lessonId}
      userPreferences={userPreferences.result}
    />
  );
};

const WithNextButton = ({
  children,
  onClick,
  rest,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  rest?: ReactNode;
}) => {
  return (
    <div className={cssModule.withNextButton}>
      {children}
      <div className={cssModule.nextButtonContainer}>
        <button onClick={onClick} className={cssModule.nextButton}>
          <span>›</span>
        </button>
        {rest}
      </div>
    </div>
  );
};

const DictionaryIcon = ({ card, helper }: { card: StandardCard; helper: Helper }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  return (
    <>
      <button onClick={handleOpen} className={cssModule.bigDictionaryButton}>
        <span>
          <BookOutlined />
        </span>
      </button>
      {isOpen && <DictionaryLoadedModal word={null} card={card} helper={helper} onClose={handleClose} />}
    </>
  );
};

const ViewCard = ({ children }: { children: React.ReactNode }) => {
  return <div className={cssModule.viewCard}>{children}</div>;
};
