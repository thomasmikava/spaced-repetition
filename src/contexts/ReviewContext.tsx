import type { FC, ReactElement } from 'react';
import { createContext, useEffect, useRef, useState } from 'react';
import { useInterval } from '../utils/hooks';
import { PreviousReviews } from '../functions/previous-reviews';
import type { GetManyRecordsResDTO, PostHistoryRecordsReqDTO } from '../api/controllers/history/history.schema';
import { useHistoryPushChange, useHistoryRecords } from '../api/controllers/history/history.queries';
import { useAuth } from './Auth';
import {
  getDbRecord,
  getUpdatableItemsFromStorage,
  removeSuccessfullySavedItemsFromStorage,
} from '../functions/storage';
import type { AnyReviewHistory } from '../functions/reviews';
import { removeKeys } from '../utils/object';

interface ReviewContextProps {}
const ReviewContext = createContext<ReviewContextProps | undefined>(undefined);

export const ReviewContextProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const { isSignedIn } = useAuth();
  const { mutateAsync } = useHistoryPushChange();
  const { data } = useHistoryRecords(!isSignedIn);
  const [updated, setUpdated] = useState(false);
  const updatingCountRef = useRef(0);

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
      update(updatedItems.map(getDbRecord));
      console.log('updatedItems', updatedItems);
    }
  }, 5 * 1000);

  useEffect(() => {
    if (!data || updated) return;
    loadInDb(data, getUpdatableItemsFromStorage());
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
  const updatedRecord: AnyReviewHistory[] = [];
  for (const key in reviews) {
    const value = reviews[key];
    if (!value || value.savedInDb) continue;
    updatedRecord.push(value);
  }
  return updatedRecord;
}

function updateStorage(updatedItems: AnyReviewHistory[]) {
  const cls = new PreviousReviews();
  const reviews = cls.getLastReviewHistory();
  const successfullySavedKeys: string[] = [];
  for (const oldRecord of updatedItems) {
    const key = oldRecord.uniqueKey;
    const value = reviews[key];
    if (!value || value.savedInDb) continue;
    if (areSame(value, oldRecord)) {
      // make sure that user hasn't practiced that word again
      successfullySavedKeys.push(key);
    }
  }
  cls.markAsSavedInDb(successfullySavedKeys);
  removeSuccessfullySavedItemsFromStorage(successfullySavedKeys);
}

function loadInDb(data: GetManyRecordsResDTO, notSavedData: PostHistoryRecordsReqDTO) {
  const cls = new PreviousReviews();
  cls.loadInDb(data, notSavedData, true);
}

function areSame(oldRecord: AnyReviewHistory, newRecord: AnyReviewHistory) {
  function normalize(record: AnyReviewHistory) {
    return removeKeys(getDbRecord(record), 'id');
  }
  return JSON.stringify(normalize(oldRecord)) === JSON.stringify(normalize(newRecord));
}
