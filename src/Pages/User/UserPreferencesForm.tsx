/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import Form from 'antd/es/form';
import { useState, type FC } from 'react';
import type { Control, UseFormWatch } from 'react-hook-form';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { defaultPreferences } from '../../functions/preferences';
import { useLangToLearnOptions } from '../../hooks/langs';
import Button from '../../ui/Button';
import ChipsSwitch from '../../ui/ChipsSwitch';
import Select from '../../ui/Select';
import { useValidation } from './Form.validation';
import styles from './styles.module.css';
import { cardTypeRecordLocalizations } from '../../database/card-types';
import SectionSwitch from '../../ui/SectionSwitch';
import { arrayToObject } from '../../utils/array';
import Modal from 'antd/es/modal/Modal';
import SortableList, { SortableItem } from 'react-easy-sort';

interface SinglePreference {
  autoSubmitCorrectAnswers?: boolean | null;
  testTypingTranslation?: boolean | null;
  askNonStandardVariants?: boolean | null;
  translationAtBottom?: boolean;
  hideRegularTranslationIfAdvanced?: boolean;
}

interface LangCardGroupSettings {
  hideGroup?: boolean | null;
  askNonStandardVariants?: boolean | null;
}

export interface CardTypeSettingsDTO {
  hideGroups?: boolean;
  askNonStandardVariants?: boolean;
  groupOrder?: string[];
  groupSettings?: { group: string; preferences: LangCardGroupSettings }[];
}

export interface LangPreference extends SinglePreference {
  cardTypeSettings?: Record<`x${string}`, CardTypeSettingsDTO | undefined>; // x is added in the key so that object is created instead of array when use hook deals with dynamic creation
}

export interface UserPreferencesFormData {
  global: SinglePreference;
  languages: { lang: string; preferences: LangPreference }[];
}

interface Props {
  defaultData: UserPreferencesFormData;
  onSave: (data: UserPreferencesFormData) => void;
  isSubmitting?: boolean;
}

export const UserPreferencesForm = ({ defaultData, onSave, isSubmitting }: Props) => {
  const { resolver } = useValidation();
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    getValues,
  } = useForm<UserPreferencesFormData>({
    defaultValues: defaultData,
    resolver,
  });
  console.log(errors, getValues());

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
      <div className={styles.pref}>
        <Form.Item label='Show translations after input'>
          <Controller
            name={`${fieldKey}.translationAtBottom`}
            control={control}
            render={({ field }) => <YesNo field={field} defaultValue={defaultValues.translationAtBottom} />}
          />
        </Form.Item>
      </div>
      <div className={styles.pref}>
        <Form.Item label='Hide main translation if advanced translations are given'>
          <Controller
            name={`${fieldKey}.hideRegularTranslationIfAdvanced`}
            control={control}
            render={({ field }) => (
              <YesNo field={field} defaultValue={defaultValues.hideRegularTranslationIfAdvanced} />
            )}
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

const LangPreference: FC<LangPreferenceProps> = ({
  lang,
  languageName,
  control,
  fieldKey,
  defaultValues,
  onRemove,
}) => {
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
        <CardTypePreferences lang={lang} fieldKey={`${fieldKey}.preferences.cardTypeSettings`} control={control} />
      </div>
    </div>
  );
};

interface CardTypePreferencesProps {
  lang: string;
  fieldKey: `languages.${number}.preferences.cardTypeSettings`;
  control: Control<UserPreferencesFormData, any>;
}

