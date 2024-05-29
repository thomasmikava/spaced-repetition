import { DeleteOutlined, EditOutlined, LeftOutlined, SettingFilled } from '@ant-design/icons';
import Button from 'antd/es/button';
import Dropdown from 'antd/es/dropdown';
import Modal from 'antd/es/modal';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import cssModule from '../../App.module.css';
import ReviewButtons from '../../ReviewButtons';
import { useCourseById, useMyMainCourses } from '../../api/controllers/courses/courses.query';
import { useCourseLessons, useDeleteLesson } from '../../api/controllers/lessons/lessons.query';
import { useCourseWords } from '../../api/controllers/words/words.query';
import { PreviousReviews } from '../../functions/previous-reviews';
import { paths } from '../../routes/paths';
import { isNonNullable } from '../../utils/array';
import { roundNumber } from '../../utils/number';
import { formatTime } from '../../utils/time';
import { useHelper } from '../hooks/text-helpers';
import { LessonBody } from './Body';
import { useFilteredLessons } from './useFilteredLessons';
import { useSignInUserData } from '../../contexts/Auth';
import { AddToMyCoursesButton } from '../Course/AddToMyCourses';

const LessonPage = () => {
  const userData = useSignInUserData();
  const params = useParams();
  const navigate = useNavigate();

  const helper = useHelper();

  const courseId = +(params.courseId as string);
  const lessonId = +(params.lessonId as string);

  const { data: course, isLoading: isCourseLoading } = useCourseById(courseId);
  const { data: myMainCourses, isLoading: isMyMainCourseLoading } = useMyMainCourses();
  const { data: allCourseLessons, isLoading: isLessonLoading } = useCourseLessons({
    courseId,
    returnAllChildrenLessons: true,
  });
  const { data: words, isLoading: isWordLoading } = useCourseWords({ courseId, lessonId });
  const lessons = useFilteredLessons(allCourseLessons, courseId, lessonId);
  const myLesson = useMemo(
    () => allCourseLessons?.find((e) => e.courseId === courseId && e.id === lessonId),
    [allCourseLessons, courseId, lessonId],
  );
  const lessonWords = words;

  const [prevReviews] = useState(() => new PreviousReviews());

  const goToCourse = () => {
    navigate(paths.app.course.page(courseId));
  };

  const goToEdit = () => {
    navigate(paths.app.course.editContent(courseId, lessonId));
  };

  const { mutate: deleteLesson, isPending: isDeleting } = useDeleteLesson();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const showDeleteModal = () => {
    setIsDeleteModalVisible(true);
  };
  const hideDeleteModal = () => {
    setIsDeleteModalVisible(false);
  };
  const handleDelete = () => {
    deleteLesson(
      { courseId, lessonId },
      {
        onSuccess: goToCourse,
      },
    );
  };

  if (isLessonLoading || isCourseLoading || isWordLoading || isMyMainCourseLoading || !helper) {
    return <div>Loading lesson...</div>;
  }

  if (!myMainCourses) return <div>Error</div>;

  if (!course) return <div>Course not found</div>;

  if (!lessonWords) return <div>Error loading words</div>;

  if (!myLesson || !allCourseLessons) return <div>Lesson not found</div>;

  const lessonsInfo = lessonWords.map((word) => {
    const closestDueDate = prevReviews.getClosestDueDate(word.id);
    const closestDueIn = closestDueDate === Infinity ? Infinity : closestDueDate - Math.floor(Date.now() / 1000);
    return { closestDueIn, word };
  });
  const studiedCards = lessonsInfo.filter((item) => item.closestDueIn !== Infinity).length;
  const allCardsCount = lessonsInfo.length;

  const canManageCourse = course?.userId === userData.userId || userData.adminLangs?.includes(course.langToLearn);

  const isInMyCoursesList = myMainCourses.some((c) => c.id === courseId);

  return (
    <div className='body'>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <LeftOutlined onClick={goToCourse} style={{ cursor: 'pointer' }} />
        <div>
          <span>{course.title}</span> - {myLesson.title}{' '}
          {allCardsCount > 0 && (
            <span>
              ({allCardsCount} items. Studied: {roundNumber((studiedCards / allCardsCount) * 100, 1)}%)
            </span>
          )}
        </div>

        {canManageCourse && isInMyCoursesList && (
          <Dropdown
            menu={{
              items: [
                { label: 'Edit', key: 'edit', icon: <EditOutlined />, onClick: goToEdit },
                { label: 'Delete', key: 'delete', icon: <DeleteOutlined />, onClick: showDeleteModal },
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
      {isInMyCoursesList ? (
        <ReviewButtons courseId={courseId} lessonId={lessonId} />
      ) : (
        <AddToMyCoursesButton courseId={courseId} />
      )}
      {lessons && lessons.length > 0 && <LessonBody courseId={courseId} lessonId={lessonId} lessons={lessons} />}
      <table className={cssModule.lessonTable}>
        <tbody>
          {lessonsInfo.map((item) => {
            const { closestDueIn: closestDueDate, word } = item;
            const key = word.id;
            return (
              <tr key={key} className={cssModule.row}>
                <td className={cssModule.lessonCardType}>
                  {helper.getCardType(word.mainType ?? word.type, word.lang)?.abbr}
                </td>
                <td className={cssModule.lessonCardValue}>{word.value}</td>
                <td className={cssModule.lessonCardTranslation}>{word.translation}</td>
                <td className={cssModule.lessonCardTranslation}>
                  {closestDueDate === Infinity || closestDueDate === null
                    ? null
                    : closestDueDate <= 0
                      ? 'Ready'
                      : 'In ' + formatTime(closestDueDate)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Modal
        title='Modal'
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={hideDeleteModal}
        confirmLoading={isDeleting}
        okText={'Delete'}
        cancelText='Cancel'
      >
        <p>Are you sure that you want to delete the lesson?</p>
      </Modal>
    </div>
  );
};

export default LessonPage;
