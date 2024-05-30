import type { SelectProps as AntSelectProps } from 'antd/es/select';
import AntSelect from 'antd/es/select';
import type { ReactElement } from 'react';
import { forwardRef } from 'react';
import type { ExtractRef } from './types';

type SelectProps<ValueType> = Pick<AntSelectProps, 'style' | 'className' | 'size'> & {
  value?: ValueType | null;
  defaultValue?: ValueType | null;
  onChange?: (value: ValueType) => void;
  options: { value: ValueType; label: string }[];
  allowClear?: boolean;
  placeholder?: string;
};

type SelectFn = <ValueType>(props: SelectProps<ValueType>) => ReactElement;

const Select = forwardRef<ExtractRef<typeof AntSelect>, SelectProps<unknown>>(
  ({ value, onChange, options, ...props }, ref) => {
    return <AntSelect value={value} options={options} onChange={onChange} {...props} ref={ref} />;
  },
) as SelectFn;

export default Select;
