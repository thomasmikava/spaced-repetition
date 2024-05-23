import { apiRequest } from '../../api';
import type { IRequest } from '../../request';
import type {
  CreateManyWordsDTO,
  GetWordsReqDTO,
  GetWordsResDTO,
  SearchWordReqDTO,
  SearchWordResDTO,
} from './words.schema';

class WordController {
  constructor(private readonly request: IRequest) {}

  getCourseWords = async (query: GetWordsReqDTO): Promise<GetWordsResDTO> => {
    return this.request.get('/courses/:courseId/words', query);
  };

  createManyWords = async (query: CreateManyWordsDTO): Promise<void> => {
    return this.request.post('/words', query);
  };

  searchWords = async (query: SearchWordReqDTO): Promise<SearchWordResDTO> => {
    return this.request.get('/words', query);
  };
}

export const wordController = new WordController(apiRequest);
