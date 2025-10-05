/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import { useLayoutEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourseById, useUpdateCourseContent } from '../../../api/controllers/courses/courses.query';
import { useCourseLessons } from '../../../api/controllers/lessons/lessons.query';
import type { LessonDTO, LessonUpdateActionDTO } from '../../../api/controllers/lessons/lessons.schema';
import { useQuizzes } from '../../../api/controllers/quizzes/quiz.query';
import type { QuizDTO } from '../../../api/controllers/quizzes/quiz.schema';
import { useCourseWords } from '../../../api/controllers/words/words.query';
import type {
  AdvancedTranslationDTO,
  GetWordsResDTO,
  TranslationObjDTO,
  WordUsageExampleDTO,
  WordWithTranslationDTO,
} from '../../../api/controllers/words/words.schema';
import { removeKeys } from '../../../utils/object';
import { useFilteredLessons } from '../../Lesson/useFilteredLessons';
import type { FormData, LessonInfo, LessonItem, WordInfo } from './Form';
import { ContentForm, DEFAULT_WORD_DISPLAY_TYPE } from './Form';
import { paths } from '../../../routes/paths';
import { arrayToObject, isNonNullable } from '../../../utils/array';
import { useHelper } from '../../hooks/text-helpers';
import LoadingPage from '../../Loading/LoadingPage';
import { useSignInUserData } from '../../../contexts/Auth';
import { addFieldIdsToTranslationObject, areTranslationsEqual, fillLangs } from './utils';
import type { QuizInfo, QuizQuestion } from './QuizField';

const EditContentPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const userData = useSignInUserData();
  const searchParams = new URL(window.location.href).searchParams;
  const courseId = +(params.courseId as string);
  const lessonId = !searchParams.get('lessonId') ? undefined : +(searchParams.get('lessonId') as string);

  const helper = useHelper();

  const { data: course, isLoading: isCourseLoading } = useCourseById(courseId);
  const { data: allCourseLessons, isLoading: isLessonLoading } = useCourseLessons({
    courseId,
    returnAllChildrenLessons: true,
  });
  const { data: courseWords, isLoading: areCourseWordsLoading } = useCourseWords({
    courseId,
    lessonId,
    includeOfficialTranslationsSeparately: true,
  });

  const { data: lessonQuizzes, isLoading: areQuizzesLoading } = useQuizzes(
    lessonId
      ? {
          lessonId,
          includeHidden: true,
          includeQuestions: true,
        }
      : null,
  );

  const translationLangs = useMemo(() => (!course ? null : course.translationLangs.split(',')), [course]);

  const lessons = useFilteredLessons(allCourseLessons, courseId, !lessonId ? null : lessonId, true, true);
  const parentLessonId: number | null = lessonId
    ? allCourseLessons?.find((lesson) => lesson.courseId === courseId && lesson.id === lessonId)?.parentLessonId ?? null
    : null;

  const { mutate: updateCourseContent, isPending: isSubmitting } = useUpdateCourseContent();

  const initialData = useMemo(() => {
    if (!lessons || !courseWords || !translationLangs) return null;

    return calculateInitialData({
      courseId,
      lessonId,
      lessons,
      courseWords,
      translationLangs,
      quizzes: lessonQuizzes || [],
    });
  }, [courseId, courseWords, lessonId, lessons, translationLangs, lessonQuizzes]);

  const isLoading = isLessonLoading || isCourseLoading || areCourseWordsLoading || areQuizzesLoading || !helper;

  useLayoutEffect(() => {
    // scroll at the bottom of page
    if (!isLoading) window.scrollTo(0, document.body.scrollHeight);
  }, [isLoading]);

  if (isLoading) {
    return <LoadingPage />;
  }
  if (!course || !initialData || !translationLangs) return <div>Error</div>;

  const gotoCourseLesson = () => {
    if (lessonId) {
      navigate(paths.app.lesson.page(lessonId, courseId));
    } else {
      navigate(paths.app.course.page(courseId));
    }
  };

  const handleSubmit = (newData: FormData) => {
    console.log('newData', newData);
    const convertedData = convertLessonUpdates(parentLessonId, newData.children, initialData.children);
    // if (1 < 2) {
    //   console.log('convertedData', convertedData);
    //   return;
    // }
    if (convertedData.length === 0) gotoCourseLesson();
    else {
      updateCourseContent(
        { courseId, actions: convertedData },
        {
          onSuccess: gotoCourseLesson,
        },
      );
    }
  };

  const canManageOfficialWords = !!userData.adminLangs?.includes(course.langToLearn);

  return (
    <div className='body' style={{ justifyContent: 'flex-start' }}>
      <h1>Edit Content Page</h1>
      <div style={{ width: '100%' }}>
        <ContentForm
          isCourseLevel={!lessonId}
          langToLearn={course.langToLearn}
          defaultData={initialData.children.length > 0 ? initialData : undefined}
          isSubmitting={isSubmitting}
          translationLangs={translationLangs!}
          onSubmit={handleSubmit}
          helper={helper}
          onCancel={gotoCourseLesson}
          canManageOfficialWords={canManageOfficialWords}
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
  translationLangs,
  quizzes,
}: {
  courseId: number;
  lessonId: number | undefined;
  lessons: LessonDTO[];
  courseWords: GetWordsResDTO;
  translationLangs: string[];
  quizzes: QuizDTO[];
}): FormData<WordInfo | QuizInfo> => {
  const initialLessons = lessonId
    ? lessons.filter((lesson) => lesson.id === lessonId)
    : lessons.filter((lesson) => lesson.parentLessonId === null);

  function getLessonInfo(lesson: LessonDTO): LessonInfo<WordInfo | QuizInfo> {
    const childLessons = lessons.filter((l) => l.parentLessonId === lesson.id);
    const lessonWords = courseWords
      .filter((word) => word.relations.some((rel) => rel.courseId === courseId && rel.lessonId === lesson.id))
      .map(
        (word): WordInfo => ({
          type: 'word',
          subType: 'search-word',
          fieldUniqueId: Math.random().toString(),
          word: removeKeys(word, 'relations'),
          translations: addFieldIdsToTranslationObject(fillLangs(translationLangs, word.translations)),
          wordValue: word.value,
          changed: false,
          wordDisplayType: word.mainType ?? (word.type === DEFAULT_WORD_DISPLAY_TYPE ? undefined : word.type),
        }),
      );

    // Add quizzes for this lesson
    const lessonQuizzes = quizzes
      .filter((quiz) => quiz.lessonId === lesson.id)
      .map(
        (quiz): QuizInfo => ({
          type: 'quiz',
          fieldUniqueId: Math.random().toString(),
          id: quiz.id,
          title: quiz.title,
          description: quiz.description || '',
          priority: quiz.priority,
          isHidden: quiz.isHidden,
          mode: quiz.mode ?? undefined,
          questions:
            quiz.questions?.map(
              (q): QuizQuestion => ({
                fieldUniqueId: Math.random().toString(),
                type: 'existing',
                questionId: q.questionId,
                order: q.order,
                points: q.points,
                title: q.question.title || undefined,
                content: q.question.content,
                isOfficial: q.question.isOfficial,
              }),
            ) || [],
        }),
      );

    return {
      type: 'lesson',
      fieldUniqueId: Math.random().toString(),
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || '',
      children: [...lessonWords, ...childLessons.map((lesson) => getLessonInfo(lesson)), ...lessonQuizzes],
    };
  }

  return {
    children: initialLessons.map((lesson) => getLessonInfo(lesson)),
  };
};

