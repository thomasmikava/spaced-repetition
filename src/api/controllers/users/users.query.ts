import { queryClient, useMutation, useQuery } from '../../../utils/queries';
import { userController } from './users.controller';

export const UserQueryKeys = {
  getPreferences: () => [`user:preferences`],
};

export const useUserPreferences = () => {
  return useQuery({
    queryFn: () => userController.getPreferences(),
    queryKey: UserQueryKeys.getPreferences(),
  });
};

export const useReplaceUserPreferences = () => {
  return useMutation({
    mutationFn: userController.replacePreferences,
    onSuccess: (): Promise<unknown> => {
      return queryClient.invalidateQueries({ queryKey: UserQueryKeys.getPreferences() });
    },
  });
};
