import { DeleteOutlined, EditOutlined, LeftOutlined, SettingFilled } from '@ant-design/icons';
import Button from 'antd/es/button/button';
import Dropdown from 'antd/es/dropdown';
import { useNavigate, useParams } from 'react-router-dom';
import ReviewButtons from '../../ReviewButtons';
import { useCourseById, useDeleteCourse, useMyMainCourses } from '../../api/controllers/courses/courses.query';
import { useCourseLessons } from '../../api/controllers/lessons/lessons.query';
import { paths } from '../../routes/paths';
import { isNonNullable } from '../../utils/array';
import { LessonBody } from '../Lesson/Body';
import { useFilteredLessons } from '../Lesson/useFilteredLessons';
import { useSignInUserData } from '../../contexts/Auth';
import { AddToMyCoursesButton } from './AddToMyCourses';
import LoadingPage from '../Loading/LoadingPage';
import { useConfirmationModal } from '../../ui/ConfirmationModal';

const CoursePage = () => {
  const userData = useSignInUserData();
  const params = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const courseId = +params.courseId!;

  const { data: course, isLoading: isCourseLoading } = useCourseById(courseId);
  const { data: myMainCourses, isLoading: isMyMainCourseLoading } = useMyMainCourses();

  const { data: allCourseLessons, isLoading: isLessonLoading } = useCourseLessons({
    courseId,
    returnAllChildrenLessons: true,
  });
  const lessons = useFilteredLessons(allCourseLessons, courseId, null);

  const goToMainPage = () => {
    navigate(paths.app.main());
  };

  const goToEdit = () => {
    navigate(paths.app.course.edit(courseId));
  };

  const goToContent = () => {
    navigate(paths.app.course.editContent(courseId));
  };

  const { confirmationModalElement, openConfirmationModal } = useConfirmationModal();

  const { mutateAsync: deleteCourse } = useDeleteCourse();

  const handleDelete = (removeForEveryone: boolean): Promise<void> => {
    return deleteCourse(
      { id: courseId, removeForEveryone },
      {
        onSuccess: goToMainPage,
      },
    );
  };

  const showDeleteModal = () => {
    openConfirmationModal({
      text: 'Are you sure that you want to delete the course?',
      onApprove: () => handleDelete(true),
    });
  };
  const showRemoveModal = () => {
    openConfirmationModal({
      text: 'Are you sure you want to remove this course from your progress?',
      onApprove: () => handleDelete(false),
    });
  };

  if (isLessonLoading || isCourseLoading || isMyMainCourseLoading) return <LoadingPage />;

  if (!myMainCourses) return <div>Error</div>;

  if (!course) return <div>Course not found</div>;

  if (!lessons) return <LoadingPage />;

  const canManageCourse = course?.userId === userData.userId || userData.adminLangs?.includes(course.langToLearn);

  const isInMyCoursesList = myMainCourses.some((c) => c.id === courseId);

  return (
    <div className='body'>
      <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
        <LeftOutlined onClick={goToMainPage} style={{ cursor: 'pointer' }} />
        <h3>{course.title}</h3>
        {isInMyCoursesList && (
          <Dropdown
            menu={{
              items: [
                { label: 'Edit content', key: 'edit-c', icon: <EditOutlined />, onClick: goToContent },
                { label: 'Edit course', key: 'edit', icon: <EditOutlined />, onClick: goToEdit },
                {
                  label: canManageCourse ? 'Remove from my courses' : 'Remove',
                  key: 'remove',
                  icon: <DeleteOutlined />,
                  onClick: showRemoveModal,
                },
                canManageCourse
                  ? { label: 'Delete', key: 'delete', icon: <DeleteOutlined />, onClick: showDeleteModal }
                  : undefined,
              ].filter(isNonNullable),
            }}
            placement='bottom'
          >
            <Button>
              <SettingFilled />
            </Button>
          </Dropdown>
        )}
      </div>
      {lessons.length === 0 ? null : isInMyCoursesList ? (
        <ReviewButtons courseId={courseId} />
      ) : (
        <AddToMyCoursesButton courseId={courseId} />
      )}
      {canManageCourse && lessons.length === 0 && (
        <Button onClick={goToContent} type='primary'>
          Add content
        </Button>
      )}
      <LessonBody courseId={courseId} lessonId={null} lessons={lessons} canManageCourse={!!canManageCourse} />
      <br />
      {confirmationModalElement}
    </div>
  );
};

export default CoursePage;
