/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, type FC } from 'react';
import Button from '../../../ui/Button';
import type { Control, FieldError, UseFormSetValue } from 'react-hook-form';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
  useController,
} from 'react-hook-form';
import styles from './styles.module.css';
import Input from '../../../ui/Input';
import Dropdown from 'antd/es/dropdown';
import { DeleteOutlined, LoadingOutlined, MinusOutlined, PlusOutlined, SettingFilled } from '@ant-design/icons';
import type { WordWithTranslationDTO } from '../../../api/controllers/words/words.schema';
import { useSearchWords } from '../../../api/controllers/words/words.query';
import { useDebounce } from 'use-debounce';
import Select from '../../../ui/Select';
import { useValidation } from './Form.validation';

export interface KnownWordInfo {
  fieldUniqueId: string;
  type: 'word';
  subType: 'known-word';
  word: WordWithTranslationDTO;
}
interface SearchWordInfo {
  fieldUniqueId: string;
  type: 'word';
  subType: 'search-word';
  searchValue: string;
}
interface CustomWordInfo {
  fieldUniqueId: string;
  type: 'word';
  subType: 'custom-word';
  wordDisplayType: number;
  value: string;
  translation: string;
}

export const DEFAULT_WORD_DISPLAY_TYPE = 1;

export type WordInfo = KnownWordInfo | SearchWordInfo | CustomWordInfo;

export interface LessonInfo<W = WordInfo> {
  fieldUniqueId: string;
  type: 'lesson';
  id?: number;
  title: string;
  description: string;
  children: (LessonInfo | W)[];
}

export interface FormData<W = WordInfo> {
  children: LessonInfo<W>[];
}

interface Props {
  isSubmitting?: boolean;
  isCourseLevel: boolean;
  langToLearn: string;
  defaultData?: FormData;
  onSubmit: (data: FormData) => void;
}

const emptyWord: WordInfo = { type: 'word', subType: 'search-word', searchValue: '', fieldUniqueId: '2' };

const emptyValues: FormData = {
  children: [
    {
      type: 'lesson',
      id: 1,
      title: '',
      description: '',
      fieldUniqueId: '1',
      children: [emptyWord],
    },
  ],
};

const ContentForm: FC<Props> = memo(
  ({ defaultData = emptyValues, isSubmitting, isCourseLevel, langToLearn, onSubmit }) => {
    const { resolver } = useValidation();
    const form = useForm({
      shouldFocusError: true,
      defaultValues: defaultData,
      resolver,
    });
    const {
      formState: { isSubmitted },
    } = form;

    /* const watch = form.watch;

  useEffect(
    () =>
      watch((values) => {
        console.log(values);
      }).unsubscribe,
    [watch],
  ); */

    const handleSuccess = (data: FormData) => {
      console.log('success', data);
      onSubmit(data);
    };

    const helper = useMemo(() => ({ langToLearn, isValidationStarted: isSubmitted }), [langToLearn, isSubmitted]);

    console.log('top level re-render');

    return (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSuccess, console.error)}>
          <FieldArray fieldKey='children' isCourseLevel={isCourseLevel} helper={helper} />
          <div style={{ gap: 10, display: 'flex', marginTop: 10 }}>
            <Button label='Cancel' variant='default' />
            <Button label='Save' type='submit' variant='primary' loading={isSubmitting} />
          </div>
        </form>
      </FormProvider>
    );
  },
);
ContentForm.displayName = 'ContentForm';

interface Helper {
  langToLearn: string;
  isValidationStarted: boolean;
}

interface FieldArrayProps {
  fieldKey: 'children' | `children.${number}.children`;
  isCourseLevel: boolean;
  helper: Helper;
}

interface FieldArrayRef {
  addNewLesson: () => void;
  addNewWord: () => void;
}

const FieldArray = memo(
  forwardRef<FieldArrayRef, FieldArrayProps>(({ fieldKey, isCourseLevel, helper }, ref) => {
    const { control } = useFormContext<FormData>();

    console.log('FieldArray rerender', fieldKey);

    const { fields, append, remove } = useFieldArray<FormData>({
      control,
      name: fieldKey,
    });

    const handleAddNewLesson = useCallback(() => {
      append({
        type: 'lesson',
        title: '',
        description: '',
        children: [
          {
            type: 'word',
            subType: 'search-word',
            searchValue: '',
            fieldUniqueId: Math.random().toString(),
          },
        ],
        fieldUniqueId: Math.random().toString(),
      });
    }, [append]);

    const handleAddNewWord = useCallback(() => {
      append({
        type: 'word',
        subType: 'search-word',
        searchValue: '',
        fieldUniqueId: Math.random().toString(),
      });
    }, [append]);

    useImperativeHandle(
      ref,
      () => ({
        addNewLesson: handleAddNewLesson,
        addNewWord: handleAddNewWord,
      }),
      [handleAddNewLesson, handleAddNewWord],
    );

    return (
      <div>
        {fields.map((field, index) => {
          if (field.type === 'lesson') {
            return (
              <LessonField
                key={field.fieldUniqueId}
                onRemove={remove}
                index={index}
                fieldKey={`${fieldKey as 'children'}.${index}`}
                helper={helper}
              />
            );
          }
          return (
            <WordField
              key={field.fieldUniqueId}
              onRemove={remove}
              index={index}
              fieldKey={`${fieldKey as 'children'}.${index}`}
              parentKey={fieldKey as 'children'}
              helper={helper}
            />
          );
          return null;
        })}
        {isCourseLevel && <Button label={'Add new lesson'} variant='default' onClick={handleAddNewLesson} />}
      </div>
    );
  }),
);
FieldArray.displayName = 'FieldArray';

