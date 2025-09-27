import type { UserInputDTO } from '../../api/controllers/questions/question-content.schema';

export interface QuizFormData {
  answers: (UserInputDTO | undefined)[];
}
