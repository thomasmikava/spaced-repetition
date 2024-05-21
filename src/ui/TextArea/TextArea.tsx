import { Typography } from 'antd';
import type { TextAreaProps as AntTextAreaProps } from 'antd/es/input/TextArea';
import AntTextArea from 'antd/es/input/TextArea';
import type { ChangeEventHandler, FocusEventHandler, KeyboardEventHandler } from 'react';
import { forwardRef, useId } from 'react';
import styles from '../Input/styles.module.css';
import type { ExtractRef } from '../types';

interface TextAreaProps {
  label?: string | null;
  name?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  errorMessage?: string;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  fullWidth?: boolean;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  onFocus?: FocusEventHandler<HTMLTextAreaElement>;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  onEnterClick?: KeyboardEventHandler<HTMLTextAreaElement>;
  textareaProps?: AntTextAreaProps;
}

export const Textarea = forwardRef<ExtractRef<typeof AntTextArea>, TextAreaProps>((props, ref) => {
  const {
    label,
    name,
    placeholder,
    value,
    defaultValue,
    maxLength,
    disabled,
    readOnly,
    autoFocus,
    required,
    onBlur,
    onFocus,
    onChange,
    onEnterClick,
    textareaProps,
  } = props;
  const uniqueId = useId();
  const inputId = textareaProps?.id || uniqueId;
  return (
    <div>
      {label && (
        <Typography.Title className={styles.label} aria-htmlFor={inputId} level={5}>
          {label}
        </Typography.Title>
      )}
      <AntTextArea
        id={inputId}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        readOnly={readOnly}
        autoFocus={autoFocus}
        required={required}
        onBlur={onBlur}
        onFocus={onFocus}
        onChange={onChange}
        onKeyUp={(e) => {
          if (e.key === 'Enter') onEnterClick?.(e);
        }}
        name={name}
        {...textareaProps}
        ref={ref}
      />
    </div>
  );
});
