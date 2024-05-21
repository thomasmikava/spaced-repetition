import type { CheckboxProps as AntCheckboxProps } from 'antd/es/checkbox/Checkbox';
import AntCheckbox from 'antd/es/checkbox/Checkbox';
import { forwardRef } from 'react';
import type { ExtractRef } from '../types';

interface CheckboxProps extends AntCheckboxProps {
  label: string;
}

export const Checkbox = forwardRef<ExtractRef<typeof AntCheckbox>, CheckboxProps>(({ label, ...props }, ref) => {
  return (
    <AntCheckbox {...props} ref={ref}>
      {label}
    </AntCheckbox>
  );
});
