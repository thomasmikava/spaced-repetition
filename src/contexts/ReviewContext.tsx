import type { FC, ReactElement } from 'react';
import { createContext, useEffect, useRef, useState } from 'react';
import { useInterval } from '../utils/hooks';
import { PreviousReviews } from '../functions/previous-reviews';
import type { PostHistoryRecordsReqDTO } from '../api/controllers/history/history.schema';
import type { TestReviewHistory } from '../functions/reviews';
import { useHistoryPushChange, useHistoryRecords } from '../api/controllers/history/history.queries';
import { useAuth } from './Auth';

interface ReviewContextProps {}
const ReviewContext = createContext<ReviewContextProps | undefined>(undefined);

export const ReviewContextProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const { isSignedIn } = useAuth();
  const { data } = useHistoryRecords(!isSignedIn);
  const [updated, setUpdated] = useState(false);
  const updatingCountRef = useRef(0);

  const { mutateAsync } = useHistoryPushChange();
  useInterval(() => {
    const updatedItems = getUpdatedItems();
    function update(items: PostHistoryRecordsReqDTO) {
      updatingCountRef.current++;
      return mutateAsync(items)
        .then(() => {
          updatingCountRef.current--;
          updateStorage(updatedItems);
        })
        .catch((e) => {
          console.log(JSON.stringify(e), JSON.parse(JSON.stringify(e)), isNetworkError(e));
          if (!isNetworkError(e) && items.length > 1) {
            const firstHalf = items.slice(0, Math.floor(items.length / 2));
            const secondHalf = items.slice(Math.floor(items.length / 2));
            update(firstHalf);
            update(secondHalf);
          }
          updatingCountRef.current--;
        });
    }
    if (updatedItems.length > 0 && !updatingCountRef.current) {
      update(updatedItems);
      console.log('updatedItems', updatedItems);
    }
  }, 5 * 1000);

  useEffect(() => {
    if (!data || updated) return;
    loadInDb(data);
    setUpdated(true);
  }, [data, updated]);

  if (!updated && isSignedIn) return <div className='body'>Loading...</div>;
  return <ReviewContext.Provider value={{}}>{children}</ReviewContext.Provider>;
};

const isNetworkError = (e: unknown): boolean => {
  return typeof e === 'object' && !!e && 'networkError' in e && !!e.networkError;
};

function getUpdatedItems() {
  const reviews = new PreviousReviews().getLastReviewHistory();
  const updatedRecord: PostHistoryRecordsReqDTO = [];
  for (const key in reviews) {
    const value = reviews[key];
    if (!value || value.savedInDb) continue;
    updatedRecord.push(getDbRecord(key, value as TestReviewHistory));
  }
  return updatedRecord;
}

const getDbRecord = (key: string, record: TestReviewHistory): PostHistoryRecordsReqDTO[number] => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { savedInDb, ...rest } = record as TestReviewHistory;
  return {
    key,
    ...rest,
    lastS: rest.lastS ?? null,
    lastHasFailed: 'lastHasFailed' in record ? !!record.lastHasFailed : null,
  };
};

function updateStorage(updatedItems: PostHistoryRecordsReqDTO) {
  const cls = new PreviousReviews();
  const reviews = cls.getLastReviewHistory();
  const successfullySavedKeys: string[] = [];
  for (const oldRecord of updatedItems) {
    const key = oldRecord.key;
    const value = reviews[key];
    if (!value || value.savedInDb) continue;
    const currentRecord = getDbRecord(key, value as TestReviewHistory);
    const areSame = JSON.stringify(currentRecord) === JSON.stringify(oldRecord);
    if (areSame) {
      successfullySavedKeys.push(key);
    }
  }
  cls.markAsSavedInDb(successfullySavedKeys);
}

function loadInDb(data: PostHistoryRecordsReqDTO) {
  const cls = new PreviousReviews();
  cls.loadInDb(data, true);
}
