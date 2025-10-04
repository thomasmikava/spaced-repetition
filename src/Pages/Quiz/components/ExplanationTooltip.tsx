import React from 'react';
import { Tooltip } from 'antd';

interface ExplanationTooltipProps {
  explanation: string;
}

export const ExplanationTooltip: React.FC<ExplanationTooltipProps> = ({ explanation }) => {
  return (
    <Tooltip title={explanation}>
      <span
        style={{
          display: 'inline-block',
          width: '16px',
          height: '16px',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '50%',
          fontSize: '12px',
          lineHeight: '16px',
          textAlign: 'center',
          marginLeft: '4px',
          cursor: 'help',
        }}
        aria-description={explanation}
        datatype='explanation-icon'
      >
        i
      </span>
    </Tooltip>
  );
};
