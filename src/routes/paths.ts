import { addPrefix, withParams } from 'link-builders';

export const paths = addPrefix('/')({
  loginPage: '/',
  registration: '/reg',
  app: addPrefix('/')({
    main: '/',
    course: addPrefix('course/')({
      add: '/new',
      edit: withParams((id: number) => `/${id}/edit`, '/:courseId/edit'),
      page: withParams((id: number) => `/${id}`, '/:courseId'),
    }),
    lesson: {
      page: withParams(
        (lessonId: number, courseId: number) => `/course/${courseId}/lesson/${lessonId}`,
        '/course/:courseId/lesson/:lessonId',
      ),
      edit: withParams(
        (lessonId: number, courseId: number) => `/course/${courseId}/lesson/${lessonId}/edit`,
        '/course/:courseId/lesson/:lessonId/edit',
      ),
    },
  }),
});
