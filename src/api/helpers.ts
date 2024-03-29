/* eslint-disable @typescript-eslint/no-explicit-any */
export const getTokenInfo = () => {
  const tokens = getTokenFromStorage();
  const decodedAccessToken = !tokens ? null : decodeToken(tokens.accessToken);

  const expirationDate = decodedAccessToken ? getTokenExpirationDate(decodedAccessToken) : null;
  const isExpired = expirationDate ? expirationDate.valueOf() < new Date().valueOf() : false;

  return { tokens, expirationDate, isExpired };
};

type TokenData = {
  accessToken: string;
  refreshToken: string;
};

const validateTokenData = (data: unknown): TokenData | null => {
  if (
    typeof data === 'object' &&
    data !== null &&
    'accessToken' in data &&
    typeof data.accessToken === 'string' &&
    'refreshToken' in data &&
    typeof data.refreshToken === 'string'
  ) {
    return data as TokenData;
  }
  return null;
};

const AUTH_STORAGE_KEY = '__auth';

export const getTokenFromStorage = (): TokenData | null => {
  const authStr = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!authStr) return null;
  try {
    const auth = JSON.parse(authStr);
    return validateTokenData(auth);
  } catch (e) {
    return null;
  }
};

export const saveTokenInStorage = (token: TokenData) => {
  const validatedToken = validateTokenData({ ...token });
  if (!validatedToken) return false;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(validatedToken));
  return true;
};

export const destroyTokenInStorage = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  return true;
};

function decodeToken(token: string) {
  try {
    if (token.split('.').length !== 3 || typeof token !== 'string') {
      return null;
    }

    const payload = token.split('.')[1];
    const padding = '='.repeat((4 - (payload.length % 4)) % 4);
    const base64 = payload.replace('-', '+').replace('_', '/') + padding;
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

function getTokenExpirationDate(decodedToken: any) {
  const expirationDate = new Date(0);
  expirationDate.setUTCSeconds(decodedToken.exp);
  return expirationDate;
}
