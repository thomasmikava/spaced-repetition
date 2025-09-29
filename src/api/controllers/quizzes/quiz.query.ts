import { queryClient, useMutation, useQuery } from '../../../utils/queries';
import { quizController } from './quiz.controller';
import type {
  GetQuizzesReqDTO,
  GetQuizzesResDTO,
  GetQuizDetailsReqDTO,
  GetQuizDetailsResDTO,
  GetUserQuizProgressReqDTO,
  GetUserQuizProgressResDTO,
  GetCourseQuizzesReqDTO,
  GetCourseQuizzesResDTO,
} from './quiz.schema';

export const QuizQueryKeys = {
  getQuizzes: (query: GetQuizzesReqDTO | null) =>
    query ? [`quiz:getQuizzes${query.lessonId}`, `any-quiz`, { lessonId: query.lessonId }, query] : [],
  getQuizDetails: (query: GetQuizDetailsReqDTO) => [
    `quiz:getQuizDetails${query.quizId}`,
    `any-quiz`,
    { quizId: query.quizId },
    query,
  ],
  getCourseQuizzes: (query: GetCourseQuizzesReqDTO) => [
    `quiz:getCourseQuizzes${query.courseId}`,
    `any-quiz`,
    { courseId: query.courseId },
    query,
  ],
  getUserQuizProgress: (query: GetUserQuizProgressReqDTO) => [
    `quiz:getUserQuizProgress${query.quizId}`,
    `any-quiz`,
    { quizId: query.quizId },
    query,
  ],
};

export const useQuizzes = (query: GetQuizzesReqDTO | null) => {
  return useQuery({
    queryFn: () => quizController.getQuizzes(query!),
    queryKey: QuizQueryKeys.getQuizzes(query!),
    enabled: !!query,
  });
};

export const useQuizDetails = (query: GetQuizDetailsReqDTO) => {
  return useQuery({
    queryFn: () => quizController.getQuizDetails(query),
    queryKey: QuizQueryKeys.getQuizDetails(query),
  });
};

export const useCourseQuizzes = (query: GetCourseQuizzesReqDTO) => {
  return useQuery({
    queryFn: () => quizController.getCourseQuizzes(query),
    queryKey: QuizQueryKeys.getCourseQuizzes(query),
  });
};

export const useUserQuizProgress = (query: GetUserQuizProgressReqDTO) => {
  return useQuery({
    queryFn: () => quizController.getUserQuizProgress(query),
    queryKey: QuizQueryKeys.getUserQuizProgress(query),
  });
};

export const getQuizzesOffline = (lessonId: number) => {
  const results = queryClient.getQueryState<GetQuizzesResDTO>(QuizQueryKeys.getQuizzes({ lessonId }));
  return results?.data;
};

export const getQuizDetailsOffline = (quizId: number) => {
  const results = queryClient.getQueryState<GetQuizDetailsResDTO>(QuizQueryKeys.getQuizDetails({ quizId }));
  return results?.data;
};

export const getCourseQuizzesOffline = (courseId: number) => {
  const results = queryClient.getQueryState<GetCourseQuizzesResDTO>(QuizQueryKeys.getCourseQuizzes({ courseId }));
  return results?.data;
};

export const getUserQuizProgressOffline = (quizId: number) => {
  const results = queryClient.getQueryState<GetUserQuizProgressResDTO>(QuizQueryKeys.getUserQuizProgress({ quizId }));
  return results?.data;
};

export const useCreateQuiz = () => {
  return useMutation({
    mutationFn: quizController.createQuiz,
    mutationKey: ['quiz:create'],
    onSuccess: (_, args): Promise<unknown> => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: [`quiz:getQuizzes${args.lessonId}`] }),
        queryClient.invalidateQueries({ queryKey: [`quiz:getCourseQuizzes${args.courseId}`] }),
      ]);
    },
  });
};

