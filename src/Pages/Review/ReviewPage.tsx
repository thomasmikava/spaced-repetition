import type { FC, ReactNode } from 'react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import Content from '../../Content';
import type { TestContextRef } from '../../contexts/testContext';
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
import { BookOutlined, FormOutlined, SettingFilled } from '@ant-design/icons/lib/icons';
import { DictionaryLoadedModal } from '../../components/DictionaryModal';
import { TranslationLangsProvider } from '../../contexts/TranslationLangs';
import { TranslationLangSelectorConnected } from '../../components/Lang/TranslationLangSelector';
import styles from './styles.module.css';
import { useUserPreferences } from '../../api/controllers/users/users.query';
import type { UserPreferencesDTO } from '../../api/controllers/users/users.schema';
import { calculatePreferences } from '../../functions/preferences';
import Dropdown from 'antd/es/dropdown';
import AntButton from 'antd/es/button';
import type { ItemType } from 'antd/es/menu/interface';
import { Checkbox } from '../../ui/Checkbox/Checkbox';
import { isNonNullable } from '../../utils/array';
import { useSnapshot } from 'valtio';
import { settingsState } from '../../states/settings';
import type { ControlRef } from './Controls';
import { CardControls } from './Controls';

interface ReviewPageProps {
  mode: 'normal' | 'endless' | 'only-new';
  words: StandardCard[];
  isInsideLesson: boolean;
  helper: NonNullable<ReturnType<typeof useHelper>>;
  userPreferences: UserPreferencesDTO | null;
}

const ReviewPage: FC<ReviewPageProps> = ({ helper, isInsideLesson, mode, words, userPreferences }) => {
  const [reviewer] = useState(() => new Reviewer(words, helper, userPreferences, isInsideLesson, mode));
  const [questionNumber, setQuestionNumber] = useState(0);

  const [currentCard, setCurrentCard] = useState(() => reviewer.getNextCard());
  const [wasWrong, setWasWrong] = useState(false);
  const controlRef = useRef<ControlRef>(null);

  const question = useMemo(() => {
    if (!helper || !currentCard) return null;
    const preferences = calculatePreferences(userPreferences, currentCard.record.card.lang);
    if (currentCard.hasGroupViewMode && !currentCard.isViewedInGroup) {
      return {
        type: CardViewMode.groupView,
        content: getCardViewContent(currentCard.record, CardViewMode.groupView, helper, preferences),
      };
    } else if (
      !currentCard.hasGroupViewMode &&
      currentCard.hasIndividualViewMode &&
      !currentCard.isIndividuallyViewed
    ) {
      return {
        type: CardViewMode.individualView,
        content: getCardViewContent(currentCard.record, CardViewMode.individualView, helper, preferences),
      };
    }
    return {
      type: CardViewMode.test,
      content: getCardViewContent(currentCard.record, CardViewMode.test, helper, preferences),
    };
  }, [currentCard, helper, userPreferences]);

  const [isInAnswerReviewMode, setIsInAnswerReviewMode] = useState(false);

  const gotoNextCard = () => {
    if (!currentCard || !question) return;
    const newS = controlRef.current?.getNewS();
    const modifierStates = controlRef.current?.getStates();
    reviewer.markViewed(currentCard, question.type, !wasWrong, undefined, newS, modifierStates);
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

  const testContextRef = useRef<TestContextRef>(null);
  const handleHintClick = () => {
    testContextRef.current?.initiateHint();
  };

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
  const shouldShowLangSwitcher = availableLangs.length > 1;
  const shouldShowSwitcher = canGoToNextCard;
  const shouldShowHint = !canGoToNextCard;

  return (
    <div className='body' style={{ paddingTop: 10, paddingBottom: 10 }}>
      <TranslationLangsProvider translationLangs={availableLangs}>
        <TestContextProvider key={questionNumber} mode={testMode} onResult={handleResult} ref={testContextRef}>
          <WithNextButton
            onClick={onSubmit}
            rest={
              testMode === 'readonly' && currentCard && currentCard.record.card.variants.length > 1 ? (
                <DictionaryIcon card={currentCard.record.card} helper={helper} />
              ) : null
            }
          >
            <div>
              <TopPart
                shouldShowLangSwitcher={shouldShowLangSwitcher}
                shouldShowControls={shouldShowSwitcher}
                shouldShowHint={shouldShowHint}
                onHintClick={handleHintClick}
              />
              <ViewCard>
                <form onSubmit={withNoEventAction(onSubmit)}>
                  <Content content={question.content} />
                </form>
              </ViewCard>
              <CardControls
                ref={controlRef}
                canChange={shouldShowSwitcher}
                card={currentCard}
                isCorrect={!wasWrong}
                mode={question.type}
                reviewer={reviewer}
                helper={helper}
              />
            </div>
          </WithNextButton>
        </TestContextProvider>
      </TranslationLangsProvider>
    </div>
  );
};

interface TopPartProps {
  shouldShowLangSwitcher: boolean;
  shouldShowControls: boolean;
  shouldShowHint: boolean;
  onHintClick?: () => void;
}

const TopPart: FC<TopPartProps> = memo(
  ({ shouldShowLangSwitcher, shouldShowControls, shouldShowHint, onHintClick }) => {
    const langSwitcher = shouldShowLangSwitcher && (
      <div className={styles.transLangsContainer}>
        <TranslationLangSelectorConnected />
      </div>
    );
    const settingsSnap = useSnapshot(settingsState);

    const onToggle = () => {
      settingsState.showControls = !settingsState.showControls;
    };

    const settingsItems: ItemType[] | null = [
      shouldShowControls
        ? {
            label: <Checkbox label='Show controls' checked={settingsSnap.showControls} onClick={onToggle} />,
            key: 'control',
          }
        : null,
    ].filter(isNonNullable);

    const hint = shouldShowHint && (
      <div className={styles.hintContainer}>
        <AntButton onClick={onHintClick}>
          <FormOutlined />
        </AntButton>
      </div>
    );

    const settings = settingsItems.length > 0 && (
      <Dropdown
        menu={{
          items: settingsItems,
        }}
        placement='bottomLeft'
      >
        <AntButton>
          <SettingFilled />
        </AntButton>
      </Dropdown>
    );

    if (!settings && !langSwitcher && !hint) return null;

    return (
      <div className={styles.topContainer}>
        {settings}
        {hint}
        {langSwitcher}
      </div>
    );
  },
);
TopPart.displayName = 'TopPart';

export const ReviewPageLoader = () => {
  const searchParams = new URL(window.location.href).searchParams;
  const mode = searchParams.get('mode');
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
      mode={mode === 'endless' || mode === 'only-new' ? mode : 'normal'}
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
