import type { LessonDTO } from '../../api/controllers/lessons/lessons.schema';
import type { WordStatistics } from '../../api/controllers/words/words.hooks';
import { BoxWithPercentage } from '../../components/Box';
import { paths } from '../../routes/paths';

export const LessonBox = ({
  lesson,
  courseId,
  stats,
}: {
  lesson: LessonDTO;
  courseId: number;
  stats: WordStatistics | undefined;
}) => {
  return <BoxWithPercentage link={paths.app.lesson.page(lesson.id, courseId)} title={lesson.title} stats={stats} />;
};
