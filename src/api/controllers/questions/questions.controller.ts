import { apiRequest } from '../../api';
import type { IRequest } from '../../request';
import type {
  CreateQuestionReqDTO,
  CreateQuestionResDTO,
  DeleteQuestionReqDTO,
  GetQuestionsReqDTO,
  GetQuestionsResDTO,
  UpdateQuestionReqDTO,
  UpdateQuestionResDTO,
  QuestionDTO,
} from './question.schema';

class QuestionController {
  constructor(private readonly request: IRequest) {}

  getQuestions = async (query: GetQuestionsReqDTO): Promise<GetQuestionsResDTO> => {
    return this.request.get('/questions', query);
  };

  getQuestion = async (data: { questionId: number }): Promise<QuestionDTO> => {
    return this.request.get('/questions/:questionId', data);
  };

  createQuestion = (data: CreateQuestionReqDTO): Promise<CreateQuestionResDTO> => {
    return this.request.post('/questions', data);
  };

  updateQuestion = (data: UpdateQuestionReqDTO): Promise<UpdateQuestionResDTO> => {
    return this.request.put('/questions/:questionId', data);
  };

  deleteQuestion = (data: DeleteQuestionReqDTO): Promise<void> => {
    return this.request.delete('/questions/:questionId', data);
  };
}

export const questionController = new QuestionController(apiRequest);
