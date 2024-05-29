import { Link } from 'react-router-dom';
import appCssModule from '../../App.module.css';
import type { CourseDTO } from '../../api/controllers/courses/courses.schema';
import { paths } from '../../routes/paths';

export const CourseBox = ({ course }: { course: CourseDTO }) => {
  return (
    <Link to={paths.app.course.page(course.id)} className={appCssModule.courseCard}>
      <div>{course.title}</div>
    </Link>
  );
};
