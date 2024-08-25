interface ContentHeader {
  type: 'header';
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  content: InnerContent;
  style?: React.CSSProperties;
}

interface ContentText {
  type: 'text';
  content: string;
  style?: React.CSSProperties;
}

interface ContentParagraph {
  type: 'paragraph';
  content: InnerContent;
  style?: React.CSSProperties;
}

export interface ContentTranslationLangSelector {
  type: 'translation-lang-selector';
  style?: React.CSSProperties;
}

export interface ContentUnderTranslationLang {
  type: 'under-translation-lang';
  getContent: (lang: string, langOptions: string[]) => AnyContent | null | undefined;
}

interface ContentHR {
  type: 'hr';
  style?: React.CSSProperties;
}

export interface ContentVoice {
  type: 'voice';
  text: string;
  language: string;
  autoplay?: boolean;
  style?: React.CSSProperties;
  size?: 'mini' | 'normal';
}

type TagVariant = 'primary' | 'secondary' | 'regular';

export type ContentTag = string | null | undefined | Omit<ContentTagElement, 'type'>;
export type ContentTagAfterAnswer = Omit<ContentAfterAnswer, 'content'> & { content: ContentTag };
export type ContentTagLike = ContentTag | ContentTagAfterAnswer;

export type ContentTagElement = {
  type: 'tag-element';
  variant: TagVariant;
  text: string;
  color?: string;
};

interface ContentTagContainer {
  type: 'tag';
  content: ContentTagLike[];
}
interface ContentDiv {
  type: 'div';
  content: (AnyContent | null | undefined)[];
  style?: React.CSSProperties;
}

interface ContentTable {
  type: 'table';
  content: InnerContent[][];
  getCellStyles?: (rowIndex: number, columnIndex: number) => React.CSSProperties | undefined;
  style?: React.CSSProperties;
}

export interface ContentAfterAnswer {
  type: 'afterAnswer';
  content: (AnyContent | null | undefined)[] | InnerContent;
}

export interface ContentBeforeAnswer {
  type: 'beforeAnswer';
  content: (AnyContent | null | undefined)[] | InnerContent;
}

export type AdvancedAnswerCheckerOptions = { caseInsensitive?: boolean };

export interface ContentInput {
  type: 'input';
  inputId?: string;
  placeholder?: string;
  correctValues?: string[];
  fullWidth?: boolean;
  autoFocus?: boolean;
  autoCheck?: boolean;
  isSubmit?: boolean;
  caseInsensitive?: boolean;
  audioProps?: Omit<ContentVoice, 'type'>;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  advancedAnswerChecker?: (value: string, options: AdvancedAnswerCheckerOptions) => boolean;
}

export interface ContentExpandable {
  type: 'expandable';
  showMoreText: string;
  showLessText: string;
  childContent: AnyContent | AnyContent[];
}

export interface ContentSection {
  type: 'section';
  title: string | (AnyContent | null | undefined)[];
  size?: 'medium' | 'big';
  content: (AnyContent | null | undefined)[];
  style?: React.CSSProperties;
}

export type AnyContent =
  | ContentHeader
  | ContentParagraph
  | ContentTranslationLangSelector
  | ContentUnderTranslationLang
  | ContentHR
  | ContentTagContainer
  | ContentText
  | ContentVoice
  | ContentDiv
  | ContentTable
  | ContentInput
  | ContentAfterAnswer
  | ContentBeforeAnswer
  | ContentExpandable
  | ContentSection
  | ContentTagElement;
type InnerContent = string | number | AnyContent;
