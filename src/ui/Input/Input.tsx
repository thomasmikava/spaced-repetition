import type { InputProps as AntInputProps } from 'antd/es/input';
import AntInput from 'antd/es/input';
import Typography from 'antd/es/typography';
import {
  forwardRef,
  useId,
  type ChangeEventHandler,
  type FocusEventHandler,
  type HTMLInputTypeAttribute,
  type KeyboardEventHandler,
} from 'react';
import type { ExtractRef } from '../types';
import styles from './styles.module.css';

interface InputProps {
  type?: HTMLInputTypeAttribute;
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
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onEnterClick?: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  inputProps?: AntInputProps;
  size?: AntInputProps['size'];
  status?: AntInputProps['status'];
}

export const Input = forwardRef<ExtractRef<typeof AntInput>, InputProps>((props, ref) => {
  const {
    type,
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
    fullWidth,
    inputProps,
    ...rest
  } = props;
  const uniqueId = useId();
  const inputId = inputProps?.id || uniqueId;
  return (
    <div style={{ width: fullWidth ? '100%' : undefined }}>
      {label && (
        <label htmlFor={inputId}>
          <Typography.Title className={styles.label} level={5}>
            {label}
          </Typography.Title>
        </label>
      )}
      <AntInput
        ref={ref}
        id={inputId}
        type={type || 'text'}
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
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEnterClick?.(e);
        }}
        name={name}
        {...rest}
        {...inputProps}
      />
    </div>
  );
});
