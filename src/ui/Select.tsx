import type { SelectProps as AntSelectProps } from 'antd/es/select';
import AntSelect from 'antd/es/select';
import { forwardRef } from 'react';
import type { ExtractRef } from './types';

type SelectProps = Pick<AntSelectProps, 'style' | 'className'> & {
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
};

const Select = forwardRef<ExtractRef<typeof AntSelect>, SelectProps>(({ value, onChange, options, ...props }, ref) => {
  return <AntSelect value={value} options={options} onChange={onChange} {...props} ref={ref} />;
});

export default Select;
