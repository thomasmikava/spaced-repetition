import { BookOutlined, DeleteOutlined, EditOutlined, LeftOutlined, SettingFilled } from '@ant-design/icons';
import AntButton from 'antd/es/button';
import Dropdown from 'antd/es/dropdown';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import LoadingPage from '../Loading/LoadingPage';
import { Table, type TableRow } from '../../ui/Table/Table';
import Button from '../../ui/Button';
import DictionaryModal from '../../components/DictionaryModal';
import { useConfirmationModal } from '../../ui/ConfirmationModal';
import { getWithSymbolArticle } from '../../functions/texts';
import { AttributeMapper } from '../../database/attributes';

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

  const { mutateAsync: deleteLesson } = useDeleteLesson();

  const { confirmationModalElement, openConfirmationModal } = useConfirmationModal();

  const showDeleteModal = () => {
    openConfirmationModal({ text: 'Are you sure that you want to delete the lesson?', onApprove: handleDelete });
  };
  const handleDelete = (): Promise<void> => {
    return deleteLesson(
      { courseId, lessonId },
      {
        onSuccess: goToCourse,
      },
    );
  };

  const [displayedWordId, setDisplayedWordId] = useState<number | null>(null);

  if (isLessonLoading || isCourseLoading || isWordLoading || isMyMainCourseLoading || !helper) {
    return <LoadingPage />;
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

  const isEmpty = !!lessons && lessons.length === 0 && lessonsInfo.length === 0;

  const wordRows =
    lessons && lessons.length > 0
      ? null
      : lessonsInfo.map((item): TableRow => {
          const { closestDueIn: closestDueDate, word } = item;
          const key = word.id;
          const cardTypeHelper = helper.getCardType(word.mainType ?? word.type, word.lang);
          const genderId = word.attributes?.[AttributeMapper.GENDER.id] ?? null;
          return {
            key,
            cells: [
              {
                cellValue: cardTypeHelper?.abbr,
                style: { opacity: 0.5, paddingRight: 30 },
              },
              cardTypeHelper?.includeArticleSymbol && genderId !== null
                ? getWithSymbolArticle(word.lang, word.value, genderId)
                : word.value,
              word.translation,
              {
                cellValue:
                  closestDueDate === Infinity || closestDueDate === null
                    ? null
                    : closestDueDate <= 0
                      ? 'Ready'
                      : 'In ' + formatTime(closestDueDate),
                style: { opacity: closestDueDate <= 10 ? 1 : undefined, textAlign: 'right' },
              },
              {
                cellValue: (
                  <Button label={<BookOutlined />} variant='text' onClick={() => setDisplayedWordId(word.id)} />
                ),
                style: { width: '46px' },
              },
            ],
          };
        });

  return (
    <div className='body'>
      <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
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
            <AntButton>
              <SettingFilled />
            </AntButton>
          </Dropdown>
        )}
      </div>
      {isEmpty ? null : isInMyCoursesList ? (
        <ReviewButtons courseId={courseId} lessonId={lessonId} />
      ) : (
        <AddToMyCoursesButton courseId={courseId} />
      )}
      {lessons && lessons.length > 0 && <LessonBody courseId={courseId} lessonId={lessonId} lessons={lessons} />}
      {wordRows && <Table rows={wordRows} removeEmptyColumns />}
      <br />

      {displayedWordId && !!course.translationLang && (
        <DictionaryModal
          wordId={displayedWordId}
          helper={helper}
          onClose={() => setDisplayedWordId(null)}
          translationLang={course.translationLang}
        />
      )}
      {confirmationModalElement}
    </div>
  );
};

export default LessonPage;
