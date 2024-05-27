/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourseById, useUpdateCourseContent } from '../../../api/controllers/courses/courses.query';
import { useCourseLessons } from '../../../api/controllers/lessons/lessons.query';
import type { LessonDTO, LessonUpdateActionDTO } from '../../../api/controllers/lessons/lessons.schema';
import { useCourseWords } from '../../../api/controllers/words/words.query';
import type { WordWithTranslationAndLessonsDTO } from '../../../api/controllers/words/words.schema';
import { removeKeys } from '../../../utils/object';
import { useFilteredLessons } from '../../Lesson/useFilteredLessons';
import type { FormData, KnownWordInfo, LessonInfo, WordInfo } from './Form';
import { ContentForm, DEFAULT_WORD_DISPLAY_TYPE } from './Form';
import { paths } from '../../../routes/paths';
import { isNonNullable } from '../../../utils/array';
import { useHelper } from '../../hooks/text-helpers';

const EditContentPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const searchParams = new URL(window.location.href).searchParams;
  const courseId = +(params.courseId as string);
  const lessonId = !searchParams.get('lessonId') ? undefined : +(searchParams.get('lessonId') as string);

  const helper = useHelper();

  const { data: course, isLoading: isCourseLoading } = useCourseById(courseId);
  const { data: allCourseLessons, isLoading: isLessonLoading } = useCourseLessons({
    courseId,
    returnAllChildrenLessons: true,
  });
  const { data: courseWords, isLoading: areCourseWordsLoading } = useCourseWords({ courseId, lessonId });

  const lessons = useFilteredLessons(allCourseLessons, courseId, !lessonId ? null : lessonId, true, true);
  const parentLessonId: number | null = lessonId
    ? allCourseLessons?.find((lesson) => lesson.courseId === courseId && lesson.id === lessonId)?.parentLessonId ?? null
    : null;

  const { mutate: updateCourseContent, isPending: isSubmitting } = useUpdateCourseContent();

  const initialData = useMemo(() => {
    if (!lessons || !courseWords) return null;

    return calculateInitialData({ courseId, lessonId, lessons, courseWords });
  }, [courseId, courseWords, lessonId, lessons]);

  if (isLessonLoading || isCourseLoading || areCourseWordsLoading || !helper) return <div>Loading...</div>;
  if (!course || !initialData) return <div>Error</div>;

  const handleSubmit = (newData: FormData) => {
    const convertedData = convertLessonUpdates(parentLessonId, newData.children, initialData.children);
    updateCourseContent(
      { courseId, actions: convertedData },
      {
        onSuccess: () => {
          if (lessonId) {
            navigate(paths.app.lesson.page(lessonId, courseId));
          } else {
            navigate(paths.app.course.page(courseId));
          }
        },
      },
    );
  };

  return (
    <div className='body'>
      Edit Content Page
      <div style={{ width: 1000, maxWidth: '100%' }}>
        <ContentForm
          isCourseLevel={!lessonId}
          langToLearn={course.langToLearn}
          defaultData={initialData.children.length > 0 ? initialData : undefined}
          isSubmitting={isSubmitting}
          translationLang={course.translationLang}
          onSubmit={handleSubmit}
          helper={helper}
        />
      </div>
    </div>
  );
};

const calculateInitialData = ({
  courseId,
  lessonId,
  lessons,
  courseWords,
}: {
  courseId: number;
  lessonId: number | undefined;
  lessons: LessonDTO[];
  courseWords: WordWithTranslationAndLessonsDTO[];
}): FormData<KnownWordInfo> => {
  const initialLessons = lessonId
    ? lessons.filter((lesson) => lesson.id === lessonId)
    : lessons.filter((lesson) => lesson.parentLessonId === null);

  function getLessonInfo(lesson: LessonDTO): LessonInfo<KnownWordInfo> {
    const childLessons = lessons.filter((l) => l.parentLessonId === lesson.id);
    const lessonWords = courseWords
      .filter((word) => word.relations.some((rel) => rel.courseId === courseId && rel.lessonId === lesson.id))
      .map(
        (word): KnownWordInfo => ({
          type: 'word',
          subType: 'known-word',
          fieldUniqueId: Math.random().toString(),
          word: removeKeys(word, 'relations'),
        }),
      );
    return {
      type: 'lesson',
      fieldUniqueId: Math.random().toString(),
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || '',
      children: [...lessonWords, ...childLessons.map((lesson) => getLessonInfo(lesson))],
    };
  }

  return {
    children: initialLessons.map((lesson) => getLessonInfo(lesson)),
  };
};

