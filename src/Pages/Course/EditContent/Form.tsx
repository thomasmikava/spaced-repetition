/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, type FC } from 'react';
import Button from '../../../ui/Button';
import type { Control, FieldError, UseFormSetFocus, UseFormSetValue } from 'react-hook-form';
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
import React from 'react';
import type { Helper } from '../../../functions/generate-card-content';
import { useWordTypeChoices } from '../../../hooks/cards';

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
  wordDisplayType?: number;
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
  translationLang: string;
  defaultData?: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  helper: Helper;
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
  ({
    defaultData = emptyValues,
    isSubmitting,
    isCourseLevel,
    langToLearn,
    onSubmit,
    onCancel,
    translationLang,
    helper,
  }) => {
    const { resolver } = useValidation();
    const form = useForm({
      shouldFocusError: true,
      defaultValues: defaultData,
      resolver,
    });
    const {
      formState: { isSubmitted, isDirty },
    } = form;

    const handleCancel = () => {
      if (!isDirty) {
        onCancel();
      } else {
        if (confirm('Are you sure you want to cancel changes?')) onCancel();
      }
    };

    /* const watch = form.watch;

  useEffect(
    () =>
      watch((values) => {
        console.log(values);
      }).unsubscribe,
    [watch],
  ); */

    const handleSuccess = (data: FormData) => {
      onSubmit(data);
    };

    const formBaseInfo = useMemo(
      (): FormBaseInfo => ({ langToLearn, isValidationStarted: isSubmitted, translationLang }),
      [langToLearn, isSubmitted, translationLang],
    );

    console.log('top level re-render');

    return (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSuccess, console.error)}>
          <FieldArray fieldKey='children' isCourseLevel={isCourseLevel} formBaseInfo={formBaseInfo} helper={helper} />
          <div style={{ gap: 10, display: 'flex', marginTop: 10 }}>
            <Button label='Cancel' variant='default' onClick={handleCancel} />
            <Button label='Save' type='submit' variant='primary' loading={isSubmitting} />
          </div>
        </form>
      </FormProvider>
    );
  },
);
ContentForm.displayName = 'ContentForm';

interface FormBaseInfo {
  langToLearn: string;
  translationLang: string;
  isValidationStarted: boolean;
}

interface FieldArrayProps {
  fieldKey: 'children' | `children.${number}.children`;
  isCourseLevel: boolean;
  formBaseInfo: FormBaseInfo;
  helper: Helper;
}

interface FieldArrayRef {
  addNewLesson: () => void;
  addNewWord: () => void;
}

const FieldArray = memo(
  forwardRef<FieldArrayRef, FieldArrayProps>(({ fieldKey, isCourseLevel, formBaseInfo, helper }, ref) => {
    const { control } = useFormContext<FormData>();

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
                formBaseInfo={formBaseInfo}
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
              formBaseInfo={formBaseInfo}
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
  formBaseInfo: FormBaseInfo;
  helper: Helper;
}

const LessonField: FC<LessonFieldProps> = memo(({ formBaseInfo, onRemove, index, fieldKey, helper }) => {
  const fieldArrayRef = useRef<FieldArrayRef>(null);
  const { control } = useFormContext<FormData>();
  const {
    fieldState: { error },
  } = useController({ control, name: `${fieldKey}.children` });
  const childrenError = (error as { root?: FieldError } | undefined)?.root ?? error;

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
        <FieldArray
          isCourseLevel={false}
          formBaseInfo={formBaseInfo}
          fieldKey={`${fieldKey}.children`}
          ref={fieldArrayRef}
          helper={helper}
        />
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
  formBaseInfo: FormBaseInfo;
  helper: Helper;
}

const WordField: FC<WordFieldProps> = memo(({ fieldKey, parentKey, formBaseInfo, index, onRemove, helper }) => {
  const { control, setValue, trigger, setFocus } = useFormContext<LessonInfo>();

  const handleSetValue: UseFormSetValue<LessonInfo> = useCallback(
    (...args) => {
      (setValue as CallableFunction)(...args);
      if (formBaseInfo.isValidationStarted) {
        trigger(parentKey);
      }
    },
    [formBaseInfo.isValidationStarted, trigger, setValue, parentKey],
  );

  const subType = useWatch({ control, name: `${fieldKey}.subType` });
  if (!subType) return null;

  const handleRemove = () => onRemove(index);

  return (
    <>
      {subType === 'known-word' && (
        <ExistingWord control={control} fieldKey={fieldKey} onRemove={handleRemove} helper={helper} />
      )}
      {subType === 'search-word' && (
        <SearchWord
          onRemove={handleRemove}
          formBaseInfo={formBaseInfo}
          control={control}
          fieldKey={fieldKey}
          setValue={handleSetValue}
          setFocus={setFocus}
          helper={helper}
        />
      )}
      {subType === 'custom-word' && (
        <CustomWord
          onRemove={handleRemove}
          formBaseInfo={formBaseInfo}
          control={control}
          fieldKey={fieldKey}
          helper={helper}
        />
      )}
    </>
  );
});
WordField.displayName = 'WordField';

const ExistingWord: FC<{
  control: Control<LessonInfo, any>;
  fieldKey: `children.${number}`;
  onRemove: () => void;
  helper: Helper;
}> = ({ control, fieldKey, onRemove, helper }) => {
  const value = useWatch({ control, name: fieldKey });

  if (value.type !== 'word' || value.subType !== 'known-word') return null;

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ width: '100%' }}>
        <div>
          <span style={{ marginRight: 5, opacity: 0.5 }}>
            {helper.getCardType(value.word.type, value.word.lang)?.abbr}
          </span>
          <span>{value.word.value}</span>
          <span style={{ margin: '0 10px' }}> - </span>
          <span>{value.word.translation}</span>
        </div>
      </div>
      <MinusOutlined className={styles.clickableIcon} onClick={onRemove} />
    </div>
  );
};

