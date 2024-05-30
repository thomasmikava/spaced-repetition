/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, type FC } from 'react';
import Button from '../../../ui/Button';
import type {
  Control,
  FieldError,
  UseFormGetValues,
  UseFormSetFocus,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
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
import type { WordDTO, WordWithTranslationDTO } from '../../../api/controllers/words/words.schema';
import { useSearchWords } from '../../../api/controllers/words/words.query';
import { useDebounce } from 'use-debounce';
import Select from '../../../ui/Select';
import { useValidation } from './Form.validation';
import React from 'react';
import type { Helper } from '../../../functions/generate-card-content';
import { useWordTypeChoices } from '../../../hooks/cards';

interface SearchWordInfo {
  fieldUniqueId: string;
  type: 'word';
  subType: 'search-word';
  wordValue: string;
  wordDisplayType?: number;
  word?: WordWithTranslationDTO;
  translation: string;
  advancedTranslation: WordWithTranslationDTO['advancedTranslation'];
  changed?: boolean;
}

export const DEFAULT_WORD_DISPLAY_TYPE = 1;

export type WordInfo = SearchWordInfo;

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

// const emptyWord: WordInfo = { type: 'word', subType: 'search-word', wordValue: '', fieldUniqueId: '2' };

const emptyValues: FormData = {
  children: [
    {
      type: 'lesson',
      id: 1,
      title: '',
      description: '',
      fieldUniqueId: '1',
      children: [],
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
      const newLesson: LessonInfo = {
        type: 'lesson',
        title: '',
        description: '',
        children: [
          // {
          //   type: 'word',
          //   subType: 'search-word',
          //   wordValue: '',
          //   fieldUniqueId: Math.random().toString(),
          // },
        ],
        fieldUniqueId: Math.random().toString(),
      };
      append(newLesson);
    }, [append]);

    const handleAddNewWord = useCallback(() => {
      const newWord: WordInfo = {
        type: 'word',
        subType: 'search-word',
        wordValue: '',
        translation: '',
        advancedTranslation: null,
        fieldUniqueId: Math.random().toString(),
      };
      append(newWord);
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
        {isCourseLevel && <Button label={'Add new top-level lesson'} variant='default' onClick={handleAddNewLesson} />}
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
    field: { value: fieldValue },
  } = useController({ control, name: `${fieldKey}.children` });
  const childrenError = (error as { root?: FieldError } | undefined)?.root ?? error;

  const areOnlyWords = fieldValue.every((f) => f.type === 'word');
  const areOnlyLessons = fieldValue.every((f) => f.type === 'lesson');
  const hasChildren = fieldValue.length > 0;

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
              size='large'
              inputProps={{ status: error ? 'error' : undefined }}
            />
          )}
        />
        <Dropdown
          menu={{
            items: [
              { label: 'Add sub lesson', key: 'add-l', icon: <PlusOutlined />, onClick: handleAddNewLesson },
              { label: 'Add new word', key: 'add-w', icon: <PlusOutlined />, onClick: handleAddNewWord },
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
          <Button label={<SettingFilled />} size='large' />
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
        {(!hasChildren || !areOnlyLessons) && (
          <Button
            style={{ marginTop: 10, marginRight: 10 }}
            label={
              <span>
                <PlusOutlined />
                <span style={{ marginLeft: 10 }}>Add new word</span>
              </span>
            }
            onClick={handleAddNewWord}
          />
        )}
        {(!hasChildren || !areOnlyWords) && (
          <Button
            style={{ marginTop: 10 }}
            label={
              <span>
                <PlusOutlined />
                <span style={{ marginLeft: 10 }}>Add sub-level</span>
              </span>
            }
            onClick={handleAddNewLesson}
          />
        )}
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
  const { control, setValue, getValues, trigger, setFocus, watch } = useFormContext<LessonInfo>();

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
      {subType === 'search-word' && (
        <SearchWord
          onRemove={handleRemove}
          formBaseInfo={formBaseInfo}
          control={control}
          fieldKey={fieldKey}
          setValue={handleSetValue}
          setFocus={setFocus}
          getValues={getValues}
          helper={helper}
          watchFn={watch}
        />
      )}
    </>
  );
});
WordField.displayName = 'WordField';

const SearchWord: FC<{
  onRemove: () => void;
  fieldKey: `children.${number}`;
  control: Control<LessonInfo, any>;
  formBaseInfo: FormBaseInfo;
  helper: Helper;
  setValue: UseFormSetValue<LessonInfo>;
  setFocus: UseFormSetFocus<LessonInfo<WordInfo>>;
  getValues: UseFormGetValues<LessonInfo<WordInfo>>;
  watchFn: UseFormWatch<LessonInfo<WordInfo>>;
}> = ({ formBaseInfo, fieldKey, control, setValue, getValues, setFocus, onRemove, helper }) => {
  const searchValue = useWatch({ control, name: `${fieldKey}.wordValue` }) as string;
  const wordDisplayType = useWatch({ control, name: `${fieldKey}.wordDisplayType` }) as number | undefined;
  const word = useWatch({ control, name: `${fieldKey}.word` }) as WordDTO | undefined;
  const isChanged = useWatch({ control, name: `${fieldKey}.changed` }) as WordDTO | undefined;

  // const [isBlurred, setIsBlurred] = useState(true);

  const lastWordRef = useRef(word);

  const areSame = word?.value === searchValue;
  const [debouncedSearchValue] = useDebounce(searchValue, 300);

  const finalSearchValue = areSame && !isChanged ? '' : debouncedSearchValue.trim();
  const { data, status, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchWords({
    lang: formBaseInfo.langToLearn,
    searchValue: finalSearchValue,
    translationLang: formBaseInfo.translationLang,
    wordType: wordDisplayType ?? undefined,
    limit: 5,
  });

  const handleChoose = useCallback(
    (suggestion: WordWithTranslationDTO) => {
      // debugger;
      const currentValue = getValues(fieldKey) as SearchWordInfo;
      setValue(fieldKey, {
        ...currentValue,
        word: suggestion,
        translation: suggestion.translation ?? currentValue.translation,
        advancedTranslation: suggestion.advancedTranslation ?? currentValue.advancedTranslation,
        wordValue: suggestion.value,
        wordDisplayType: suggestion.mainType ?? suggestion.type,
        changed: false,
      });
      lastWordRef.current = suggestion;
      setFocus(`${fieldKey}.translation`);
    },
    [fieldKey, setValue, getValues, setFocus],
  );

  const wordTypeChoices = useWordTypeChoices(formBaseInfo.langToLearn, helper) || [];

  return (
    <div className={styles.wordSearchContainer}>
      <div className={styles.topPart}>
        <div style={{ width: '100%', display: 'flex', gap: 10 }}>
          <div style={{ flex: 2 }}>
            <Controller
              name={`${fieldKey}.wordValue`}
              control={control}
              render={({ field: { onBlur, onChange, ...rest }, fieldState: { error } }) => (
                <>
                  <Input
                    placeholder='Word'
                    fullWidth
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setValue(`${fieldKey}.changed`, true);
                      if (lastWordRef.current) {
                        if (newValue === lastWordRef.current.value) {
                          setValue(`${fieldKey}.word`, lastWordRef.current);
                        } else {
                          setValue(`${fieldKey}.word`, undefined);
                        }
                      }
                      onChange(e);
                    }}
                    onFocus={() => {
                      // setIsBlurred(false);
                    }}
                    onBlur={() => {
                      // setTimeout(() => setIsBlurred(true), 100);
                      onBlur();
                    }}
                    {...rest}
                    size='large'
                  />
                  {error && <p style={{ color: 'red' }}>Choose one of the options or clear the search field</p>}
                </>
              )}
            />
          </div>
          <div style={{ flex: 5 }}>
            <Controller
              name={`${fieldKey}.translation`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  placeholder='translation'
                  fullWidth
                  {...field}
                  size='large'
                  inputProps={{ status: error ? 'error' : undefined }}
                />
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
                  size='large'
                />
              )}
            />
          </div>
        </div>
        <MinusOutlined className={styles.clickableIcon} onClick={onRemove} />
      </div>
      {finalSearchValue && (
        <Suggestions
          data={data}
          status={status}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          handleChoose={handleChoose}
          helper={helper}
        />
      )}
    </div>
  );
};

