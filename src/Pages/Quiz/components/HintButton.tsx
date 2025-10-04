import React from 'react';
import { Tooltip } from 'antd';

interface HintButtonProps {
  onHint: () => void;
  style?: React.CSSProperties;
}

export const HintButton: React.FC<HintButtonProps> = ({ onHint, style }) => {
  return (
    <Tooltip title='Get a hint'>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={onHint}
        style={{
          padding: '2px 6px',
          backgroundColor: '#f59e0b',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer',
          lineHeight: '20px',
          minWidth: '24px',
          userSelect: 'none',
          ...style,
        }}
        aria-description='Get a hint'
        datatype='hint'
      >
        💡
      </button>
    </Tooltip>
  );
};
