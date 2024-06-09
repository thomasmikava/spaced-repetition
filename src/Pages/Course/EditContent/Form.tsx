/* eslint-disable @typescript-eslint/no-explicit-any */
import type { KeyboardEventHandler } from 'react';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type FC,
} from 'react';
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
import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
  LoadingOutlined,
  MinusOutlined,
  PlusOutlined,
  SettingFilled,
} from '@ant-design/icons';
import type { WordWithTranslationDTO } from '../../../api/controllers/words/words.schema';
import { useSearchWords } from '../../../api/controllers/words/words.query';
import { useDebounce } from 'use-debounce';
import Select from '../../../ui/Select';
import { useValidation } from './Form.validation';
import React from 'react';
import type { Helper } from '../../../functions/generate-card-content';
import { useWordTypeChoices } from '../../../hooks/cards';
import { mergeRefs } from 'react-merge-refs';
import type { InputRef } from 'antd/es/input';
import { as } from '../../../utils/common';
import DictionaryModal from '../../../components/DictionaryModal';
import type { ItemType } from 'antd/es/menu/interface';
import { isNonNullable } from '../../../utils/array';
import { pickKeys } from '../../../utils/object';
import type { WordModalCloseArg } from '../../../components/OfficialWordFormModal/types';
import OfficialWordFormModal from '../../../components/OfficialWordFormModal';
import { Tooltip } from 'antd';
import { useConfirmationModal } from '../../../ui/ConfirmationModal';

interface SearchWordInfo {
  fieldUniqueId: string;
  type: 'word';
  subType: 'search-word';
  wordValue: string;
  wordDisplayType?: number;
  makeOfficial?: boolean;
  word?: WordWithTranslationDTO;
  translation: string;
  advancedTranslation: WordWithTranslationDTO['advancedTranslation'];
  changed?: boolean;
  askedForChangeConfirmation?: boolean;
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
  canManageOfficialWords: boolean;
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
    canManageOfficialWords,
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

    const handleSubmit = form.handleSubmit(handleSuccess, console.error);

    const formBaseInfo = useMemo(
      (): FormBaseInfo => ({
        langToLearn,
        isValidationStarted: isSubmitted,
        translationLang,
        handleSubmit,
        canManageOfficialWords,
      }),
      [langToLearn, isSubmitted, translationLang, handleSubmit, canManageOfficialWords],
    );

    console.log('top level re-render');