type SuggestionProps = Pick<
  ReturnType<typeof useSearchWords>,
  'data' | 'status' | 'fetchNextPage' | 'hasNextPage' | 'isFetchingNextPage'
> & {
  handleChoose: (word: WordWithTranslationDTO) => void;
  helper: Helper;
};

const Suggestions: FC<SuggestionProps> = memo(
  ({ data, status, handleChoose, hasNextPage, fetchNextPage, isFetchingNextPage, helper }) => {
    const areResultsFound = data && (data.pages.length > 0 || data.pages[0].words.length > 0);

    return (
      <div>
        {status === 'pending' && <LoadingOutlined />}
        {status === 'error' && <span>Error</span>}
        {status === 'success' && data && areResultsFound && (
          <div className={styles.suggestionsContainer}>
            <div className={styles.suggestedWords}>
              {data.pages.map((page, index) => (
                <React.Fragment key={index}>
                  {page.words.map((word) => (
                    <div key={word.id} onClick={() => handleChoose(word)} className={styles.wordSuggestion}>
                      <span>{word.value}</span>
                      <span>{word.translation}</span>
                      <span style={{ marginRight: 5, opacity: 0.5 }}>
                        {helper.getCardType(word.type, word.lang)?.abbr}
                      </span>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
            {hasNextPage && (
              <Button onClick={() => fetchNextPage()} label='Load more words' loading={isFetchingNextPage} />
            )}
          </div>
        )}
      </div>
    );
  },
);

export { ContentForm };
