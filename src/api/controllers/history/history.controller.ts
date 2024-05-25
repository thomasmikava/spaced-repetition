import { apiRequest } from '../../api';
import type { IRequest } from '../../request';
import type { GetManyRecordsResDTO, PostHistoryRecordsReqDTO } from './history.schema';

class HistoryController {
  constructor(private readonly request: IRequest) {}

  getMany = (): Promise<GetManyRecordsResDTO> => {
    return this.request.get('review');
  };
  postRecords = (data: PostHistoryRecordsReqDTO) => {
    return this.request.post('review', data);
  };
}

export const historyController = new HistoryController(apiRequest);
