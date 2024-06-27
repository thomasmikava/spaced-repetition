interface BaseRecordDTO {
  wordId: number;
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
};

export type GetManyRecordsResDTO = {
  records: MinimalReviewRecordDTO[];
  isLastPage: boolean;
};

///

export type PostHistoryRecordsReqDTO = ReviewWithOptionalDTO[];
