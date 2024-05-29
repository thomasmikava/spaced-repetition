import type { FC, ReactNode } from 'react';
import { createContext, memo, useContext, useEffect, useMemo, useState } from 'react';
import {
  useAuthLoginState,
  useAuthRenewAccessToken,
  useAuthRevokeAccessToken,
} from '../api/controllers/auth/auth.queries';
import type { UserToken } from '../api/controllers/auth/auth.schema';
import { destroyTokenInStorage, getTokenInfo, saveTokenInStorage } from '../api/helpers';
import { useInterval, useLatestCallback } from '../utils/hooks';

export interface AuthData {
  signOut: () => void;
  isSignedIn: boolean;
  isExpired: boolean;
  userData: UserToken | null;
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
export const useSignInUserData = (): UserToken => {
  const data = useContext(AuthContext);
  if (!data) {
    throw new Error('Auth context provider not used');
  }
  if (!data.isSignedIn || !data.userData) {
    throw new Error('User is not signed in');
  }
  return data.userData;
};

export const AuthProvider: FC<{ children?: ReactNode }> = memo(({ children }) => {
  const { data: loginResponse } = useAuthLoginState();
  const { data: renewTokenSuccessResponse, mutate: renewToken } = useAuthRenewAccessToken();
  const { mutate: revokeTokens } = useAuthRevokeAccessToken();

  const [{ tokens, expirationDate, isExpired, decodedAccessToken }, setState] = useState(getTokenInfo);
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
      userData: decodedAccessToken,
    }),
    [isExpired, isSignedIn, decodedAccessToken, signOut],
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
