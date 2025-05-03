import type { FC } from 'react';
import { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import cssModule from './App.module.css';
import { useWordIds } from './api/controllers/words/words.query';
import { PreviousReviews } from './functions/previous-reviews';
import { uniquelize } from './utils/array';
import { paths } from './routes/paths';
import { useAuth } from './contexts/Auth';
import { ReviewBlock } from './api/controllers/history/history.schema';

interface Props {
  courseId?: number;
  lessonId?: number;
}

const ReviewButtons: FC<Props> = ({ courseId, lessonId }) => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const isPremium = !!userData?.premiumUntil;

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
    if (!wordIds || !wordIds.length) return { dueReview: 0, uniqueCards: 0, dueReviewAI: 0, uniqueCardsAI: 0 };
    const prevReviews = new PreviousReviews();
    let totalVariantReviews = 0;
    let totalWordsReview = 0;
    let totalVariantReviewsAI = 0;
    let totalWordsReviewAI = 0;
    for (const wordId of wordIds) {
      const count = prevReviews.getDueCardsCount(ReviewBlock.standard, wordId);
      if (count > 0) {
        totalWordsReview++;
        totalVariantReviews += count;
      }
      const aiCount = prevReviews.getDueCardsCount(ReviewBlock.AI, wordId);
      if (aiCount > 0) {
        totalWordsReviewAI++;
        totalVariantReviewsAI += aiCount;
      }
    }
    return {
      dueReview: totalVariantReviews,
      uniqueCards: totalWordsReview,
      dueReviewAI: totalVariantReviewsAI,
      uniqueCardsAI: totalWordsReviewAI,
    };
  }, [wordIds]);

  const handleReview = (endless: boolean, onlyNewWords: boolean) => {
    navigate(paths.app.review({ courseId, lessonId, endless, onlyNewWords }));
  };
  const handleAIReview = (endless: boolean, onlyNewWords: boolean) => {
    navigate(paths.app.reviewAI({ courseId, lessonId, endless, onlyNewWords }));
  };
  const handleHardWords = () => {
    navigate(paths.app.difficultWords({ courseId, lessonId }));
  };

  return (
    <div className={cssModule.buttonsContainer}>
      <button onClick={() => handleReview(false, false)}>
        Train{isLoading ? '...' : ''}
        {!isLoading && dueReview > 0 && <>: {`${uniqueCards}`}</>}
      </button>
      <button onClick={() => handleReview(false, true)}>Learn New words</button>
      {isPremium && (
        <button onClick={() => handleAIReview(false, false)}>
          AI test{/* {!isLoading && dueReviewAI > 0 && <>: {`${uniqueCardsAI}`}</>} */}
        </button>
      )}
      {isPremium && <button onClick={() => handleHardWords()}>Hard words</button>}
    </div>
  );
};

export default memo(ReviewButtons);
