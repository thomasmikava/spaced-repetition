import type { FC } from 'react';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import cssModule from './App.module.css';

interface Props {
  courseId?: number;
  lessonId?: number;
}

const ReviewButtons: FC<Props> = ({ courseId, lessonId }) => {
  const navigate = useNavigate();

  // const [reviewer] = useState(() => new Reviewer(courseId, lessonId));

  // const { dueReview, uniqueCards } = reviewer.getDueCardsCount(); // TODO: get it

  const dueReview = 0,
    uniqueCards = 0;

  const handleReview = (endless: boolean) => {
    const params = [];
    if (courseId) params.push(`courseId=${courseId}`);
    if (lessonId) params.push(`lessonId=${lessonId}`);
    if (endless) params.push('mode=endless');
    navigate(params.length ? `/review?${params.join('&')}` : '/review');
  };

  return (
    <div className={cssModule.buttonsContainer}>
      <button onClick={() => handleReview(false)}>
        Review
        {dueReview > 0 && (
          <>
            : {`${dueReview} `}
            <sup>{`(${uniqueCards})`}</sup>
          </>
        )}
      </button>
      <button onClick={() => handleReview(true)}>Endless review</button>
    </div>
  );
};

export default memo(ReviewButtons);