    return (
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
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
  canManageOfficialWords: boolean;
  handleSubmit: () => Promise<void>;
}

interface FieldArrayProps {
  fieldKey: 'children' | `children.${number}.children`;
  isCourseLevel: boolean;
  formBaseInfo: FormBaseInfo;
  helper: Helper;
  onAddNewWord?: (newWords?: AddNewWordInfo[]) => void;
}

interface FieldArrayRef {
  addNewLesson: () => void;
  addNewWord: (newWords?: AddNewWordInfo[]) => void;
}

export type AddNewWordInfo =
  | { wordValue: string; translation?: string; word?: undefined }
  | { word: WordWithTranslationDTO; customTranslation?: string };

export interface JSONPasteWords {
  type: 'internal-paste';
  words: AddNewWordInfo[];
}

const FieldArray = memo(
  forwardRef<FieldArrayRef, FieldArrayProps>(({ fieldKey, isCourseLevel, formBaseInfo, onAddNewWord, helper }, ref) => {
    const { control } = useFormContext<FormData>();

    const { fields, append, remove } = useFieldArray({
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

    const handleAddNewWord = useCallback(
      (values: AddNewWordInfo[] = [{ wordValue: '', translation: '' }]) => {
        for (const value of values) {
          const newWord: WordInfo = value.word
            ? {
                type: 'word',
                subType: 'search-word',
                wordValue: value.word.value,
                word: value.word,
                translation: value.customTranslation ?? value.word.translation ?? '',
                advancedTranslation: value.word.advancedTranslation ?? null,
                wordDisplayType:
                  value.word.mainType ?? (value.word.type === DEFAULT_WORD_DISPLAY_TYPE ? undefined : value.word.type),
                fieldUniqueId: Math.random().toString(),
              }
            : {
                type: 'word',
                subType: 'search-word',
                wordValue: value.wordValue,
                translation: value.translation ?? '',
                advancedTranslation: null,
                fieldUniqueId: Math.random().toString(),
              };
          append(newWord);
        }
      },
      [append],
    );

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
          const isLastChild = index === fields.length - 1;
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
              onAddNewWord={onAddNewWord}
              isLastChild={isLastChild}
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

  const handleAddNewWord = (newWords?: AddNewWordInfo[]) => {
    if (!fieldArrayRef.current) return;
    fieldArrayRef.current.addNewWord(newWords);
  };

  return (
    <div className={styles.lessonFieldContainer}>
      <div className={styles.lessonTitle}>
        <Controller
          name={`${fieldKey}.title`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input placeholder='Lesson title' fullWidth {...field} size='large' status={error ? 'error' : undefined} />
          )}
        />
        <Dropdown
          menu={{
            items: [
              { label: 'Add sub lesson', key: 'add-l', icon: <PlusOutlined />, onClick: handleAddNewLesson },
              { label: 'Add new word', key: 'add-w', icon: <PlusOutlined />, onClick: () => handleAddNewWord() },
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
          onAddNewWord={handleAddNewWord}
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
            onClick={() => handleAddNewWord()}
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
  onAddNewWord?: (newWords?: AddNewWordInfo[]) => void;
  isLastChild: boolean;
}

const WordField: FC<WordFieldProps> = memo(
  ({ fieldKey, parentKey, formBaseInfo, index, onRemove, onAddNewWord, isLastChild, helper }) => {
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
            onAddNewWord={onAddNewWord}
            isLastChild={isLastChild}
          />
        )}
      </>
    );
  },
);
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
  onAddNewWord?: (newWords?: AddNewWordInfo[]) => void;
  isLastChild: boolean;
}> = ({
  formBaseInfo,
  fieldKey,
  control,
  setValue,
  getValues,
  setFocus,
  onRemove,
  onAddNewWord,
  isLastChild,
  helper,
}) => {
  const searchValue = useWatch({ control, name: `${fieldKey}.wordValue` }) as string;
  const wordDisplayType = useWatch({ control, name: `${fieldKey}.wordDisplayType` });
  const word = useWatch({ control, name: `${fieldKey}.word` });
  const isChanged = useWatch({ control, name: `${fieldKey}.changed` });
  const askedForChangeConfirmation = useWatch({ control, name: `${fieldKey}.askedForChangeConfirmation` });

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

  const wodValueRef = useRef<InputRef>(null);

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

  const handleEnterClick: KeyboardEventHandler = (e) => {
    if (e.ctrlKey) {
      // continue to submit the form
      formBaseInfo.handleSubmit();
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    if (isLastChild) onAddNewWord?.();
  };

  const { confirmationModalElement, openConfirmationModal } = useConfirmationModal();

  const shouldAskForConfirmationWhenChanging =
    !askedForChangeConfirmation && formBaseInfo.canManageOfficialWords && !!word && word.isOfficial;

  const notifyIfNecessary = (fn: () => void, key: string) => {
    openConfirmationModal({
      text: 'This will only change the translation for you and will not affect the official word. If you wish to change official translation, click settings icon and then "Edit forms" and modify the translation there',
      approveTitle: 'Change translation only for me',
      onApprove: () => {
        fn();
        setFocus(key as never);
        setValue(`${fieldKey}.askedForChangeConfirmation`, true);
      },
      rejectTitle: 'Cancel',
      displayRejectButtonAsPrimary: true,
    });
  };

  const isEmptyWordValue = !searchValue;

  useEffect(() => {
    if (isLastChild && onAddNewWord && isEmptyWordValue) {
      const onPaste = (event: ClipboardEvent) => {
        if (event.target !== wodValueRef.current?.input) return;

        const newWords = getWordsFromPastedData(event.clipboardData);

        if (newWords) {
          console.log('pasted words', newWords);
          onRemove();
          onAddNewWord(newWords);
          event.preventDefault();
        }
      };
      document.addEventListener('paste', onPaste);
      return () => {
        document.removeEventListener('paste', onPaste);
      };
    }
  }, [isLastChild, onAddNewWord, isEmptyWordValue, onRemove]);

  const wordTypeChoices = useWordTypeChoices(formBaseInfo.langToLearn, helper) || [];

  return (
    <div className={styles.wordSearchContainer}>
      <div className={styles.topPart}>
        <div style={{ width: '100%', display: 'flex', gap: 10 }}>
          <div style={{ flex: 2 }}>
            <Controller
              name={`${fieldKey}.wordValue`}
              control={control}
              render={({ field: { onBlur, onChange, ref, ...rest }, fieldState: { error } }) => (
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
                    onEnterClick={handleEnterClick}
                    ref={mergeRefs([wodValueRef, ref])}
                    {...rest}
                    status={error ? 'error' : undefined}
                    size='large'
                  />
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
                  onChange={
                    !shouldAskForConfirmationWhenChanging
                      ? field.onChange
                      : (e) => {
                          const newValue = e.target.value;
                          notifyIfNecessary(() => field.onChange(newValue), `${fieldKey}.translation`);
                        }
                  }
                  size='large'
                  status={error ? 'error' : undefined}
                  onEnterClick={handleEnterClick}
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
        <WordAdvancedActions
          formBaseInfo={formBaseInfo}
          word={word}
          fieldKey={fieldKey}
          key={word ? word.id : 'unknown'}
          helper={helper}
          handleOfficialWordChoose={handleChoose}
        />
        {formBaseInfo.canManageOfficialWords && <OfficialityIcon control={control} fieldKey={fieldKey} />}
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
          translationLang={formBaseInfo.translationLang}
        />
      )}
      {confirmationModalElement}
    </div>
  );
};

interface WordAdvancedActionsProps {
  formBaseInfo: FormBaseInfo;
  word: WordWithTranslationDTO | undefined;
  fieldKey: `children.${number}`;
  helper: Helper;
  handleOfficialWordChoose: (word: WordWithTranslationDTO) => void;
}

type A = SearchWordInfo & {
  customTranslations: Pick<WordWithTranslationDTO, 'translation' | 'advancedTranslation'> | null;
};

const WordAdvancedActions: FC<WordAdvancedActionsProps> = ({
  formBaseInfo,
  word,
  fieldKey,
  helper,
  handleOfficialWordChoose,
}) => {
  const [isWordFormsModalOpen, setIsWordFormsModalOpen] = useState(false);
  const [userWordData, setUserWordData] = useState<A>();
  const { getValues } = useFormContext<LessonInfo>();
  const handleOfficialWordOpen = () => {
    const data = getValues(fieldKey);
    if (data.type !== 'word') return;
    const areTranslationsIdentical =
      !!word &&
      data.translation === word.translation &&
      JSON.stringify(word.advancedTranslation ?? null) === JSON.stringify(data.advancedTranslation ?? null);
    setUserWordData({
      ...data,
      customTranslations: areTranslationsIdentical ? null : pickKeys(data, 'translation', 'advancedTranslation'),
    });
    setIsWordFormsModalOpen(true);
  };
  const handleClose = (arg: WordModalCloseArg) => {
    setIsWordFormsModalOpen(false);
    setUserWordData(undefined);
    if (!arg.justClosed) {
      handleOfficialWordChoose(arg.word);
    }
  };
  const items: ItemType[] = [
    formBaseInfo.canManageOfficialWords
      ? {
          label: word ? 'Edit forms' : 'Create official word',
          key: 'add-l',
          icon: word ? <EditOutlined /> : <PlusOutlined />,
          onClick: handleOfficialWordOpen,
        }
      : null,
    // TODO: add possibility to hide words for non-admins as well,
  ];
  const filteredItems = items.filter(isNonNullable);
  if (filteredItems.length === 0) return null;

  return (
    <>
      <Dropdown
        menu={{
          items: filteredItems,
        }}
        placement='bottom'
      >
        <Button label={<SettingFilled />} size='large' />
      </Dropdown>
      {isWordFormsModalOpen && (
        <OfficialWordFormModal
          defaultTranslationLang={formBaseInfo.translationLang}
          wordId={word?.id}
          customTranslations={userWordData?.customTranslations ?? undefined}
          onClose={handleClose}
          defaultType={userWordData?.wordDisplayType}
          learningLang={formBaseInfo.langToLearn}
          defaultValue={userWordData?.wordValue}
          helper={helper}
        />
      )}
    </>
  );
};

const OfficialityIcon: FC<{
  fieldKey: `children.${number}`;
  control: Control<LessonInfo, any>;
}> = memo(({ control, fieldKey }) => {
  const { setValue } = useFormContext<LessonInfo>();
  const word = useWatch({ control, name: `${fieldKey}.word` });
  const translation = useWatch({ control, name: `${fieldKey}.translation` });
  const advancedTranslation = useWatch({ control, name: `${fieldKey}.advancedTranslation` });
  const makeOfficial = useWatch({ control, name: `${fieldKey}.makeOfficial` });

  const status = (() => {
    if (!word && makeOfficial) return 'will-become-official';
    if (!word || !word.isOfficial) return 'not-official';
    if (
      translation === word.translation &&
      JSON.stringify(advancedTranslation ?? null) === JSON.stringify(word.advancedTranslation ?? null)
      // TODO: check word type as well
    ) {
      return 'unchanged-official';
    }
    return 'changed-official';
  })();

  const isAlreadyCreated = !!word;

  // eslint-disable-next-line sonarjs/cognitive-complexity
  return useMemo(() => {
    const handleClick = () => {
      if (status === 'will-become-official') {
        setValue(`${fieldKey}.makeOfficial`, undefined);
      } else if (status === 'not-official') {
        setValue(`${fieldKey}.makeOfficial`, true);
      }
    };
    return (
      <Tooltip
        title={
          status === 'will-become-official'
            ? 'Word will become official after lesson creation; Click to disable it'
            : status === 'not-official'
              ? `Word is not official${isAlreadyCreated ? "; Click settings icon, then 'Edit forms' and modify 'Official' checkbox" : '; Click to create official form once lesson is created'}`
              : status === 'unchanged-official'
                ? 'Word is official'
                : 'Word is official, but you have changed translation'
        }
      >
        <div
          className={
            styles.globeWorld +
            ' ' +
            (status === 'will-become-official'
              ? styles.willBecomeOfficialWord
              : status === 'not-official'
                ? isAlreadyCreated
                  ? styles.notOfficialWordAlreadyCreated
                  : styles.notOfficialWord
                : status === 'unchanged-official'
                  ? styles.unChangedOfficialWord
                  : styles.changedOfficialWord)
          }
        >
          <GlobalOutlined onClick={handleClick} />
        </div>
      </Tooltip>
    );
  }, [status, setValue, fieldKey, isAlreadyCreated]);
});

type SuggestionProps = Pick<
  ReturnType<typeof useSearchWords>,
  'data' | 'status' | 'fetchNextPage' | 'hasNextPage' | 'isFetchingNextPage'
> & {
  handleChoose: (word: WordWithTranslationDTO) => void;
  helper: Helper;
  translationLang: string;
};

const Suggestions: FC<SuggestionProps> = memo(
  ({ data, status, handleChoose, hasNextPage, fetchNextPage, isFetchingNextPage, translationLang, helper }) => {
    const areResultsFound = data && (data.pages.length > 0 || data.pages[0].words.length > 0);

    const [displayedWordId, setDisplayedWordId] = useState<number | null>(null);

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
                    <button key={word.id} onClick={() => handleChoose(word)} className={styles.wordSuggestion}>
                      <span>{word.value}</span>
                      <span>{word.translation}</span>
                      <span style={{ marginRight: 5, opacity: 0.5 }}>
                        {helper.getCardType(word.type, word.lang)?.abbr}
                      </span>
                      <span onClick={(e) => e.stopPropagation()}>
                        <Button label={<BookOutlined />} variant='text' onClick={() => setDisplayedWordId(word.id)} />
                      </span>
                    </button>
                  ))}
                </React.Fragment>
              ))}
            </div>
            {hasNextPage && (
              <Button onClick={() => fetchNextPage()} label='Load more words' loading={isFetchingNextPage} />
            )}
          </div>
        )}

        {displayedWordId && !!translationLang && (
          <DictionaryModal
            wordId={displayedWordId}
            helper={helper}
            onClose={() => setDisplayedWordId(null)}
            translationLang={translationLang}
          />
        )}
      </div>
    );
  },
);

