import axios from 'axios';
import { addAuthInterceptor } from './interceptors/auth.interceptor';
import { Request } from './request';

console.log(import.meta.env.VITE_API_URL);
const mainAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const apiRequest = new Request(mainAxios);

addAuthInterceptor(apiRequest.axios);
