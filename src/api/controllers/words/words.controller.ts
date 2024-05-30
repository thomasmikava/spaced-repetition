import { getModifiedSearchValue } from '../../../functions/texts';
import { apiRequest } from '../../api';
import type { IRequest } from '../../request';
import type {
  CreateManyWordsDTO,
  GetLanguageDictionaryReqDTO,
  GetLanguageDictionaryResDTO,
  GetMyCoursesWordsResDTO,
  GetWordIdsReqDTO,
  GetWordIdsResDTO,
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

  getMyMainCoursesWords = async (): Promise<GetMyCoursesWordsResDTO> => {
    return this.request.get('/words/my-courses');
  };

  getDictionary = async (query: GetLanguageDictionaryReqDTO): Promise<GetLanguageDictionaryResDTO> => {
    return this.request.get('/words/dictionary', query);
  };

  getWordIds = async (query: GetWordIdsReqDTO): Promise<GetWordIdsResDTO> => {
    return this.request.get('/word-ids', query);
  };

  createManyWords = async (query: CreateManyWordsDTO): Promise<void> => {
    return this.request.post('/words', query);
  };

  searchWords = async (query: SearchWordReqDTO): Promise<SearchWordResDTO> => {
    const modifiedSearch = getModifiedSearchValue(query.searchValue, query.lang, query.wordType);
    return this.request.get('/words', { ...query, searchValue: modifiedSearch });
  };
}

export const wordController = new WordController(apiRequest);
