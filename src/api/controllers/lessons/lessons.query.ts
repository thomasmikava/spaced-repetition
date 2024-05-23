import { queryClient, useMutation, useQuery } from '../../../utils/queries';
import { lessonController } from './lessons.controller';
import type { GetLessonsReqDTO } from './lessons.schema';

const LessonQueryKeys = {
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

export const useCreateNewLesson = () => {
  return useMutation({
    mutationFn: lessonController.createLesson,
    mutationKey: ['document:create'],
    onSuccess: (_, args): Promise<unknown> => {
      return queryClient.invalidateQueries({ queryKey: [`lesson:getCourseLessons${args.courseId}`] });
    },
  });
};

export const useDeleteLesson = () => {
  return useMutation({
    mutationFn: lessonController.deleteLesson,
    onSuccess: (_, args): Promise<unknown> => {
      return queryClient.invalidateQueries({ queryKey: [`lesson:getCourseLessons${args.courseId}`] });
    },
  });
};
