import { apiRequest } from '../../api';
import type { IRequest } from '../../request';
import type { GetDynamicQuestionReqDTO, GetDynamicQuestionResDTO } from './dynamic-questions.schema';

class DynamicQuestionController {
  constructor(private readonly request: IRequest) {}

  generateDynamicQuestion = async (query: GetDynamicQuestionReqDTO): Promise<GetDynamicQuestionResDTO> => {
    return this.request.post('/dynamic', query);
  };
}

export const dynamicQuestionController = new DynamicQuestionController(apiRequest);