const CardTypePreferences: FC<CardTypePreferencesProps> = ({ lang, control, fieldKey }) => {
  const availableCardTypes = cardTypeRecordLocalizations.filter((e) => e.lang === lang && !!e.configuration);
  const [selectedCardType, setSelectedCardType] = useState<number | null>(null);
  const config = selectedCardType
    ? availableCardTypes.find((e) => e.cardTypeRecordId === selectedCardType)?.configuration
    : undefined;
  if (availableCardTypes.length === 0) return null;
  return (
    <div>
      <div className={styles.cardTypesContainer}>
        <div>Types</div>
        <div>
          <SectionSwitch
            options={availableCardTypes.map((e) => ({ value: e.cardTypeRecordId, label: e.name }))}
            value={selectedCardType}
            onChange={setSelectedCardType}
          />
        </div>
      </div>
      {selectedCardType && !!config && (
        <SingleCardTypePreferences
          key={selectedCardType}
          fieldKey={`${fieldKey}.x${selectedCardType}`}
          control={control}
          groups={config.variantGroups
            ?.filter((e) => e.id !== 'init' && e.id !== 'skip')
            .map((e) => ({ value: e.id, label: e.name ?? e.id }))}
        />
      )}
    </div>
  );
};

interface SingleCardTypePreferencesProps {
  fieldKey: `languages.${number}.preferences.cardTypeSettings.x${string}`;
  control: Control<UserPreferencesFormData, any>;
  groups: { value: string; label: string }[] | undefined;
}

const SingleCardTypePreferences: FC<SingleCardTypePreferencesProps> = ({ control, fieldKey, groups }) => {
  // TODO: get default values somehow
  return (
    <div className={styles.preferencesContainer}>
      <div className={styles.pref}>
        <Form.Item label='Hide'>
          <Controller
            name={`${fieldKey}.hideGroups`}
            control={control}
            render={({ field }) => <YesNo field={field} defaultValue={false} />}
          />
        </Form.Item>
      </div>
      <div className={styles.pref}>
        <Form.Item label='Test me in irregular forms'>
          <Controller
            name={`${fieldKey}.askNonStandardVariants`}
            control={control}
            render={({ field }) => <YesNo field={field} defaultValue={true} />}
          />
        </Form.Item>
      </div>
      {groups && (
        <div className={styles.pref}>
          <Form.Item label='Group order'>
            <Controller
              name={`${fieldKey}.groupOrder`}
              control={control}
              render={({ field }) => <GroupVariants value={field.value} onChange={field.onChange} groups={groups} />}
            />
          </Form.Item>
        </div>
      )}
      {groups && <Groups control={control} fieldKey={`${fieldKey}.groupSettings`} groups={groups} />}
    </div>
  );
};

interface GroupVariantsProps {
  value: string[] | null | undefined;
  onChange: (values: string[] | undefined) => void;
  groups: { value: string; label: string }[];
}

const GroupVariants: FC<GroupVariantsProps> = ({ value, onChange, groups }) => {
  const groupByValue = arrayToObject(groups, 'value');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  return (
    <div>
      {!value && <Button label='Set custom order' onClick={() => setIsSortModalOpen(true)} />}
      {!!value && (
        <div>
          <ol className={styles.groupSortedList}>
            {value.map((id, idx) => {
              const item = groupByValue[id];
              if (!item) return null;
              return <li key={idx}>{item.label}</li>;
            })}
          </ol>
          <Button label='Edit order' onClick={() => setIsSortModalOpen(true)} />
          <Button label='Remove custom order' onClick={() => onChange(undefined)} />
        </div>
      )}
      {isSortModalOpen && (
        <GroupSort
          defaultValue={value ?? null}
          options={groups}
          onApprove={(v) => {
            onChange(v ?? undefined);
            setIsSortModalOpen(false);
          }}
          onCancel={() => setIsSortModalOpen(false)}
        />
      )}
    </div>
  );
};

interface GroupsProps {
  fieldKey: `languages.${number}.preferences.cardTypeSettings.x${string}.groupSettings`;
  control: Control<UserPreferencesFormData, any>;
  groups: { value: string; label: string }[];
}
const Groups: FC<GroupsProps> = ({ control, fieldKey, groups }) => {
  const { append, fields, remove } = useFieldArray({ control, name: fieldKey });
  const items = fields as never as CardTypeSettingsDTO['groupSettings'];

  const handleGroupChoose = (groupId: string) => {
    const has = items?.some((e) => e.group === groupId);
    if (!has) append({ group: groupId, preferences: {} });
  };

  return (
    <div>
      <Select
        options={groups}
        className={styles.langSelect}
        placeholder='Choose Group for custom preferences'
        value={null}
        onChange={handleGroupChoose}
      />
      <div>
        {items?.map((field, index) => (
          <GroupPreference
            key={field.group}
            group={field.group}
            groupName={groups.find((e) => e.value === field.group)?.label ?? field.group}
            control={control}
            fieldKey={`${fieldKey}.${index}`}
            onRemove={() => remove(index)}
          />
        ))}
      </div>
    </div>
  );
};

