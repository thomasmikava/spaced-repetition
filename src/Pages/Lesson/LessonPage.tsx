import {
  BookOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  LeftOutlined,
  PlusOutlined,
  SettingFilled,
} from '@ant-design/icons';
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
import { formatTime, roundTime } from '../../utils/time';
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
import { specialBoxClasses } from '../Home/boxes';
import { ALL_LANGS, sortByLangs, useTranslationLang } from '../hooks/useTranslationLang';
import { TranslationLangSelector } from '../../components/Lang/TranslationLangSelector';
import { TranslationLangsProvider } from '../../contexts/TranslationLangs';

// eslint-disable-next-line sonarjs/cognitive-complexity
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

  const { translationLang, handleTransLangChange, shouldShowTranslationLangs } = useTranslationLang(
    course?.translationLangs,
  );

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
              translationLang === ALL_LANGS
                ? {
                    cellValue: (
                      <div>
                        {sortByLangs(word.translations, course.translationLangs).map((tr, i) => (
                          <div key={tr.lang + '_' + i}>
                            {shouldShowTranslationLangs ? `${tr.lang}: ` : ''}
                            {tr.translation}
                          </div>
                        ))}
                      </div>
                    ),
                    style: {},
                  }
                : word.translations.find((e) => e.lang === translationLang)?.translation,
              {
                cellValue:
                  closestDueDate === Infinity || closestDueDate === null
                    ? null
                    : closestDueDate <= 0
                      ? 'Ready'
                      : formatTime(roundTime(closestDueDate)),
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

  const copyWords = () => {
    if (!wordRows) return;
    const words = lessonsInfo
      .map((item) => {
        if (!item.word) return null;
        return item.word.value;
      })
      .filter(isNonNullable)
      .join('\n');

    navigator.clipboard.writeText(words);
  };
  const canCopyWords = wordRows && wordRows.length > 0 && typeof navigator?.clipboard?.writeText === 'function';

  return (
    <TranslationLangsProvider translationLangs={course.translationLangs}>
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
                  canCopyWords
                    ? { label: 'Copy words', key: 'copy', icon: <CopyOutlined />, onClick: copyWords }
                    : null,
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
        {lessons && lessons.length > 0 && (
          <LessonBody courseId={courseId} lessonId={lessonId} lessons={lessons} canManageCourse={!!canManageCourse} />
        )}
        {wordRows && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <TranslationLangSelector
                options={course.translationLangs}
                onChange={handleTransLangChange}
                value={translationLang}
              />
            </div>
            <Table rows={wordRows} removeEmptyColumns />
          </div>
        )}
        {canManageCourse && lessons && lessons.length === 0 && (!wordRows || !wordRows.length) && (
          <AddBox onClick={goToEdit} />
        )}
        <br />

        {displayedWordId && !!course.translationLangs && (
          <DictionaryModal
            wordId={displayedWordId}
            helper={helper}
            onClose={() => setDisplayedWordId(null)}
            translationLangs={
              !translationLang || translationLang === ALL_LANGS ? course.translationLangs.split(',') : [translationLang]
            }
          />
        )}
        {confirmationModalElement}
      </div>
    </TranslationLangsProvider>
  );
};

const AddBox = ({ onClick }: { onClick: () => void }) => {
  return (
    <>
      <div className={specialBoxClasses.container} onClick={onClick}>
        <PlusOutlined />
        <span className={specialBoxClasses.title}>Add words or sub-lessons</span>
      </div>
    </>
  );
};

export default LessonPage;
