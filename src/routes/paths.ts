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
      editContent: withParams(
        (id: number, lessonId?: number) => `/${id}/edit-content${lessonId ? `?lessonId=${lessonId}` : ''}`,
        '/:courseId/edit-content',
      ),
    }),
    lesson: {
      page: withParams(
        (lessonId: number, courseId: number) => `/course/${courseId}/lesson/${lessonId}`,
        '/course/:courseId/lesson/:lessonId',
      ),
    },
  }),
});
