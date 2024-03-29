import cssModule from './App.module.css';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courses } from './courses/lessons';
import ReviewButtons from './ReviewButtons';
import { paths } from './routes/paths';

const CoursePage = () => {
  const params = useParams();
  const navigate = useNavigate();

  const courseId = +(params.courseId as string);
  const myCourse = useMemo(() => {
    return courses.find((course) => course.id === courseId);
  }, [courseId]);

  const handleLessonClick = (lessonId: number) => {
    navigate(paths.app.lesson(lessonId, courseId));
  };

  const goToMainPage = () => {
    navigate(paths.app.main());
  };

  if (!myCourse) return <div>Course not found</div>;

  return (
    <div className='body'>
      <div onClick={goToMainPage}>{myCourse.title}</div>
      <ReviewButtons courseId={courseId} />
      <div className={cssModule.lessonsContainer}>
        {myCourse.lessons.map((lesson) => (
          <div className={cssModule.lesson} key={lesson.id} onClick={() => handleLessonClick(lesson.id)}>
            {lesson.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursePage;
