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

export type ContentTag = string | null | undefined | { variant: TagVariant; text: string; color: string };

interface ContentTagContainer {
  type: 'tag';
  content: ContentTag[];
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

export type AnyContent =
  | ContentHeader
  | ContentParagraph
  | ContentHR
  | ContentTagContainer
  | ContentText
  | ContentVoice
  | ContentDiv
  | ContentTable
  | ContentInput
  | ContentAfterAnswer
  | ContentBeforeAnswer
  | ContentExpandable;
type InnerContent = string | number | AnyContent;
