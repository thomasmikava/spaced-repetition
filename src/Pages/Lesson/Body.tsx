import type { FC } from 'react';
import { memo } from 'react';
import type { LessonDTO } from '../../api/controllers/lessons/lessons.schema';
import { LessonBox } from './LessonBox';
import cssModule from './styles.module.css';

interface Props {
  courseId: number;
  lessonId: number | null;
  lessons: LessonDTO[];
}

export const LessonBody: FC<Props> = memo(({ courseId, lessons }) => {
  return (
    <div className={cssModule.lessonsContainer}>
      {lessons.map((lesson) => (
        <LessonBox key={lesson.id} lesson={lesson} courseId={courseId} />
      ))}
    </div>
  );
});
