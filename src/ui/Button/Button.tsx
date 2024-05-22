import type { ButtonProps as AntButtonProps } from 'antd/es/button';
import AntButton from 'antd/es/button';
import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import type { ExtractRef } from '../types';

type ButtonProps = Omit<AntButtonProps, 'type' | 'htmlType' | 'block'> & {
  label: ReactNode;
  type?: AntButtonProps['htmlType'];
  variant?: AntButtonProps['type'];
  fullWidth?: boolean;
};

export const Button = forwardRef<ExtractRef<typeof AntButton>, ButtonProps>(
  ({ label, type, variant, fullWidth, ...props }, ref) => {
    return (
      <AntButton htmlType={type} type={variant} block={fullWidth} {...props} ref={ref}>
        {label}
      </AntButton>
    );
  },
);
