/* eslint-disable sonarjs/cognitive-complexity */
import React, { useEffect, useState } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import {
  QuestionType,
  AnswerStatus,
  FillBlanksInputSize,
} from '../../api/controllers/questions/question-content.schema';
import type {
  FillBlanksQuestionDTO,
  FillBlanksUserInputDTO,
  FillBlanksUserAnswerDTO,
  FillBlanksInputItemDTO,
  FillBlanksMissingItem,
} from '../../api/controllers/questions/question-content.schema';
import type { QuizFormData } from './types';
import { getMinimalChange } from '../../utils/hint';
import { isNonNullable } from '../../utils/array';
import { renderTextWithLineBreaks } from './common';
import { AnswerDisplay } from './components/AnswerDisplay';
import { RevealButton } from './components/RevealButton';
import { HintButton } from './components/HintButton';

interface FillBlanksQuestionProps {
  questionId: number;
  content: FillBlanksQuestionDTO;
  isReadOnly: boolean;
  processedAnswer?: FillBlanksUserAnswerDTO;
}

const FillBlanksQuestion: React.FC<FillBlanksQuestionProps> = ({
  questionId,
  content,
  isReadOnly,
  processedAnswer,
}) => {
  const { control, setValue, getValues } = useFormContext<QuizFormData>();
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());

  // Watch current form values for this question
  const areCurrentAnswersSet = useWatch({
    control,
    name: `answers.${questionId}`,
    compute: (value) => !!value,
  });

  // Initialize form values if not present
  // Skip initialization if processedAnswer exists (means parent will populate it)
  useEffect(() => {
    if (!areCurrentAnswersSet && !processedAnswer) {
      const blanks = content.items.filter((e) => e.type === 'missing');
      const answers: FillBlanksInputItemDTO[] = [];
      blanks.forEach((_, index) => {
        answers.push({ index, value: '', isFirstTrial: true });
      });

      const initialAnswer: FillBlanksUserInputDTO = {
        type: QuestionType.FILL_BLANKS,
        answers,
      };
      setValue(`answers.${questionId}`, initialAnswer);
    }
  }, [questionId, content, areCurrentAnswersSet, setValue, processedAnswer]);

  // Get the status of a specific blank from the processed answer
  const getBlankStatus = (blankIndex: number): AnswerStatus | null => {
    if (!processedAnswer || !processedAnswer.answers) return null;
    const answer = processedAnswer.answers.find((a) => a.index === blankIndex);
    return answer?.status || null;
  };

  // Get the user's previous answer for a blank
  const getPreviousAnswer = (blankIndex: number): string => {
    if (!processedAnswer || !processedAnswer.answers) return '';
    const answer = processedAnswer.answers.find((a) => a.index === blankIndex);
    return answer?.value || '';
  };

  // Get the correct answer for a blank
  const getCorrectAnswer = (blankIndex: number): string => {
    if (!processedAnswer || !processedAnswer.answers) return '';
    const answer = processedAnswer.answers.find((a) => a.index === blankIndex);
    return answer?.correctAnswer || '';
  };

  // Handle reveal answer
  const handleRevealAnswer = (blankIndex: number) => {
    setRevealedAnswers((prev) => new Set(prev).add(blankIndex));

    // Update form value to mark this as revealed
    const currentValue = getValues(`answers.${questionId}`) as FillBlanksUserInputDTO;
    if (currentValue && currentValue.answers) {
      const updatedAnswers = [...currentValue.answers].filter(isNonNullable);
      const answerIndex = updatedAnswers.findIndex((a) => a.index === blankIndex);
      if (answerIndex !== -1) {
        updatedAnswers[answerIndex] = {
          ...updatedAnswers[answerIndex],
          isRevealed: true,
          isFirstTrial: false,
        };
        setValue(`answers.${questionId}`, {
          ...currentValue,
          answers: updatedAnswers,
        });
      }
    }
  };

  // Handle hint
  const handleHint = (blankIndex: number, onChange: (value: FillBlanksInputItemDTO) => void) => {
    const currentValue = getValues(`answers.${questionId}`) as FillBlanksUserInputDTO;
    if (currentValue && currentValue.answers) {
      const currentAnswer = currentValue.answers.filter(isNonNullable).find((a) => a.index === blankIndex);
      const userInput = currentAnswer?.value || '';

      // Get the correct answers for this blank
      const blankItem = content.items.filter((item): item is FillBlanksMissingItem => item.type === 'missing')[
        blankIndex
      ];
      const correctAnswers = blankItem?.officialAnswers || [];

      // Call getMinimalChange with case sensitive (false) and no prefixes (empty array)
      const hint = getMinimalChange(userInput, correctAnswers, false, []);
      if (userInput === hint) {
        // No further hint available since user input is the same as correct answer
        handleRevealAnswer(blankIndex);
        return;
      }

      // Update the form value with the hint
      const updatedAnswers = [...currentValue.answers].filter(isNonNullable);
      const answerIndex = updatedAnswers.findIndex((a) => a.index === blankIndex);
      if (answerIndex !== -1) {
        updatedAnswers[answerIndex] = {
          ...updatedAnswers[answerIndex],
          value: hint,
          isFirstTrial: false,
        };
        setValue(`answers.${questionId}`, {
          ...currentValue,
          answers: updatedAnswers,
        });
        onChange(updatedAnswers[answerIndex]);
      }
    }
  };

  // Helper function to get input width based on size
  const getInputWidth = (size?: FillBlanksInputSize): string => {
    switch (size) {
      case FillBlanksInputSize.SMALL:
        return '50px';
      case FillBlanksInputSize.LARGE:
        return '100%';
      case FillBlanksInputSize.MEDIUM:
      default:
        return '120px';
    }
  };

  let blankCounter = 0;

  return (
    <div style={{ lineHeight: 2.2, fontSize: '16px', color: '#e0e0e0' }}>
      {content.items.map((item, itemIndex) => {
        if (item.type === 'text') {
          return (
            <span key={itemIndex} style={{ verticalAlign: 'middle' }}>
              {renderTextWithLineBreaks(item.value)}
            </span>
          );
        } else if (item.type === 'missing') {
          const blankIndex = blankCounter++;
          const status = getBlankStatus(blankIndex);
          const isRevealed = revealedAnswers.has(blankIndex) || status === AnswerStatus.REVEALED;
          const canBeRevealed = status === AnswerStatus.INCORRECT && !isRevealed;
          const previousAnswer = getPreviousAnswer(blankIndex);
          const correctAnswer = getCorrectAnswer(blankIndex);
          const inputWidth = getInputWidth(item.size);

          // In read-only mode or if answer is submitted
          if (isReadOnly || (status !== null && !canBeRevealed) || isRevealed) {
            const displayedCorrectAnswer = correctAnswer || item.officialAnswers[0];

            return (
              <AnswerDisplay
                key={itemIndex}
                status={status}
                isRevealed={isRevealed}
                userAnswer={previousAnswer}
                correctAnswer={displayedCorrectAnswer}
                explanation={item.explanation}
                containerStyle={{
                  position: 'relative',
                  display: item.size === FillBlanksInputSize.LARGE ? 'block' : 'inline',
                }}
                displayStyle={{
                  minWidth: item.size === FillBlanksInputSize.LARGE ? 'auto' : '60px',
                  width: item.size === FillBlanksInputSize.LARGE ? '100%' : 'auto',
                  display: item.size === FillBlanksInputSize.LARGE ? 'block' : 'inline-block',
                }}
              />
            );
          }

          // Interactive mode - show input field
          return (
            <span
              key={itemIndex}
              style={{ position: 'relative', display: item.size === FillBlanksInputSize.LARGE ? 'block' : 'inline' }}
            >
              <Controller
                name={`answers.${questionId}.answers.${blankIndex}`}
                control={control}
                render={({ field }) => {
                  const isSameAsIncorrect = status === AnswerStatus.INCORRECT && field.value?.value === previousAnswer;

                  const inputStyle: React.CSSProperties = {
                    width: inputWidth,
                    padding: '4px 8px',
                    margin: item.size === FillBlanksInputSize.LARGE ? '4px 0' : '0 4px',
                    border: `2px solid ${isSameAsIncorrect ? '#f87171' : '#6b7280'}`,
                    borderRadius: '4px',
                    backgroundColor: '#1f1f1f',
                    color: '#e0e0e0',
                    opacity: 1,
                    fontSize: '14px',
                    display: item.size === FillBlanksInputSize.LARGE ? 'block' : 'inline-block',
                    verticalAlign: 'middle',
                  };

                  const isLargeInput = item.size === FillBlanksInputSize.LARGE;

                  // Common input element
                  const inputElement = (
                    <input
                      type='text'
                      value={(field.value as FillBlanksInputItemDTO | undefined)?.value || ''}
                      onChange={(e) => {
                        const newValue: FillBlanksInputItemDTO = {
                          index: blankIndex,
                          value: e.target.value,
                          isFirstTrial:
                            (field.value as FillBlanksInputItemDTO | undefined)?.isFirstTrial ?? !previousAnswer,
                        };
                        field.onChange(newValue);
                      }}
                      style={isLargeInput ? { ...inputStyle, flex: 1, margin: 0 } : inputStyle}
                    />
                  );

                  // Common buttons element
                  const buttonsElement = (
                    <div
                      style={{
                        gap: '4px',
                        verticalAlign: 'middle',
                        ...(isLargeInput ? { flexShrink: 0, display: 'flex' } : { display: 'inline-flex' }),
                      }}
                    >
                      {/* Hint button - shown for all inputs */}
                      <HintButton
                        onHint={() => handleHint(blankIndex, field.onChange)}
                        style={isLargeInput ? {} : { marginLeft: '4px', verticalAlign: 'middle' }}
                      />

                      {/* Reveal button - only for incorrect answers */}
                      {status === AnswerStatus.INCORRECT && (
                        <RevealButton
                          onReveal={() => handleRevealAnswer(blankIndex)}
                          style={isLargeInput ? {} : { marginLeft: '4px', verticalAlign: 'middle' }}
                        />
                      )}
                    </div>
                  );

                  // For large inputs, use flexbox layout to keep buttons on the same line
                  if (isLargeInput) {
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                        {inputElement}
                        {buttonsElement}
                      </div>
                    );
                  }

                  // For small and medium inputs, use the original layout
                  return (
                    <>
                      {inputElement}
                      {buttonsElement}
                    </>
                  );
                }}
              />
            </span>
          );
        }
        return null;
      })}
    </div>
  );
};

export default FillBlanksQuestion;