export const useUpdateQuiz = () => {
  return useMutation({
    mutationFn: quizController.updateQuiz,
    mutationKey: ['quiz:update'],
    onSuccess: (data, args): Promise<unknown> => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: [`quiz:getQuizDetails${args.quizId}`] }),
        queryClient.invalidateQueries({ queryKey: [`quiz:getQuizzes${args.lessonId || data.lessonId}`] }),
        queryClient.invalidateQueries({ queryKey: [`quiz:getCourseQuizzes${data.courseId}`] }),
      ]);
    },
  });
};

export const useDeleteQuiz = () => {
  return useMutation({
    mutationFn: quizController.deleteQuiz,
    onSuccess: (_, args): Promise<unknown> => {
      // Get quiz data from cache to determine lessonId and courseId for invalidation
      const quizData = getQuizDetailsOffline(args.quizId);
      const invalidationPromises = [queryClient.invalidateQueries({ queryKey: [`quiz:getQuizDetails${args.quizId}`] })];

      if (quizData) {
        invalidationPromises.push(
          queryClient.invalidateQueries({ queryKey: [`quiz:getQuizzes${quizData.lessonId}`] }),
          queryClient.invalidateQueries({ queryKey: [`quiz:getCourseQuizzes${quizData.courseId}`] }),
        );
      }

      return Promise.all(invalidationPromises);
    },
  });
};

export const useStartQuizAttempt = () => {
  return useMutation({
    mutationFn: quizController.startQuizAttempt,
    mutationKey: ['quiz:startAttempt'],
    onSuccess: (data, args): Promise<unknown> => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: [`quiz:getUserQuizProgress${args.quizId}`] }),
        queryClient.invalidateQueries({ queryKey: [`quiz:getCourseQuizzes${data.courseId}`] }),
      ]);
    },
  });
};

export const useSubmitQuestionAnswer = () => {
  return useMutation({
    mutationFn: quizController.submitQuestionAnswer,
    mutationKey: ['quiz:submitAnswer'],
    onSuccess: (data): Promise<unknown> => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: [`quiz:getUserQuizProgress${data.quizAttempt.quizId}`] }),
        queryClient.invalidateQueries({ queryKey: [`quiz:getCourseQuizzes${data.quizAttempt.courseId}`] }),
      ]);
    },
  });
};

export const useFinalizeQuizAttempt = () => {
  return useMutation({
    mutationFn: quizController.finalizeQuizAttempt,
    mutationKey: ['quiz:finalizeAttempt'],
    onSuccess: (data): Promise<unknown> => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: [`quiz:getUserQuizProgress${data.quizId}`] }),
        queryClient.invalidateQueries({ queryKey: [`quiz:getCourseQuizzes${data.courseId}`] }),
      ]);
    },
  });
};

export const useResetQuizAttempt = () => {
  return useMutation({
    mutationFn: (args: { quizId: number; courseId: number; quizAttemptId: number }) =>
      quizController.resetQuizAttempt({ quizAttemptId: args.quizAttemptId }),
    mutationKey: ['quiz:resetAttempt'],
    onSuccess: (_data, variables): Promise<unknown> => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: [`quiz:getUserQuizProgress${variables.quizId}`] }),
        queryClient.invalidateQueries({ queryKey: [`quiz:getCourseQuizzes${variables.courseId}`] }),
      ]);
    },
  });
};

export const invalidateQuizzes = ({ lessonId, courseId }: { lessonId: number | null; courseId: number }) => {
  if (!lessonId) {
    return queryClient.invalidateQueries({
      predicate: (query) => query.queryKey.some((e) => typeof e === 'string' && e.startsWith('any-quiz')),
    });
  }
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: [`quiz:getQuizzes${lessonId}`], exact: false }),
    queryClient.invalidateQueries({ queryKey: [`quiz:getQuizDetails${lessonId}`], exact: false }),
    queryClient.invalidateQueries({ queryKey: [`quiz:getCourseQuizzes${courseId}`], exact: false }),
  ]);
};
