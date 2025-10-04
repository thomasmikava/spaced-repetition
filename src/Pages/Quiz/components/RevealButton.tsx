import React from 'react';
import { Tooltip } from 'antd';

interface RevealButtonProps {
  onReveal: () => void;
  style?: React.CSSProperties;
}

export const RevealButton: React.FC<RevealButtonProps> = ({ onReveal, style }) => {
  return (
    <Tooltip title='Reveal answer (forfeit points)'>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReveal();
        }}
        style={{
          padding: '2px 6px',
          backgroundColor: '#dc2626',
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
        datatype='reveal-answer'
        aria-description='Reveal answer (forfeit points)'
      >
        ?
      </button>
    </Tooltip>
  );
};