interface LessonFieldProps {
  onRemove: (index: number) => void;
  index: number;
  fieldKey: `children.${number}`;
  helper: Helper;
}

const LessonField: FC<LessonFieldProps> = memo(({ helper, onRemove, index, fieldKey }) => {
  const fieldArrayRef = useRef<FieldArrayRef>(null);
  const { control } = useFormContext<FormData>();
  //   //   const { errors } = useFormState({ control, name: `${fieldKey}.children` });
  //   console.log(errors, fieldKey + '.children');
  //   const { errors } = useFormState({ control, name: `${fieldKey}.children` });
  //   const rootError = getValue(errors, fieldKey + '.children.root');
  //   (window as any).logLatestErrors = () => control._formState.errors;
  //   console.log('heyyy', useWatchErrors(control, fieldKey + '.children'));
  const {
    fieldState: { error },
  } = useController({ control, name: `${fieldKey}.children` });
  //   const rootError: any = null;
  const childrenError = (error as { root?: FieldError } | undefined)?.root ?? error;
  console.log('rootError', fieldKey, childrenError);
  //   console.log('oooo', getValue(errors, fieldKey + '.children.root'));

  console.log('LessonField rerender', fieldKey);

  const handleAddNewLesson = () => {
    if (!fieldArrayRef.current) return;
    fieldArrayRef.current.addNewLesson();
  };

  const handleAddNewWord = () => {
    if (!fieldArrayRef.current) return;
    fieldArrayRef.current.addNewWord();
  };

  return (
    <div className={styles.lessonFieldContainer}>
      <div className={styles.lessonTitle}>
        <Controller
          name={`${fieldKey}.title`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              placeholder='Lesson title'
              fullWidth
              {...field}
              inputProps={{ status: error ? 'error' : undefined }}
            />
          )}
        />
        <Dropdown
          menu={{
            items: [
              { label: 'Add sub lesson', key: 'add', icon: <PlusOutlined />, onClick: handleAddNewLesson },
              {
                label: 'Delete',
                key: 'remove',
                icon: <DeleteOutlined />,
                onClick: () => onRemove(index),
              },
            ],
          }}
          placement='bottom'
        >
          <Button label={<SettingFilled />} />
        </Dropdown>
      </div>
      <div className={styles.lessonChildren}>
        <FieldArray isCourseLevel={false} helper={helper} fieldKey={`${fieldKey}.children`} ref={fieldArrayRef} />
        {childrenError && childrenError.ref && (
          <p style={{ color: 'red' }}>
            Lesson cannot be empty. Add at least 1 word or sub-lesson or delete it from the settings icon
          </p>
        )}
        <Button
          style={{ marginTop: 10 }}
          label={
            <span>
              <PlusOutlined />
              <span style={{ marginLeft: 10 }}>Add new word</span>
            </span>
          }
          onClick={handleAddNewWord}
        />
      </div>
    </div>
  );
});
LessonField.displayName = 'LessonField';

interface WordFieldProps {
  onRemove: (index: number) => void;
  index: number;
  fieldKey: `children.${number}`;
  parentKey: `children`;
  helper: Helper;
}

const WordField: FC<WordFieldProps> = memo(({ fieldKey, parentKey, helper, index, onRemove }) => {
  const { control, setValue, trigger } = useFormContext<LessonInfo>();

  console.log('Rerendered WordField', fieldKey);

  const handleSetValue: UseFormSetValue<LessonInfo> = useCallback(
    (...args) => {
      (setValue as CallableFunction)(...args);
      if (helper.isValidationStarted) {
        trigger(parentKey);
      }
    },
    [helper.isValidationStarted, trigger, setValue, parentKey],
  );

  const subType = useWatch({ control, name: `${fieldKey}.subType` });
  if (!subType) return null;

  const handleRemove = () => onRemove(index);

  return (
    <>
      {subType === 'known-word' && <ExistingWord control={control} fieldKey={fieldKey} onRemove={handleRemove} />}
      {subType === 'search-word' && (
        <SearchWord
          onRemove={handleRemove}
          helper={helper}
          control={control}
          fieldKey={fieldKey}
          setValue={handleSetValue}
        />
      )}
      {subType === 'custom-word' && (
        <CustomWord onRemove={handleRemove} helper={helper} control={control} fieldKey={fieldKey} />
      )}
    </>
  );
});
WordField.displayName = 'WordField';

