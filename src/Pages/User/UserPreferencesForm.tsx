/* eslint-disable @typescript-eslint/no-explicit-any */
import Form from 'antd/es/form';
import type { FC } from 'react';
import type { Control } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import { useValidation } from './Form.validation';

interface SinglePreference {
  autoSubmitCorrectAnswers?: boolean;
  testTypingTranslation?: boolean;
}

export interface UserPreferencesFormData {
  global: SinglePreference;
  languages: { lang: string | null; preferences: SinglePreference }[];
}

interface Props {
  defaultData: UserPreferencesFormData;
  onSave: (data: UserPreferencesFormData) => void;
  isSubmitting?: boolean;
}

export const UserPreferencesForm = ({ defaultData, onSave, isSubmitting }: Props) => {
  const { resolver } = useValidation();
  const { handleSubmit, control } = useForm<UserPreferencesFormData>({
    defaultValues: defaultData,
    resolver,
  });

  const labelSpan = 10;
  const colSpan = 4;
  const wrapperCol = { offset: labelSpan, span: colSpan };

  //   const learnLangOptions = useLangToLearnOptions();

  return (
    <Form
      labelCol={{ span: labelSpan }}
      wrapperCol={{ span: colSpan }}
      style={{ width: 600, maxWidth: '100%', textAlign: 'left' }}
      autoComplete='off'
      onSubmitCapture={handleSubmit(onSave, console.error)}
    >
      <div>
        <Preferences fieldKey='global' control={control} />

        {/* TODO: display form for per lang */}

        <Form.Item wrapperCol={wrapperCol}>
          <Button label='Save' type='submit' variant='primary' fullWidth loading={isSubmitting} />
        </Form.Item>
      </div>
    </Form>
  );
};

interface PreferencesProps {
  fieldKey: `global`;
  control: Control<UserPreferencesFormData, any>;
}

const styles = {} as any;

const Preferences: FC<PreferencesProps> = ({ fieldKey, control }) => {
  return (
    <div className={styles.advancedTranslationItemOuterContainer}>
      <div className={styles.advancedTranslationItemContainer}>
        <Form.Item label='Auto submit correct answers'>
          <Controller
            name={`${fieldKey}.autoSubmitCorrectAnswers`}
            control={control}
            render={({ field }) => (
              /* TODO: replace Select with discord-like switch */
              <Select
                options={[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' },
                ]}
                allowClear
                {...field}
              />
            )}
          />
        </Form.Item>
      </div>
      <div className={styles.advancedTranslationItemContainer}>
        <Form.Item label='Test in typing translations'>
          <Controller
            name={`${fieldKey}.testTypingTranslation`}
            control={control}
            render={({ field }) => (
              <Select
                options={[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' },
                ]}
                allowClear
                {...field}
              />
            )}
          />
        </Form.Item>
      </div>
    </div>
  );
};
