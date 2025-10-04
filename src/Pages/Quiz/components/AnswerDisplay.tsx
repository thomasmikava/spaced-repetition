/* eslint-disable sonarjs/cognitive-complexity */
import React from 'react';
import { AnswerStatus } from '../../../api/controllers/questions/question-content.schema';
import { ExplanationTooltip } from './ExplanationTooltip';

interface AnswerDisplayProps {
  status: AnswerStatus | null;
  isRevealed: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  containerStyle?: React.CSSProperties;
  displayStyle?: React.CSSProperties;
}

const emptyValue = Symbol();

const getDisplayValue = (
  isRevealed: boolean,
  status: AnswerStatus | null,
  userAnswer: string,
): string | typeof emptyValue => {
  if (isRevealed) {
    return userAnswer || emptyValue;
  }
  if (status === AnswerStatus.CORRECT || status === AnswerStatus.PARTIAL) {
    return userAnswer;
  }
  return userAnswer || emptyValue;
};

const getBackgroundColor = (
  status: AnswerStatus | null,
  isRevealed: boolean,
  displayValue: string | typeof emptyValue,
  correctAnswer: string,
): string => {
  if (status === AnswerStatus.CORRECT) return '#065f46';
  if (status === AnswerStatus.PARTIAL) return '#1e3a8a';
  if (status === AnswerStatus.INCORRECT || isRevealed) {
    return displayValue === correctAnswer ? '#186d7b' : '#7f1d1d';
  }
  return '#374151';
};

const getBorderColor = (
  status: AnswerStatus | null,
  isRevealed: boolean,
  displayValue: string | typeof emptyValue,
  correctAnswer: string,
): string => {
  if (status === AnswerStatus.CORRECT) return '#4ade80';
  if (status === AnswerStatus.PARTIAL) return '#60a5fa';
  if (status === AnswerStatus.INCORRECT || isRevealed) {
    return displayValue === correctAnswer ? '#4acade' : '#f87171';
  }
  return '#6b7280';
};

const shouldShowIncorrectFormat = (status: AnswerStatus | null, isRevealed: boolean): boolean => {
  return status === AnswerStatus.INCORRECT || status === AnswerStatus.UNANSWERED || isRevealed;
};

const IncorrectAnswerContent: React.FC<{
  displayValue: string | typeof emptyValue;
  correctAnswer: string;
}> = ({ displayValue, correctAnswer }) => {
  if (displayValue === correctAnswer) {
    return (
      <span style={{ color: 'white', fontWeight: 'bold' }} datatype='correct-answer'>
        {correctAnswer}
      </span>
    );
  }

  return (
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
        {correctAnswer}
      </span>
    </>
  );
};

export const AnswerDisplay: React.FC<AnswerDisplayProps> = ({
  status,
  isRevealed,
  userAnswer,
  correctAnswer,
  explanation,
  containerStyle,
  displayStyle,
}) => {
  const displayValue = getDisplayValue(isRevealed, status, userAnswer);
  const backgroundColor = getBackgroundColor(status, isRevealed, displayValue, correctAnswer);
  const borderColor = getBorderColor(status, isRevealed, displayValue, correctAnswer);

  const spanStyle = {
    padding: '2px 4px',
    margin: '1px 4px',
    backgroundColor,
    border: `2px solid ${borderColor}`,
    borderRadius: '4px',
    minWidth: '60px',
    display: 'inline-block',
    textAlign: 'center' as const,
    wordBreak: 'keep-all' as const,
    ...displayStyle,
  };

  return (
    <span style={{ position: 'relative', display: 'inline', ...containerStyle }}>
      <span style={spanStyle} data-status={isRevealed ? AnswerStatus.REVEALED : status || AnswerStatus.UNANSWERED}>
        {shouldShowIncorrectFormat(status, isRevealed) ? (
          <IncorrectAnswerContent displayValue={displayValue} correctAnswer={correctAnswer} />
        ) : (
          <span style={{ color: '#e0e0e0' }}>{displayValue === emptyValue ? '___' : displayValue}</span>
        )}
      </span>
      {explanation && (status === AnswerStatus.CORRECT || status === AnswerStatus.PARTIAL) && (
        <ExplanationTooltip explanation={explanation} />
      )}
    </span>
  );
};
