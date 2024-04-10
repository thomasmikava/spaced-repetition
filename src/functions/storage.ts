import type { PostHistoryRecordsReqDTO } from '../api/controllers/history/history.schema';
import type { AnyReviewHistory, TestReviewHistory } from './reviews';

export const getDbRecord = (key: string, record: AnyReviewHistory): PostHistoryRecordsReqDTO[number] => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { savedInDb, ...rest } = record as TestReviewHistory;
  return {
    key,
    ...rest,
    lastS: rest.lastS ?? null,
    lastHasFailed: 'lastHasFailed' in record ? !!record.lastHasFailed : null,
  };
};

export const getUpdatableItemsFromStorage = (): PostHistoryRecordsReqDTO => {
  try {
    const storageValue = localStorage.getItem('__UPDATED_ITEMS');
    if (storageValue) {
      return JSON.parse(storageValue);
    } else return [];
  } catch (e) {
    return [];
  }
};

export function addUpdatedItemsInStorage(updatedItems: PostHistoryRecordsReqDTO) {
  let array = getUpdatableItemsFromStorage();
  array = array.filter((item) => !updatedItems.some((updatedItem) => updatedItem.key === item.key));
  array.push(...updatedItems);
  localStorage.setItem('__UPDATED_ITEMS', JSON.stringify(array));
}

export function removeSuccessfullySavedItemsFromStorage(successfullySavedKeys: string[]) {
  const updatedItems = getUpdatableItemsFromStorage();
  const newItems = updatedItems.filter((item) => !successfullySavedKeys.includes(item.key));
  localStorage.setItem('__UPDATED_ITEMS', JSON.stringify(newItems));
}
