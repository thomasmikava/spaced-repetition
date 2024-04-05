import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cssModule from './App.module.css';
import type { AnyContent, ContentAfterAnswer, ContentExpandable, ContentInput, ContentVoice } from './content-types';
import { useTestContext } from './contexts/testContext';

const renderContent = (
  content: string | number | null | undefined | AnyContent | (AnyContent | null | undefined)[],
) => {
  if (typeof content === 'string' || typeof content === 'number' || content === null || content === undefined) {
    return content;
  }
  return <Content content={content} />;
};

const Content = memo(({ content }: { content: AnyContent | (AnyContent | null | undefined)[] }) => {
  if (Array.isArray(content)) {
    return (
      <>
        {content.map((item, index) => {
          return item === null || item === undefined ? null : <Content key={index} content={item} />;
        })}
      </>
    );
  }

  switch (content.type) {
    case 'header':
      return <h1 style={content.style}>{renderContent(content.content)}</h1>;
    case 'paragraph':
      return <p style={content.style}>{renderContent(content.content)}</p>;
    case 'text':
      return <span style={content.style}>{renderContent(content.content)}</span>;
    case 'hr':
      return <hr style={content.style} />;
    case 'voice':
      return <Voice key={content.text} {...content} />;
    case 'div':
      return (
        <div style={content.style}>
          {content.content.map((item, index) => {
            return item === undefined || item === null ? null : <Content key={index} content={item} />;
          })}
        </div>
      );
    case 'tag':
      return (
        <div className={cssModule.contentTagsContainer}>
          {/* <span>{content.content.map((e) => (typeof e === 'object' && e ? e.text : e || '')).join(', ')}</span> */}
          {content.content.map((tag, idx) => {
            const variant = typeof tag === 'object' && tag ? tag.variant : 'regular';
            const color = typeof tag === 'object' && tag ? tag.color : undefined;
            const bgColor = variant === 'primary' ? color : undefined;
            const borderColor = variant === 'primary' || variant === 'secondary' ? color : undefined;
            return tag === undefined || tag === null ? null : (
              <div
                className={cssModule.contentTag + ' ' + cssModule['contentTag-' + variant]}
                key={idx}
                style={{
                  background: bgColor,
                  boxShadow: borderColor ? `0 0 0 1px ${color}, inset 0 0 0 1px ${color}` : undefined,
                }}
              >
                {typeof tag === 'object' ? renderContent(tag.text) : renderContent(tag)}
              </div>
            );
          })}
        </div>
      );
    case 'table':
      return (
        <table style={content.style}>
          <tbody>
            {content.content.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, columnIndex) => (
                  <td key={columnIndex} style={content.getCellStyles?.(rowIndex, columnIndex)}>
                    {renderContent(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'input':
      return <Input {...content} />;
    case 'afterAnswer':
      return <AfterAnswer {...content} />;
    case 'expandable':
      return <Expandable {...content} />;
  }
});

const AfterAnswer = ({ content }: ContentAfterAnswer) => {
  const { mode } = useTestContext();
  if (mode === 'edit') return null;
  return <>{renderContent(content)}</>;
};

const Expandable = ({ showMoreText, showLessText, childContent }: ContentExpandable) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className={cssModule.expandableContainer}>
      <div className={cssModule.expandableTrigger} onClick={() => setIsExpanded((prev) => !prev)}>
        {isExpanded ? showLessText + ' ▼' : showMoreText + ' ▶'}
      </div>
      {isExpanded && <Content content={childContent} />}
    </div>
  );
};

const Input = ({
  inputId,
  placeholder,
  style,
  containerStyle,
  correctValues,
  caseInsensitive,
  fullWidth,
  autoFocus,
  isSubmit,
  audioProps,
}: ContentInput) => {
  const { mode, useOnCheck } = useTestContext();
  const ref = useRef<HTMLInputElement>(null);
  const lastResult = useOnCheck(inputId, () => {
    const value = (ref.current?.value ?? '').trim();
    const isCorrect = !!correctValues?.some((correctValue) => {
      if (caseInsensitive) return correctValue.toLocaleLowerCase() === value.toLocaleLowerCase();
      return correctValue === value;
    });
    return { isCorrect, value };
  });

  const audio = useMemo(() => {
    if (!audioProps) return undefined;
    return <Content content={{ type: 'voice', ...audioProps }} />;
  }, [audioProps]);

  return (
    <div className={cssModule.inputContainer + ' ' + (fullWidth ? cssModule.fullWidth : '')} style={containerStyle}>
      <input
        ref={ref}
        type={isSubmit ? 'submit' : 'text'}
        className={cssModule.testInput + ' ' + (fullWidth ? cssModule.fullWidth : '')}
        id={'input.' + inputId}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={style}
        autoComplete='off'
        autoCorrect='off'
        spellCheck={false}
        autoCapitalize='none'
        readOnly={mode === 'readonly'}
      />
      {lastResult && lastResult.isCorrect && (
        <div className={cssModule.inputAnswer + ' ' + cssModule.inputCorrectAnswer}>
          <span>{correctValues?.join('/')}</span>
          {audio}
        </div>
      )}
      {lastResult && !lastResult.isCorrect && (
        <div className={cssModule.inputAnswer + ' ' + cssModule.inputIncorrectAnswer}>
          <span>{correctValues?.join('/')}</span>
          {audio}
        </div>
      )}
    </div>
  );
};

const Voice = ({ text, language, autoplay, size, style }: ContentVoice) => {
  const handleSound = useCallback(() => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = language;
    window.speechSynthesis.speak(msg);
  }, [language, text]);

  useEffect(() => {
    let isCanceled = false;
    if (autoplay) {
      setTimeout(() => {
        if (!isCanceled) handleSound();
      }, 200);
    }
    return () => {
      isCanceled = true;
      window.speechSynthesis.cancel();
    };
  }, [autoplay, handleSound]);

  return (
    <button
      type='button'
      className={cssModule.voiceButton + ' ' + (size === 'mini' ? cssModule.miniVoiceButton : '')}
      onClick={handleSound}
      style={style}
    >
      🔊
    </button>
  );
};

export default Content;
