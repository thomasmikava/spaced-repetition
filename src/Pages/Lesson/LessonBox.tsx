import { Link } from 'react-router-dom';
import type { LessonDTO } from '../../api/controllers/lessons/lessons.schema';
import { paths } from '../../routes/paths';
import appCssModule from '../../App.module.css';

export const LessonBox = ({ lesson, courseId }: { lesson: LessonDTO; courseId: number }) => {
  return (
    <Link to={paths.app.lesson.page(lesson.id, courseId)} className={appCssModule.courseCard}>
      <div>{lesson.title}</div>
    </Link>
  );
};
