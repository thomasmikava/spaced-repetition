import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CoursePage from './Pages/Course/CoursePage.tsx';
import LessonPage from './Pages/Lesson/LessonPage.tsx';
import ReviewPage from './Pages/ReviewPage.tsx';
import AlgorithmReviewPage from './Pages/AlgorithmReviewPage.tsx';
import NewWordsPage from './Pages/NewWords.tsx';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './utils/queries.ts';
import { AuthProvider } from './contexts/Auth.tsx';
import { paths } from './routes/paths.ts';
import { PageGuard } from './routes/PageGuard.tsx';
import LoginPage from './Pages/Login/index.tsx';
import RegistrationPage from './Pages/Registration/index.tsx';
import { ReviewContextProvider } from './contexts/ReviewContext.tsx';
import HomePage from './Pages/Home/HomePage.tsx';
import AddCoursePage from './Pages/Course/AddCoursePage.tsx';
import ConfigProvider from 'antd/es/config-provider/index';
import theme from 'antd/es/theme/index';
import EditCoursePage from './Pages/Course/EditCoursePage.tsx';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <PageGuard authPage={<HomePage />} publicPage={<LoginPage />} />,
    },
    {
      path: paths.registration.routePath,
      element: (
        <PageGuard onlyPublic>
          <RegistrationPage />
        </PageGuard>
      ),
    },
    {
      path: paths.app.course.add.routePath,
      element: (
        <PageGuard onlyAuth>
          <AddCoursePage />
        </PageGuard>
      ),
    },
    {
      path: paths.app.course.edit.routePath,
      element: (
        <PageGuard onlyAuth>
          <EditCoursePage />
        </PageGuard>
      ),
    },
    {
      path: paths.app.course.page.routePath,
      element: (
        <PageGuard onlyAuth>
          <CoursePage />
        </PageGuard>
      ),
    },
    {
      path: paths.app.lesson.page.routePath,
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
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ReviewContextProvider>
            <RouterProvider router={router} />
          </ReviewContextProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
