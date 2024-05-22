import { DeleteOutlined, EditOutlined, LeftOutlined, SettingFilled } from '@ant-design/icons';
import Button from 'antd/es/button/button';
import Dropdown from 'antd/es/dropdown';
import Modal from 'antd/es/modal';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import cssModule from '../../App.module.css';
import ReviewButtons from '../../ReviewButtons';
import { useCourseById, useDeleteCourse } from '../../api/controllers/courses/courses.query';
import { useCourseLessons } from '../../api/controllers/lessons/lessons.query';
import { paths } from '../../routes/paths';
import { isNonNullable } from '../../utils/array';
import { LessonBox } from '../Lesson/LessonBox';
import { useFilteredLessons } from '../Lesson/useFilteredLessons';

const CoursePage = () => {
  const params = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const courseId = +params.courseId!;

  const { data: course, isLoading: isCourseLoading } = useCourseById(courseId);

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

  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<'deleteForAll' | 'removeForMe' | 'closed'>('closed');
  const showDeleteModal = () => {
    setIsDeleteModalVisible('deleteForAll');
  };
  const showRemoveModal = () => {
    setIsDeleteModalVisible('removeForMe');
  };
  const hideDeleteModal = () => {
    setIsDeleteModalVisible('closed');
  };
  const handleDelete = () => {
    deleteCourse(
      { id: courseId, removeForEveryone: isDeleteModalVisible === 'deleteForAll' },
      {
        onSuccess: goToMainPage,
      },
    );
  };

  const canManageCourse = true; // TODO: check if I have the permission to delete it

  if (isLessonLoading || isCourseLoading) return <div>Loading course...</div>;

  if (!course) return <div>Course not found</div>;

  if (!lessons) return <div>Loading course...</div>;

  return (
    <div className='body'>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <LeftOutlined onClick={goToMainPage} style={{ cursor: 'pointer' }} />
        <h3>{course.title}</h3>
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
      </div>
      <ReviewButtons courseId={courseId} />
      <div className={cssModule.lessonsContainer}>
        {lessons.map((lesson) => (
          <LessonBox key={lesson.id} lesson={lesson} courseId={courseId} />
        ))}
      </div>
      <Modal
        title='Modal'
        open={isDeleteModalVisible !== 'closed'}
        onOk={handleDelete}
        onCancel={hideDeleteModal}
        confirmLoading={isDeleting}
        okText={isDeleteModalVisible === 'deleteForAll' ? 'Delete' : 'Remove'}
        cancelText='Cancel'
      >
        {isDeleteModalVisible === 'deleteForAll' ? (
          <p>Are you sure that you want to delete the course?</p>
        ) : (
          <p>Are you sure you want to remove this course from your progress?</p>
        )}
      </Modal>
    </div>
  );
};

export default CoursePage;
