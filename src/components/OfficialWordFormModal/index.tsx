import { useEffect, useRef, useState, type FC } from 'react';
import type { BaseWordVariantDTO, WordDTO, WordWithTranslationDTO } from '../../api/controllers/words/words.schema';
import { useOneWord } from '../../api/controllers/words/words.query';
import { Modal, Skeleton } from 'antd';
import Button from '../../ui/Button';
import type { Control } from 'react-hook-form';
import { Controller, FormProvider, useController, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import type { OptionalKeys } from '../../utils/types';
import { useConfirmationModal } from '../../ui/ConfirmationModal';
import Input from '../../ui/Input';
import { useTranslationLangOptions } from '../../hooks/langs';
import Select from '../../ui/Select';
import { MinusOutlined } from '@ant-design/icons';
import type { Helper } from '../../functions/generate-card-content';

type DefaultTranslation = Pick<WordWithTranslationDTO, 'advancedTranslation' | 'translation'>;

interface OfficialWordFormModalProps {
  defaultTranslationLang: string;
  learningLang: string;
  defaultType?: number;
  defaultValue?: string;
  wordId: number | undefined;
  customTranslations?: DefaultTranslation;
  onClose: () => void;
  helper: Helper;
}

interface FormTranslation extends DefaultTranslation {
  id?: number;
  fieldUniqueId: string;
  lang: string;
}

type FormVariant = OptionalKeys<BaseWordVariantDTO, 'id'> & { fieldUniqueId: string };

interface FormData extends Pick<WordDTO, 'attributes' | 'labels' | 'type' | 'mainType' | 'lang' | 'value'> {
  translations: FormTranslation[];
  variants: FormVariant[];
}

const OfficialWordFormModal: FC<OfficialWordFormModalProps> = ({
  wordId,
  defaultTranslationLang,
  learningLang,
  customTranslations,
  defaultType,
  onClose,
  defaultValue,
  helper,
}) => {
  const { data } = useOneWord(
    wordId ? { id: wordId, onlyOfficialTranslation: true, includeAllOfficialTranslations: true } : null,
  );
  const isLoaded = !wordId ? true : !!data;
  const doneOnce = useRef(false);

  const form = useForm<FormData>({
    defaultValues: {
      lang: learningLang,
      type: defaultType,
      variants: [],
      value: defaultValue,
      translations: customTranslations
        ? [
            {
              lang: defaultTranslationLang,
              ...customTranslations,
              fieldUniqueId: 'default',
            },
          ]
        : [],
    },
  });

  const reset = form.reset;
  const isDirty = form.formState.isDirty;

  useEffect(() => {
    if (!data || doneOnce.current) return;
    reset({
      ...data,
      variants: data.variants.map((v) => ({
        id: v.id,
        fieldUniqueId: Math.random().toString(),
        attrs: v.attrs,
        categoryId: v.categoryId,
        value: v.value,
      })),
      value: defaultValue,
      translations:
        data.officialTranslations?.map((t) => ({
          id: t.id,
          fieldUniqueId: Math.random().toString(),
          lang: t.lang,
          translation: t.translation,
          advancedTranslation: t.advancedTranslation,
        })) || [],
    });
    doneOnce.current = true;
  });

  const { confirmationModalElement, openConfirmationModal } = useConfirmationModal();

  const handleClose = () => {
    if (isDirty) {
      openConfirmationModal({ text: 'Are you sure you want to close this form?', onApprove: onClose });
    } else {
      onClose();
    }
  };

  const handleSuccess = (data: FormData) => {};
  const handleSubmit = form.handleSubmit(handleSuccess, console.error);

  return (
    <Modal
      title={'Edit official word'}
      open={true}
      onOk={() => {}}
      onCancel={handleClose}
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} label='Cancel' />
          <Button onClick={handleSubmit} label='Submit' variant='primary' />
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
            <ActualForm helper={helper} lang={form.getValues('lang')} />
          </form>
        </FormProvider>
      )}
      {confirmationModalElement}
    </Modal>
  );
};

const ActualForm: FC<{ helper: Helper; lang: string }> = ({ helper, lang }) => {
  return (
    <div>
      <TitleEditor helper={helper} />
      <TranslationsEditor />
      <VariantsEditor lang={lang} helper={helper} />
    </div>
  );
};

const TitleEditor: FC<{ helper: Helper }> = ({ helper }) => {
  const { control, getValues } = useFormContext<FormData>();
  return (
    <div>
      <Controller
        name={`value`}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Input placeholder='Word value' fullWidth {...field} size='large' status={error ? 'error' : undefined} />
        )}
      />
      <LabelsSelector fieldKey='labels' control={control} helper={helper} lang={getValues('lang')} />
      <AttributesSelector fieldKey='attributes' control={control} helper={helper} lang={getValues('lang')} />
    </div>
  );
};

const TranslationsEditor = () => {
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
          <Translation key={field.fieldUniqueId} index={index} langOptions={translationLangOptions} onRemove={remove} />
        ))}
        <div>
          <Button label='Add translation for other languages' onClick={() => append(handleAddTranslation)} />
        </div>
      </div>
    </div>
  );
};

const Translation: FC<{
  index: number;
  langOptions: { value: string; label: string }[];
  onRemove: (index: number) => void;
}> = ({ index, onRemove, langOptions }) => {
  const { control, watch } = useFormContext<FormData>();
  const translationId = watch(`translations.${index}.id`);
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
}> = ({ fieldKey, control, helper, lang }) => {
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
        return (
          <div>
            <label style={{ marginRight: 10 }}>{attribute.name}:</label>
            <Select
              options={helper
                .getAttributeRecordsByAttributeId(attrId, lang)
                .map((v) => ({ value: v.id, label: v.name }))}
              onChange={(value) => field.onChange({ ...attributes, [attrId]: value })}
              value={attributes?.[attrId]}
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
      <h2 onClick={toggleVisibility}>Variants{areShown ? '▼' : '▶'}</h2>
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

export default OfficialWordFormModal;
