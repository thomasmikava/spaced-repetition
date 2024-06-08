/* eslint-disable @typescript-eslint/no-explicit-any */

export interface LessonDTO {
  id: number;
  courseId: number;
  parentLessonId: number | null;
  title: string;
  description: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type LessonUpdateActionDTO =
  | {
      type: 'existing-word';
      isNewRecord: boolean;
      wordId: number;
      customTranslation?: { translation: string; translationVariants: any[] | null };
    }
  | {
      type: 'new-word';
      wordType: 'phrase';
      displayType?: number | null;
      value: string;
      translation: { translation: string; translationVariants: any[] | null };
      official?: boolean;
    }
  | {
      type: 'update-lesson';
      lessonId: number;
      parentLessonId?: number | null;
      title?: string;
      description?: string | null;
      items?: LessonUpdateActionDTO[];
    }
  | {
      type: 'new-lesson';
      title: string;
      description: string | null;
      parentLessonId?: number | null;
      items?: LessonUpdateActionDTO[];
    }
  | { type: 'delete-word'; wordId: number }
  | { type: 'delete-lesson'; lessonId: number };

export interface CreateLessonReqDTO {
  courseId: number;
  parentLessonId?: number | null;
  title: string;
  description: string | null;
  items?: LessonUpdateActionDTO[];
}

export type CreateLessonResDTO = LessonDTO;

///

export interface UpdateLessonReqDTO {
  lessonId: number;
  courseId: number;
  parentLessonId?: number | null;
  title?: string;
  description?: string | null;
  items?: LessonUpdateActionDTO[];
}

export type UpdateLessonResDTO = LessonDTO;

///

export interface GetLessonsReqDTO {
  courseId: number;
  lessonId?: number | null;
  returnAllChildrenLessons?: boolean;
}

export type GetLessonsResDTO = LessonDTO[];

///

export interface DeleteLessonReqDTO {
  courseId: number;
  lessonId: number;
}
