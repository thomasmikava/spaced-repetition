interface BaseRecordDTO {
  wordId: number;
  block: number;
  sKey: string;
  /** how many tries were correct */
  corr: number;
  /** repetition. total tries */
  rep: number;
  /** is the last try correct */
  lc: boolean;
  lastDate: number;
  lastS: number | null;
  dueDate: number | null;
}

export enum ReviewBlock {
  universal = 0,
  standard = 1,
  AI = 2,
}

export interface ReviewRecordDTO extends BaseRecordDTO {
  id: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MinimalReviewRecordDTO extends BaseRecordDTO {
  id: number;
}

export interface ReviewWithOptionalDTO extends BaseRecordDTO {
  id?: number;
}

///
export type GetManyRecordsReqDTO = {
  limit: number;
  skip: number;
  getTotalCount?: boolean;
};

export type GetManyRecordsResDTO = {
  records: MinimalReviewRecordDTO[];
  isLastPage: boolean;
  totalRecords?: number;
};

///

export type PostHistoryRecordsReqDTO = ReviewWithOptionalDTO[];
