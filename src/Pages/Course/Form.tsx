import { useEffect, type FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useValidation } from './Form.validation';
import Input from '../../ui/Input';
import Textarea from '../../ui/TextArea';
import { Checkbox } from '../../ui/Checkbox/Checkbox';
import Button from '../../ui/Button';
import Form from 'antd/es/form';
import Select from '../../ui/Select';
import { useLangToLearnOptions, useTranslationLangOptions } from '../../hooks/langs';

export interface CourseFormData {
  title: string;
  description: string;
  langToLearn: string;
  translationLang: string;
  isPublic: boolean;
  isOfficial: boolean;
}

const emptyData: CourseFormData = {
  title: '',
  description: '',
  langToLearn: '',
  translationLang: '',
  isOfficial: false,
  isPublic: false,
};

interface CourseFormProps {
  defaultData?: CourseFormData;
  officialLangs?: string[];
  onSubmit: (data: CourseFormData) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

export const CourseForm: FC<CourseFormProps> = ({
  defaultData = emptyData,
  officialLangs,
  onSubmit,
  isSubmitting,
  submitLabel,
}) => {
  const { resolver } = useValidation();
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<CourseFormData>({
    defaultValues: defaultData,
    resolver,
    reValidateMode: 'onChange',
  });

  const langToLearn = watch('langToLearn');
  const canSelectOfficiality = !!officialLangs?.includes(langToLearn);
  useEffect(() => {
    if (!canSelectOfficiality) setValue('isOfficial', false);
  }, [canSelectOfficiality, setValue]);

  const labelSpan = 6;
  const colSpan = 16;
  const wrapperCol = { offset: labelSpan, span: colSpan };

  const learnLangOptions = useLangToLearnOptions();
  const translationLangOptions = useTranslationLangOptions();

  return (
    <Form
      labelCol={{ span: labelSpan }}
      wrapperCol={{ span: colSpan }}
      style={{ width: 600, maxWidth: '100%', textAlign: 'left' }}
      autoComplete='off'
      onSubmitCapture={handleSubmit(onSubmit, console.error)}
    >
      <div>
        <Form.Item label='Title' required validateStatus={errors.title && 'error'}>
          <Controller
            name='title'
            control={control}
            defaultValue={defaultData.title}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Item>

        <Form.Item label='Description' validateStatus={errors.description && 'error'}>
          <Controller
            name='description'
            control={control}
            defaultValue={defaultData.description}
            render={({ field }) => <Textarea {...field} />}
          />
        </Form.Item>

        <Form.Item label='Language to learn' required validateStatus={errors.langToLearn && 'error'}>
          <Controller
            name='langToLearn'
            control={control}
            defaultValue={defaultData.langToLearn}
            render={({ field }) => <Select options={learnLangOptions} {...field} />}
          />
        </Form.Item>

        <Form.Item label='Translation language' required validateStatus={errors.translationLang && 'error'}>
          <Controller
            name='translationLang'
            control={control}
            defaultValue={defaultData.translationLang}
            render={({ field }) => <Select options={translationLangOptions} {...field} />}
          />
        </Form.Item>

        {canSelectOfficiality && (
          <Form.Item wrapperCol={wrapperCol}>
            <Controller
              name='isPublic'
              control={control}
              defaultValue={defaultData.isOfficial}
              render={({ field: { value, ...field } }) => <Checkbox label='Official' checked={value} {...field} />}
            />
          </Form.Item>
        )}
        <Form.Item wrapperCol={wrapperCol}>
          <Controller
            name='isPublic'
            control={control}
            defaultValue={defaultData.isPublic}
            render={({ field: { value, ...field } }) => <Checkbox label='Public' checked={value} {...field} />}
          />
        </Form.Item>

        <Form.Item wrapperCol={wrapperCol}>
          <Button label={submitLabel} type='submit' variant='primary' fullWidth loading={isSubmitting} />
        </Form.Item>
      </div>
    </Form>
  );
};
