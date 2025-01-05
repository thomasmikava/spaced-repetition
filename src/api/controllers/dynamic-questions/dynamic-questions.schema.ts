export interface GetDynamicQuestionReqDTO {
  lang: string;
  transLang: string;
  transText: string;
  fill: 'originalLang' | 'transLang';
  typeOfSpeech: string;
  variant: string;
  tags: { name: string; value: string }[];
  wordId: number;
  testKey: string;
  trial: number;
}

export interface GetDynamicQuestionResDTO {
  text: string;
  translatedText: string;
  possibleValues?: string[][];
}
