import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CoursePage from './CoursePage.tsx';
import LessonPage from './LessonPage.tsx';
import ReviewPage from './ReviewPage.tsx';
import AlgorithmReviewPage from './AlgorithmReviewPage.tsx';
import NewWordsPage from './NewWords.tsx';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './utils/queries.ts';
import { AuthProvider } from './contexts/Auth.tsx';
import { paths } from './routes/paths.ts';
import { PageGuard } from './routes/PageGuard.tsx';
import LoginPage from './Pages/Login/index.tsx';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <PageGuard authPage={<App />} publicPage={<LoginPage />} />,
    },
    {
      path: paths.app.course.routePath,
      element: (
        <PageGuard onlyAuth>
          <CoursePage />
        </PageGuard>
      ),
    },
    {
      path: paths.app.lesson.routePath,
      element: (
        <PageGuard onlyAuth>
          <LessonPage />
        </PageGuard>
      ),
    },
    {
      path: '/review',
      element: (
        <PageGuard onlyAuth>
          <ReviewPage />
        </PageGuard>
      ),
    },
    {
      path: '/review-algo',
      element: (
        <PageGuard onlyAuth>
          <AlgorithmReviewPage />
        </PageGuard>
      ),
    },
    {
      path: '/new-words',
      element: (
        <PageGuard onlyAuth>
          <NewWordsPage />
        </PageGuard>
      ),
    },
  ],
  {
    basename: '/spaced-repetition',
  },
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
