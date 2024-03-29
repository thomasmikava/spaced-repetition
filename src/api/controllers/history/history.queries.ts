import { useMutation, useQuery } from '../../../utils/queries';
import { historyController } from './history.controller';

export const useHistoryRecords = (avoid: boolean) => {
  return useQuery({
    queryFn: () => historyController.getMany(),
    queryKey: ['history:getMany'],
    enabled: !avoid,
  });
};

export const useHistoryPushChange = () => {
  return useMutation({
    mutationFn: historyController.postRecords,
    mutationKey: ['document:postRecords'],
    // onSuccess: (data, args) => {
    //   //
    // },
  });
};