export { ContentForm };

const getWordsFromPastedData = (clipboardData: DataTransfer | null): AddNewWordInfo[] | null => {
  const tableData = getTableFromClipboard(clipboardData);
  if (tableData) {
    console.log('tableData', tableData);
    const first2Cols = getFirstNNonEmptyColumns(tableData, 2, (v) => !v).filter((e) => e.some((e) => !!e));
    if (first2Cols.length === 0) return null;

    return first2Cols.map((e) => ({
      wordValue: e[0],
      translation: e[1],
    }));
  }

  const wordsData = getWordsFromClipboard(clipboardData);
  if (wordsData) {
    return wordsData;
  }

  return null;
};

const getTableFromClipboard = (clipboardData: DataTransfer | null) => {
  try {
    if (!clipboardData) return null;
    const pastedData = clipboardData.getData('text/html');

    // Validate if the pasted data is likely HTML
    if (!pastedData || (!pastedData.includes('<html>') && !pastedData.includes('<table>'))) {
      // Pasted data is not HTML or does not contain table elements
      return null;
    }

    // Use DOMParser to parse the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(pastedData, 'text/html');

    // Find the table body
    const tbody = doc.querySelector('tbody');
    if (!tbody) {
      // No table body found in the pasted HTML
      return null;
    }

    // Initialize a 2D array to hold the table data
    const tableArray: string[][] = [];

    // Iterate over each row in the tbody
    if (tbody) {
      tbody.querySelectorAll('tr').forEach(function (row) {
        const rowData: string[] = [];
        // Iterate over each cell in the row
        row.querySelectorAll('td').forEach(function (cell) {
          // Extract text and push into the rowData array
          rowData.push((cell.textContent || '').trim());
        });
        // Push rowData into tableArray
        tableArray.push(rowData);
      });
    }

    // Log the 2D array to see the output
    return tableArray;
  } catch (e) {
    return null;
  }
};

const getWordsFromClipboard = (clipboardData: DataTransfer | null): AddNewWordInfo[] | null => {
  try {
    if (!clipboardData) return null;
    const pastedData = clipboardData.getData('text');

    if (!pastedData) return null;

    const value = JSON.parse(pastedData);

    if (value === null || typeof value !== 'object' || value.type !== 'internal-paste') return null;

    if (!('words' in value) || !Array.isArray(value.words)) return null;

    as<JSONPasteWords>(value);
    return value.words;
  } catch (e) {
    return null;
  }
};

function getFirstNNonEmptyColumns<T>(tableData: T[][], n: number, isEmpty: (cellValue: T) => boolean) {
  const result: T[][] = [];
  for (let i = 0; i < tableData.length; i++) {
    const row = tableData[i];
    const newRow: T[] = [];
    for (let j = 0; j < row.length && newRow.length < n; j++) {
      if (!isEmpty(row[j])) newRow.push(row[j]);
    }
    result.push(newRow);
  }
  return result;
}
