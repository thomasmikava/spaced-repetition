import cssModule from './App.module.css';
import ReviewButtons from './ReviewButtons';
import { courses } from './courses/lessons';
import { useNavigate } from 'react-router-dom';
import { paths } from './routes/paths';

const App = () => {
  const navigate = useNavigate();

  const handleCourseClick = (courseId: number) => {
    navigate(paths.app.course(courseId));
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
