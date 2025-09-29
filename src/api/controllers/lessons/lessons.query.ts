import { filterLessons } from '../../../Pages/Lesson/useFilteredLessons';
import { queryClient, useMutation, useQuery } from '../../../utils/queries';
import { invalidateQuizzes } from '../quizzes/quiz.query';
import { lessonController } from './lessons.controller';
import type { GetLessonsReqDTO, GetLessonsResDTO } from './lessons.schema';

export const LessonQueryKeys = {
  getCourseLessons: (query: GetLessonsReqDTO) => [
    `lesson:getCourseLessons${query.courseId}`,
    { courseId: query.courseId },
    query,
  ],
};

export const useCourseLessons = (query: GetLessonsReqDTO) => {
  return useQuery({
    queryFn: () => lessonController.getCourseLessons(query),
    queryKey: LessonQueryKeys.getCourseLessons(query),
  });
};

export const getCourseLessonsOffline = (courseId: number, lessonId: number) => {
  const results =
    queryClient.getQueryState<GetLessonsResDTO>(
      LessonQueryKeys.getCourseLessons({ courseId, lessonId, returnAllChildrenLessons: true }),
    ) ||
    queryClient.getQueryState<GetLessonsResDTO>(
      LessonQueryKeys.getCourseLessons({ courseId, returnAllChildrenLessons: true }),
    );
  if (!results || !results.data) return undefined;
  return filterLessons(results.data, courseId, lessonId, true, true);
};

export const useCreateNewLesson = () => {
  return useMutation({
    mutationFn: lessonController.createLesson,
    mutationKey: ['document:create'],
    onSuccess: async (data, args) => {
      const lessonId = data.id;
      const courseId = args.courseId;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [`lesson:getCourseLessons${args.courseId}`], exact: false }),
        invalidateQuizzes({ lessonId, courseId }),
      ]);
    },
  });
};

export const useDeleteLesson = () => {
  return useMutation({
    mutationFn: lessonController.deleteLesson,
    onSuccess: async (_, args) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [`lesson:getCourseLessons${args.courseId}`], exact: false }),
        invalidateQuizzes({ lessonId: args.lessonId, courseId: args.courseId }),
      ]);
    },
  });
};
