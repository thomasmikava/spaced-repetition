import LeftOutlined from '@ant-design/icons/lib/icons/LeftOutlined';
import { useNavigate } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';
import appCssModule from '../../App.module.css';
import { useSearchCourses } from '../../api/controllers/courses/courses.query';
import { paths } from '../../routes/paths';
import { CourseBox } from './Box';

const ExploreCoursesPage = () => {
  const navigate = useNavigate();

  const { data, isError } = useSearchCourses({
    excludeMyCourses: true,
    limit: 100,
  });

  const goToMainPage = () => {
    navigate(paths.app.main());
  };

  if (isError) return <div>Error</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <div className='body'>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <LeftOutlined onClick={goToMainPage} style={{ cursor: 'pointer' }} />
        <h1>Public courses</h1>
      </div>
      <div className={appCssModule.courseContainer}>
        {data.pages.map((page, i) => (
          <Fragment key={i}>
            {page.courses.map((course) => (
              <CourseBox key={course.id} course={course} />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default ExploreCoursesPage;
