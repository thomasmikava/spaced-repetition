import { MinusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Modal, Skeleton } from 'antd';
import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import type { Control } from 'react-hook-form';
import { Controller, FormProvider, useController, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { useCreateNewWord, useOneWord, useUpdateWord } from '../../api/controllers/words/words.query';
import type { AdvancedTranslationDTO, WordWithTranslationDTO } from '../../api/controllers/words/words.schema';
import type { TranslationVariant } from '../../database/types';
import type { Helper } from '../../functions/generate-card-content';
import { useTranslationLangOptions } from '../../hooks/langs';
import Button from '../../ui/Button';
import { useConfirmationModal } from '../../ui/ConfirmationModal';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import { getCreateWordDTO, getWordUpdateActions } from './db-actions';
import type {
  DefaultTranslation,
  FormAdvancedTranslationItem,
  FormData,
  FormTranslation,
  FormVariant,
  WordModalCloseArg,
} from './types';
import { getWholeWordFromPastedData, replaceEmptyObjects } from './utils';
import { Checkbox } from '../../ui/Checkbox/Checkbox';
import { mergeRefs } from 'react-merge-refs';

interface OfficialWordFormModalProps {
  defaultTranslationLang: string;
  learningLang: string;
  defaultType?: number;
  defaultValue?: string;
  wordId: number | undefined;
  customTranslations?: {
    translation?: DefaultTranslation['translation'] | null;
    advancedTranslation?: AdvancedTranslationDTO[] | null;
  };
  onClose: (info: WordModalCloseArg) => void;
  helper: Helper;
}

const OfficialWordFormModal: FC<OfficialWordFormModalProps> = ({
  wordId,
  defaultTranslationLang,
  learningLang,
  customTranslations,
  defaultType,
  onClose,
  defaultValue: defaultWordValue,
  helper,
}) => {
  const [wordLoadedOnce, setWordLoadedOnce] = useState(false);
  const { data: oneWordInitialData, isFetching } = useOneWord(
    !wordLoadedOnce && wordId
      ? { id: wordId, onlyOfficialTranslation: true, includeAllOfficialTranslations: true }
      : null,
  );
  const data = isFetching ? null : oneWordInitialData;
  const isLoaded = !wordId ? true : wordLoadedOnce || !!data;
  const doneOnce = useRef(false);

  const defaultValues = useMemo((): FormData => {
    const def: FormData = {
      lang: learningLang,
      type: defaultType ?? 1,
      mainType: null,
      attributes: null,
      variants: [
        { fieldUniqueId: Math.random().toString(), attrs: null, categoryId: 1, value: defaultWordValue ?? '' },
      ],
      isOfficial: true,
      value: defaultWordValue ?? '',
      translations: customTranslations
        ? [
            {
              ...customTranslations,
              lang: defaultTranslationLang,
              advancedTranslation:
                customTranslations.advancedTranslation?.map((adv) => ({
                  ...adv,
                  fieldUniqueId: Math.random().toString(),
                })) ?? null,
              translation: customTranslations.translation ?? '',
              fieldUniqueId: 'default',
            },
          ]
        : [],
    };
    return replaceEmptyObjects(def);
  }, [customTranslations, defaultTranslationLang, defaultType, defaultWordValue, learningLang]);

  const defaultValuesRef = useRef({ isNew: true, data: defaultValues, wordId: undefined as undefined | number });

  const form = useForm<FormData>({
    defaultValues,
  });

  const reset = form.reset;
  const isDirty = form.formState.isDirty;

  useEffect(() => {
    if (!data || doneOnce.current) return;
    const newForm: FormData = {
      ...data,
      variants: data.variants.map((v) => ({
        id: v.id,
        fieldUniqueId: Math.random().toString(),
        attrs: v.attrs,
        categoryId: v.categoryId,
        value: v.value,
      })),
      translations: data.officialTranslations?.map((t) => ({
        id: t.id,
        fieldUniqueId: Math.random().toString(),
        lang: t.lang,
        translation: t.translation,
        advancedTranslation:
          t.advancedTranslation?.map((advanced: TranslationVariant) => ({
            ...advanced,
            fieldUniqueId: Math.random().toString(),
          })) ?? null,
      })) || [
        {
          lang: defaultTranslationLang,
          translation: '',
          advancedTranslation: null,
          fieldUniqueId: Math.random().toString(),
        },
      ],
    };
    const newDefaultValues = replaceEmptyObjects(newForm);
    defaultValuesRef.current = { isNew: false, data: newDefaultValues, wordId: data.id };
    reset(newDefaultValues);
    setWordLoadedOnce(true);
    doneOnce.current = true;
  });
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const { mutate: createWord } = useCreateNewWord();
  const { mutate: updateWord } = useUpdateWord();

  const { confirmationModalElement, openConfirmationModal } = useConfirmationModal();

  const handleClose = () => {
    const close = () => onClose({ justClosed: true });
    if (isDirty) {
      openConfirmationModal({ text: 'Are you sure you want to close this form?', onApprove: close });
    } else {
      close();
    }
  };

  const handleSuccess = (data: FormData) => {
    const sanitized = replaceEmptyObjects(data);
    const officialTranslation = sanitized.translations.find((t) => t.lang === defaultTranslationLang);
    const translationObj: Pick<WordWithTranslationDTO, 'translation' | 'advancedTranslation'> = {
      translation: officialTranslation?.translation ?? undefined,
      advancedTranslation: officialTranslation?.advancedTranslation ?? undefined,
    };
    const onError = (error: unknown) => {
      setIsSubmitLoading(false);
      alert(typeof error === 'object' && error && 'message' in error && error.message ? error.message : 'Error');
    };
    if (defaultValuesRef.current.isNew) {
      const createDTO = getCreateWordDTO(sanitized);
      setIsSubmitLoading(true);
      createWord(createDTO, {
        onSuccess: (word) => {
          const newWordId = word.id;
          const wordWithTranslation: WordWithTranslationDTO = {
            ...word,
            ...translationObj,
          };
          onClose({ justClosed: false, created: true, wordId: newWordId, word: wordWithTranslation });
        },
        onError,
      });
    } else {
      const wordId = defaultValuesRef.current.wordId as number;
      const dbWordUpdateActions = getWordUpdateActions(wordId, defaultValuesRef.current.data, sanitized);
      if (!dbWordUpdateActions) {
        return onClose({ justClosed: true });
      }
      updateWord(dbWordUpdateActions, {
        onSuccess: (word) => {
          const wordWithTranslation: WordWithTranslationDTO = {
            ...word,
            ...translationObj,
          };
          onClose({ justClosed: false, created: false, wordId, word: wordWithTranslation });
        },
        onError,
      });
    }
  };
  const handleSubmit = form.handleSubmit(handleSuccess, console.error);

  return (
    <Modal
      title={'Edit forms'}
      open={true}
      onOk={() => {}}
      onCancel={handleClose}
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} label='Cancel' />
          <Button onClick={handleSubmit} label='Submit' variant='primary' loading={isSubmitLoading} />
        </div>
      }
      width={1200}
      style={{ maxWidth: 'calc(100% - 84px)' }}
    >
      {!isLoaded ? (
        <Skeleton active />
      ) : (
        <FormProvider {...form}>
          <form onSubmit={handleSubmit}>
            <ActualForm helper={helper} lang={form.getValues('lang')} defaultTranslationLang={defaultTranslationLang} />
          </form>
        </FormProvider>
      )}
      {confirmationModalElement}
    </Modal>
  );
};

