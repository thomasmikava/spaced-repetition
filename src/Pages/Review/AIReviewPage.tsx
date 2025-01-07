import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ReviewBlock } from '../../api/controllers/history/history.schema';
import { useUserPreferences } from '../../api/controllers/users/users.query';
import type { UserPreferencesDTO } from '../../api/controllers/users/users.schema';
import cssModule from '../../App.module.css';
import AntButton from 'antd/es/button';
import Content from '../../Content';
import type { TestContextRef } from '../../contexts/testContext';
import { TestContextProvider } from '../../contexts/testContext';
import { TranslationLangsProvider } from '../../contexts/TranslationLangs';
import type { IdType, StandardCard } from '../../database/types';
import { SPECIAL_VIEW_IDS } from '../../functions/consts';
import type { Helper } from '../../functions/generate-card-content';
import { Reviewer } from '../../functions/reviewer';
import type { AnyReviewHistory } from '../../functions/reviews';
import { CardViewMode, type StandardTestableCard } from '../../functions/reviews';
import { withNoEventAction } from '../../utils/event';
import { useHelper } from '../hooks/text-helpers';
import LoadingPage from '../Loading/LoadingPage';
import type { ControlRef } from './Controls';
import { CardControls } from './Controls';
import { DictionaryIcon } from './DictionaryIcon';
import { TopPart } from './TopPart';
import { useWords } from './useWords';
import { WithNextButton } from './WithNextButton';
import type {
  GetDynamicQuestionReqDTO,
  GetDynamicQuestionResDTO,
} from '../../api/controllers/dynamic-questions/dynamic-questions.schema';
import { useDynamicQuestion } from '../../api/controllers/dynamic-questions/dynamic-questions.query';
import type { AnyContent } from '../../content-types';
import { calculatePreferences, type Preferences } from '../../functions/preferences';
import { getHintPrefixes } from '../../functions/hint-prefixes';
import { isNonNullable, uniquelize } from '../../utils/array';

interface ReviewPageProps {
  mode: 'normal' | 'endless' | 'only-new';
  words: StandardCard[];
  isInsideLesson: boolean;
  helper: NonNullable<ReturnType<typeof useHelper>>;
  userPreferences: UserPreferencesDTO | null;
}

type VariantData = GetDynamicQuestionReqDTO & { regIndex?: number };

const AIReviewPage: FC<ReviewPageProps> = ({ helper, isInsideLesson, mode, words, userPreferences }) => {
  const [reviewer] = useState(() => new Reviewer(words, helper, ReviewBlock.AI, userPreferences, isInsideLesson, mode));
  const [questionNumber, setQuestionNumber] = useState(0);

  const [currentCard, setCurrentCard] = useState(() => reviewer.getNextCard());
  const [variantData, setVariantData] = useState<VariantData | null>(null);
  const [wasWrong, setWasWrong] = useState(false);
  const controlRef = useRef<ControlRef>(null);
  const { data: dynamicQuestionData, isPending, error: dynamicQuestionError } = useDynamicQuestion(variantData);

  const handleRegeneration = () => {
    setVariantData((current) =>
      !current
        ? null
        : current.regIndex === undefined
          ? { ...current, regIndex: 1 }
          : { ...current, regIndex: current.regIndex + 1 },
    );
    setIsInAnswerReviewMode(false);
  };

  useEffect(() => {
    if (!helper || !currentCard || !userPreferences) return;
    if (currentCard) {
      setVariantData(
        getVariantData({ testableCard: currentCard.record, helper, historyRecord: currentCard.historyRecord }),
      );
    }
  }, [helper, userPreferences, currentCard]);

  const question = useMemo(() => {
    if (!helper || !currentCard || !variantData || !dynamicQuestionData || isPending || dynamicQuestionError)
      return null;

    const preferences = calculatePreferences(userPreferences, currentCard.record.card.lang);

    return {
      type: CardViewMode.test,
      content: getCardViewContent(currentCard.record, dynamicQuestionData, variantData, preferences),
    };
  }, [currentCard, helper, isPending, userPreferences, variantData, dynamicQuestionError, dynamicQuestionData]);

  const [isInAnswerReviewMode, setIsInAnswerReviewMode] = useState(false);

  const gotoNextCard = () => {
    if (!currentCard || !question) return;
    const newS = controlRef.current?.getNewS();
    const modifierStates = controlRef.current?.getStates();
    reviewer.markViewed(ReviewBlock.AI, currentCard, question.type, !wasWrong, undefined, newS, modifierStates);
    const nextCard = reviewer.getNextCard();
    setVariantData(null);
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

  const isView = false;
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

  if (!isPending && dynamicQuestionError) {
    console.error(dynamicQuestionError);
    return <div className='body'>Error getting dynamic question...</div>;
  }

  if (!variantData || isPending) {
    return <div className='body'>Loading...</div>;
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
        <TestContextProvider
          key={`${questionNumber}_${variantData.regIndex ?? 0}`}
          mode={testMode}
          onResult={handleResult}
          ref={testContextRef}
        >
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
                additionalButton={<AntButton onClick={handleRegeneration}>Regenerate sentence</AntButton>}
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
                reviewBlock={ReviewBlock.AI}
                isStateModifierHidden
              />
            </div>
          </WithNextButton>
        </TestContextProvider>
      </TranslationLangsProvider>
    </div>
  );
};

export const AIReviewPageLoader = () => {
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
    <AIReviewPage
      mode={mode === 'endless' || mode === 'only-new' ? mode : 'normal'}
      words={words}
      helper={helper}
      isInsideLesson={!!courseId && !!lessonId}
      userPreferences={userPreferences.result}
    />
  );
};

