import { inParallel } from '../../../utils/promises';
import { apiRequest } from '../../api';
import type { IRequest } from '../../request';
import type { GetManyRecordsReqDTO, GetManyRecordsResDTO, PostHistoryRecordsReqDTO } from './history.schema';

class HistoryController {
  constructor(private readonly request: IRequest) {}

  getMany = async (): Promise<GetManyRecordsResDTO['records']> => {
    const limit = 200;
    const firstPageResult = await this._getMany({ limit, skip: 0, getTotalCount: true });
    const isLast = firstPageResult.isLastPage;
    const records: GetManyRecordsResDTO['records'] = firstPageResult.records;

    if (isLast) return records;

    const totalPages = Math.ceil(firstPageResult.totalRecords! / limit);
    const promiseFns = Array.from(
      { length: totalPages - 1 },
      (_, i) => () => this._getMany({ limit, skip: (i + 1) * limit }).then((data) => data.records),
    );
    const restPagesResults = await inParallel(promiseFns, 5);
    return records.concat(restPagesResults.flat());
  };

  private _getMany(args: GetManyRecordsReqDTO): Promise<GetManyRecordsResDTO> {
    return this.request.get('review', args);
  }

  postRecords = (data: PostHistoryRecordsReqDTO) => {
    return this.request.post('review', data);
  };
}

export const historyController = new HistoryController(apiRequest);
