import { useNavigate } from 'react-router-dom';
import { useCreateNewCourse } from '../../api/controllers/courses/courses.query';
import type { CourseFormData } from './Form';
import { CourseForm } from './Form';
import { paths } from '../../routes/paths';

const AddCoursePage = () => {
  const navigate = useNavigate();
  const { mutate: createCourse, isPending } = useCreateNewCourse();
  const handleSubmit = (data: CourseFormData) => {
    createCourse(
      { ...data, description: data.description || null },
      { onSuccess: (data) => navigate(paths.app.course.page(data.id), { replace: true }) },
    );
  };

  return (
    <div className='body'>
      <div>Create a new course</div>
      <br />
      <CourseForm onSubmit={handleSubmit} isSubmitting={isPending} submitLabel='Create' />
    </div>
  );
};

export default AddCoursePage;
