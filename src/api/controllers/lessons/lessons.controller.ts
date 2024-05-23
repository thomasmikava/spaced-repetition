import { apiRequest } from '../../api';
import type { IRequest } from '../../request';
import type {
  CreateLessonReqDTO,
  CreateLessonResDTO,
  DeleteLessonReqDTO,
  GetLessonsReqDTO,
  GetLessonsResDTO,
  UpdateLessonReqDTO,
  UpdateLessonResDTO,
} from './lessons.schema';

class LessonController {
  constructor(private readonly request: IRequest) {}

  getCourseLessons = async (query: GetLessonsReqDTO): Promise<GetLessonsResDTO> => {
    return this.request.get('/courses/:courseId/lessons', query);
  };
  createLesson = (data: CreateLessonReqDTO): Promise<CreateLessonResDTO> => {
    return this.request.post('/courses/:courseId/lessons', data);
  };
  updateLesson = (data: UpdateLessonReqDTO): Promise<UpdateLessonResDTO> => {
    return this.request.put('/courses/:courseId/lessons/:lessonId', data);
  };
  deleteLesson = (data: DeleteLessonReqDTO): Promise<void> => {
    return this.request.delete('/courses/:courseId/lessons/:lessonId', data);
  };
}

export const lessonController = new LessonController(apiRequest);
