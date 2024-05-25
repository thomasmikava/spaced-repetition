import type { LessonUpdateActionDTO } from '../lessons/lessons.schema';

export interface CourseDTO {
  id: number;
  userId?: number | null;
  title: string;
  description: string | null;
  langToLearn: string;
  translationLang: string;
  isPublic: boolean;
  isOfficial: boolean;
  isDeleted: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseReqDTO {
  title: string;
  description: string | null;
  langToLearn: string;
  translationLang: string;
  isPublic: boolean;
  isOfficial: boolean;
}
export type CreateCourseResDTO = CourseDTO;

///

export interface UpdateCourseReqDTO {
  id: number;
  title?: string;
  description?: string | null;
  langToLearn?: string;
  translationLang?: string;
  isPublic?: boolean;
  isOfficial?: boolean;
}

export type UpdateCourseResDTO = CourseDTO;

///

export type GetMyCoursesResDTO = CourseDTO[];

///

export type GetCourseReqDTO = { id: number };

export type GetCourseResDTO = CourseDTO;

///

export interface DeleteCourseReqDTO {
  id: number;
  removeForEveryone?: boolean;
}

///

export interface UpdateCourseContentReqDTO {
  courseId: number;
  actions: LessonUpdateActionDTO[];
}
