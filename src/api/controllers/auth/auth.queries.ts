import { useMutation } from '@tanstack/react-query';
import { authController } from './auth.controller';
import { createMutationSuccessAutoDestroyer, useLastMutationState } from '../../../utils/queries';

export const useAuthLogin = () => {
  return useMutation({
    mutationFn: authController.login,
    mutationKey: ['login'],
  });
};

export const useAuthLoginState = () => useLastMutationState(['login'], authController.login);
export const useAuthLoginCleaner = createMutationSuccessAutoDestroyer(['login']);

export const useAuthRenewAccessToken = () => {
  return useMutation({
    mutationFn: authController.renewAccessToken,
    mutationKey: ['renewAccessToken'],
  });
};
export const useAuthRenewAccessTokenCleaner = createMutationSuccessAutoDestroyer(['login']);

export const useAuthRevokeAccessToken = () => {
  return useMutation({
    mutationFn: authController.revokeTokens,
    mutationKey: ['revokeTokens'],
  });
};
export const useAuthRevokeAccessTokenCleaner = createMutationSuccessAutoDestroyer(['revokeTokens']);
