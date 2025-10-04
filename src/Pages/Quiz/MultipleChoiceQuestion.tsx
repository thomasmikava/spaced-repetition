/* eslint-disable sonarjs/cognitive-complexity */
import React, { useEffect, useState } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { Select } from 'antd';
import { QuestionType, AnswerStatus, ChoiceDisplayMode } from '../../api/controllers/questions/question-content.schema';
import type {
  MultipleChoiceQuestionDTO,
  MultipleChoiceUserInputDTO,
  MultipleChoiceUserAnswerDTO,
  MultipleChoiceInputItemDTO,
  MultipleChoiceGroupItemDTO,
} from '../../api/controllers/questions/question-content.schema';
import type { QuizFormData } from './types';
import { renderTextWithLineBreaks } from './common';
import { AnswerDisplay } from './components/AnswerDisplay';
import { RevealButton } from './components/RevealButton';
import { ExplanationTooltip } from './components/ExplanationTooltip';

interface MultipleChoiceQuestionProps {
  questionId: number;
  content: MultipleChoiceQuestionDTO;
  isReadOnly: boolean;
  processedAnswer?: MultipleChoiceUserAnswerDTO;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
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
    if (!areCurrentAnswersSet && !processedAnswer) {
      const choiceGroups = content.items.filter((e) => e.type === 'choice-group');
      const answers: MultipleChoiceInputItemDTO[] = [];
      choiceGroups.forEach((_, index) => {
        answers.push({ index, value: null, isFirstTrial: true });
      });

      const initialAnswer: MultipleChoiceUserInputDTO = {
        type: QuestionType.MULTIPLE_CHOICE,
        answers,
      };
      setValue(`answers.${questionId}`, initialAnswer);
    }
  }, [questionId, content, areCurrentAnswersSet, setValue, processedAnswer]);

  // Get the status of a specific choice group from the processed answer
  const getGroupStatus = (groupIndex: number): AnswerStatus | null => {
    if (!processedAnswer || !processedAnswer.answers) return null;
    const answer = processedAnswer.answers.find((a) => a.index === groupIndex);
    return answer?.status || null;
  };

  // Get the user's previous answer for a choice group
  const getPreviousAnswer = (groupIndex: number): number | number[] | null => {
    if (!processedAnswer || !processedAnswer.answers) return null;
    const answer = processedAnswer.answers.find((a) => a.index === groupIndex);
    return answer?.value ?? null;
  };

  // Get the correct answer for a choice group
  const getCorrectAnswer = (groupIndex: number): number | number[] => {
    if (!processedAnswer || !processedAnswer.answers) return [];
    const answer = processedAnswer.answers.find((a) => a.index === groupIndex);
    return answer?.correctAnswer ?? [];
  };

  // Handle reveal answer
  const handleRevealAnswer = (groupIndex: number) => {
    setRevealedAnswers((prev) => new Set(prev).add(groupIndex));

    const currentValue = getValues(`answers.${questionId}`) as MultipleChoiceUserInputDTO;
    if (currentValue && currentValue.answers) {
      const updatedAnswers = [...currentValue.answers];
      const answerIndex = updatedAnswers.findIndex((a) => a.index === groupIndex);
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

  // Get the default display mode based on selection type
  const getDefaultDisplayMode = (isMultiSelect: boolean): ChoiceDisplayMode => {
    return isMultiSelect ? ChoiceDisplayMode.CHECKBOX : ChoiceDisplayMode.RADIO;
  };

  // Format answer for display
  const formatAnswerForDisplay = (
    value: number | number[] | null,
    options: MultipleChoiceGroupItemDTO['options'],
  ): string => {
    if (value === null) return '(No selection)';
    if (Array.isArray(value)) {
      if (value.length === 0) return '(No selection)';
      return value.map((idx) => options[idx]?.text || '').join(', ');
    }
    return options[value]?.text || '';
  };

  let choiceGroupCounter = 0;

  return (
    <div style={{ lineHeight: 2.2, fontSize: '16px', color: '#e0e0e0' }}>
      {content.items.map((item, itemIndex) => {
        if (item.type === 'text') {
          return (
            <span key={itemIndex} style={{ verticalAlign: 'middle' }}>
              {renderTextWithLineBreaks(item.value)}
            </span>
          );
        } else if (item.type === 'choice-group') {
          const groupIndex = choiceGroupCounter++;
          const status = getGroupStatus(groupIndex);
          const isRevealed = revealedAnswers.has(groupIndex) || status === AnswerStatus.REVEALED;
          const canBeRevealed = status === AnswerStatus.INCORRECT && !isRevealed;
          const previousAnswer = getPreviousAnswer(groupIndex);
          const correctAnswer = getCorrectAnswer(groupIndex);
          const isMultiSelect = item.isMultiSelect ?? false;
          const displayMode = item.displayMode ?? getDefaultDisplayMode(isMultiSelect);
          const isInlineDropdown = item.isInlineDropdown ?? false;

          // In read-only mode or if answer is submitted
          if (isReadOnly || (status !== null && !canBeRevealed) || isRevealed) {
            const userAnswerText = formatAnswerForDisplay(previousAnswer, item.options);
            const correctAnswerText = formatAnswerForDisplay(correctAnswer, item.options);

            return (
              <span
                key={itemIndex}
                style={{
                  position: 'relative',
                  display: displayMode === ChoiceDisplayMode.DROPDOWN && isInlineDropdown ? 'inline-block' : 'block',
                }}
              >
                <AnswerDisplay
                  status={status}
                  isRevealed={isRevealed}
                  userAnswer={userAnswerText}
                  correctAnswer={correctAnswerText}
                  explanation={item.explanation}
                  containerStyle={{
                    position: 'relative',
                    display: displayMode === ChoiceDisplayMode.DROPDOWN && isInlineDropdown ? 'inline-block' : 'block',
                    marginTop: displayMode === ChoiceDisplayMode.DROPDOWN && !isInlineDropdown ? '8px' : '0',
                    marginBottom: displayMode === ChoiceDisplayMode.DROPDOWN && !isInlineDropdown ? '8px' : '0',
                  }}
                  displayStyle={{
                    minWidth: '120px',
                    display: displayMode === ChoiceDisplayMode.DROPDOWN && isInlineDropdown ? 'inline-block' : 'block',
                  }}
                />
                {item.explanation && (status === AnswerStatus.CORRECT || status === AnswerStatus.PARTIAL) && (
                  <ExplanationTooltip explanation={item.explanation} />
                )}
              </span>
            );
          }

          // Interactive mode - show choice group controls
          return (
            <span
              key={itemIndex}
              style={{
                position: 'relative',
                display: displayMode === ChoiceDisplayMode.DROPDOWN && isInlineDropdown ? 'inline-block' : 'block',
                marginTop: displayMode === ChoiceDisplayMode.DROPDOWN && !isInlineDropdown ? '8px' : '0',
                marginBottom: displayMode === ChoiceDisplayMode.DROPDOWN && !isInlineDropdown ? '8px' : '0',
              }}
            >
              <Controller
                name={`answers.${questionId}.answers.${groupIndex}`}
                control={control}
                render={({ field }) => {
                  const currentValue = (field.value as MultipleChoiceInputItemDTO | undefined)?.value ?? null;
                  const isSameAsIncorrect =
                    status === AnswerStatus.INCORRECT &&
                    JSON.stringify(currentValue) === JSON.stringify(previousAnswer);

                  // Render based on display mode
                  if (displayMode === ChoiceDisplayMode.DROPDOWN) {
                    const dropdownOptions = item.options.map((opt, idx) => ({
                      label: opt.text,
                      value: idx,
                    }));

                    return (
                      <span style={{ display: isInlineDropdown ? 'inline-block' : 'block' }}>
                        <Select
                          value={currentValue as number | null}
                          onChange={(value) => {
                            const newValue: MultipleChoiceInputItemDTO = {
                              index: groupIndex,
                              value,
                              isFirstTrial:
                                (field.value as MultipleChoiceInputItemDTO | undefined)?.isFirstTrial ?? true,
                            };
                            field.onChange(newValue);
                          }}
                          options={dropdownOptions}
                          placeholder='Select an option...'
                          style={{
                            minWidth: isInlineDropdown ? '150px' : '100%',
                            maxWidth: isInlineDropdown ? '250px' : '100%',
                          }}
                          status={isSameAsIncorrect ? 'error' : undefined}
                          dropdownStyle={{ backgroundColor: '#1f1f1f', color: '#e0e0e0' }}
                        />
                        {canBeRevealed && (
                          <RevealButton
                            onReveal={() => handleRevealAnswer(groupIndex)}
                            style={{ marginLeft: '8px', verticalAlign: 'middle' }}
                          />
                        )}
                      </span>
                    );
                  }

                  // Radio or Checkbox mode
                  const isCheckbox = displayMode === ChoiceDisplayMode.CHECKBOX;
                  const selectedSet = Array.isArray(currentValue) ? new Set(currentValue) : new Set<number>();
                  const selectedSingle = typeof currentValue === 'number' ? currentValue : null;

                  return (
                    <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                      {item.options.map((option, optIndex) => {
                        const isSelected = isCheckbox ? selectedSet.has(optIndex) : selectedSingle === optIndex;

                        return (
                          <div
                            key={optIndex}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              marginBottom: '6px',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              let newValue: number | number[] | null;

                              if (isCheckbox) {
                                // Multi-select logic
                                const newSet = new Set(selectedSet);
                                if (newSet.has(optIndex)) {
                                  newSet.delete(optIndex);
                                } else {
                                  newSet.add(optIndex);
                                }
                                newValue = Array.from(newSet).sort((a, b) => a - b);
                                if (newValue.length === 0) newValue = null;
                              } else {
                                // Single-select logic
                                newValue = isSelected ? null : optIndex;
                              }

                              const newAnswer: MultipleChoiceInputItemDTO = {
                                index: groupIndex,
                                value: newValue,
                                isFirstTrial:
                                  (field.value as MultipleChoiceInputItemDTO | undefined)?.isFirstTrial ?? true,
                              };
                              field.onChange(newAnswer);
                            }}
                          >
                            <div
                              style={{
                                width: '20px',
                                height: '20px',
                                border: `2px solid ${isSameAsIncorrect && isSelected ? '#f87171' : '#6b7280'}`,
                                borderRadius: isCheckbox ? '4px' : '50%',
                                backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                                marginRight: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {isSelected && (
                                <div
                                  style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#fff',
                                    borderRadius: isCheckbox ? '2px' : '50%',
                                  }}
                                />
                              )}
                            </div>
                            <span style={{ color: '#e0e0e0' }}>{option.text}</span>
                          </div>
                        );
                      })}
                      {canBeRevealed && (
                        <div style={{ marginTop: '8px' }}>
                          <RevealButton onReveal={() => handleRevealAnswer(groupIndex)} />
                        </div>
                      )}
                    </div>
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

export default MultipleChoiceQuestion;
