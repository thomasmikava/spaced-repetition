/* eslint-disable @typescript-eslint/no-explicit-any */
import { EditOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { memo, useState, type FC } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import type { QuestionContentDTO } from '../../../api/controllers/questions/question-content.schema';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import type { FormBaseInfo, FormData } from './Form';
import styles from './styles.module.css';
import type { QuestionJsonOnSaveProps } from './QuestionJsonModal';
import QuestionJsonModal from './QuestionJsonModal';

export interface QuizQuestion {
  fieldUniqueId: string;
  type: 'existing' | 'new';
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
  questions: QuizQuestion[];
}

interface QuizFieldProps {
  onRemove: (index: number) => void;
  index: number;
  fieldKey: `children.${number}.children.${number}`;
  formBaseInfo: FormBaseInfo;
}

export const QuizField: FC<QuizFieldProps> = memo(({ onRemove, index, fieldKey }) => {
  const { control, setValue } = useFormContext<FormData>();
  const { fields, append, remove } = useFieldArray({
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

  const handleSaveQuestion = ({ content, points }: QuestionJsonOnSaveProps) => {
    if (editingQuestion) {
      // Update existing question
      setValue(`${fieldKey}.questions.${editingQuestion.index}.content`, content);
      setValue(`${fieldKey}.questions.${editingQuestion.index}.points`, points);
    } else {
      // Add new question
      const newQuestion: QuizQuestion = {
        type: 'new',
        order: fields.length,
        points,
        content,
        fieldUniqueId: Math.random().toString(),
      };
      append(newQuestion);
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
