/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteOutlined } from '@ant-design/icons';
import Form from 'antd/es/form';
import { type FC } from 'react';
import type { Control, UseFormWatch } from 'react-hook-form';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { defaultPreferences } from '../../functions/preferences';
import { useLangToLearnOptions } from '../../hooks/langs';
import Button from '../../ui/Button';
import ChipsSwitch from '../../ui/ChipsSwitch';
import Select from '../../ui/Select';
import { useValidation } from './Form.validation';
import styles from './styles.module.css';

interface SinglePreference {
  autoSubmitCorrectAnswers?: boolean | null;
  testTypingTranslation?: boolean | null;
  askNonStandardVariants?: boolean | null;
}

export interface UserPreferencesFormData {
  global: SinglePreference;
  languages: { lang: string; preferences: SinglePreference }[];
}

interface Props {
  defaultData: UserPreferencesFormData;
  onSave: (data: UserPreferencesFormData) => void;
  isSubmitting?: boolean;
}

export const UserPreferencesForm = ({ defaultData, onSave, isSubmitting }: Props) => {
  const { resolver } = useValidation();
  const { handleSubmit, control, watch } = useForm<UserPreferencesFormData>({
    defaultValues: defaultData,
    resolver,
  });

  const labelSpan = 10;
  const colSpan = 8;
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
        <Preferences fieldKey='global' control={control} defaultValues={defaultPreferences} />

        <Languages control={control} defaultValues={defaultPreferences} watch={watch} />

        <br />

        <Form.Item wrapperCol={wrapperCol}>
          <Button label='Save' type='submit' variant='primary' fullWidth loading={isSubmitting} />
        </Form.Item>
      </div>
    </Form>
  );
};

type RequiredPref = {
  [key in keyof SinglePreference]-?: NonNullable<SinglePreference[key]>;
};

interface PreferencesProps {
  fieldKey: `global` | `languages.${number}.preferences`;
  control: Control<UserPreferencesFormData, any>;
  defaultValues: RequiredPref;
}

const Preferences: FC<PreferencesProps> = ({ fieldKey, control, defaultValues }) => {
  return (
    <div className={styles.preferencesContainer}>
      <div className={styles.pref}>
        <Form.Item label='Auto-submit correct answers'>
          <Controller
            name={`${fieldKey}.autoSubmitCorrectAnswers`}
            control={control}
            render={({ field }) => <YesNo field={field} defaultValue={defaultValues.autoSubmitCorrectAnswers} />}
          />
        </Form.Item>
      </div>
      <div className={styles.pref}>
        <Form.Item label='Test me in translations'>
          <Controller
            name={`${fieldKey}.testTypingTranslation`}
            control={control}
            render={({ field }) => <YesNo field={field} defaultValue={defaultValues.testTypingTranslation} />}
          />
        </Form.Item>
      </div>
      <div className={styles.pref}>
        <Form.Item label='Test me in irregular forms'>
          <Controller
            name={`${fieldKey}.askNonStandardVariants`}
            control={control}
            render={({ field }) => <YesNo field={field} defaultValue={defaultValues.askNonStandardVariants} />}
          />
        </Form.Item>
      </div>
    </div>
  );
};

interface LanguagesProps {
  control: Control<UserPreferencesFormData, any>;
  defaultValues: RequiredPref;
  watch: UseFormWatch<UserPreferencesFormData>;
}

const Languages: FC<LanguagesProps> = ({ control, watch, defaultValues }) => {
  const learnLangOptions = useLangToLearnOptions();

  const globalPreferences = watch('global');
  const parentPreferences = (() => {
    const val = { ...defaultValues };
    Object.entries(globalPreferences).forEach(([key, value]) => {
      if (value !== null && value !== undefined) (val as Record<string, unknown>)[key] = value;
    });
    return val;
  })();

  const { append, fields, remove } = useFieldArray({ control, name: 'languages' });

  const handleLang = (langCode: string) => {
    const has = fields.some((e) => e.lang === langCode);
    if (!has) append({ lang: langCode, preferences: {} });
  };

  return (
    <div>
      <Select
        options={learnLangOptions}
        className={styles.langSelect}
        placeholder='Choose language for custom preferences'
        value={null}
        onChange={handleLang}
      />
      <div>
        {fields.map((field, index) => (
          <LangPreference
            key={field.lang}
            lang={field.lang}
            languageName={learnLangOptions.find((e) => e.value === field.lang)?.label ?? field.lang}
            control={control}
            defaultValues={parentPreferences}
            fieldKey={`languages.${index}`}
            onRemove={() => remove(index)}
          />
        ))}
      </div>
    </div>
  );
};

interface LangPreferenceProps {
  lang: string;
  languageName: string;
  control: Control<UserPreferencesFormData, any>;
  defaultValues: RequiredPref;
  fieldKey: `languages.${number}`;
  onRemove: () => void;
}

const LangPreference: FC<LangPreferenceProps> = ({ languageName, control, fieldKey, defaultValues, onRemove }) => {
  return (
    <div className={styles.langContainer}>
      <div className={styles.langHeader}>
        <span>{languageName}</span>
        <span className={styles.delete}>
          <Button label={<DeleteOutlined />} variant='text' size='large' onClick={onRemove} />
        </span>
      </div>
      <div>
        <Preferences fieldKey={`${fieldKey}.preferences`} control={control} defaultValues={defaultValues} />
      </div>
    </div>
  );
};

interface YesNoProps {
  field: {
    onChange: (value: boolean | null) => void;
    value: boolean | null | undefined;
  };
  defaultValue: boolean;
}

const YesNo: FC<YesNoProps> = ({ field, defaultValue }) => {
  return (
    <ChipsSwitch
      options={[
        { value: true, label: 'Yes' },
        {
          value: null,
          label: <span style={{ minWidth: 71, display: 'block' }}>{`Default: ${defaultValue ? 'yes' : 'no'}`}</span>,
        },
        { value: false, label: 'No' },
      ]}
      value={field.value ?? null}
      onChange={field.onChange}
    />
  );
};
