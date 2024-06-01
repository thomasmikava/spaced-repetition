import type { PostHistoryRecordsReqDTO } from '../api/controllers/history/history.schema';
import { getRecordUniqueKey, type AnyReviewHistory } from './reviews';

export const getDbRecord = (record: AnyReviewHistory): PostHistoryRecordsReqDTO[number] => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { savedInDb, uniqueKey, ...rest } = record;
  return {
    ...rest,
    lastS: rest.lastS ?? null,
    dueDate: rest.dueDate ?? null,
  };
};

const STORAGE_KEY = '__REVIEW_UPDATED_ITEMS';

export const getUpdatableItemsFromStorage = (): PostHistoryRecordsReqDTO => {
  try {
    const storageValue = localStorage.getItem(STORAGE_KEY);
    if (storageValue) {
      return JSON.parse(storageValue);
    } else return [];
  } catch (e) {
    return [];
  }
};

export function addUpdatedItemsInStorage(updatedItems: PostHistoryRecordsReqDTO) {
  let array = getUpdatableItemsFromStorage();
  array = array.filter(
    (item) => !updatedItems.some((updatedItem) => getRecordUniqueKey(updatedItem) === getRecordUniqueKey(item)),
  );
  array.push(...updatedItems);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
}

export function removeSuccessfullySavedItemsFromStorage(successfullySavedKeys: string[]) {
  const updatedItems = getUpdatableItemsFromStorage();
  const newItems = updatedItems.filter((item) => !successfullySavedKeys.includes(getRecordUniqueKey(item)));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
}
