import { Fragment } from 'react/jsx-runtime';
import appCssModule from '../../App.module.css';
import { useSearchCourses } from '../../api/controllers/courses/courses.query';
import { CourseBox } from './Box';

const ExploreCoursesPage = () => {
  const { data, isError } = useSearchCourses({
    excludeMyCourses: true,
    limit: 100,
  });

  if (isError) return <div>Error</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <div className='body'>
      <h1>Public courses</h1>
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
