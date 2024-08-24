import { useNavigate, useParams } from 'react-router-dom';
import { useCourseById, useUpdateCourse } from '../../api/controllers/courses/courses.query';
import type { CourseFormData } from './Form';
import { CourseForm } from './Form';
import { paths } from '../../routes/paths';
import LoadingPage from '../Loading/LoadingPage';
import { useSignInUserData } from '../../contexts/Auth';

const EditCoursePage = () => {
  const userData = useSignInUserData();
  const params = useParams();
  const courseId = +(params.courseId as string);
  const navigate = useNavigate();

  const { data: course, isLoading: isCourseLoading } = useCourseById(courseId);

  const { mutate: updateCourse, isPending } = useUpdateCourse();
  const handleSubmit = (data: CourseFormData) => {
    updateCourse(
      {
        id: courseId,
        ...data,
        description: data.description || null,
        translationLangs: data.translationLangs.join(','),
      },
      { onSuccess: () => navigate(paths.app.course.page(courseId)) },
    );
  };

  if (isCourseLoading) return <LoadingPage />;
  if (!course) return <div>Course not found</div>;

  return (
    <div className='body'>
      <div>Edit course</div>
      <br />
      <CourseForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        defaultData={{
          title: course.title,
          description: course.description ?? '',
          isOfficial: course.isOfficial,
          isPublic: course.isPublic,
          langToLearn: course.langToLearn,
          translationLangs: course.translationLangs.split(','),
        }}
        officialLangs={userData.adminLangs || undefined}
        submitLabel='Save'
      />
    </div>
  );
};

export default EditCoursePage;
