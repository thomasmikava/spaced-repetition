import { useMemo } from 'react';
import { queryClient, useMutation, useQuery } from '../../../utils/queries';
import { courseController } from './courses.controller';
import type { ExploreCoursesReqDTO, GetMyCoursesResDTO } from './courses.schema';
import { useInfiniteQuery } from '@tanstack/react-query';
import { WordQueryKeys } from '../words/words.query';
import { invalidateQuizzes } from '../quizzes/quiz.query';

const prefixes = {
  getOneMinified: 'course:getMinified',
  getOne: 'course:getOneX',
};

export const CourseQueryKeys = {
  getOne: (id: number) => [prefixes.getOne, `course:getOne-${id}`],
  getMyMainCourses: () => ['course:getMyMainCourses'],
  searchCourses: (query: Omit<ExploreCoursesReqDTO, 'skip'>) => [`word:searchCourses`, query],
};

export const useMyMainCourses = () => {
  return useQuery({
    queryFn: courseController.getCourses,
    queryKey: CourseQueryKeys.getMyMainCourses(),
  });
};

export const useCreateNewCourse = () => {
  return useMutation({
    mutationFn: courseController.createCourse,
    onSuccess: (): Promise<unknown> => {
      return queryClient.invalidateQueries({ queryKey: CourseQueryKeys.getMyMainCourses() });
    },
  });
};

export const useAddToMyCourses = () => {
  return useMutation({
    mutationFn: courseController.addToMyCourses,
    onSuccess: (): Promise<unknown> => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: CourseQueryKeys.getMyMainCourses() }),
        queryClient.invalidateQueries({ queryKey: WordQueryKeys.getWordIds({}) }),
      ]);
    },
  });
};

export const useUpdateCourse = () => {
  return useMutation({
    mutationFn: courseController.updateCourse,
    onSuccess: (_, args): Promise<unknown> => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: CourseQueryKeys.getMyMainCourses() }),
        queryClient.invalidateQueries({ queryKey: CourseQueryKeys.getOne(args.id) }),
      ]);
    },
  });
};

export const useDeleteCourse = () => {
  return useMutation({
    mutationFn: courseController.delete,
    onSuccess: (): Promise<unknown> => {
      return queryClient.invalidateQueries({ queryKey: CourseQueryKeys.getMyMainCourses() });
    },
  });
};

export const useCourseById = (id: number) => {
  const previousDataset = useMemo(() => {
    const oldData = queryClient.getQueryState<GetMyCoursesResDTO>(CourseQueryKeys.getMyMainCourses());
    if (oldData) {
      const course = oldData.data?.find((course) => course.id === id);
      if (course) return { data: course, dataUpdatedAt: oldData.dataUpdatedAt };
    }
    return undefined;
  }, [id]);

  return useQuery({
    queryFn: () => courseController.getById({ id }),
    queryKey: CourseQueryKeys.getOne(id),
    initialData: () => previousDataset?.data,
    initialDataUpdatedAt: () => previousDataset?.dataUpdatedAt,
  });
};

export const useUpdateCourseContent = () => {
  return useMutation({
    mutationFn: courseController.updateCourseContent,
    onSuccess: (_, args): Promise<unknown> => {
      console.log('args', args);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: CourseQueryKeys.getOne(args.courseId) }),
        queryClient.invalidateQueries({ queryKey: [`lesson:getCourseLessons${args.courseId}`], exact: false }), // TODO: export from lessons.query
        queryClient.invalidateQueries({ queryKey: [`word:getCourseWords${args.courseId}`], exact: false }), // TODO: export from words.query
        queryClient.invalidateQueries({ queryKey: WordQueryKeys.getMyCoursesWords(), exact: false }),
        invalidateQuizzes({ lessonId: null, courseId: args.courseId }),
      ]);
    },
  });
};

export const useSearchCourses = (query: Omit<ExploreCoursesReqDTO, 'skip'>) => {
  return useInfiniteQuery({
    queryFn: ({ pageParam }) => courseController.explore({ ...query, skip: pageParam ?? 0 }),
    queryKey: CourseQueryKeys.searchCourses(query),
    staleTime: 1000 * 60,
    retry: false,
    enabled: query.searchValue !== '',
    initialPageParam: 0,
    getPreviousPageParam: (_firstPage, _allPages, firstPageParam) => Math.max(0, firstPageParam - query.limit),
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.isLastPage) return undefined;
      if (lastPage.courses.length < query.limit) return undefined;
      return lastPageParam + query.limit;
    },
  });
};
