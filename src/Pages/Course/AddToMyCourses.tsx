import type { FC } from 'react';
import cssModule from '../../App.module.css';
import { useAddToMyCourses } from '../../api/controllers/courses/courses.query';

export const AddToMyCoursesButton: FC<{ courseId: number }> = ({ courseId }) => {
  const { mutate } = useAddToMyCourses();
  const handleAddToMyCourses = () => {
    mutate({ courseId });
  };

  return (
    <div className={cssModule.buttonsContainer}>
      <button onClick={handleAddToMyCourses}>Start this course</button>
    </div>
  );
};
