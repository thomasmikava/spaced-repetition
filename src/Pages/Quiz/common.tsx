import React from 'react';

// Helper function to render text with line breaks
export const renderTextWithLineBreaks = (text: string) => {
  return text.split('\n').map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));
};
