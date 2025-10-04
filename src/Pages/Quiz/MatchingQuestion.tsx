/* eslint-disable sonarjs/cognitive-complexity */
import React, { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { QuestionType, AnswerStatus } from '../../api/controllers/questions/question-content.schema';
import type {
  MatchingQuestionDTO,
  MatchingUserInputDTO,
  MatchingUserAnswerDTO,
  MatchingInputItemDTO,
  MatchingAnswerOptionDTO,
} from '../../api/controllers/questions/question-content.schema';
import type { QuizFormData } from './types';
import { isNonNullable } from '../../utils/array';
import { renderTextWithLineBreaks } from './common';

interface MatchingQuestionProps {
  questionId: number;
  content: MatchingQuestionDTO;
  isReadOnly: boolean;
  processedAnswer?: MatchingUserAnswerDTO;
}

// Draggable answer option component
const DraggableOption: React.FC<{
  value: string;
  usageLimit?: number | null;
  currentUsage: number;
  isDisabled: boolean;
}> = ({ value, usageLimit, currentUsage, isDisabled }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `option-${value}`,
    data: { value, fromPool: true },
    disabled: isDisabled,
  });

  // undefined means 1, null means infinite
  const effectiveLimit = usageLimit === undefined ? 1 : usageLimit;
  const remaining = effectiveLimit !== null ? Math.max(0, effectiveLimit - currentUsage) : 0;
  const showCount = effectiveLimit !== null && effectiveLimit > 1;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        display: 'inline-block',
        padding: '8px 12px',
        margin: '4px',
        backgroundColor: isDisabled ? '#374151' : '#1e40af',
        color: isDisabled ? '#6b7280' : '#e0e0e0',
        border: '2px solid',
        borderColor: isDisabled ? '#4b5563' : '#3b82f6',
        borderRadius: '6px',
        cursor: isDisabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
        opacity: isDisabled ? 0.5 : isDragging ? 0.5 : 1,
        userSelect: 'none',
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      {value}
      {showCount && (
        <span
          style={{
            marginLeft: '6px',
            fontSize: '12px',
            color: isDisabled ? '#6b7280' : '#93c5fd',
          }}
        >
          ({remaining})
        </span>
      )}
    </div>
  );
};

