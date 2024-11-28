import { Link } from 'react-router-dom';
import appCssModule from '../../App.module.css';
import type { WordStatistics } from '../../api/controllers/words/words.hooks';

export const BoxWithPercentage = ({
  link,
  title,
  stats,
}: {
  link: string;
  title: string;
  stats: WordStatistics | undefined;
}) => {
  return (
    <Link to={link} className={appCssModule.courseCard}>
      {stats && stats.totalWords > 0 && (
        <span className={appCssModule.statsContainer}>
          <span
            className={appCssModule.statsKnownWords}
            style={{ width: `${(stats.totalViewedWords / stats.totalWords) * 100}%` }}
          />
          <span
            className={appCssModule.statsReviewWords}
            style={{
              width: `${(stats.dueReviewWords / stats.totalWords) * 100}%`,
              left: `${Math.max(0, (stats.totalViewedWords - stats.dueReviewWords) / stats.totalWords) * 100}%`,
            }}
          />
        </span>
      )}
      <div>{title}</div>
    </Link>
  );
};