const ActualForm: FC<{ helper: Helper; lang: string; defaultTranslationLang: string }> = ({
  helper,
  lang,
  defaultTranslationLang,
}) => {
  return (
    <div>
      <TitleEditor helper={helper} lang={lang} defaultTranslationLang={defaultTranslationLang} />
      <TranslationsEditor helper={helper} wordLang={lang} />
      <VariantsEditor lang={lang} helper={helper} />
    </div>
  );
};

const TitleEditor: FC<{ helper: Helper; lang: string; defaultTranslationLang: string }> = ({
  helper,
  lang,
  defaultTranslationLang,
}) => {
  const { control, getValues, reset } = useFormContext<FormData>();

  const wordValueRef = useRef<InputRef>(null);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if (event.target !== wordValueRef.current?.input) return;
      let newFormData = getWholeWordFromPastedData(event.clipboardData);
      if (newFormData) {
        if (!newFormData.translations.some((lang) => lang.lang === defaultTranslationLang)) {
          newFormData = {
            ...newFormData,
            translations: newFormData.translations.concat([
              {
                lang: defaultTranslationLang,
                translation: '',
                advancedTranslation: null,
                fieldUniqueId: Math.random().toString(),
              },
            ]),
          };
        }
        reset(newFormData);

        event.preventDefault();
      }
    };
    document.addEventListener('paste', onPaste);
    return () => {
      document.removeEventListener('paste', onPaste);
    };
  }, [reset]);

  return (
    <div>
      <Controller
        name='isOfficial'
        control={control}
        render={({ field: { value, ...field } }) => <Checkbox label='Official' checked={value} {...field} />}
      />
      <Controller
        name={`value`}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Input
            placeholder='Word value'
            fullWidth
            {...field}
            ref={mergeRefs([wordValueRef, field.ref])}
            size='large'
            status={error ? 'error' : undefined}
          />
        )}
      />
      <div style={{ display: 'flex', gap: 10, marginTop: 10, marginBottom: 10 }}>
        <TypeSelector helper={helper} lang={lang} fieldKey={'type' as const} title='Word type' allowClear={false} />
        <TypeSelector helper={helper} lang={lang} fieldKey={'mainType' as const} title='Display type' allowClear />
      </div>
      <LabelsSelector fieldKey='labels' control={control} helper={helper} lang={getValues('lang')} />
      <AttributesSelector fieldKey='attributes' control={control} helper={helper} lang={getValues('lang')} />
    </div>
  );
};