// Droppable blank zone component
const DroppableBlank: React.FC<{
  blankIndex: number;
  selectedValue: string;
  status: AnswerStatus | null;
  isRevealed: boolean;
  canBeRevealed: boolean;
  previousAnswer: string;
  correctAnswer: string;
  correctAnswers: string[];
  explanation?: string;
  isReadOnly: boolean;
  onReveal: () => void;
  onClick: () => void;
}> = ({
  blankIndex,
  selectedValue,
  status,
  isRevealed,
  canBeRevealed,
  previousAnswer,
  correctAnswer,
  correctAnswers,
  explanation,
  isReadOnly,
  onReveal,
  onClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `blank-${blankIndex}`,
    data: { blankIndex },
    disabled: isReadOnly || isRevealed,
  });

  // Make the filled value draggable
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: `filled-blank-${blankIndex}`,
    data: { value: selectedValue, fromBlank: blankIndex },
    disabled: isReadOnly || isRevealed || !selectedValue || selectedValue === '',
  });

  // Read-only mode or submitted answer (locked in)
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

    return (
      <span style={{ position: 'relative', display: 'inline-block' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '0px 12px',
            margin: '2px 4px',
            backgroundColor,
            border: `2px solid ${borderColor}`,
            borderRadius: '4px',
            minWidth: '120px',
            textAlign: 'center',
          }}
        >
          {status === AnswerStatus.INCORRECT || status === AnswerStatus.UNANSWERED || isRevealed ? (
            <>
              <span style={{ textDecoration: displayValue !== emptyValue ? 'line-through' : 'none', color: '#f87171' }}>
                {displayValue === emptyValue ? '___' : displayValue}
              </span>
              {' → '}
              <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{correctAnswer || correctAnswers[0]}</span>
            </>
          ) : (
            <span style={{ color: '#e0e0e0' }}>{displayValue === emptyValue ? '___' : displayValue}</span>
          )}
        </span>
        {explanation && (status === AnswerStatus.CORRECT || status === AnswerStatus.PARTIAL) && (
          <Tooltip title={explanation}>
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

  // Interactive mode - droppable zone
  const hasValue = selectedValue && selectedValue !== '';
  // Only show red border if status is incorrect AND value hasn't changed
  const showIncorrectBorder = status === AnswerStatus.INCORRECT && selectedValue === previousAnswer;

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span
        ref={setNodeRef}
        style={{
          display: 'inline-block',
          position: 'relative',
          minWidth: '120px',
        }}
      >
        {hasValue ? (
          <span
            ref={setDraggableRef}
            {...attributes}
            {...listeners}
            style={{
              display: 'inline-block',
              width: '100%',
              padding: '0px 12px',
              backgroundColor: isOver ? '#1e3a8a' : '#1e40af',
              border: `2px solid ${showIncorrectBorder ? '#f87171' : isOver ? '#60a5fa' : '#3b82f6'}`,
              borderRadius: '4px',
              color: '#e0e0e0',
              textAlign: 'center',
              fontSize: '14px',
              transition: 'all 0.2s',
              opacity: isDragging ? 0.5 : 1,
              cursor: 'grab',
              userSelect: 'none',
              boxSizing: 'border-box',
            }}
            onClick={onClick}
          >
            {selectedValue}
          </span>
        ) : (
          <span
            onClick={onClick}
            style={{
              display: 'inline-block',
              padding: '0px 12px',
              margin: '2px 4px',
              minWidth: '120px',
              backgroundColor: isOver ? '#1e3a8a' : '#1f1f1f',
              border: `2px solid ${isOver ? '#60a5fa' : '#6b7280'}`,
              borderRadius: '4px',
              color: '#e0e0e0',
              textAlign: 'center',
              fontSize: '14px',
              transition: 'all 0.2s',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            --- Drop ---
          </span>
        )}
      </span>
      {canBeRevealed && (
        <Tooltip title='Reveal answer (forfeit points)'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReveal();
            }}
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
    </span>
  );
};

const MatchingQuestion: React.FC<MatchingQuestionProps> = ({ questionId, content, isReadOnly, processedAnswer }) => {
  const { setValue, getValues } = useFormContext<QuizFormData>();
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeValue, setActiveValue] = useState<string>('');
  const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});

  // Watch current form values for this question
  const areCurrentAnswersSet = useWatch({
    name: `answers.${questionId}`,
    compute: (value) => !!value,
  });

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor),
  );

  // Initialize form values if not present
  // Skip initialization if processedAnswer exists (means parent will populate it)
  useEffect(() => {
    if (!areCurrentAnswersSet && !processedAnswer) {
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
  }, [questionId, content, areCurrentAnswersSet, setValue, processedAnswer]);

  // Calculate usage counts for each option
  const getUsageCounts = (): Map<string, number> => {
    const counts = new Map<string, number>();
    const currentAnswer = getValues(`answers.${questionId}`) as MatchingUserInputDTO | undefined;

    if (currentAnswer?.answers) {
      currentAnswer.answers.filter(isNonNullable).forEach((answer) => {
        if (answer.value && answer.value !== '') {
          counts.set(answer.value, (counts.get(answer.value) || 0) + 1);
        }
      });
    }

    return counts;
  };

  // Check if an option is disabled (accounting for current blank's usage)
  const isOptionDisabled = (optionValue: string, excludeBlankIndex?: number): boolean => {
    const option = content.answerOptions.find((opt) => opt.value === optionValue);
    const limit = option?.usageLimit;

    // If usageLimit is null, option is never disabled (unlimited usage)
    // If usageLimit is undefined, treat it as 1 (default)
    if (limit === null) {
      return false;
    }

    const effectiveLimit = limit === undefined ? 1 : limit;
    const usageCounts = getUsageCounts();
    let currentUsage = usageCounts.get(optionValue) || 0;

    // Exclude current blank's usage if specified (for dropdown menu)
    if (excludeBlankIndex !== undefined) {
      const currentAnswer = getValues(`answers.${questionId}`) as MatchingUserInputDTO | undefined;
      const blank = currentAnswer?.answers?.[excludeBlankIndex];
      if (blank?.value === optionValue) {
        currentUsage--;
      }
    }

    return currentUsage >= effectiveLimit;
  };

  // Get the status of a specific blank from the processed answer
  const getBlankStatus = (blankIndex: number): AnswerStatus | null => {
    if (!processedAnswer?.answers) return null;
    const answer = processedAnswer.answers.find((a) => a.index === blankIndex);
    return answer?.status || null;
  };

  // Get the user's previous answer for a blank
  const getPreviousAnswer = (blankIndex: number): string => {
    if (!processedAnswer?.answers) return '';
    const answer = processedAnswer.answers.find((a) => a.index === blankIndex);
    return answer?.value || '';
  };

  // Get the correct answer for a blank
  const getCorrectAnswer = (blankIndex: number): string => {
    if (!processedAnswer?.answers) return '';
    const answer = processedAnswer.answers.find((a) => a.index === blankIndex);
    return answer?.correctAnswer || '';
  };

  // Update a blank's value
  const updateBlankValue = (blankIndex: number, newValue: string) => {
    const currentAnswer = getValues(`answers.${questionId}`) as MatchingUserInputDTO;
    if (currentAnswer?.answers) {
      const updatedAnswers = [...currentAnswer.answers];
      const previousAnswer = getPreviousAnswer(blankIndex);

      updatedAnswers[blankIndex] = {
        index: blankIndex,
        value: newValue,
        isFirstTrial: updatedAnswers[blankIndex]?.isFirstTrial ?? !previousAnswer,
      };

      setValue(`answers.${questionId}`, {
        ...currentAnswer,
        answers: updatedAnswers,
      });
    }
  };

  // Handle reveal answer
  const handleRevealAnswer = (blankIndex: number) => {
    setRevealedAnswers((prev) => new Set(prev).add(blankIndex));

    const currentValue = getValues(`answers.${questionId}`) as MatchingUserInputDTO;
    if (currentValue?.answers) {
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

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveValue((event.active.data.current?.value as string) || '');
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current;
    const optionValue = activeData?.value as string;
    const fromBlank = activeData?.fromBlank as number | undefined;

    // Dropping on a blank
    if (over.id.toString().startsWith('blank-')) {
      const targetBlankIndex = parseInt(over.id.toString().replace('blank-', ''));

      // Don't do anything if dropping on the same blank
      if (fromBlank === targetBlankIndex) {
        return;
      }

      // Check if option is disabled for this blank
      // Only need to check when dragging from pool, not when moving between blanks
      if (fromBlank === undefined && isOptionDisabled(optionValue, targetBlankIndex)) {
        return;
      }

      // If coming from another blank, clear the source blank first
      if (fromBlank !== undefined) {
        updateBlankValue(fromBlank, '');
      }

      // Set the target blank (this will replace any existing value)
      updateBlankValue(targetBlankIndex, optionValue);
    }
    // Dropping back to answer pool
    else if (over.id === 'answer-pool' && fromBlank !== undefined) {
      // Clear the source blank
      updateBlankValue(fromBlank, '');
    }
  };

  // Create dropdown menu for a blank
  const createDropdownMenu = (blankIndex: number): MenuProps => {
    const currentAnswer = getValues(`answers.${questionId}`) as MatchingUserInputDTO;
    const currentValue = currentAnswer?.answers?.[blankIndex]?.value || '';

    const items: MenuProps['items'] = content.answerOptions.map((option, idx) => {
      const disabled = isOptionDisabled(option.value, blankIndex);
      const usageCounts = getUsageCounts();
      let currentUsage = usageCounts.get(option.value) || 0;

      // Adjust for current blank if it already has this value
      if (currentValue === option.value) {
        currentUsage--;
      }

      // undefined means 1, null means infinite
      const effectiveLimit = option.usageLimit === undefined ? 1 : option.usageLimit;
      const remaining = effectiveLimit !== null ? Math.max(0, effectiveLimit - currentUsage) : 0;
      const showCount = effectiveLimit !== null && effectiveLimit > 1;

      return {
        key: `option-${idx}`,
        label: (
          <span style={{ color: disabled ? '#6b7280' : '#e0e0e0' }}>
            {option.value}
            {showCount && <span style={{ marginLeft: '6px', fontSize: '12px', color: '#93c5fd' }}>({remaining})</span>}
          </span>
        ),
        disabled,
        onClick: () => {
          if (!disabled) {
            updateBlankValue(blankIndex, option.value);
            setDropdownVisible({ ...dropdownVisible, [blankIndex]: false });
          }
        },
      };
    });

    // Add clear option at the bottom
    if (currentValue) {
      items.push({
        key: 'clear',
        label: (
          <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CloseOutlined style={{ fontSize: '12px' }} />
            Clear selection
          </span>
        ),
        onClick: () => {
          updateBlankValue(blankIndex, '');
          setDropdownVisible({ ...dropdownVisible, [blankIndex]: false });
        },
      });
    }

    return { items };
  };

  let blankCounter = 0;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ fontSize: '16px', color: '#e0e0e0' }}>
        {/* Main content with text and drop zones */}
        <div style={{ lineHeight: 2.2, marginBottom: '20px' }}>
          {content.items.map((item, itemIndex) => {
            if (item.type === 'text') {
              return <span key={itemIndex}>{renderTextWithLineBreaks(item.value)}</span>;
            } else if (item.type === 'blank') {
              const blankIndex = blankCounter++;
              const status = getBlankStatus(blankIndex);
              const isRevealed = revealedAnswers.has(blankIndex) || status === AnswerStatus.REVEALED;
              const canBeRevealed = status === AnswerStatus.INCORRECT && !isRevealed;
              const previousAnswer = getPreviousAnswer(blankIndex);
              const correctAnswer = getCorrectAnswer(blankIndex);
              const currentAnswer = getValues(`answers.${questionId}`) as MatchingUserInputDTO;
              const selectedValue = currentAnswer?.answers?.[blankIndex]?.value || '';

              const dropdownMenu = createDropdownMenu(blankIndex);

              return (
                <Dropdown
                  key={itemIndex}
                  menu={dropdownMenu}
                  trigger={['click']}
                  disabled={isReadOnly || isRevealed || (status !== null && !canBeRevealed)}
                  open={dropdownVisible[blankIndex]}
                  onOpenChange={(visible) => setDropdownVisible({ ...dropdownVisible, [blankIndex]: visible })}
                >
                  <span>
                    <DroppableBlank
                      blankIndex={blankIndex}
                      selectedValue={selectedValue}
                      status={status}
                      isRevealed={isRevealed}
                      canBeRevealed={canBeRevealed}
                      previousAnswer={previousAnswer}
                      correctAnswer={correctAnswer}
                      correctAnswers={item.correctAnswers}
                      explanation={item.explanation}
                      isReadOnly={isReadOnly}
                      onReveal={() => handleRevealAnswer(blankIndex)}
                      onClick={() => {
                        if (!isReadOnly && !isRevealed && (status === null || canBeRevealed)) {
                          setDropdownVisible({ ...dropdownVisible, [blankIndex]: true });
                        }
                      }}
                    />
                  </span>
                </Dropdown>
              );
            }
            return null;
          })}
        </div>

        {/* Draggable answer options section */}
        {!isReadOnly && (
          <AnswerOptionsPool
            options={content.answerOptions}
            getUsageCounts={getUsageCounts}
            isOptionDisabled={isOptionDisabled}
          />
        )}

        {/* Drag overlay - shows dragged item while dragging */}
        <DragOverlay>
          {activeId && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: '#1e40af',
                color: '#e0e0e0',
                border: '2px solid #3b82f6',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                opacity: 0.8,
              }}
            >
              {activeValue}
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

// Answer options pool component with droppable area
const AnswerOptionsPool: React.FC<{
  options: MatchingAnswerOptionDTO[];
  getUsageCounts: () => Map<string, number>;
  isOptionDisabled: (optionValue: string, excludeBlankIndex?: number) => boolean;
}> = ({ options, getUsageCounts, isOptionDisabled }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'answer-pool',
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: isOver ? '#1e3a8a' : '#111827',
        borderRadius: '8px',
        border: `2px solid ${isOver ? '#60a5fa' : '#374151'}`,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#9ca3af' }}>
        Answer Options (drag or click blanks to select):
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {options.map((option, idx) => {
          const usageCounts = getUsageCounts();
          const currentUsage = usageCounts.get(option.value) || 0;
          const isDisabled = isOptionDisabled(option.value);

          return (
            <DraggableOption
              key={idx}
              value={option.value}
              usageLimit={option.usageLimit}
              currentUsage={currentUsage}
              isDisabled={isDisabled}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MatchingQuestion;