const getCustomTranslations = ({ word, translations }: WordInfo): TranslationObjDTO[] => {
  if (!word) return [];
  const officialTranslationsByLang = arrayToObject(word.translations, 'lang');
  return Object.values(translations)
    .filter(isNonNullable)
    .filter((e) => !isEmptyTranslation(e))
    .map((customTranslation) => ({
      lang: customTranslation.lang,
      translation: customTranslation.translation.trim(),
      advancedTranslation: customTranslation.advancedTranslation
        ? trimAdvancedTranslations(customTranslation.advancedTranslation)
        : null,
    }))
    .filter((e) => !isEmptyTranslation(e))
    .filter((customTranslation) => {
      const officialTrans = officialTranslationsByLang[customTranslation.lang];
      if (!officialTrans) return true;
      return !areTranslationsEqual(customTranslation, officialTrans);
    });
};
const getTranslations = ({ translations }: WordInfo): TranslationObjDTO[] => {
  return Object.values(translations)
    .filter(isNonNullable)
    .filter((e) => !isEmptyTranslation(e));
};
const trimAdvancedTranslations = (translations: AdvancedTranslationDTO[]): AdvancedTranslationDTO[] | null => {
  const arr = translations
    .map(
      (t): AdvancedTranslationDTO => ({
        schema: t.schema?.trim(),
        attrs: t.attrs,
        translation: t.translation.trim(),
        examples: t.examples ? trimExamples(t.examples) : undefined,
      }),
    )
    .filter(isNonEmptyAdvancedTranslation);
  if (arr.length === 0) return null;
  return arr;
};
const isNonEmptyAdvancedTranslation = (translation: AdvancedTranslationDTO) =>
  !!translation.translation ||
  !!translation.attrs ||
  !!translation.schema ||
  (!!translation.examples && translation.examples.length > 0);

