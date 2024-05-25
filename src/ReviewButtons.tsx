import type { FC } from 'react';
import { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import cssModule from './App.module.css';
import { useWordIds } from './api/controllers/words/words.query';
import { PreviousReviews } from './functions/previous-reviews';
import { uniquelize } from './utils/array';

interface Props {
  courseId?: number;
  lessonId?: number;
}

const ReviewButtons: FC<Props> = ({ courseId, lessonId }) => {
  const navigate = useNavigate();

  const { data: wordsInfo, isLoading } = useWordIds({ courseId, lessonId });

  const wordIds = useMemo(
    () =>
      !wordsInfo
        ? undefined
        : uniquelize(wordsInfo.map((courseInfo) => courseInfo.lessons.map((l) => l.words.map((w) => w.id))).flat(2)),
    [wordsInfo],
  );

  const { dueReview, uniqueCards } = useMemo(() => {
    if (!wordIds || !wordIds.length) return { dueReview: 0, uniqueCards: 0 };
    const prevReviews = new PreviousReviews();
    let totalVariantReviews = 0;
    let totalWordsReview = 0;
    for (const wordId of wordIds) {
      const count = prevReviews.getDueCardsCount(wordId);
      if (count > 0) {
        totalWordsReview++;
        totalVariantReviews += count;
      }
    }
    return { dueReview: totalVariantReviews, uniqueCards: totalWordsReview };
  }, [wordIds]);

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
        Review{isLoading ? '...' : ''}
        {!isLoading && dueReview > 0 && (
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
