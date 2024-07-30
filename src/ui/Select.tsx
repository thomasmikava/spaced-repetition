import type { SelectProps as AntSelectProps } from 'antd/es/select';
import AntSelect from 'antd/es/select';
import type { ReactElement } from 'react';
import { forwardRef } from 'react';
import type { ExtractRef } from './types';

type SelectProps<ValueType, IsMulti extends boolean = false> = Pick<
  AntSelectProps,
  'style' | 'className' | 'size' | 'showSearch' | 'disabled'
> & {
  value?: (IsMulti extends true ? ValueType[] : ValueType) | null;
  defaultValue?: (IsMulti extends true ? ValueType[] : ValueType) | null;
  onChange?: (value: IsMulti extends true ? ValueType[] : ValueType) => void;
  options: { value: ValueType; label: string }[];
  allowClear?: boolean;
  placeholder?: string;
};

type SelectFn = {
  <ValueType>(props: SelectProps<ValueType, false> & { mode?: undefined }): ReactElement;
  <ValueType>(props: SelectProps<ValueType, true> & { mode: 'multiple' | 'tags' }): ReactElement;
};

const Select = forwardRef<ExtractRef<typeof AntSelect>, SelectProps<unknown>>(
  ({ value, onChange, options, showSearch = true, ...props }, ref) => {
    return (
      <AntSelect
        value={value}
        options={options}
        onChange={onChange}
        {...props}
        showSearch={showSearch}
        filterOption={filterFunc}
        ref={ref}
      />
    );
  },
) as SelectFn;

const filterFunc = (input: string, option: { label: string } | undefined) =>
  !!option && option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;

export default Select;
