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
  content: QuestionContentDTO;
  title: string;
  points: number;
}

interface QuestionJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: QuestionJsonOnSaveProps) => void;
  initialContent?: QuestionContentDTO;
  title?: string;
}

interface AdditionalContentProps {
  title: string;
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
    parsedContent?: { content: QuestionContentDTO } & AdditionalContentProps;
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

    try {
      const parsed = JSON.parse(jsonText);
      const result = QuestionContentSchemaSchema.safeParse(parsed);
      const title = 'title' in parsed && typeof parsed.title === 'string' ? parsed.title : '';

      if (result.success) {
        setValidationStatus({
          isValid: true,
          parsedContent: { content: result.data, title },
        });
      } else {
        const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        setValidationStatus({
          isValid: false,
          error: `Validation error: ${errors}`,
        });
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
      const q = createQuestion(validationStatus.parsedContent.content);
      onSave({
        content: validationStatus.parsedContent.content,
        points: q.getInputCount(),
        title: validationStatus.parsedContent.title,
      });
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
        <Alert message='Valid question content' type='success' showIcon />
      ) : (
        <Alert message='Invalid content' description={validationStatus.error} type='error' showIcon />
      )}

      <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
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
