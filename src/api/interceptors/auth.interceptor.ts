import type { Axios } from 'axios';
import { getTokenFromStorage } from '../helpers';

export const addAuthInterceptor = (axios: Axios) => {
  axios.interceptors.request.use((config) => {
    // Skip if custom Authorization is provided
    if ('Authorization' in config.headers) return config;

    const tokens = getTokenFromStorage();
    if (!tokens) return config;

    config.headers.Authorization = `Bearer ${tokens.accessToken}`;

    return config;
  });
};
