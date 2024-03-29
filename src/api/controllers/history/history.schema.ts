export interface HistoryRecordDTO {
  id: number;
  userId: number;
  key: string;
  firstDate: number;
  lastDate: number;
  repetition: number;
  lastS: number | null;
  lastHasFailed: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

///

export type GetManyRecordsResDTO = HistoryRecordDTO[];

///

export type PostHistoryRecordsReqDTO = Omit<HistoryRecordDTO, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[];
