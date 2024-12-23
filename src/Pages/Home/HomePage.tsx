import GlobalOutlined from '@ant-design/icons/lib/icons/GlobalOutlined';
import PlusOutlined from '@ant-design/icons/lib/icons/PlusOutlined';
import SearchOutlined from '@ant-design/icons/lib/icons/SearchOutlined';
import { Link, useNavigate } from 'react-router-dom';
import appCssModule from '../../App.module.css';
import ReviewButtons from '../../ReviewButtons';
import { useMyMainCourses } from '../../api/controllers/courses/courses.query';
import { paths } from '../../routes/paths';
import { CourseBox } from '../Course/Box';
import cssModule from './styles.module.css';
import { specialBoxClasses } from './boxes';
import { useWordsStats } from '../../api/controllers/words/words.hooks';

const HomePage = () => {
  const { data: mainCourses } = useMyMainCourses();
  const stats = useWordsStats();
  if (!mainCourses) return null;

  return (
    <div className='body'>
      <ReviewButtons />
      <br />
      <div className={appCssModule.courseContainer}>
        {mainCourses.map((course) => (
          <CourseBox key={course.id} course={course} stats={stats?.courses?.[course.id]} />
        ))}
        {mainCourses.length > 0 && <SearchBox />}
        <PublicCourses />
        <AddBox />
      </div>
    </div>
  );
};

const SearchBox = () => {
  const navigate = useNavigate();
  const onClick = () => navigate(paths.app.search());
  return (
    <div className={cssModule.specialBox} onClick={onClick}>
      <SearchOutlined />
      <span className={cssModule.title}>Search words</span>
    </div>
  );
};

const AddBox = () => {
  return (
    <Link className={specialBoxClasses.container} to={paths.app.course.add()}>
      <PlusOutlined />
      <span className={cssModule.title}>Create a course</span>
    </Link>
  );
};

const PublicCourses = () => {
  const navigate = useNavigate();
  const onClick = () => navigate(paths.app.explore());
  return (
    <div className={specialBoxClasses.container} onClick={onClick}>
      <GlobalOutlined />
      <span className={cssModule.title}>Explore courses</span>
    </div>
  );
};

export default HomePage;
