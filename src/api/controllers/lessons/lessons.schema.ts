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
      customTranslation?: { translation: string; translationVariants: any[] };
    }
  | {
      type: 'new-word';
      wordType: 'phrase';
      value: string;
      translation: { translation: string; translationVariants: any[] };
    }
  | {
      type: 'update-lesson';
      lessonId: number;
      title: string;
      description: string | null;
      items: LessonUpdateActionDTO[];
    }
  | { type: 'new-lesson'; title: string; description: string | null; items: LessonUpdateActionDTO[] }
  | { type: 'delete-word'; wordId: number }
  | { type: 'delete-lesson'; lessonId: number };

export interface CreateLessonReqDTO {
  courseId: number;
  parentLessonId?: number | null;
  title: string;
  description: string | null;
  items: LessonUpdateActionDTO[];
}

export type CreateLessonResDTO = LessonDTO;

///

export interface UpdateLessonReqDTO {
  lessonId: number;
  courseId: number;
  title: string;
  description: string | null;
  items: LessonUpdateActionDTO[];
}

export type UpdateLessonResDTO = LessonDTO;

///

export interface GetLessonsReqDTO {
  courseId: number;
  lessonId?: number | null;
  returnAllChildrenLessons?: boolean;
}

export type GetLessonsResDTO = LessonDTO[];
