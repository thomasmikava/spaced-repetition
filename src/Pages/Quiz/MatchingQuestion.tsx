/* eslint-disable sonarjs/cognitive-complexity */
import React, { useEffect, useState } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { QuestionType, AnswerStatus } from '../../api/controllers/questions/question-content.schema';
import type {
  MatchingQuestionDTO,
  MatchingUserInputDTO,
  MatchingUserAnswerDTO,
  MatchingInputItemDTO,
} from '../../api/controllers/questions/question-content.schema';
import type { QuizFormData } from './types';
import { Tooltip } from 'antd';
interface MatchingQuestionProps {
  questionId: number;
  content: MatchingQuestionDTO;
  isReadOnly: boolean;
  processedAnswer?: MatchingUserAnswerDTO;
}

const MatchingQuestion: React.FC<MatchingQuestionProps> = ({ questionId, content, isReadOnly, processedAnswer }) => {
  const { control, setValue, getValues } = useFormContext<QuizFormData>();
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());

  // Watch current form values for this question
  const areCurrentAnswersSet = useWatch({
    control,
    name: `answers.${questionId}`,
    compute: (value) => !!value,
  });

  // Initialize form values if not present
  useEffect(() => {
    if (!areCurrentAnswersSet) {
      const blanks = content.items.filter((e) => e.type === 'blank');
      const answers: MatchingInputItemDTO[] = [];
      blanks.forEach((_, index) => {
        answers.push({ index, value: '', isFirstTrial: true });
      });

      const initialAnswer: MatchingUserInputDTO = {
        type: QuestionType.MATCHING,
        answers,
      };
      setValue(`answers.${questionId}`, initialAnswer);
    }
  }, [questionId, content, areCurrentAnswersSet, setValue]);

  // Calculate usage counts for each option
  const getUsageCounts = (): Map<string, number> => {
    const counts = new Map<string, number>();
    const currentAnswer = getValues(`answers.${questionId}`) as MatchingUserInputDTO | undefined;

    if (currentAnswer && currentAnswer.answers) {
      currentAnswer.answers.forEach((answer) => {
        if (answer.value && answer.value !== '') {
          counts.set(answer.value, (counts.get(answer.value) || 0) + 1);
        }
      });
    }

    return counts;
  };

  // Check if an option is disabled for a specific blank
  const isOptionDisabled = (optionValue: string, currentBlankValue: string): boolean => {
    if (optionValue === currentBlankValue) return false; // Can always select the current value

    const usageCounts = getUsageCounts();
    const currentUsage = usageCounts.get(optionValue) || 0;
    const option = content.answerOptions.find((opt) => opt.value === optionValue);
    const limit = option?.usageLimit || 1;

    return currentUsage >= limit;
  };

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
    const currentValue = getValues(`answers.${questionId}`) as MatchingUserInputDTO;
    if (currentValue && currentValue.answers) {
      const updatedAnswers = [...currentValue.answers];
      const answerIndex = updatedAnswers.findIndex((a) => a.index === blankIndex);
      if (answerIndex !== -1) {
        updatedAnswers[answerIndex] = {
          ...updatedAnswers[answerIndex],
          value: '', // Clear the value when revealed
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

  let blankCounter = 0;

  return (
    <div style={{ lineHeight: 2.2, fontSize: '16px', color: '#e0e0e0' }}>
      {content.items.map((item, itemIndex) => {
        if (item.type === 'text') {
          return <span key={itemIndex}>{item.value}</span>;
        } else if (item.type === 'blank') {
          const blankIndex = blankCounter++;
          const status = getBlankStatus(blankIndex);
          const isRevealed = revealedAnswers.has(blankIndex) || status === AnswerStatus.REVEALED;
          const canBeRevealed = status === AnswerStatus.INCORRECT && !isRevealed;
          const previousAnswer = getPreviousAnswer(blankIndex);
          const correctAnswer = getCorrectAnswer(blankIndex);

          // In read-only mode or if answer is submitted
          if (isReadOnly || (status !== null && !canBeRevealed) || isRevealed) {
            const displayValue = isRevealed
              ? item.correctAnswers[0]
              : status === AnswerStatus.CORRECT || status === AnswerStatus.PARTIAL
                ? previousAnswer
                : previousAnswer || '___';

            const backgroundColor =
              status === AnswerStatus.CORRECT
                ? '#065f46'
                : status === AnswerStatus.PARTIAL
                  ? '#1e3a8a'
                  : status === AnswerStatus.INCORRECT || isRevealed
                    ? '#7f1d1d'
                    : '#374151';

            const borderColor =
              status === AnswerStatus.CORRECT
                ? '#4ade80'
                : status === AnswerStatus.PARTIAL
                  ? '#60a5fa'
                  : status === AnswerStatus.INCORRECT || isRevealed
                    ? '#f87171'
                    : '#6b7280';

            return (
              <span key={itemIndex} style={{ position: 'relative' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    margin: '0 4px',
                    backgroundColor,
                    border: `2px solid ${borderColor}`,
                    borderRadius: '4px',
                    minWidth: '120px',
                    textAlign: 'center',
                  }}
                >
                  {status === AnswerStatus.INCORRECT || status === AnswerStatus.UNANSWERED || isRevealed ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: '#f87171' }}>{displayValue}</span>
                      {' → '}
                      <span style={{ color: '#4ade80', fontWeight: 'bold' }}>
                        {correctAnswer || item.correctAnswers[0]}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: '#e0e0e0' }}>{displayValue}</span>
                  )}
                </span>
                {/* Explanation tooltip */}
                {item.explanation && (status === AnswerStatus.CORRECT || status === AnswerStatus.PARTIAL) && (
                  <Tooltip title={item.explanation}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '50%',
                        fontSize: '12px',
                        lineHeight: '16px',
                        textAlign: 'center',
                        marginLeft: '4px',
                        cursor: 'help',
                      }}
                    >
                      i
                    </span>
                  </Tooltip>
                )}
              </span>
            );
          }

          // Interactive mode - show select dropdown
          return (
            <span key={itemIndex} style={{ position: 'relative' }}>
              <Controller
                name={`answers.${questionId}.answers.${blankIndex}`}
                control={control}
                render={({ field }) => (
                  <>
                    <select
                      value={field.value?.value || ''}
                      onChange={(e) => {
                        const newValue = {
                          index: blankIndex,
                          value: e.target.value,
                          isFirstTrial: field.value?.isFirstTrial ?? !previousAnswer,
                        };

                        // Update the specific answer in the array
                        const currentAnswers = getValues(`answers.${questionId}`) as MatchingUserInputDTO;
                        if (currentAnswers && currentAnswers.answers) {
                          const updatedAnswers = [...currentAnswers.answers];
                          updatedAnswers[blankIndex] = newValue;
                          setValue(`answers.${questionId}`, {
                            ...currentAnswers,
                            answers: updatedAnswers,
                          });
                        }
                      }}
                      disabled={isRevealed}
                      style={{
                        minWidth: '150px',
                        padding: '4px 8px',
                        margin: '0 4px',
                        border: `2px solid ${status === AnswerStatus.INCORRECT ? '#f87171' : '#6b7280'}`,
                        borderRadius: '4px',
                        backgroundColor: '#1f1f1f',
                        color: '#e0e0e0',
                        opacity: 1,
                        fontSize: '14px',
                      }}
                    >
                      <option value=''>--- Select ---</option>
                      {content.answerOptions.map((option, optIdx) => (
                        <option
                          key={optIdx}
                          value={option.value}
                          disabled={isOptionDisabled(option.value, field.value?.value || '')}
                          style={{
                            color: isOptionDisabled(option.value, field.value?.value || '') ? '#6b7280' : '#e0e0e0',
                            backgroundColor: '#1f1f1f',
                          }}
                        >
                          {option.value}
                          {option.usageLimit &&
                            option.usageLimit > 1 &&
                            ` (${Math.max(0, option.usageLimit - (getUsageCounts().get(option.value) || 0))}/${option.usageLimit} left)`}
                        </option>
                      ))}
                    </select>

                    {/* Reveal answer button for incorrect answers */}
                    {status === AnswerStatus.INCORRECT && (
                      <Tooltip title='Reveal answer (forfeit points)'>
                        <button
                          onClick={() => handleRevealAnswer(blankIndex)}
                          style={{
                            marginLeft: '4px',
                            padding: '2px 6px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          ?
                        </button>
                      </Tooltip>
                    )}
                  </>
                )}
              />
            </span>
          );
        }
        return null;
      })}
    </div>
  );
};

export default MatchingQuestion;
