import cssModule from './App.module.css';
import ReviewButtons from './ReviewButtons';
import { courses } from './course/lessons';
import { useNavigate } from 'react-router-dom';

const App = () => {
  const navigate = useNavigate();

  const handleCourseClick = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };
  return (
    <div className='body'>
      <ReviewButtons />
      <div className={cssModule.courseContainer}>
        {courses.map((course) => (
          <div key={course.id} className={cssModule.courseCard} onClick={() => handleCourseClick(course.id)}>
            {course.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
