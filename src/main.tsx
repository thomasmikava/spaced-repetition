import { QueryClientProvider } from '@tanstack/react-query';
import ConfigProvider from 'antd/es/config-provider/index';
import theme from 'antd/es/theme/index';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/Auth.tsx';
import { ReviewContextProvider } from './contexts/ReviewContext.tsx';
import './index.css';
import { AlgorithmReviewPageLoader } from './Pages/Review/AlgorithmReviewPage.tsx';
import AddCoursePage from './Pages/Course/AddCoursePage.tsx';
import CoursePage from './Pages/Course/CoursePage.tsx';
import { EditContentPage } from './Pages/Course/EditContent/EditContentPage.tsx';
import EditCoursePage from './Pages/Course/EditCoursePage.tsx';
import HomePage from './Pages/Home/HomePage.tsx';
import LessonPage from './Pages/Lesson/LessonPage.tsx';
import LoginPage from './Pages/Login/index.tsx';
import NewWordsPage from './Pages/NewWords.tsx';
import RegistrationPage from './Pages/Registration/index.tsx';
import { ReviewPageLoader } from './Pages/Review/ReviewPage.tsx';
import TestingThingsPage from './Pages/TestingThings.tsx';
import { PageGuard } from './routes/PageGuard.tsx';
import { paths } from './routes/paths.ts';
import { queryClient } from './utils/queries.ts';
import ExploreCoursesPage from './Pages/Course/ExploreCoursesPage.tsx';

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
      path: paths.app.course.editContent.routePath,
      element: (
        <PageGuard onlyAuth>
          <EditContentPage />
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
      path: paths.app.explore.routePath,
      element: (
        <PageGuard onlyAuth>
          <ExploreCoursesPage />
        </PageGuard>
      ),
    },
    {
      path: paths.app.review.routePath,
      element: (
        <PageGuard onlyAuth>
          <ReviewPageLoader />
        </PageGuard>
      ),
    },
    {
      path: '/review-algo',
      element: (
        <PageGuard onlyAuth>
          <AlgorithmReviewPageLoader />
        </PageGuard>
      ),
    },
    {
      path: '/testing-things',
      element: (
        <PageGuard onlyAuth>
          <TestingThingsPage />
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
