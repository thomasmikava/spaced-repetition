import { apiRequest } from '../../api';
import type { IRequest } from '../../request';
import type {
  CreateQuizReqDTO,
  CreateQuizResDTO,
  UpdateQuizReqDTO,
  UpdateQuizResDTO,
  GetQuizzesReqDTO,
  GetQuizzesResDTO,
  GetQuizDetailsReqDTO,
  GetQuizDetailsResDTO,
  DeleteQuizReqDTO,
  StartQuizAttemptReqDTO,
  StartQuizAttemptResDTO,
  SubmitQuestionAnswerReqDTO,
  SubmitQuestionAnswerResDTO,
  FinalizeQuizAttemptReqDTO,
  FinalizeQuizAttemptResDTO,
  GetUserQuizProgressReqDTO,
  GetUserQuizProgressResDTO,
  GetCourseQuizzesReqDTO,
  GetCourseQuizzesResDTO,
  ResetQuizAttemptReqDTO,
  ResetQuizAttemptResDTO,
} from './quiz.schema';

class QuizController {
  constructor(private readonly request: IRequest) {}

  // Quiz CRUD operations
  getQuizzes = async (data: GetQuizzesReqDTO): Promise<GetQuizzesResDTO> => {
    return this.request.get('/lessons/:lessonId/quizzes', data);
  };

  getQuizDetails = async (data: GetQuizDetailsReqDTO): Promise<GetQuizDetailsResDTO> => {
    return this.request.get('/quizzes/:quizId', data);
  };

  createQuiz = (data: CreateQuizReqDTO): Promise<CreateQuizResDTO> => {
    return this.request.post('/lessons/:lessonId/quizzes', data);
  };

  updateQuiz = (data: UpdateQuizReqDTO): Promise<UpdateQuizResDTO> => {
    return this.request.put('/quizzes/:quizId', data);
  };

  deleteQuiz = (data: DeleteQuizReqDTO): Promise<void> => {
    return this.request.delete('/quizzes/:quizId', data);
  };

  // Quiz attempt operations
  startQuizAttempt = (data: StartQuizAttemptReqDTO): Promise<StartQuizAttemptResDTO> => {
    return this.request.post('/quizzes/:quizId/attempts', data);
  };

  submitQuestionAnswer = (data: SubmitQuestionAnswerReqDTO): Promise<SubmitQuestionAnswerResDTO> => {
    return this.request.post('/quiz-attempts/:quizAttemptId/answers', data);
  };

  finalizeQuizAttempt = (data: FinalizeQuizAttemptReqDTO): Promise<FinalizeQuizAttemptResDTO> => {
    return this.request.post('/quiz-attempts/:quizAttemptId/finalize', data);
  };

  resetQuizAttempt = (data: ResetQuizAttemptReqDTO): Promise<ResetQuizAttemptResDTO> => {
    return this.request.delete('/quiz-attempts/:quizAttemptId/reset', data);
  };

  // Progress and reporting
  getUserQuizProgress = async (data: GetUserQuizProgressReqDTO): Promise<GetUserQuizProgressResDTO> => {
    return this.request.get('/quizzes/:quizId/progress', data);
  };

  getCourseQuizzes = async (data: GetCourseQuizzesReqDTO): Promise<GetCourseQuizzesResDTO> => {
    return this.request.get('/courses/:courseId/quizzes', data);
  };
}

export const quizController = new QuizController(apiRequest);
