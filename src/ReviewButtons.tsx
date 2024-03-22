import { useNavigate } from 'react-router-dom';
import cssModule from './App.module.css';
import type { FC } from 'react';
import { memo, useState } from 'react';
import { Reviewer } from './functions/reviewer';

interface Props {
  courseId?: number;
  lessonId?: number;
}

const ReviewButtons: FC<Props> = ({ courseId, lessonId }) => {
  const navigate = useNavigate();

  const [reviewer] = useState(() => new Reviewer(courseId, lessonId));

  const dueCardsCount = reviewer.getDueCardsCount();

  const handleReview = (endless: boolean) => {
    const params = [];
    if (courseId) params.push(`courseId=${courseId}`);
    if (lessonId) params.push(`lessonId=${lessonId}`);
    if (endless) params.push('mode=endless');
    navigate(params.length ? `/review?${params.join('&')}` : '/review');
  };

  return (
    <div className={cssModule.buttonsContainer}>
      <button onClick={() => handleReview(false)} disabled={dueCardsCount <= 0}>
        Review {dueCardsCount > 0 ? `(${dueCardsCount})` : ''}
      </button>
      <button onClick={() => handleReview(true)}>Endless review</button>
    </div>
  );
};

export default memo(ReviewButtons);
