import { apiRequest } from '../../api';
import type { IRequest } from '../../request';
import type { GetWordsReqDTO, GetWordsResDTO } from './words.schema';

class WordController {
  constructor(private readonly request: IRequest) {}

  getCourseWords = async (query: GetWordsReqDTO): Promise<GetWordsResDTO> => {
    return this.request.get('/courses/:courseId/words', query);
  };
}

export const wordController = new WordController(apiRequest);
