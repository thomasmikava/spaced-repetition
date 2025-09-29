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
} from '../../api/controllers/questions/question-content.schema';
import type { QuizFormData } from './types';
import { Tooltip } from 'antd';
import { getMinimalChange } from '../../utils/hint';

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
  useEffect(() => {
    if (!areCurrentAnswersSet) {
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
  }, [questionId, content, areCurrentAnswersSet, setValue]);

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
      const updatedAnswers = [...currentValue.answers];
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
      const currentAnswer = currentValue.answers.find((a) => a.index === blankIndex);
      const userInput = currentAnswer?.value || '';

      // Get the correct answers for this blank
      const blankItem = content.items.filter((item) => item.type === 'missing')[blankIndex];
      const correctAnswers = blankItem?.officialAnswers || [];

      // Call getMinimalChange with case sensitive (false) and no prefixes (empty array)
      const hint = getMinimalChange(userInput, correctAnswers, false, []);
      console.log('hint', hint);

      // Update the form value with the hint
      const updatedAnswers = [...currentValue.answers];
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

  // Helper function to render text with line breaks
  const renderTextWithLineBreaks = (text: string) => {
    return text.split('\n').map((line, index, array) => (
      <React.Fragment key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  let blankCounter = 0;

  return (
    <div style={{ lineHeight: 2.2, fontSize: '16px', color: '#e0e0e0' }}>
      {content.items.map((item, itemIndex) => {
        if (item.type === 'text') {
          return <span key={itemIndex}>{renderTextWithLineBreaks(item.value)}</span>;
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
            const emptyValue = Symbol();
            const displayValue = isRevealed
              ? previousAnswer || emptyValue
              : status === AnswerStatus.CORRECT || status === AnswerStatus.PARTIAL
                ? previousAnswer
                : previousAnswer || emptyValue;

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

            const spanStyle = {
              padding: '2px 4px',
              margin: '1px 4px',
              backgroundColor,
              border: `2px solid ${borderColor}`,
              borderRadius: '4px',
              minWidth: item.size === FillBlanksInputSize.LARGE ? 'auto' : '60px',
              width: item.size === FillBlanksInputSize.LARGE ? '100%' : 'auto',
              display: item.size === FillBlanksInputSize.LARGE ? 'block' : 'inline-block',
              textAlign: 'center' as const,
              wordBreak: 'keep-all' as const,
            };

            return (
              <span
                key={itemIndex}
                style={{ position: 'relative', display: item.size === FillBlanksInputSize.LARGE ? 'block' : 'inline' }}
              >
                <span
                  style={spanStyle}
                  data-status={isRevealed ? AnswerStatus.REVEALED : status || AnswerStatus.UNANSWERED}
                >
                  {status === AnswerStatus.INCORRECT || status === AnswerStatus.UNANSWERED || isRevealed ? (
                    <>
                      <span
                        style={{
                          textDecoration: displayValue !== emptyValue ? 'line-through' : 'none',
                          color: '#f87171',
                        }}
                        datatype='user-incorrect-answer'
                      >
                        {displayValue === emptyValue ? '___' : displayValue}
                      </span>
                      {' → '}
                      <span style={{ color: '#4ade80', fontWeight: 'bold' }} datatype='correct-answer'>
                        {correctAnswer || item.officialAnswers[0]}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: '#e0e0e0' }}>{displayValue === emptyValue ? '___' : displayValue}</span>
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
                      aria-description={item.explanation}
                      datatype='explanation-icon'
                    >
                      i
                    </span>
                  </Tooltip>
                )}
              </span>
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

                  const inputStyle = {
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
                  };

                  return (
                    <>
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
                        style={inputStyle}
                      />

                      {/* Hint and Reveal buttons for incorrect answers */}
                      {status === AnswerStatus.INCORRECT && (
                        <>
                          <Tooltip title='Get a hint'>
                            <button
                              onClick={() => handleHint(blankIndex, field.onChange)}
                              style={{
                                marginLeft: '4px',
                                padding: '2px 6px',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                verticalAlign: 'middle',
                                lineHeight: '20px',
                                minWidth: '24px',
                              }}
                              aria-description='Get a hint'
                            >
                              💡
                            </button>
                          </Tooltip>

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
                                verticalAlign: 'middle',
                                lineHeight: '20px',
                                minWidth: '24px',
                              }}
                              aria-description='Reveal answer (forfeit points)'
                            >
                              ?
                            </button>
                          </Tooltip>
                        </>
                      )}
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
