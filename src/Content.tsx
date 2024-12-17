import type { KeyboardEvent } from 'react';
import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cssModule from './App.module.css';
import type {
  AnyContent,
  ContentAfterAnswer,
  ContentBeforeAnswer,
  ContentExpandable,
  ContentInput,
  ContentTagAfterAnswer,
  ContentTagElement,
  ContentTagLike,
  ContentTranslationLangSelector,
  ContentUnderTranslationLang,
  ContentVoice,
} from './content-types';
import { useTestContext } from './contexts/testContext';
import { Colors } from './functions/texts';
import { useTranslationLangSettings } from './contexts/TranslationLangs';
import { TranslationLangSelector } from './components/Lang/TranslationLangSelector';
import { getMinimalChange } from './utils/hint';

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
    case 'section':
      return (
        <div
          className={content.size === 'big' ? cssModule.bigSectionContainer : cssModule.sectionContainer}
          style={content.style}
        >
          <div className={cssModule.sectionTitle}>
            {typeof content.title === 'string'
              ? content.title
              : content.title.map((item, index) => {
                  return item === undefined || item === null ? null : <Content key={index} content={item} />;
                })}
          </div>
          <div className={cssModule.sectionBody}>
            {content.content.map((item, index) => {
              return item === undefined || item === null ? null : <Content key={index} content={item} />;
            })}
          </div>
        </div>
      );
    case 'tag':
      return (
        <div className={cssModule.contentTagsContainer}>
          {content.content.map((rawTag, idx) => {
            const tag = isTagAfterAnswer(rawTag) ? rawTag.content : rawTag;
            if (tag === undefined || tag === null) return null;
            const variant = typeof tag === 'object' ? tag.variant : 'regular';
            const color = typeof tag === 'object' ? tag.color : undefined;
            const tagElement: ContentTagElement = {
              type: 'tag-element',
              variant,
              color,
              text: typeof tag === 'object' ? tag.text : tag,
            };
            return (
              <Fragment key={idx}>
                {isTagAfterAnswer(rawTag)
                  ? renderContent({
                      type: 'afterAnswer',
                      content: tagElement,
                    })
                  : renderContent(tagElement)}
              </Fragment>
            );
          })}
        </div>
      );
    case 'tag-element': {
      const variant = content.variant;
      const color = content.color ? convertColor(content.color) : undefined;
      const bgColor = variant === 'primary' ? color : undefined;
      const borderColor = variant === 'primary' || variant === 'secondary' ? color : undefined;
      return (
        <div
          className={cssModule.contentTag + ' ' + cssModule['contentTag-' + variant]}
          style={{
            background: bgColor,
            boxShadow: borderColor ? `0 0 0 1px ${color}, inset 0 0 0 1px ${color}` : undefined,
          }}
        >
          {renderContent(content.text)}
        </div>
      );
    }
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
    case 'beforeAnswer':
      return <BeforeAnswer {...content} />;
    case 'expandable':
      return <Expandable {...content} />;
    case 'under-translation-lang':
      return <UnderTranslationLang {...content} />;
    case 'translation-lang-selector':
      return <CTranslationLangSelector {...content} />;
  }
});

const isTagAfterAnswer = (content: ContentTagLike): content is ContentTagAfterAnswer =>
  typeof content === 'object' && !!content && 'type' in content && content.type === 'afterAnswer';

