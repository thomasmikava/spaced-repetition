import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { LeftOutlined } from '@ant-design/icons';
import {
  useQuizDetails,
  useUserQuizProgress,
  useStartQuizAttempt,
  useSubmitQuestionAnswer,
  useResetQuizAttempt,
} from '../../api/controllers/quizzes/quiz.query';
import { type UserInputDTO } from '../../api/controllers/questions/question-content.schema';
import { createQuestion } from '../../api/controllers/questions/content/question-factory';
import QuestionCard from './QuestionCard';
import LoadingPage from '../Loading/LoadingPage';
import { paths } from '../../routes/paths';
import type { QuizFormData } from './types';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();

  const quizId = +(params.quizId as string);
  const courseId = +(params.courseId as string);
  const lessonId = +(params.lessonId as string);

  const { data: quiz, isLoading: isQuizLoading } = useQuizDetails({ quizId });
  const {
    data: userProgress,
    isLoading: isProgressLoading,
    refetch: refetchProgress,
  } = useUserQuizProgress({ quizId });
  const { mutateAsync: startAttempt, isPending: isStartingAttempt } = useStartQuizAttempt();
  const { mutateAsync: submitAnswer, isPending: isSubmittingAnswer } = useSubmitQuestionAnswer();
  const { mutateAsync: resetAttempt, isPending: isResettingAttempt } = useResetQuizAttempt();

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [submittingQuestionId, setSubmittingQuestionId] = useState<number | null>(null);
  const [resetCounter, setResetCounter] = useState<number>(0);

  const methods = useForm<QuizFormData>({
    defaultValues: {
      answers: {} as [],
    },
  });

  const isLoading = isQuizLoading || isProgressLoading;

  // Initialize attempt
  useEffect(() => {
    if (userProgress?.attempt) {
      setAttemptId(userProgress.attempt.id);

      // Pre-populate form with existing answers
      if (userProgress.questionAttempts && userProgress.questionAttempts.length > 0) {
        const existingAnswers: Record<number, UserInputDTO> = {};
        userProgress.questionAttempts.forEach((attempt) => {
          if (attempt.userAnswer && quiz?.questions) {
            // Find the corresponding question to get its content
            const quizQuestion = quiz.questions.find((q) => q.questionId === attempt.questionId);
            if (quizQuestion) {
              // Use the question factory to create question instance and map user input to form data
              const questionInstance = createQuestion(quizQuestion.question.content);
              existingAnswers[attempt.questionId] = questionInstance.mapUserInputToFormData(attempt.userAnswer);
            }
          }
        });
        methods.reset({ answers: existingAnswers as UserInputDTO[] });
      }
    } else if (!isLoading && quiz && !attemptId && !isStartingAttempt) {
      // Auto-start quiz if no existing attempt
      handleStartQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProgress, isLoading, quiz, attemptId, isStartingAttempt]);

  const handleStartQuiz = async () => {
    try {
      const attempt = await startAttempt({ quizId });
      setAttemptId(attempt.id);
    } catch (error) {
      console.error('Failed to start quiz:', error);
    }
  };

  const handleSubmit = async (questionId: number, isPartialSubmission: boolean) => {
    if (!attemptId || !quiz?.questions) return;

    const formData = methods.getValues();
    const quizQuestion = quiz.questions.find((q) => q.questionId === questionId);

    if (!quizQuestion) {
      console.error('Question not found.');
      return;
    }

    // Use the question factory to create question instance and map form data
    const questionInstance = createQuestion(quizQuestion.question.content);
    const userInput = questionInstance.mapFormDataToUserInput(formData.answers[questionId], {
      isFullSubmission: !isPartialSubmission,
    });

    // For partial submit, check if the mapped input has any answers
    if (isPartialSubmission && (!userInput.answers || userInput.answers.length === 0)) {
      return;
    }

    setSubmittingQuestionId(questionId);
    try {
      await submitAnswer({
        quizAttemptId: attemptId,
        questionId,
        userInput,
        isPartialSubmission,
      });

      // Refetch progress to update UI
      await refetchProgress();
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmittingQuestionId(null);
    }
  };

  const handlePartialSubmit = async (questionId: number) => {
    await handleSubmit(questionId, true);
  };

  const handleFinalSubmit = async (questionId: number) => {
    await handleSubmit(questionId, false);
  };

  const goBack = () => {
    navigate(paths.app.lesson.page(lessonId, courseId));
  };

  const handleResetQuiz = async () => {
    if (!attemptId) return;

    try {
      await resetAttempt({
        quizId,
        courseId,
        quizAttemptId: attemptId,
      });

      // Reset form data and attempt ID to restart
      methods.reset({ answers: null as never as [] }, { keepValues: false });
      setAttemptId(null);

      // Increment reset counter for body key
      setResetCounter((prev) => prev + 1);

      // Refetch progress to update UI
      await refetchProgress();
    } catch (error) {
      console.error('Failed to reset quiz:', error);
      alert('Failed to reset quiz. Please try again.');
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!quiz) {
    return (
      <div className='body'>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2 style={{ color: '#e0e0e0' }}>Quiz not found</h2>
          <button
            onClick={goBack}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const isCompleted = userProgress?.attempt?.isCompleted || false;
  const hasAttempt = !!attemptId;

  // Show loading while starting quiz automatically
  if (!hasAttempt && (isStartingAttempt || (!userProgress?.attempt && !attemptId))) {
    return <LoadingPage />;
  }

  return (
    <FormProvider {...methods}>
      <div className='body' key={resetCounter}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
          {/* Header */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: '30px' }}>
            <LeftOutlined onClick={goBack} style={{ cursor: 'pointer', fontSize: '20px', color: '#e0e0e0' }} />
            <h1 style={{ margin: 0, color: '#ffffff' }}>{quiz.title}</h1>
          </div>

          {/* Quiz Info */}
          {quiz.description && (
            <div
              style={{
                marginBottom: '30px',
                padding: '15px',
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                border: '1px solid #555555',
              }}
            >
              <p style={{ margin: 0, color: '#e0e0e0' }}>{quiz.description}</p>
            </div>
          )}

          {/* Progress Summary */}
          {userProgress && (
            <div
              style={{
                marginBottom: '30px',
                padding: '15px',
                backgroundColor: '#1f2937',
                borderRadius: '8px',
                border: '1px solid #374151',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ color: '#e0e0e0' }}>
                  <strong style={{ color: '#60a5fa' }}>Progress:</strong> {userProgress.completionPercentage.toFixed(0)}
                  %
                </div>
                <div style={{ color: '#e0e0e0' }}>
                  <strong style={{ color: '#60a5fa' }}>Accuracy:</strong> {userProgress.accuracyPercentage.toFixed(0)}%
                </div>
                <div style={{ color: '#e0e0e0' }}>
                  <strong style={{ color: '#60a5fa' }}>Points:</strong> {userProgress.attempt?.pointsEarned || 0} /{' '}
                  {quiz.totalPoints}
                </div>
                <div style={{ color: '#e0e0e0' }}>
                  <strong style={{ color: '#60a5fa' }}>Status:</strong>{' '}
                  {isCompleted ? '✅ Completed' : '⏳ In Progress'}
                </div>
              </div>
            </div>
          )}

          {/* Questions */}
          {questions.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                border: '1px solid #555555',
              }}
            >
              <h3 style={{ color: '#e0e0e0' }}>No questions available</h3>
              <p style={{ color: '#cccccc' }}>This quiz doesn't have any questions yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {questions.map((question, index) => {
                const questionAttempt = userProgress?.questionAttempts?.find(
                  (qa) => qa.questionId === question.questionId,
                );

                return (
                  <QuestionCard
                    key={question.questionId}
                    question={question}
                    questionNumber={index + 1}
                    isCompleted={isCompleted}
                    questionAttempt={questionAttempt}
                    onPartialSubmit={() => handlePartialSubmit(question.questionId)}
                    onFinalSubmit={() => handleFinalSubmit(question.questionId)}
                    isSubmitting={submittingQuestionId === question.questionId}
                    disabled={isSubmittingAnswer}
                  />
                );
              })}
            </div>
          )}

          {/* Completion Message */}
          {isCompleted && (
            <div
              style={{
                marginTop: '40px',
                padding: '30px',
                backgroundColor: '#1f2937',
                border: '2px solid #4ade80',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <h2 style={{ color: '#4ade80', margin: '0 0 15px 0' }}>🎉 Quiz Completed!</h2>
              <p style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#e0e0e0' }}>
                Final Score:{' '}
                <strong style={{ color: '#ffffff' }}>
                  {userProgress?.attempt?.pointsEarned || 0} / {quiz.totalPoints} points
                </strong>
              </p>
              <p style={{ margin: '0 0 20px 0', color: '#cccccc' }}>
                Accuracy: <strong style={{ color: '#ffffff' }}>{userProgress?.accuracyPercentage.toFixed(1)}%</strong>
              </p>
              <button
                onClick={handleResetQuiz}
                disabled={isResettingAttempt}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isResettingAttempt ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  opacity: isResettingAttempt ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isResettingAttempt) {
                    e.currentTarget.style.backgroundColor = '#d97706';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isResettingAttempt) {
                    e.currentTarget.style.backgroundColor = '#f59e0b';
                  }
                }}
              >
                {isResettingAttempt ? '🔄 Resetting...' : '🔄 Reset Quiz'}
              </button>
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
};

export default QuizPage;
