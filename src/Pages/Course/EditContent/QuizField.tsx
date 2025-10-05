/* eslint-disable @typescript-eslint/no-explicit-any */
import { EditOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { memo, useState, type FC } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import type { QuestionContentDTO } from '../../../api/controllers/questions/question-content.schema';
import { QuizMode } from '../../../api/controllers/quizzes/quiz.schema';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import type { FormBaseInfo, FormData } from './Form';
import styles from './styles.module.css';
import type { QuestionJsonOnSaveProps } from './QuestionJsonModal';
import QuestionJsonModal from './QuestionJsonModal';

export interface QuizQuestion {
  fieldUniqueId: string;
  type: 'existing' | 'new' | 'update';
  questionId?: number;
  order: number;
  points: number;
  title?: string;
  content?: QuestionContentDTO;
  isOfficial?: boolean;
}

export interface QuizInfo {
  fieldUniqueId: string;
  type: 'quiz';
  id?: number;
  title: string;
  description: string;
  priority?: number;
  isHidden?: boolean;
  mode?: QuizMode;
  questions: QuizQuestion[];
}

interface QuizFieldProps {
  onRemove: (index: number) => void;
  index: number;
  fieldKey: `children.${number}.children.${number}`;
  formBaseInfo: FormBaseInfo;
}

export const QuizField: FC<QuizFieldProps> = memo(({ onRemove, index, fieldKey }) => {
  const { control, getValues } = useFormContext<FormData>();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: `${fieldKey}.questions`,
  });

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{ index: number; question: QuizQuestion } | null>(null);

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (index: number, question: QuizQuestion) => {
    setEditingQuestion({ index, question });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = ({ questions }: QuestionJsonOnSaveProps) => {
    if (editingQuestion) {
      // When editing, only use the first question from the array
      const { content, points, title } = questions[0];
      const existingValue = getValues(`${fieldKey}.questions.${editingQuestion.index}`);
      update(editingQuestion.index, {
        ...existingValue,
        content,
        points,
        title,
        type: existingValue.questionId ? 'update' : 'new',
      });
    } else {
      // Add all questions from the array
      const currentLength = fields.length;
      questions.forEach(({ content, points, title }, index) => {
        const newQuestion: QuizQuestion = {
          type: 'new',
          order: currentLength + index,
          points,
          content,
          fieldUniqueId: Math.random().toString(),
          title,
        };
        append(newQuestion);
      });
    }
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  return (
    <div className={styles.lessonFieldContainer}>
      <div className={styles.lessonTitle}>
        <Controller
          name={`${fieldKey}.title`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input placeholder='Quiz title' fullWidth {...field} size='large' status={error ? 'error' : undefined} />
          )}
        />
        <Controller
          name={`${fieldKey}.description`}
          control={control}
          render={({ field }) => <Input placeholder='Quiz description (optional)' fullWidth {...field} size='large' />}
        />
        <Controller
          name={`${fieldKey}.mode`}
          control={control}
          render={({ field }) => (
            <Select
              placeholder='Quiz mode (optional)'
              size='large'
              style={{ width: '100%' }}
              value={field.value ?? null}
              onChange={field.onChange}
              allowClear
              options={[
                { label: 'Assessment Mode', value: QuizMode.ASSESSMENT },
                { label: 'Practice Mode', value: QuizMode.PRACTICE },
                { label: 'Live Feedback Mode', value: QuizMode.LIVE_FEEDBACK },
              ]}
            />
          )}
        />
        <MinusOutlined className={styles.clickableIcon} onClick={() => onRemove(index)} />
      </div>

      <div style={{ marginLeft: 20, marginTop: 10 }}>
        <div>
          <h4>Questions:</h4>
          {fields.map((field, qIndex) => {
            const question = field as QuizQuestion;
            return (
              <div key={field.fieldUniqueId} className={styles.wordSearchContainer} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>Q{qIndex + 1}:</span>
                  <Controller
                    name={`${fieldKey}.questions.${qIndex}.title`}
                    control={control}
                    render={({ field }) => (
                      <Input placeholder='Question title (optional)' {...field} inputProps={{ style: { flex: 1 } }} />
                    )}
                  />
                  <Button label={<EditOutlined />} onClick={() => handleEditQuestion(qIndex, question)} />
                  <MinusOutlined className={styles.clickableIcon} onClick={() => remove(qIndex)} />
                </div>
                {question.content && (
                  <div style={{ marginTop: 5, fontSize: 12, color: '#666' }}>Type: {question.content.type}</div>
                )}
              </div>
            );
          })}
          <Button
            label={
              <span>
                <PlusOutlined />
                <span style={{ marginLeft: 10 }}>Add question</span>
              </span>
            }
            onClick={handleAddQuestion}
            style={{ marginTop: 10 }}
          />
        </div>
      </div>

      {isQuestionModalOpen && (
        <QuestionJsonModal
          isOpen={isQuestionModalOpen}
          onClose={() => {
            setIsQuestionModalOpen(false);
            setEditingQuestion(null);
          }}
          onSave={handleSaveQuestion}
          initialContent={editingQuestion?.question.content}
          title={editingQuestion ? 'Edit Question' : 'Add Question'}
        />
      )}
    </div>
  );
});