interface GroupPreferenceProps {
  group: string;
  groupName: string;
  control: Control<UserPreferencesFormData, any>;
  fieldKey: `languages.${number}.preferences.cardTypeSettings.x${string}.groupSettings.${number}`;
  onRemove: () => void;
}

const GroupPreference: FC<GroupPreferenceProps> = ({ groupName, control, fieldKey, onRemove }) => {
  return (
    <div className={styles.langContainer}>
      <div className={styles.langHeader}>
        <span>{groupName}</span>
        <span className={styles.delete}>
          <Button label={<DeleteOutlined />} variant='text' size='large' onClick={onRemove} />
        </span>
      </div>
      <div>
        <GroupPreferencesInputs fieldKey={`${fieldKey}.preferences`} control={control} />
      </div>
    </div>
  );
};

interface GroupPreferencesInputsProps {
  fieldKey: `languages.${number}.preferences.cardTypeSettings.x${string}.groupSettings.${number}.preferences`;
  control: Control<UserPreferencesFormData, any>;
}

const GroupPreferencesInputs: FC<GroupPreferencesInputsProps> = ({ control, fieldKey }) => {
  return (
    <div className={styles.preferencesContainer}>
      <div className={styles.pref}>
        <Form.Item label='Test me in irregular forms'>
          <Controller
            name={`${fieldKey}.askNonStandardVariants`}
            control={control}
            render={({ field }) => <YesNo field={field} defaultValue={true} />}
          />
        </Form.Item>
      </div>
    </div>
  );
};

interface GroupSortProps {
  defaultValue: string[] | null;
  options: { value: string; label: string }[];
  onApprove: (value: string[] | null) => void;
  onCancel: () => void;
}

const GroupSort: FC<GroupSortProps> = ({ onCancel, defaultValue, options, onApprove }) => {
  const [sortedOptions, setSortedOptions] = useState(() => {
    if (!defaultValue) return options;
    const groupIdPosition: Record<string, number | undefined> = {};
    defaultValue.forEach((groupId, idx) => (groupIdPosition[groupId] = idx));
    return options.sort((opt1, opt2) => {
      const ind1 = groupIdPosition[opt1.value];
      const ind2 = groupIdPosition[opt2.value];
      if (ind1 !== undefined && ind2 !== undefined) return ind1 - ind2;
      if (ind1 !== undefined) return -1;
      if (ind2 !== undefined) return 1;
      return 0;
    });
  });

  const handleApprove = () => {
    onApprove(sortedOptions.map((e) => e.value));
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
      <Button label={'Cancel'} onClick={onCancel} />
      <Button label={'Ok'} variant={'primary'} onClick={handleApprove} />
    </div>
  );

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setSortedOptions((items) => {
      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);
      return newItems;
    });
  };

  return (
    <Modal
      title={'Set custom review time'}
      open={true}
      onOk={() => {}}
      onCancel={onCancel}
      width={500}
      style={{ maxWidth: 'calc(100% - 84px)' }}
      footer={footer}
      zIndex={10}
    >
      <div>
        <SortableList
          onSortEnd={onSortEnd}
          className={styles.groupsSortContainer}
          draggedItemClassName={styles.dragged}
        >
          {sortedOptions.map((item) => (
            <SortableItem key={item.value}>
              <div className={styles.groupItem}>
                <HolderOutlined />
                <span>{item.label}</span>
              </div>
            </SortableItem>
          ))}
        </SortableList>
      </div>
    </Modal>
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
          isDefault: true,
        },
        { value: false, label: 'No' },
      ]}
      value={field.value ?? null}
      onChange={field.onChange}
    />
  );
};
