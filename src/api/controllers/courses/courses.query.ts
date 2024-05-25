import { useMemo } from 'react';
import { queryClient, useMutation, useQuery } from '../../../utils/queries';
import { courseController } from './courses.controller';
import type { GetMyCoursesResDTO } from './courses.schema';

const prefixes = {
  getOneMinified: 'course:getMinified',
  getOne: 'course:getOneX',
};

export const CourseQueryKeys = {
  getOne: (id: number) => [prefixes.getOne, `course:getOne-${id}`],
  getMyMainCourses: () => ['course:getMyMainCourses'],
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
      return queryClient.ensureQueryData({ queryKey: CourseQueryKeys.getMyMainCourses() });
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
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: CourseQueryKeys.getOne(args.courseId) }),
        queryClient.invalidateQueries({ queryKey: [`lesson:getCourseLessons${args.courseId}`] }), // TODO: export from lessons.query
        queryClient.invalidateQueries({ queryKey: [`word:getCourseWords${args.courseId}`] }), // TODO: export from words.query
      ]);
    },
  });
};
