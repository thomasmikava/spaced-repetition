import { QuestionCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuizzes } from '../../api/controllers/quizzes/quiz.query';
import type { QuizDTO } from '../../api/controllers/quizzes/quiz.schema';
import { paths } from '../../routes/paths';
import { Table } from '../../ui/Table/Table';
import Button from '../../ui/Button';
import { roundNumber } from '../../utils/number';

interface QuizListProps {
  lessonId: number;
  courseId: number;
}

export const QuizList = ({ lessonId, courseId }: QuizListProps) => {
  const navigate = useNavigate();
  const { data: quizzes, isLoading: isQuizzesLoading } = useQuizzes({
    lessonId,
    includeHidden: false,
    includeUserProgress: true,
  });

  if (isQuizzesLoading) {
    return null;
  }

  if (!quizzes || quizzes.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: 30 }}>
      <h3 style={{ marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
        <QuestionCircleOutlined />
        Quizzes ({quizzes.length})
      </h3>
      <div>
        <Table
          rows={quizzes.map((quiz: QuizDTO) => ({
            key: quiz.id,
            cells: [
              quiz.title,
              {
                cellValue: quiz.description || '-',
                style: { opacity: 0.7 },
              },
              {
                cellValue: `${quiz.questionCount} questions`,
                style: { textAlign: 'center' },
              },
              {
                cellValue: `${quiz.totalPoints} points`,
                style: { textAlign: 'center' },
              },
              {
                cellValue: (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <Button
                      label={
                        quiz.userProgress?.completionPercentage === 100
                          ? 'Review Quiz'
                          : quiz.userProgress?.completionPercentage && quiz.userProgress.completionPercentage > 0
                            ? 'Resume Quiz'
                            : 'Take Quiz'
                      }
                      variant='primary'
                      onClick={() => navigate(paths.app.quiz.page({ quizId: quiz.id, courseId, lessonId }))}
                    />
                    {quiz.userProgress?.completionPercentage === 100 && (
                      <span style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                        Accuracy: {roundNumber(quiz.userProgress.accuracyPercentage, 2)}%
                      </span>
                    )}
                  </div>
                ),
                style: { textAlign: 'center', width: '120px' },
              },
            ],
          }))}
          removeEmptyColumns
        />
      </div>
    </div>
  );
};
