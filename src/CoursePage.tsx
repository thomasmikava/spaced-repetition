import cssModule from './App.module.css';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courses } from './course/lessons';
import ReviewButtons from './ReviewButtons';

const CoursePage = () => {
  let params = useParams();
  const navigate = useNavigate();

  const courseId = +(params.courseId as string);
  const myCourse = useMemo(() => {
    return courses.find((course) => course.id === courseId);
  }, []);

  const handleLessonClick = (lessonId: number) => {
    navigate(`/spaced-repetition/course/${courseId}/lesson/${lessonId}`);
  };

  const goToMainPage = () => {
    navigate(`/spaced-repetition/`);
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
