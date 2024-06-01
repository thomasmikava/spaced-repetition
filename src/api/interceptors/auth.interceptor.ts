import { isAxiosError, type Axios } from 'axios';
import { destroyTokenInStorage, getTokenFromStorage } from '../helpers';

export const addAuthInterceptor = (axios: Axios) => {
  axios.interceptors.request.use((config) => {
    // Skip if custom Authorization is provided
    if ('Authorization' in config.headers) return config;

    const tokens = getTokenFromStorage();
    if (!tokens) return config;

    config.headers.Authorization = `Bearer ${tokens.accessToken}`;

    return config;
  });

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        destroyTokenInStorage();
        location.reload();
      }
      return Promise.reject(error);
    },
  );
};
