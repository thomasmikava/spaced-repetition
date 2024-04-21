import { addPrefix, withParams } from 'link-builders';

export const paths = addPrefix('/')({
  loginPage: '/',
  registration: '/reg',
  app: addPrefix('/')({
    main: '/',
    course: withParams((id: number) => `/course/${id}`, '/course/:courseId'),
    lesson: withParams(
      (lessonId: number, courseId: number) => `/course/${courseId}/lesson/${lessonId}`,
      '/course/:courseId/lesson/:lessonId',
    ),
  }),
});
