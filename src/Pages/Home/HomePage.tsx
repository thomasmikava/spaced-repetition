import { Link } from 'react-router-dom';
import appCssModule from '../../App.module.css';
import ReviewButtons from '../../ReviewButtons';
import { useMyMainCourses } from '../../api/controllers/courses/courses.query';
import type { CourseDTO } from '../../api/controllers/courses/courses.schema';
import { paths } from '../../routes/paths';
import cssModule from './styles.module.css';
import SearchOutlined from '@ant-design/icons/lib/icons/SearchOutlined';
import GlobalOutlined from '@ant-design/icons/lib/icons/GlobalOutlined';
import PlusOutlined from '@ant-design/icons/lib/icons/PlusOutlined';

const HomePage = () => {
  const { data: mainCourses } = useMyMainCourses();
  if (!mainCourses) return null;

  return (
    <div className='body'>
      <ReviewButtons />
      <div className={appCssModule.courseContainer}>
        {mainCourses.map((course) => (
          <CourseBox key={course.id} course={course} />
        ))}
        {mainCourses.length > 0 && <SearchBox />}
        <PublicCourses />
        <AddBox />
      </div>
    </div>
  );
};

const CourseBox = ({ course }: { course: CourseDTO }) => {
  return (
    <Link to={paths.app.course.page(course.id)} className={appCssModule.courseCard}>
      <div>{course.title}</div>
    </Link>
  );
};

const SearchBox = () => {
  return (
    <div className={cssModule.specialBox}>
      <SearchOutlined />
      <span className={cssModule.title}>Search words</span>
    </div>
  );
};

const AddBox = () => {
  return (
    <Link className={cssModule.specialBox} to={paths.app.course.add()}>
      <PlusOutlined />
      <span className={cssModule.title}>Create a course</span>
    </Link>
  );
};

const PublicCourses = () => {
  return (
    <div className={cssModule.specialBox}>
      <GlobalOutlined />
      <span className={cssModule.title}>Explore courses</span>
    </div>
  );
};

export default HomePage;
