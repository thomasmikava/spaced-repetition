import type { FC, ReactNode } from 'react';
import { createContext, memo, useContext } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useInterval, useLatestCallback } from '../utils/hooks';
import { destroyTokenInStorage, getTokenInfo, saveTokenInStorage } from '../api/helpers';
import { useAuthLoginState, useAuthRenewAccessToken, useAuthRevokeAccessToken } from '../api/controllers/auth.queries';

export interface AuthData {
  signOut: () => void;
  isSignedIn: boolean;
  isExpired: boolean;
}

const AuthContext = createContext<AuthData | null>(null);

export { AuthContext };

export const useAuth = (): AuthData => {
  const data = useContext(AuthContext);
  if (!data) {
    throw new Error('Auth context provider not used');
  }
  return data;
};

export const AuthProvider: FC<{ children?: ReactNode }> = memo(({ children }) => {
  const { data: loginResponse } = useAuthLoginState();
  const { data: renewTokenSuccessResponse, mutate: renewToken } = useAuthRenewAccessToken();
  const { mutate: revokeTokens } = useAuthRevokeAccessToken();

  const [{ tokens, expirationDate, isExpired }, setState] = useState(getTokenInfo);
  const [isAboutToExpire, setIsAboutToExpire] = useState(() => willExpireSoon(expirationDate));

  const tokenFetchingResponse = renewTokenSuccessResponse || loginResponse;

  useEffect(() => {
    if (tokenFetchingResponse) {
      saveTokenInStorage(tokenFetchingResponse);
      setState(getTokenInfo());
    }
  }, [tokenFetchingResponse]);

  useInterval(() => {
    if (expirationDate) setIsAboutToExpire(willExpireSoon(expirationDate));
  }, 1000);

  const shouldRenewToken = isExpired || isAboutToExpire;

  const signOutInternal = useLatestCallback((isInvalidToken: boolean) => {
    destroyTokenInStorage();
    setState(getTokenInfo());
    if (!isInvalidToken && tokens) {
      revokeTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    }
  });

  useEffect(() => {
    if (tokens && shouldRenewToken) {
      renewToken(
        { refreshToken: tokens.refreshToken },
        {
          onSuccess: () => setIsAboutToExpire(false),
          onError: () => signOutInternal(true),
        },
      );
    }
  }, [tokens, shouldRenewToken, renewToken, signOutInternal]);

  const signOut = useLatestCallback(() => signOutInternal(false));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).signOut = signOut;

  const isSignedIn = !!tokens;

  const authData: AuthData = useMemo(
    () => ({
      isExpired,
      isSignedIn,
      signOut,
    }),
    [isExpired, isSignedIn, signOut],
  );

  return <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>;
});
AuthProvider.displayName = 'AuthProvider';

const willExpireSoon = (expirationDate: Date | null) => {
  if (!expirationDate) return null;
  const offset = expirationDate.getTime() - Date.now();
  const TOKEN_RENEWAL_OFFSET = 60 * 1000;
  return offset <= TOKEN_RENEWAL_OFFSET;
};
