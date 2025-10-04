import { Modal, Input, Alert } from 'antd';
import { useState, useEffect, type FC } from 'react';
import type { FillBlanksQuestionDTO } from '../../../api/controllers/questions/question-content.schema';
import {
  QuestionContentSchemaSchema,
  QuestionType,
  type QuestionContentDTO,
} from '../../../api/controllers/questions/question-content.schema';
import { createQuestion } from '../../../api/controllers/questions/content/question-factory';

const { TextArea } = Input;

export interface QuestionJsonOnSaveProps {
  questions: Array<{
    content: QuestionContentDTO;
    title: string;
    points: number;
  }>;
}

interface QuestionJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: QuestionJsonOnSaveProps) => void;
  initialContent?: QuestionContentDTO;
  title?: string;
}

const QuestionJsonModal: FC<QuestionJsonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContent,
  title = 'Edit Question Content',
}) => {
  const [jsonText, setJsonText] = useState('');
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    error?: string;
    parsedContent?: Array<{ content: QuestionContentDTO; title: string }>;
    questionCount?: number;
  }>({ isValid: false });

  useEffect(() => {
    if (initialContent) {
      setJsonText(JSON.stringify(initialContent, null, 2));
    } else {
      // Provide a template for new questions
      const template: FillBlanksQuestionDTO = {
        type: QuestionType.FILL_BLANKS,
        items: [
          { type: 'text', value: 'The capital of France is ' },
          {
            type: 'missing',
            officialAnswers: ['Paris'],
            additionalAnswers: ['paris'],
            explanation: 'Paris is the capital and largest city of France',
          },
          { type: 'text', value: '.' },
        ],
      };
      setJsonText(JSON.stringify(template, null, 2));
    }
  }, [initialContent, isOpen]);

  useEffect(() => {
    if (!jsonText.trim()) {
      setValidationStatus({ isValid: false, error: 'Content cannot be empty' });
      return;
    }

    const validateQuestion = (item: unknown, index?: number) => {
      const result = QuestionContentSchemaSchema.safeParse(item);
      const title =
        typeof item === 'object' && item !== null && 'title' in item && typeof item.title === 'string'
          ? item.title
          : '';

      if (result.success) {
        return { success: true as const, data: { content: result.data, title } };
      } else {
        const itemErrors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        const errorPrefix = index !== undefined ? `Question ${index + 1}: ` : '';
        return { success: false as const, error: `${errorPrefix}${itemErrors}` };
      }
    };

    try {
      const parsed = JSON.parse(jsonText);

      // Check if it's an array of questions
      if (Array.isArray(parsed)) {
        const validatedQuestions: Array<{ content: QuestionContentDTO; title: string }> = [];
        const errors: string[] = [];

        parsed.forEach((item, index) => {
          const result = validateQuestion(item, index);
          if (result.success) {
            validatedQuestions.push(result.data);
          } else {
            errors.push(result.error);
          }
        });

        if (errors.length > 0) {
          setValidationStatus({
            isValid: false,
            error: `Validation errors:\n${errors.join('\n')}`,
          });
        } else if (validatedQuestions.length === 0) {
          setValidationStatus({
            isValid: false,
            error: 'Array is empty, please provide at least one question',
          });
        } else {
          setValidationStatus({
            isValid: true,
            parsedContent: validatedQuestions,
            questionCount: validatedQuestions.length,
          });
        }
      } else {
        // Single question
        const result = validateQuestion(parsed);
        if (result.success) {
          setValidationStatus({
            isValid: true,
            parsedContent: [result.data],
            questionCount: 1,
          });
        } else {
          setValidationStatus({
            isValid: false,
            error: `Validation error: ${result.error}`,
          });
        }
      }
    } catch (e) {
      setValidationStatus({
        isValid: false,
        error: `Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`,
      });
    }
  }, [jsonText]);

  const handleSave = () => {
    if (validationStatus.isValid && validationStatus.parsedContent) {
      const questions = validationStatus.parsedContent.map(({ content, title }) => {
        const q = createQuestion(content);
        return {
          content,
          points: q.getInputCount(),
          title,
        };
      });

      onSave({ questions });
      onClose();
    }
  };

  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onClose}
      onOk={handleSave}
      okText='Save'
      cancelText='Cancel'
      width={800}
      okButtonProps={{ disabled: !validationStatus.isValid }}
    >
      <div style={{ marginBottom: 10 }}>
        <TextArea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder='Paste or type question JSON content here...'
          rows={20}
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        />
      </div>

      {validationStatus.isValid ? (
        <Alert
          message={
            validationStatus.questionCount && validationStatus.questionCount > 1
              ? `Valid: ${validationStatus.questionCount} questions will be added`
              : 'Valid question content'
          }
          type='success'
          showIcon
        />
      ) : (
        <Alert message='Invalid content' description={validationStatus.error} type='error' showIcon />
      )}

      <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
        <strong>Supported formats:</strong>
        <ul style={{ marginTop: 5 }}>
          <li>Single question object</li>
          <li>Array of question objects (for batch import)</li>
        </ul>
        <strong>Supported question types:</strong>
        <ul style={{ marginTop: 5 }}>
          <li>
            <code>fill-blanks</code>: Fill in the blanks questions
          </li>
          <li>
            <code>matching</code>: Matching questions with answer options
          </li>
        </ul>
      </div>
    </Modal>
  );
};

export default QuestionJsonModal;