const AfterAnswer = ({ content }: ContentAfterAnswer) => {
  const { mode } = useTestContext();
  if (mode === 'edit') return null;
  return <>{renderContent(content)}</>;
};
const BeforeAnswer = ({ content }: ContentBeforeAnswer) => {
  const { mode } = useTestContext();
  if (mode !== 'edit') return null;
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
  caseInsensitive = false,
  fullWidth,
  autoFocus,
  isSubmit,
  audioProps,
  advancedAnswerChecker,
  autoCheck,
  shouldNotReplaceWithCorrectAnswer,
  hintPrefixes,
}: ContentInput) => {
  const { mode, useOnCheck, useOnHintListener } = useTestContext();
  const ref = useRef<HTMLInputElement>(null);
  const submittedRef = useRef(false);

  const correctValuesSet = useMemo(() => {
    if (!correctValues || !correctValues.length) return undefined;
    return new Set(caseInsensitive ? correctValues?.map((e) => e.toLocaleLowerCase()) : correctValues);
  }, [caseInsensitive, correctValues]);

  const checkIfCorrect = (rawValue: string) => {
    const value = rawValue.trim();
    return (
      !!correctValuesSet?.has(caseInsensitive ? value.toLocaleLowerCase() : value) ||
      !!advancedAnswerChecker?.(value, { caseInsensitive })
    );
  };
  const submitAnswer = () => {
    const element = ref.current;
    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true,
    });
    element?.form?.dispatchEvent(submitEvent);
    submittedRef.current = true;
  };
  const lastResult = useOnCheck(inputId, () => {
    const value = (ref.current?.value ?? '').trim();
    const isCorrect = checkIfCorrect(ref.current?.value ?? '');
    return { isCorrect, value };
  });
  useOnHintListener(inputId, () => {
    if (!ref.current) return;
    const inputValue = ref.current.value ?? '';
    // TODO: receive prefixes from props
    const newValue = getMinimalChange(inputValue, correctValues || [], caseInsensitive, hintPrefixes);

    ref.current.value = newValue;
    const isCorrect = checkIfCorrect(newValue);
    if (isCorrect) {
      submitAnswer();
    } else {
      ref.current.focus();
    }
  });

  const audio = useMemo(() => {
    if (!audioProps) return undefined;
    return <Content content={{ type: 'voice', ...audioProps }} />;
  }, [audioProps]);

  const handleAutoCheck = (e: KeyboardEvent) => {
    const element = ref.current;
    if (submittedRef.current || !element || !element.form || e.key === 'Control') return;
    const isCorrect = checkIfCorrect(ref.current.value);
    if (!isCorrect) return;
    submitAnswer();
  };
  const correctnessClassName =
    shouldNotReplaceWithCorrectAnswer && lastResult
      ? lastResult.isCorrect
        ? cssModule.correctInputOutline
        : cssModule.incorrectInputOutline
      : '';

  return (
    <div className={cssModule.inputContainer + ' ' + (fullWidth ? cssModule.fullWidth : '')} style={containerStyle}>
      <input
        ref={ref}
        type={isSubmit ? 'submit' : 'text'}
        className={cssModule.testInput + ' ' + (fullWidth ? cssModule.fullWidth : '') + ' ' + correctnessClassName}
        id={'input.' + inputId}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={style}
        autoComplete='off'
        autoCorrect='off'
        spellCheck={false}
        autoCapitalize='none'
        readOnly={mode === 'readonly'}
        onKeyUp={autoCheck ? handleAutoCheck : undefined}
      />
      {lastResult && lastResult.isCorrect && !shouldNotReplaceWithCorrectAnswer && (
        <div className={cssModule.inputAnswer + ' ' + cssModule.inputCorrectAnswer}>
          <span>{correctValues?.join('/')}</span>
          {audio}
        </div>
      )}
      {lastResult && !lastResult.isCorrect && !shouldNotReplaceWithCorrectAnswer && (
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
      }, 0);
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

const convertColor = (color: string) => {
  if (color.startsWith('_')) return Colors[color.slice(1) as never];
  return color;
};

const UnderTranslationLang = ({ getContent }: ContentUnderTranslationLang) => {
  const { value, options } = useTranslationLangSettings();
  if (value === null) return null;
  const content = getContent?.(value, options);
  return renderContent(content);
};

const CTranslationLangSelector = ({ style }: ContentTranslationLangSelector) => {
  const { value, options, onChange } = useTranslationLangSettings();
  if (value === null) return null;
  return <TranslationLangSelector value={value} options={options} onChange={onChange} style={style} />;
};

export default Content;