const TypeSelector: FC<{ fieldKey: string; title: string; helper: Helper; lang: string; allowClear: boolean }> = ({
  fieldKey,
  title,
  helper,
  lang,
  allowClear,
}) => {
  const { control } = useFormContext<FormData>();
  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 100 }}>{title}:</div>
      <Controller
        name={fieldKey as 'type' | 'mainType'}
        control={control}
        render={({ field }) => (
          <Select
            options={helper.getSupportedCardTypes(lang).map((v) => ({ value: v.id, label: v.name }))}
            onChange={(v) => {
              field.onChange(v ?? (!allowClear ? 1 : null));
            }}
            value={field.value ?? null}
            allowClear={allowClear}
            placeholder='Select type'
            style={{ width: '100%' }}
          />
        )}
      />
    </div>
  );
};

const TranslationsEditor = ({ helper, wordLang }: { helper: Helper; wordLang: string }) => {
  const { fields, append, remove } = useFieldArray<FormData>({
    name: 'translations',
  });
  const translationLangOptions = useTranslationLangOptions();
  const handleAddTranslation = () => {
    const newTranslation: FormTranslation = {
      lang: '',
      translation: '',
      advancedTranslation: null,
      fieldUniqueId: Math.random().toString(),
    };
    append(newTranslation);
  };
  return (
    <div>
      <h2>Translations:</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(fields as FormTranslation[]).map((field, index) => (
          <Translation
            key={field.fieldUniqueId}
            index={index}
            langOptions={translationLangOptions}
            onRemove={remove}
            helper={helper}
            wordLang={wordLang}
          />
        ))}
        <div>
          <Button label='Add translation for other languages' onClick={handleAddTranslation} />
        </div>
      </div>
    </div>
  );
};

const Translation: FC<{
  index: number;
  langOptions: { value: string; label: string }[];
  onRemove: (index: number) => void;
  helper: Helper;
  wordLang: string;
}> = ({ index, onRemove, langOptions, wordLang, helper }) => {
  const { control, watch } = useFormContext<FormData>();
  const translationId = watch(`translations.${index}.id`);
  const lang = watch(`translations.${index}.lang`);
  const { confirmationModalElement, openConfirmationModal } = useConfirmationModal();
  const handleRemove = () => {
    if (translationId) {
      openConfirmationModal({
        text: 'Are you sure you want to delete the translation?',
        onApprove: () => onRemove(index),
      });
    } else {
      onRemove(index);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ minWidth: 100 }}>
          <Controller
            name={`translations.${index}.lang`}
            control={control}
            render={({ field }) => (
              <Select
                options={langOptions}
                {...field}
                style={{ width: '100%' }}
                disabled={!!translationId}
                placeholder='Choose translation language'
                size='large'
              />
            )}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Controller
            name={`translations.${index}.translation`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                placeholder='Word value'
                fullWidth
                {...field}
                value={field.value ?? ''}
                size='large'
                status={error ? 'error' : undefined}
              />
            )}
          />
        </div>
        <MinusOutlined onClick={handleRemove} />
        {confirmationModalElement}
      </div>
      {lang && (
        <TranslationVariantsEditor
          helper={helper}
          index={index}
          lang={lang}
          isExistingTranslation={!!translationId}
          wordLang={wordLang}
        />
      )}
    </div>
  );
};

