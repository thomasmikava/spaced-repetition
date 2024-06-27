import { apiRequest } from '../../api';
import type { IRequest } from '../../request';
import type { GetManyRecordsReqDTO, GetManyRecordsResDTO, PostHistoryRecordsReqDTO } from './history.schema';

class HistoryController {
  constructor(private readonly request: IRequest) {}

  getMany = async (): Promise<GetManyRecordsResDTO['records']> => {
    const records: GetManyRecordsResDTO['records'] = [];
    let isLast = false;
    const limit = 200;
    let skip = 0;
    while (!isLast) {
      const result = await this._getMany({ limit, skip });
      records.push(...result.records);
      isLast = result.isLastPage;
      skip += limit;
    }
    return records;
  };

  private _getMany(args: GetManyRecordsReqDTO): Promise<GetManyRecordsResDTO> {
    return this.request.get('review', args);
  }

  postRecords = (data: PostHistoryRecordsReqDTO) => {
    return this.request.post('review', data);
  };
}

export const historyController = new HistoryController(apiRequest);
