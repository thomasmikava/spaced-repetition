/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { isAxiosError } from 'axios';
import axios from 'axios';
import type { GeneralError } from '../errors';

interface RequestOptions {
  headers?: AxiosRequestConfig<any>['headers'];
}

export interface IRequest {
  get: <T = unknown>(url: string, data?: unknown, options?: RequestOptions) => Promise<T>;
  post: <T = unknown>(url: string, data?: unknown, options?: RequestOptions) => Promise<T>;
  put: <T = unknown>(url: string, data?: unknown, options?: RequestOptions) => Promise<T>;
  delete: <T = unknown>(url: string, data?: unknown, options?: RequestOptions) => Promise<T>;
  patch: <T = unknown>(url: string, data?: unknown, options?: RequestOptions) => Promise<T>;
}

export class Request implements IRequest {
  constructor(readonly axios: AxiosInstance) {}

  get = <T = unknown>(url: string, data?: unknown, options: RequestOptions = {}): Promise<T> => {
    const { fullUrl } = parseUrl(url, data, 'queryParam');
    const axiosConfig = this.getConfig(options);
    return normalizeError(this.axios.get(fullUrl, axiosConfig));
  };

  delete = <T = unknown>(url: string, data?: unknown, options: RequestOptions = {}): Promise<T> => {
    const { fullUrl } = parseUrl(url, data, 'queryParam');
    const axiosConfig = this.getConfig(options);
    return normalizeError(this.axios.delete(fullUrl, axiosConfig));
  };

  post = <T = unknown>(url: string, data?: unknown, options: RequestOptions = {}): Promise<T> => {
    const { fullUrl, restData } = parseUrl(url, data);
    const axiosConfig = this.getConfig(options);
    return normalizeError(this.axios.post(fullUrl, restData, axiosConfig));
  };

  put = <T = unknown>(url: string, data?: unknown, options: RequestOptions = {}): Promise<T> => {
    const { fullUrl, restData } = parseUrl(url, data);
    const axiosConfig = this.getConfig(options);
    return normalizeError(this.axios.put(fullUrl, restData, axiosConfig));
  };

  patch = <T = unknown>(url: string, data?: unknown, options: RequestOptions = {}): Promise<T> => {
    const { fullUrl, restData } = parseUrl(url, data);
    const axiosConfig = this.getConfig(options);
    return normalizeError(this.axios.patch(fullUrl, restData, axiosConfig));
  };

  private getConfig(options: RequestOptions = {}): AxiosRequestConfig<any> {
    const { ...restOptions } = options;
    return restOptions;
  }
}

const normalizeError = <T>(promise: Promise<AxiosResponse<T>>): Promise<T> => {
  return promise
    .then((response) => response.data)
    .catch((error) => {
      console.log(JSON.stringify(error), error);
      if (isAxiosError(error)) {
        if (error.message === 'Network Error') {
          throw {
            status: null,
            networkError: true,
          };
        }
        const standardError: GeneralError = {
          status: error.response && !isNaN(error.response.status) ? +error.response.status : 0,
          data: error.response?.data,
        };
        throw standardError;
      }
      throw error;
    });
};

const duplicateFormData = (data: FormData) => {
  // TODO: implement
  return data;
};

const parseUrl = (url: string, data: any, strategy = '') => {
  const parsed = parseUrlHelper(url, data);
  if (strategy === 'queryParam') {
    return {
      fullUrl: axios.getUri({ url: parsed.fullUrl, params: parsed.restData }), // g(parsed.fullUrl, parsed.restData),
      restData: null,
    };
  } else {
    return parsed;
  }
};

const parseUrlHelper = (url: string, data: any) => {
  if (data === null || typeof data !== 'object') return { fullUrl: url, restData: data };

  // example: api/unis/:uni_id/ => api/unis/7/
  const keysToDelete: string[] = [];
  const fullUrl = url.replace(/:([^/\s]+)/g, (str, match) => {
    if (data[match] !== undefined) {
      const val = data[match];
      keysToDelete.push(match);
      return val;
    }
    return str;
  });

  let newData = data;

  if (keysToDelete.length > 0) {
    if (data instanceof FormData) {
      newData = duplicateFormData(data);
      for (const key of keysToDelete) {
        newData.delete(key);
      }
    } else {
      newData = { ...data };
      for (const key of keysToDelete) {
        delete newData[key];
      }
    }
  }

  return { fullUrl, restData: newData };
};
