import { apiRequest } from '../../api';
import type { IRequest } from '../../request';
import type { GetWordsReqDTO, GetWordsResDTO, SearchWordReqDTO, SearchWordResDTO } from './words.schema';

class WordController {
  constructor(private readonly request: IRequest) {}

  getCourseWords = async (query: GetWordsReqDTO): Promise<GetWordsResDTO> => {
    return this.request.get('/courses/:courseId/words', query);
  };

  searchWords = async (query: SearchWordReqDTO): Promise<SearchWordResDTO> => {
    if (1 < 2) {
      return {
        words: [
          {
            id: 1,
            lang: 'de',
            type: 1,
            mainType: 1,
            value: 'test',
            attributes: null,
            groupPriorities: null,
            userId: null,
            isOfficial: true,
            translation: 'translation value',
            advancedTranslation: null,
          },
        ],
      };
    }
    return this.request.get('/words', query);
  };
}

export const wordController = new WordController(apiRequest);