const convertLessonUpdates = (
  rootParentLessonId: number | null,
  newData: LessonInfo[],
  initialData: LessonInfo<KnownWordInfo>[],
): LessonUpdateActionDTO[] => {
  const initialDataTree = buildTree(initialData, rootParentLessonId);
  const newDataTree = buildTree(newData, rootParentLessonId);
  function mapWord(word: WordInfo, isNew: boolean): LessonUpdateActionDTO | null {
    if (word.subType === 'known-word') {
      return {
        type: 'existing-word',
        isNewRecord: isNew,
        wordId: word.word.id,
      };
    }
    if (word.subType === 'custom-word') {
      return {
        type: 'new-word',
        wordType: 'phrase',
        value: word.value,
        displayType: word.wordDisplayType === DEFAULT_WORD_DISPLAY_TYPE ? null : word.wordDisplayType,
        translation: {
          translation: word.translation,
          translationVariants: [],
        },
      };
    }
    return null;
  }

  function convertLessonInfo(
    info: LessonInfo,
    parentLessonId: number | null | undefined,
  ): LessonUpdateActionDTO | null {
    const initialInfo = info.id ? initialDataTree[info.id] : undefined;
    if (!initialInfo) {
      return {
        type: 'new-lesson',
        title: info.title,
        description: info.description || null,
        parentLessonId,
        items: normalizeItems([
          ...info.children.filter(isLesson).map((lesson) => convertLessonInfo(lesson, undefined)),
          ...info.children.filter(isWord).map((word) => mapWord(word, true)),
        ]),
      };
    }

    const initialWords = initialInfo.children.filter(
      (child): child is KnownWordInfo => child.type === 'word' && child.subType === 'known-word',
    );
    const initialWordIds = new Set(initialWords.map((word) => word.word.id));
    const newWords = info.children.filter(isKnownWordInfo).map((word) => word.word.id);
    const deletedWordIds = [...initialWordIds].filter((id) => !newWords.includes(id));

    const updateItem: LessonUpdateActionDTO = {
      type: 'update-lesson',
      lessonId: info.id!,
      title: info.title !== initialInfo.title ? info.title : undefined,
      description: (info.description || '') !== (initialInfo.description || '') ? info.description || null : undefined,
      parentLessonId: parentLessonId !== initialInfo.parentLessonId ? parentLessonId : undefined,
      items: normalizeItems([
        ...info.children.filter(isLesson).map((lesson) => convertLessonInfo(lesson, info.id!)),
        ...info.children
          .filter(isWord)
          .filter((child) => {
            if (child.subType === 'known-word') {
              return !initialWordIds.has(child.word.id);
            }
            return true;
          })
          .map((word) => mapWord(word, true)),
        ...deletedWordIds.map((wordId): LessonUpdateActionDTO => ({ type: 'delete-word', wordId })),
      ]),
    };

    if (
      updateItem.title === undefined &&
      updateItem.description === undefined &&
      updateItem.parentLessonId === undefined &&
      (!updateItem.items || updateItem.items.length === 0)
    ) {
      return null;
    }

    return updateItem;
  }

  const actions = newData.map((info) => convertLessonInfo(info, rootParentLessonId)).filter(isNonNullable);

  const prevLessonIds = new Set(
    Object.values(initialDataTree)
      .map((lesson) => (lesson && lesson.id ? +lesson.id : null))
      .filter(isNonNullable),
  );

  const newDataLessonIds = new Set(
    Object.values(newDataTree)
      .map((lesson) => (lesson && lesson.id ? +lesson.id : null))
      .filter(isNonNullable),
  );

  const removedLessonIds = [...prevLessonIds].filter((id) => !newDataLessonIds.has(id));

  for (const removedLessonId of removedLessonIds) {
    actions.push({
      type: 'delete-lesson',
      lessonId: removedLessonId,
    });
  }

  const newActionsTree = buildActionsTree(actions);
  for (const oldLessonId in initialDataTree) {
    const oldLesson = initialDataTree[oldLessonId];
    if (!oldLesson) continue;

    const lessonAction: LessonUpdateActionDTO = newActionsTree[oldLesson.id!] || {
      type: 'update-lesson',
      lessonId: oldLesson.id!,
      items: [],
    };
    if (lessonAction.type !== 'update-lesson') continue;

    const oldLessonWordIds = new Set(oldLesson.children.filter(isKnownWordInfo).map((word) => word.word.id));
    const newLesson = newDataTree[oldLessonId];
    const newLessonWordIds = new Set(newLesson?.children.filter(isKnownWordInfo).map((word) => word.word.id));
    const removedWordIds = [...oldLessonWordIds].filter((id) => !newLessonWordIds.has(id));

    lessonAction.items = lessonAction.items || [];
    const mentionedWordIds = new Set(
      lessonAction.items
        .map((item) => (item.type === 'existing-word' ? item.wordId : null))
        .concat(lessonAction.items.map((item) => (item.type === 'delete-word' ? item.wordId : null))),
    );
    for (const removedWordId of removedWordIds) {
      if (!mentionedWordIds.has(removedWordId)) {
        lessonAction.items.push({
          type: 'delete-word',
          wordId: removedWordId,
        });
      }
    }
  }

  return actions;
};

const isLesson = <T extends WordInfo>(info: T | LessonInfo<T>): info is LessonInfo<T> => info.type === 'lesson';

const isWord = <T extends WordInfo>(info: T | LessonInfo<T>): info is T => info.type === 'word';

const isKnownWordInfo = (info: WordInfo | LessonInfo<WordInfo>): info is KnownWordInfo =>
  info.type === 'word' && info.subType === 'known-word';

const buildTree = <T extends WordInfo>(data: LessonInfo<T>[], rootParentId: number | null) => {
  const tree: { [lessonId in string]?: LessonInfo<T> & { parentLessonId: number | null } } = {};

  for (const lesson of data) {
    if (!lesson.id) continue;
    tree[lesson.id] = {
      ...lesson,
      parentLessonId: rootParentId,
    };
    Object.assign(
      tree,
      buildTree(
        lesson.children.filter((child): child is LessonInfo => child.type === 'lesson'),
        lesson.id,
      ),
    );
  }
  return tree;
};

const buildActionsTree = (data: LessonUpdateActionDTO[]) => {
  const tree: { [lessonId in string]?: LessonUpdateActionDTO } = {};

  for (const lesson of data) {
    if (lesson.type !== 'update-lesson' && lesson.type !== 'delete-lesson') continue;
    const id = lesson.lessonId;
    tree[id] = lesson;
    if (lesson.type === 'update-lesson' && lesson.items) {
      Object.assign(tree, buildActionsTree(lesson.items));
    }
  }
  return tree;
};

const normalizeItems = <T extends unknown>(items: (T | null)[]): T[] | undefined => {
  const newArr = items.filter(isNonNullable);
  return newArr.length > 0 ? newArr : undefined;
};

export { EditContentPage };