const LabelsSelector: FC<{
  fieldKey: string;
  control: Control<FormData, unknown>;
  helper: Helper;
  lang: string;
}> = ({ fieldKey, control, helper, lang }) => {
  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 10 }}>
      <span>Labels:</span>
      <Controller
        name={fieldKey as 'labels'}
        control={control}
        render={({ field }) => (
          <Select
            mode='multiple'
            options={helper.getLabels(lang).map((v) => ({ value: v.id, label: v.name }))}
            onChange={field.onChange}
            value={field.value ?? null}
            allowClear
            placeholder='Select labels'
            style={{ width: '100%' }}
          />
        )}
      />
    </div>
  );
};

const AttributesSelector: FC<{
  fieldKey: string;
  control: Control<FormData, unknown>;
  helper: Helper;
  lang: string;
  isMulti?: boolean;
}> = ({ fieldKey, control, helper, lang, isMulti }) => {
  const { field } = useController({ control, name: fieldKey as 'attributes' });
  const attributes = field.value;
  const attributeKeys = Object.keys(attributes || {});
  if (attributeKeys.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10, marginRight: 10 }}>
      {attributeKeys.map((key) => {
        const attrId = +key;
        const attribute = helper.getAttribute(attrId, lang);
        if (!attribute) return null;
        const value = attributes?.[attrId];
        return (
          <div key={attrId}>
            <label style={{ marginRight: 10 }}>{attribute.name}:</label>
            <Select
              mode={isMulti ? 'multiple' : undefined}
              options={helper
                .getAttributeRecordsByAttributeId(attrId, lang)
                .map((v) => ({ value: v.id, label: v.name }))}
              onChange={(value) => field.onChange({ ...attributes, [attrId]: value })}
              value={isMulti && !!value && !Array.isArray(value) ? [value] : value}
              allowClear
              placeholder='Select value'
            />
          </div>
        );
      })}
    </div>
  );
};

const VariantsEditor: FC<{ lang: string; helper: Helper }> = ({ lang, helper }) => {
  const [areShown, setAreShown] = useState(false);
  const toggleVisibility = () => setAreShown((prev) => !prev);
  const { fields, append, remove } = useFieldArray<FormData>({
    name: 'variants',
  });
  const handleAddVariant = () => {
    const newVariant: FormVariant = {
      attrs: null,
      categoryId: null,
      fieldUniqueId: Math.random().toString(),
      value: '',
    };
    append(newVariant);
  };
  return (
    <div>
      <h2 onClick={toggleVisibility} style={{ cursor: 'pointer' }}>
        Variants{areShown ? '▼' : '▶'}
      </h2>
      {areShown && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(fields as FormTranslation[]).map((field, index) => (
            <Variant key={field.fieldUniqueId} index={index} onRemove={remove} lang={lang} helper={helper} />
          ))}
          <div>
            <Button label='Add variant' onClick={handleAddVariant} />
          </div>
        </div>
      )}
    </div>
  );
};

