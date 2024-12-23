import type { FC } from 'react';
import { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import cssModule from './App.module.css';
import { useWordIds } from './api/controllers/words/words.query';
import { PreviousReviews } from './functions/previous-reviews';
import { uniquelize } from './utils/array';
import { paths } from './routes/paths';

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
        : uniquelize(
            wordsInfo
              .map((courseInfo) => courseInfo.lessons.map((l) => l.words.filter((e) => !e.h).map((w) => w.id)))
              .flat(2),
          ),
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

  const handleReview = (endless: boolean, onlyNewWords: boolean) => {
    navigate(paths.app.review({ courseId, lessonId, endless, onlyNewWords }));
  };

  return (
    <div className={cssModule.buttonsContainer}>
      <button onClick={() => handleReview(false, false)}>
        Train{isLoading ? '...' : ''}
        {!isLoading && dueReview > 0 && <>: {`${uniqueCards}`}</>}
      </button>
      <button onClick={() => handleReview(false, true)}>Learn New words</button>
    </div>
  );
};

export default memo(ReviewButtons);
