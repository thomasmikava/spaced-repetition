import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CoursePage from './CoursePage.tsx';
import LessonPage from './LessonPage.tsx';
import ReviewPage from './ReviewPage.tsx';

const router = createBrowserRouter([
  {
    path: '/spaced-repetition/',
    element: <App />,
  },
  {
    path: '/spaced-repetition/course/:courseId',
    element: <CoursePage />,
  },
  {
    path: '/spaced-repetition/course/:courseId/lesson/:lessonId',
    element: <LessonPage />,
  },
  {
    path: '/spaced-repetition/review',
    element: <ReviewPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