const ViewCard = ({ children }: { children: React.ReactNode }) => {
  return <div className={cssModule.viewCard}>{children}</div>;
};

const getVariantData = ({
  testableCard,
  helper,
  historyRecord,
}: {
  testableCard: StandardTestableCard;
  historyRecord: AnyReviewHistory | undefined;
  helper: Helper;
}): VariantData => {
  const translation = testableCard.specificTranslation ?? { lang: testableCard.card.lang, text: '' };
  return {
    fill: testableCard.groupMeta.testViewId === SPECIAL_VIEW_IDS.inverseTest ? 'transLang' : 'originalLang',
    lang: testableCard.card.lang,
    transLang: translation.lang,
    transText: translation.text,
    typeOfSpeech:
      helper.getCardType(testableCard.card.mainType ?? testableCard.card.type, testableCard.card.lang)?.name ?? '',
    variant: testableCard.variant.category === 1 ? testableCard.card.value : testableCard.variant.value,
    tags: getTags(testableCard, helper),
    wordId: testableCard.card.id,
    testKey: testableCard.testKey,
    trial: historyRecord?.rep ?? 0,
  };
};

const getTags = (record: StandardTestableCard, helper: Helper) => {
  const tags: { name: string; value: string }[] = [];

  let attributes = record.variant.attrs;

  if (record.variant.category === 1) {
    const configuration = helper.getCardType(record.card.mainType ?? record.card.type, record.card.lang)?.configuration;
    if (configuration?.initialCardTags) {
      for (const tag of configuration.initialCardTags) {
        tags.push({ name: tag, value: '' });
      }
    }
    if (configuration?.initialCardAttrs) {
      attributes = { ...configuration.initialCardAttrs, ...attributes };
    }
  }

  const getAttrInfo = (attrId: IdType | string, value: IdType) => {
    const attr = helper.getAttribute(attrId, record.card.lang);
    if (!attr) return null;
    const attrRecord = helper.getAttributeRecord(value, record.card.lang);
    if (!attrRecord) return null;
    return { name: attr.name, value: attrRecord.name };
  };
  if (attributes) {
    for (const id in attributes) {
      const attr = attributes[id];
      const info = getAttrInfo(id, attr);
      if (!info) continue;
      tags.push(info);
    }
  }

  return tags;
};

export const getCardViewContent = (
  record: StandardTestableCard,
  dynamicQuestionData: GetDynamicQuestionResDTO,
  varitantData: VariantData,
  preferences: Preferences,
): (AnyContent | null | undefined)[] => {
  if (varitantData.fill === 'originalLang') {
    const { parts, sentence } = processAsteriskParts(dynamicQuestionData.text);
    const correctAnswer = parts.join(' ');
    const otherCorrectValues = dynamicQuestionData.possibleValues?.map((x) => x.join(' ')) ?? [];
    const hintPrefixes = getHintPrefixes(record.card.mainType ?? record.card.type, record.card.lang);
    return [
      {
        type: 'paragraph',
        content: sentence,
        style: { fontSize: '1.5em', marginTop: 0 },
      },
      {
        type: 'paragraph',
        content: dynamicQuestionData.translatedText,
        style: { fontSize: '1.5em' },
      },
      {
        type: 'input',
        inputId: '1',
        autoFocus: true,
        caseInsensitive: !record.caseSensitive,
        placeholder: 'Type your answer here',
        style: { textAlign: 'center' },
        correctValues: [correctAnswer, ...otherCorrectValues],
        autoCheck: preferences.autoSubmitCorrectAnswers,
        fullWidth: true,
        shouldNotReplaceWithCorrectAnswer: false,
        hintPrefixes,
      },
      {
        type: 'afterAnswer',
        content: [
          { type: 'hr' },
          { type: 'paragraph', content: record.specificTranslation?.text || '', style: { fontSize: '1.2em' } },
        ],
      },
    ];
  } else {
    const { parts, sentence } = processAsteriskParts(dynamicQuestionData.translatedText);
    const correctAnswer = parts.join(' ');
    const otherCorrectValues = dynamicQuestionData.possibleValues?.map((x) => x.join(' ')) ?? [];
    const hintPrefixes = uniquelize(
      record.card.translations
        .flatMap((e) => getHintPrefixes(record.card.mainType ?? record.card.type, e.lang))
        .filter(isNonNullable),
    );
    return [
      {
        type: 'paragraph',
        content: dynamicQuestionData.text,
        style: { fontSize: '1.5em', marginTop: 0 },
      },
      {
        type: 'paragraph',
        content: sentence,
        style: { fontSize: '1.5em' },
      },
      {
        type: 'input',
        inputId: '1',
        autoFocus: true,
        caseInsensitive: !record.caseSensitive,
        placeholder: 'Type your answer here',
        style: { textAlign: 'center' },
        correctValues: [correctAnswer, ...otherCorrectValues],
        autoCheck: preferences.autoSubmitCorrectAnswers,
        fullWidth: true,
        shouldNotReplaceWithCorrectAnswer: false,
        hintPrefixes,
      },
      {
        type: 'afterAnswer',
        content: [
          { type: 'hr' },
          { type: 'paragraph', content: record.specificTranslation?.text || '', style: { fontSize: '1.2em' } },
        ],
      },
    ];
  }
};

function processAsteriskParts(input: string): { sentence: string; parts: string[] } {
  const parts: string[] = [];
  const sentence = input.replace(/\*(.*?)\*/g, (_, match) => {
    parts.push(match.trim());
    return '___';
  });
  return { sentence, parts };
}
