interface BaseRecordDTO {
  wordId: number;
  sKey: string;
  lc: boolean;
  lastDate: number;
  repetition: number;
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

export type GetManyRecordsResDTO = MinimalReviewRecordDTO[];

///

export type PostHistoryRecordsReqDTO = ReviewWithOptionalDTO[];