const SearchWord: FC<{
  onRemove: () => void;
  fieldKey: `children.${number}`;
  control: Control<LessonInfo, any>;
  formBaseInfo: FormBaseInfo;
  helper: Helper;
  setValue: UseFormSetValue<LessonInfo>;
  setFocus: UseFormSetFocus<LessonInfo<WordInfo>>;
}> = ({ formBaseInfo, fieldKey, control, setValue, onRemove, setFocus, helper }) => {
  const value = useWatch({ control, name: fieldKey }) as SearchWordInfo;

  const searchValue = (value as SearchWordInfo).searchValue ?? '';
  const wordDisplayType = value.wordDisplayType;
  const [debouncedSearchValue] = useDebounce(searchValue, 300);

  const { data, status, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchWords({
    lang: formBaseInfo.langToLearn,
    searchValue: debouncedSearchValue.trim(),
    translationLang: formBaseInfo.translationLang,
    wordType: wordDisplayType ?? undefined,
    limit: 5,
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
      value: debouncedSearchValue.trim(),
      wordDisplayType: wordDisplayType ?? DEFAULT_WORD_DISPLAY_TYPE,
      translation: '',
      fieldUniqueId: Math.random().toString(),
    });
    setTimeout(() => setFocus(`${fieldKey}.translation`), 10);
  }, [debouncedSearchValue, fieldKey, wordDisplayType, setValue, setFocus]);

  const wordTypeChoices = useWordTypeChoices(formBaseInfo.langToLearn, helper) || [];

  if (value.type !== 'word' || value.subType !== 'search-word') return null;

  const areResultsFound = data && (data.pages.length > 0 || data.pages[0].words.length > 0);

  return (
    <div className={styles.wordSearchContainer}>
      <div className={styles.topPart}>
        <div style={{ width: '100%', display: 'flex', gap: 10 }}>
          <div style={{ flex: 5 }}>
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
          <div style={{ flex: 1 }}>
            <Controller
              name={`${fieldKey}.wordDisplayType`}
              control={control}
              render={({ field }) => (
                <Select<number>
                  options={wordTypeChoices}
                  {...field}
                  allowClear
                  style={{ width: '100%' }}
                  placeholder='Choose type'
                />
              )}
            />
          </div>
        </div>
        <MinusOutlined className={styles.clickableIcon} onClick={onRemove} />
      </div>
      {debouncedSearchValue && (
        <div>
          {status === 'pending' && <LoadingOutlined />}
          {status === 'error' && <span>Error</span>}
          {status === 'success' && data && areResultsFound && (
            <div>
              {data.pages.map((page, index) => (
                <React.Fragment key={index}>
                  {page.words.map((word) => (
                    <div key={word.id} onClick={() => handleChoose(word)}>
                      <span style={{ marginRight: 5, opacity: 0.5 }}>
                        {helper.getCardType(word.type, word.lang)?.abbr}
                      </span>
                      <span>{word.value}</span>
                      <span style={{ margin: '0 10px' }}> - </span>
                      <span>{word.translation}</span>
                    </div>
                  ))}
                </React.Fragment>
              ))}
              {hasNextPage && (
                <Button onClick={() => fetchNextPage()} label='Load more words' loading={isFetchingNextPage} />
              )}
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
  formBaseInfo: FormBaseInfo;
  helper: Helper;
}> = ({ control, onRemove, formBaseInfo, fieldKey, helper }) => {
  const wordTypeChoices = useWordTypeChoices(formBaseInfo.langToLearn, helper) || [];
  return (
    <div>
      <div style={{ width: '100%', display: 'flex', gap: 10 }}>
        <Controller
          name={`${fieldKey}.wordDisplayType`}
          control={control}
          render={({ field }) => <Select<number> options={wordTypeChoices} {...field} />}
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
