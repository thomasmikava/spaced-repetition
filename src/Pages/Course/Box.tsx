import type { CourseDTO } from '../../api/controllers/courses/courses.schema';
import type { CourseWordStatistics } from '../../api/controllers/words/words.hooks';
import { BoxWithPercentage } from '../../components/Box';
import { paths } from '../../routes/paths';

export const CourseBox = ({ course, stats }: { course: CourseDTO; stats: CourseWordStatistics | undefined }) => {
  return <BoxWithPercentage link={paths.app.course.page(course.id)} title={course.title} stats={stats?.stats} />;
};
