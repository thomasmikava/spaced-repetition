import { apiRequest } from '../../api';
import type { IRequest } from '../../request';
import type {
  CreateCourseReqDTO,
  CreateCourseResDTO,
  DeleteCourseReqDTO,
  GetCourseReqDTO,
  GetCourseResDTO,
  GetMyCoursesResDTO,
  UpdateCourseContentReqDTO,
  UpdateCourseReqDTO,
  UpdateCourseResDTO,
} from './courses.schema';

class CourseController {
  constructor(private readonly request: IRequest) {}

  getCourses = async (): Promise<GetMyCoursesResDTO> => {
    return this.request.get('courses');
  };

  getById = async (data: GetCourseReqDTO): Promise<GetCourseResDTO> => {
    return this.request.get('courses/:id', data);
  };

  delete = async (data: DeleteCourseReqDTO): Promise<void> => {
    return this.request.delete('courses/:id', data);
  };

  createCourse = (data: CreateCourseReqDTO): Promise<CreateCourseResDTO> => {
    return this.request.post('courses', data);
  };

  updateCourse = (data: UpdateCourseReqDTO): Promise<UpdateCourseResDTO> => {
    return this.request.patch('courses/:id', data);
  };

  updateCourseContent = (data: UpdateCourseContentReqDTO): Promise<void> => {
    return this.request.patch('courses/:id/content', data);
  };
}

export const courseController = new CourseController(apiRequest);
