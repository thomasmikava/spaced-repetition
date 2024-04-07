import { Subscription } from 'simple-subscriptions';
import type { AllCardsReviewHistory } from './reviews';

type Data = AllCardsReviewHistory;

export const globalHistory = new Subscription<(a: { updater: number | null; data: Data }) => void, Data>();
globalHistory.subscribe((value) => {
  globalHistory.setMetaData(value.data);
});
