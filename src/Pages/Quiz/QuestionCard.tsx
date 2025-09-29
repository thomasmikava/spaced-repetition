/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/cognitive-complexity */
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { QuestionType } from '../../api/controllers/questions/question-content.schema';
import type {
  FillBlanksUserAnswerDTO,
  MatchingUserAnswerDTO,
} from '../../api/controllers/questions/question-content.schema';
import FillBlanksQuestion from './FillBlanksQuestion';
import MatchingQuestion from './MatchingQuestion';
import type { QuizQuestionDTO, UserQuestionAttemptDTO } from '../../api/controllers/quizzes/quiz.schema';

interface QuestionCardProps {
  question: QuizQuestionDTO;
  questionNumber: number;
  isCompleted: boolean;
  questionAttempt?: UserQuestionAttemptDTO;
  onPartialSubmit: () => void;
  onFinalSubmit: () => void;
  isSubmitting: boolean;
  disabled: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  isCompleted,
  questionAttempt,
  onPartialSubmit,
  onFinalSubmit,
  isSubmitting,
  disabled,
}) => {
  const { control } = useFormContext();

  // Watch for non-empty inputs using computed value
  const hasNonEmptyInputs = useWatch({
    control,
    name: `answers.${question.questionId}`,
    compute: (currentAnswer) => {
      if (!currentAnswer) return false;

      if (currentAnswer.type === QuestionType.FILL_BLANKS && currentAnswer.answers) {
        return currentAnswer.answers.some((a: any) => a.value && a.value.trim() !== '');
      } else if (currentAnswer.type === QuestionType.MATCHING && currentAnswer.answers) {
        return currentAnswer.answers.some((a: any) => a.value && a.value !== '');
      }

      return false;
    },
  });

  // Extract only needed fields from questionAttempt
  const submittedAt = questionAttempt?.submittedAt;
  const pointsEarned = questionAttempt?.pointsEarned;
  const processedAnswer = questionAttempt?.userAnswer;

  // Determine question status
  const getQuestionStatus = () => {
    if (!questionAttempt) return 'not-started';
    if (submittedAt) {
      if (pointsEarned === question.points) return 'perfect';
      if ((pointsEarned ?? 0) > 0) return 'partial';
      return 'incorrect';
    }
    return 'in-progress';
  };

  const status = getQuestionStatus();
  const isReadOnly = isCompleted || (submittedAt ?? null) !== null;

  // Determine border color based on status
  const getBorderColor = () => {
    switch (status) {
      case 'perfect':
        return '#52c41a';
      case 'partial':
        return '#faad14';
      case 'incorrect':
        return '#ff4d4f';
      case 'in-progress':
        return '#1890ff';
      default:
        return '#d9d9d9';
    }
  };

  // Should show Submit Non-Empty button
  const shouldShowPartialSubmit = !isReadOnly && (hasNonEmptyInputs || status === 'in-progress');

  return (
    <div
      style={{
        padding: '24px',
        // paddingBottom: !isReadOnly ? '80px' : '24px', // Add extra padding for sticky buttons
        border: `2px solid ${getBorderColor()}`,
        borderRadius: '8px',
        backgroundColor: '#1f1f1f',
        position: 'relative',
      }}
      datatype='question-card'
    >
      {/* Question Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '1px solid #555555',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h3 style={{ margin: 0, color: '#60a5fa' }}>Question {questionNumber}</h3>
          {question.question.title && (
            <span style={{ fontSize: '16px', color: '#cccccc' }}>{question.question.title}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span
            style={{
              padding: '4px 12px',
              backgroundColor: '#374151',
              color: '#e0e0e0',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {question.points} {question.points === 1 ? 'point' : 'points'}
          </span>
          {questionAttempt && submittedAt && (
            <span
              style={{
                padding: '4px 12px',
                backgroundColor: status === 'perfect' ? '#065f46' : status === 'partial' ? '#92400e' : '#7f1d1d',
                color: status === 'perfect' ? '#4ade80' : status === 'partial' ? '#fbbf24' : '#f87171',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              {pointsEarned} / {question.points}
            </span>
          )}
        </div>
      </div>

      {/* Question Content */}
      <div style={{ marginBottom: '20px' }}>{renderQuestionContent()}</div>

      {/* Action Buttons - Sticky at bottom */}
      {!isReadOnly && (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
            padding: '16px 24px',
            margin: '0 -24px 0 -24px', // Negative margins to extend to card edges
            backgroundColor: '#1f1f1f', // Same as card background
            borderTop: '1px solid #555555',
            borderRadius: '0 0 6px 6px', // Match card border radius on bottom
          }}
        >
          {shouldShowPartialSubmit && (
            <button
              onClick={onPartialSubmit}
              disabled={disabled || isSubmitting || !hasNonEmptyInputs}
              style={{
                padding: '8px 20px',
                backgroundColor: '#1f1f1f',
                color: '#60a5fa',
                border: '1px solid #60a5fa',
                borderRadius: '4px',
                cursor: disabled || isSubmitting || !hasNonEmptyInputs ? 'not-allowed' : 'pointer',
                opacity: disabled || isSubmitting || !hasNonEmptyInputs ? 0.6 : 1,
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Non-Empty'}
            </button>
          )}
          <button
            onClick={onFinalSubmit}
            disabled={disabled || isSubmitting}
            style={{
              padding: '8px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled || isSubmitting ? 'not-allowed' : 'pointer',
              opacity: disabled || isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      )}

      {/* Status Messages */}
      {isReadOnly && (
        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: status === 'perfect' ? '#065f46' : status === 'partial' ? '#92400e' : '#7f1d1d',
            borderRadius: '4px',
            border: `1px solid ${status === 'perfect' ? '#4ade80' : status === 'partial' ? '#fbbf24' : '#f87171'}`,
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', color: '#cccccc' }}>
            {status === 'perfect' && '✅ Perfect! All answers correct.'}
            {status === 'partial' && '⚠️ Partially correct.'}
            {status === 'incorrect' && '❌ Incorrect. Review the correct answers above.'}
          </p>
        </div>
      )}
    </div>
  );

  function renderQuestionContent() {
    const content = question.question.content;

    switch (content.type) {
      case QuestionType.FILL_BLANKS:
        return (
          <FillBlanksQuestion
            questionId={question.questionId}
            content={content}
            isReadOnly={isReadOnly}
            processedAnswer={processedAnswer as FillBlanksUserAnswerDTO | undefined}
          />
        );
      case QuestionType.MATCHING:
        return (
          <MatchingQuestion
            questionId={question.questionId}
            content={content}
            isReadOnly={isReadOnly}
            processedAnswer={processedAnswer as MatchingUserAnswerDTO | undefined}
          />
        );
      default:
        return (
          <div
            style={{ padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '4px', border: '1px solid #555555' }}
          >
            <p style={{ color: '#e0e0e0' }}>Unsupported question type</p>
          </div>
        );
    }
  }
};

export default QuestionCard;
