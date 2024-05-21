import { useMemo } from 'react';
import { queryClient, useMutation, useQuery } from '../../../utils/queries';
import { courseController } from './courses.controller';
import type { GetMyCoursesResDTO } from './courses.schema';

const prefixes = {
  getOneMinified: 'course:getMinified',
  getOne: 'course:getOneX',
};

const CourseQueryKeys = {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CourseQueryKeys.getMyMainCourses() });
    },
  });
};

export const useUpdateCourse = () => {
  return useMutation({
    mutationFn: courseController.updateCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CourseQueryKeys.getMyMainCourses() });
    },
  });
};

export const useDeleteCourse = () => {
  return useMutation({
    mutationFn: courseController.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CourseQueryKeys.getMyMainCourses() });
    },
  });
};

export const useCourseById = (id: number) => {
  const previousDataset = useMemo(
    () =>
      queryClient
        .getQueriesData<GetMyCoursesResDTO>({ queryKey: CourseQueryKeys.getMyMainCourses() })
        ?.find(([, data]) => data?.some((course) => course.id === id)),
    [id],
  );

  return useQuery({
    queryFn: () => courseController.getById({ id }),
    queryKey: CourseQueryKeys.getOne(id),
    initialData: () => previousDataset && previousDataset[1]?.find((course) => course.id === id),
    initialDataUpdatedAt: () => previousDataset && queryClient.getQueryState(previousDataset[0])?.dataUpdatedAt,
  });
};
