import type { ReactNode } from 'react';
import cssModule from '../../App.module.css';

export const WithNextButton = ({
  children,
  onClick,
  rest,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  rest?: ReactNode;
}) => {
  return (
    <div className={cssModule.withNextButton}>
      {children}
      <div className={cssModule.nextButtonContainer}>
        <button onClick={onClick} className={cssModule.nextButton}>
          <span>›</span>
        </button>
        {rest}
      </div>
    </div>
  );
};