const trimExamples = (examples: WordUsageExampleDTO[]): WordUsageExampleDTO[] | undefined => {
  const arr = examples
    .map(
      (e): WordUsageExampleDTO => ({
        text: e.text.trim(),
        translation: e.translation?.trim(),
      }),
    )
    .filter(isNonEmptyExample);
  if (arr.length === 0) return undefined;
  return arr;
};
const isNonEmptyExample = (example: WordUsageExampleDTO) => !!example.text || !!example.translation;

const isEmptyTranslation = (translation: TranslationObjDTO) =>
  translation.translation.trim() === '' &&
  (!translation.advancedTranslation || translation.advancedTranslation.length === 0);

const convertLessonUpdates = (
  rootParentLessonId: number | null,
  newData: LessonInfo[],
  initialData: LessonInfo[],
): LessonUpdateActionDTO[] => {
  const initialDataTree = buildTree(initialData, rootParentLessonId);
  const newDataTree = buildTree(newData, rootParentLessonId);
  function mapWord(word: WordInfo, isNew: boolean): LessonUpdateActionDTO | null {
    if (word.word) {
      return {
        type: 'existing-word',
        isNewRecord: isNew,
        wordId: word.word.id,
        customTranslations: getCustomTranslations(word),
      };
    }
    return {
      type: 'new-word',
      wordType: 'phrase',
      value: word.wordValue,
      displayType: word.wordDisplayType === DEFAULT_WORD_DISPLAY_TYPE ? null : word.wordDisplayType,
      translations: getTranslations(word),
      official: !word.word && word.makeOfficial,
    };
  }

  function mapQuiz(quiz: QuizInfo): LessonUpdateActionDTO {
    if (quiz.id) {
      return {
        type: 'update-quiz',
        quizId: quiz.id,
        title: quiz.title,
        description: quiz.description || null,
        // priority: quiz.priority,
        isHidden: quiz.isHidden,
        mode: quiz.mode,
        questions: quiz.questions.map((q, idx) => {
          if (q.type === 'existing' && q.questionId) {
            return {
              type: 'existing',
              questionId: q.questionId,
              order: idx,
              points: q.points,
            };
          }
          if (q.type === 'update' && q.questionId) {
            return {
              type: 'update',
              questionId: q.questionId,
              order: idx,
              points: q.points,
              content: q.content,
              title: q.title,
              isOfficial: q.isOfficial,
            };
          }
          return {
            type: 'new',
            order: idx,
            points: q.points,
            title: q.title,
            content: q.content!,
            isOfficial: q.isOfficial,
          };
        }),
      };
    }
    return {
      type: 'new-quiz',
      title: quiz.title,
      description: quiz.description || null,
      // priority: quiz.priority,
      isHidden: quiz.isHidden,
      mode: quiz.mode,
      questions: quiz.questions.map((q, idx) => ({
        type: 'new' as const,
        order: idx,
        points: q.points,
        title: q.title,
        content: q.content!,
        isOfficial: q.isOfficial,
      })),
    };
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
          ...info.children.filter(isQuiz).map((quiz) => mapQuiz(quiz)),
        ]),
      };
    }

    const initialWords = initialInfo.children.filter(isKnownWordInfo);
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
            if (child.word && initialWordIds.has(child.word.id)) {
              return getCustomTranslations(child).length > 0;
            }
            return true;
          })
          .map((word) => mapWord(word, true)),
        ...info.children.filter(isQuiz).map((quiz) => mapQuiz(quiz)),
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

  // Handle quiz deletion
  const initialQuizIds = new Set(
    Object.values(initialDataTree)
      .filter(isNonNullable)
      .flatMap((lesson) => lesson.children.filter(isQuiz).map((q) => q.id))
      .filter(isNonNullable),
  );

  const newQuizIds = new Set(
    Object.values(newDataTree)
      .filter(isNonNullable)
      .flatMap((lesson) => lesson.children.filter(isQuiz).map((q) => q.id))
      .filter(isNonNullable),
  );

  const removedQuizIds = [...initialQuizIds].filter((id) => !newQuizIds.has(id));

  for (const removedQuizId of removedQuizIds) {
    actions.push({
      type: 'delete-quiz',
      quizId: removedQuizId,
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

const isLesson = <T extends LessonItem>(info: T | LessonInfo<T>): info is LessonInfo<T> => info.type === 'lesson';

const isWord = (info: LessonItem | LessonInfo<LessonItem>): info is WordInfo => info.type === 'word';

const isQuiz = (info: LessonItem | LessonInfo<LessonItem>): info is QuizInfo => info.type === 'quiz';

const isKnownWordInfo = (
  info: LessonItem | LessonInfo<LessonItem>,
): info is WordInfo & { word: WordWithTranslationDTO } => info.type === 'word' && !!info.word;

const buildTree = <T extends WordInfo | QuizInfo>(data: LessonInfo<T>[], rootParentId: number | null) => {
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
        lesson.children.filter((child): child is LessonInfo<T> => child.type === 'lesson'),
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