const Variant: FC<{
  index: number;
  onRemove: (index: number) => void;
  helper: Helper;
  lang: string;
}> = ({ index, onRemove, helper, lang }) => {
  const { control, watch } = useFormContext<FormData>();
  const variantId = watch(`variants.${index}.id`);
  const { confirmationModalElement, openConfirmationModal } = useConfirmationModal();
  const handleRemove = () => {
    if (variantId) {
      openConfirmationModal({
        text: 'Are you sure you want to delete the variant?',
        onApprove: () => onRemove(index),
      });
    } else {
      onRemove(index);
    }
  };

  return (
    <div style={{ border: '1px solid black', padding: 10, borderRadius: 10 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Controller
            name={`variants.${index}.value`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                placeholder='Variant value'
                fullWidth
                {...field}
                value={field.value ?? ''}
                size='large'
                status={error ? 'error' : undefined}
              />
            )}
          />
        </div>
        <MinusOutlined onClick={handleRemove} />
        {confirmationModalElement}
      </div>
      <CategorySelector fieldKey={`variants.${index}.categoryId`} control={control} helper={helper} lang={lang} />
      <AttributesSelector fieldKey={`variants.${index}.attrs`} control={control} helper={helper} lang={lang} />
    </div>
  );
};

const CategorySelector: FC<{
  fieldKey: string;
  control: Control<FormData, unknown>;
  helper: Helper;
  lang: string;
}> = ({ fieldKey, control, helper, lang }) => {
  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 10 }}>
      <span>Category:</span>
      <Controller
        name={fieldKey as 'variants.0.categoryId'}
        control={control}
        render={({ field }) => (
          <Select
            options={helper.getCategories(lang).map((v) => ({ value: v.id, label: v.name }))}
            onChange={field.onChange}
            value={field.value}
            allowClear
            placeholder='Select category'
            style={{ width: '100%' }}
          />
        )}
      />
    </div>
  );
};

const TranslationVariantsEditor: FC<{
  lang: string;
  wordLang: string;
  helper: Helper;
  index: number;
  isExistingTranslation: boolean;
}> = ({ lang, helper, index, wordLang, isExistingTranslation }) => {
  const [areShown, setAreShown] = useState(false);
  const toggleVisibility = () => setAreShown((prev) => !prev);
  const fieldKey = `translations.${index}.advancedTranslation` as const;
  const { fields, append, remove } = useFieldArray<FormData>({
    name: fieldKey,
  });
  const handleAddAdvancedTranslation = () => {
    const newVariant: FormAdvancedTranslationItem = {
      translation: '',
      schema: '',
      attrs: {},
      fieldUniqueId: Math.random().toString(),
    };
    append(newVariant);
  };
  return (
    <div>
      <h2 onClick={toggleVisibility}>Advanced translations{areShown ? '▼' : '▶'}</h2>
      {areShown && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(fields as FormTranslation[]).map((field, index) => (
            <TranslationVariantComponent
              key={field.fieldUniqueId}
              fieldKey={`${fieldKey}.${index}`}
              index={index}
              onRemove={remove}
              lang={lang}
              helper={helper}
              isExistingTranslation={isExistingTranslation}
              wordLang={wordLang}
            />
          ))}
          <div>
            <Button label='Add advanced translation' onClick={handleAddAdvancedTranslation} />
          </div>
        </div>
      )}
    </div>
  );
};

const TranslationVariantComponent: FC<{
  index: number;
  fieldKey: `translations.${number}.advancedTranslation.${number}`;
  onRemove: (index: number) => void;
  helper: Helper;
  lang: string;
  wordLang: string;
  isExistingTranslation: boolean;
}> = ({ index, onRemove, helper, wordLang, isExistingTranslation, fieldKey }) => {
  const { control } = useFormContext<FormData>();
  const { confirmationModalElement, openConfirmationModal } = useConfirmationModal();
  const handleRemove = () => {
    if (isExistingTranslation) {
      openConfirmationModal({
        text: 'Are you sure you want to delete this advanced translation?',
        onApprove: () => onRemove(index),
      });
    } else {
      onRemove(index);
    }
  };

  return (
    <div style={{ border: '1px solid black', padding: 10, borderRadius: 10 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Controller
            name={`${fieldKey}.schema`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                placeholder='schema (use # in place of the word)'
                fullWidth
                {...field}
                value={field.value ?? ''}
                size='large'
                status={error ? 'error' : undefined}
              />
            )}
          />
        </div>
        <div style={{ flex: 3 }}>
          <Controller
            name={`${fieldKey}.translation`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                placeholder='translation value'
                fullWidth
                {...field}
                value={field.value ?? ''}
                size='large'
                status={error ? 'error' : undefined}
              />
            )}
          />
        </div>
        <MinusOutlined onClick={handleRemove} />
      </div>
      {confirmationModalElement}
      <AttributesSelector
        fieldKey={`${fieldKey}.attrs`}
        control={control}
        helper={helper}
        lang={wordLang}
        isMulti={true}
      />
    </div>
  );
};

export default OfficialWordFormModal;