const ExistingWord: FC<{ control: Control<LessonInfo, any>; fieldKey: `children.${number}`; onRemove: () => void }> = ({
  control,
  fieldKey,
  onRemove,
}) => {
  const value = useWatch({ control, name: fieldKey });

  if (value.type !== 'word' || value.subType !== 'known-word') return null;

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ width: '100%' }}>
        <div>
          <span>{value.word.type}</span> <span>{value.word.value}</span>
        </div>
        <div>{value.word.translation}</div>
      </div>
      <MinusOutlined className={styles.clickableIcon} onClick={onRemove} />
    </div>
  );
};

const SearchWord: FC<{
  onRemove: () => void;
  fieldKey: `children.${number}`;
  control: Control<LessonInfo, any>;
  helper: Helper;
  setValue: UseFormSetValue<LessonInfo>;
}> = ({ helper, fieldKey, control, setValue, onRemove }) => {
  const value = useWatch({ control, name: fieldKey });
  //   const { sub } = useFormContext<FormData>({ control });
  //   console.log('fieldKey', fieldKey, errors, dirtyFields);

  const searchValue = (value as SearchWordInfo).searchValue ?? '';
  const [debouncedSearchValue] = useDebounce(searchValue, 300);

  const { data, status } = useSearchWords({
    lang: helper.langToLearn,
    searchValue: debouncedSearchValue,
  });

  const handleChoose = useCallback(
    (suggestion: WordWithTranslationDTO) => {
      setValue(fieldKey, {
        type: 'word',
        subType: 'known-word',
        word: suggestion,
        fieldUniqueId: Math.random().toString(),
      });
    },
    [fieldKey, setValue],
  );

  const handleAddAsCustomWord = useCallback(() => {
    setValue(fieldKey, {
      type: 'word',
      subType: 'custom-word',
      value: debouncedSearchValue,
      wordDisplayType: DEFAULT_WORD_DISPLAY_TYPE,
      translation: '',
      fieldUniqueId: Math.random().toString(),
    });
  }, [debouncedSearchValue, fieldKey, setValue]);

  if (value.type !== 'word' || value.subType !== 'search-word') return null;

  return (
    <div className={styles.wordSearchContainer}>
      <div className={styles.topPart}>
        <div style={{ width: '100%' }}>
          <Controller
            name={`${fieldKey}.searchValue`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <Input placeholder='Search word' fullWidth {...field} />
                {error && <p style={{ color: 'red' }}>Choose one of the options or clear the search field</p>}
              </>
            )}
          />
        </div>
        <MinusOutlined className={styles.clickableIcon} onClick={onRemove} />
      </div>
      {debouncedSearchValue && (
        <div>
          {status === 'pending' && <LoadingOutlined />}
          {status === 'error' && <span>Error</span>}
          {status === 'success' && data && data.words.length > 0 && (
            <div>
              <>
                {data.words.map((word) => (
                  <div key={word.id} onClick={() => handleChoose(word)}>
                    <span>{word.type}</span> <span>{word.value}</span>
                    <span>{word.translation}</span>
                  </div>
                ))}
              </>
              <Button onClick={handleAddAsCustomWord} label='Add as custom word' />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CustomWord: FC<{
  onRemove: () => void;
  fieldKey: `children.${number}`;
  control: Control<LessonInfo, any>;
  helper: Helper;
}> = ({ control, onRemove, fieldKey }) => {
  return (
    <div>
      <div style={{ width: '100%', display: 'flex', gap: 10 }}>
        <Controller
          name={`${fieldKey}.wordDisplayType`}
          control={control}
          render={({ field }) => (
            <Select<number>
              options={[
                { value: 1, label: 'PHRASE' }, // TODO: don't hardcode
                { value: 2, label: 'NOUN' },
                { value: 3, label: 'VERB' },
                { value: 4, label: 'PRONOUN' },
                { value: 5, label: 'ADJECTIVE' },
                { value: 6, label: 'PREPOSITION' },
                { value: 7, label: 'CONJUNCTION' },
                { value: 8, label: 'NUMBER' },
                { value: 9, label: 'ARTICLE' },
              ]}
              {...field}
            />
          )}
        />
        <Controller
          name={`${fieldKey}.value`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input placeholder='word' fullWidth {...field} inputProps={{ status: error ? 'error' : undefined }} />
          )}
        />
        <Controller
          name={`${fieldKey}.translation`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              placeholder='translation'
              fullWidth
              {...field}
              inputProps={{ status: error ? 'error' : undefined }}
            />
          )}
        />
        <MinusOutlined className={styles.clickableIcon} onClick={onRemove} />
      </div>
    </div>
  );
};

export { ContentForm };
