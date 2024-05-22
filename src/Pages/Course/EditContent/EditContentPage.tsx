import { useParams } from 'react-router-dom';
import { useCourseLessons } from '../../../api/controllers/lessons/lessons.query';
import { useFilteredLessons } from '../../Lesson/useFilteredLessons';
import { ContentForm } from './Form';
import { useCourseById } from '../../../api/controllers/courses/courses.query';

const EditContentPage = () => {
  const params = useParams();
  const searchParams = new URL(window.location.href).searchParams;
  const courseId = +(params.courseId as string);
  const lessonId = !searchParams.get('lessonId') ? undefined : +(searchParams.get('lessonId') as string);

  const { data: course, isLoading: isCourseLoading } = useCourseById(courseId);
  const { data: allCourseLessons, isLoading: isLessonLoading } = useCourseLessons({
    courseId,
    returnAllChildrenLessons: true,
  });

  const lessons = useFilteredLessons(allCourseLessons, courseId, !lessonId ? null : lessonId, true);

  if (isLessonLoading || isCourseLoading) return <div>Loading...</div>;
  if (!lessons || !course) return <div>Error</div>;

  console.log('Page rerender');

  console.log(lessons);

  return (
    <div className='body'>
      Edit Content Page
      <div style={{ width: 1000, maxWidth: '100%' }}>
        <ContentForm isCourseLevel={!lessonId} langToLearn={course.langToLearn} />
      </div>
    </div>
  );
};

export { EditContentPage };
