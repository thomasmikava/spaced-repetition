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
      editContent: withParams((id: number, lessonId?: number) => {
        const queryParam = lessonId ? `?lessonId=${lessonId}` : '';
        return `/${id}/edit-content${queryParam}`;
      }, '/:courseId/edit-content'),
    }),
    explore: '/explore',
    search: '/search',
    lesson: {
      page: withParams(
        (lessonId: number, courseId: number) => `/course/${courseId}/lesson/${lessonId}`,
        '/course/:courseId/lesson/:lessonId',
      ),
    },
    review: withParams(
      ({
        courseId,
        lessonId,
        endless,
        onlyNewWords,
      }: {
        courseId?: number;
        lessonId?: number;
        endless: boolean;
        onlyNewWords: boolean;
      }) => {
        const params = [];
        if (courseId) params.push(`courseId=${courseId}`);
        if (lessonId) params.push(`lessonId=${lessonId}`);
        if (endless) params.push('mode=endless');
        else if (onlyNewWords) params.push('mode=only-new');
        return params.length ? `/review?${params.join('&')}` : '/review';
      },
      '/review',
    ),
    reviewAI: withParams(
      ({
        courseId,
        lessonId,
        endless,
        onlyNewWords,
      }: {
        courseId?: number;
        lessonId?: number;
        endless: boolean;
        onlyNewWords: boolean;
      }) => {
        const params = [];
        if (courseId) params.push(`courseId=${courseId}`);
        if (lessonId) params.push(`lessonId=${lessonId}`);
        if (endless) params.push('mode=endless');
        else if (onlyNewWords) params.push('mode=only-new');
        return params.length ? `/ai-review?${params.join('&')}` : '/ai-review';
      },
      '/ai-review',
    ),
  }),
  admin: addPrefix('/admin')({
    scripts: '/scripts',
  }),
  user: addPrefix('/user')({
    preferences: '/preferences',
  }),
});
