/* eslint-disable @typescript-eslint/no-explicit-any */

import type { DefaultBodyType, HttpHandler, HttpResponseResolver, JsonBodyType, PathParams, StrictRequest } from 'msw';
import { http, HttpResponse } from 'msw';

type HttpMethod = 'head' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options';

type NativeCallback<TResponse extends JsonBodyType> = HttpResponseResolver<PathParams, DefaultBodyType, TResponse>;

type Callback<TResponse extends JsonBodyType> = (info: {
  request: StrictRequest<DefaultBodyType>;
  params: PathParams;
}) => Promise<TResponse> | TResponse;

/**
 * Helper class for creating type-safe mock endpoints
 */
export class MockEndpoint<TResponse extends JsonBodyType> {
  constructor(
    private readonly method: HttpMethod,
    private readonly url: string,
  ) {}

  /**
   * Creates a handler that returns a successful JSON response
   * @param data - Response data or function that returns response data
   */
  successResponse(data: TResponse | Callback<TResponse>): HttpHandler {
    return http[this.method](this.url, async (...args) => {
      const responseData: TResponse = typeof data === 'function' ? await data(...args) : data;
      return HttpResponse.json(responseData ?? null);
    });
  }

  /**
   * Creates a typed response payload
   * @param data - Response data
   * @returns The response data, typed as TResponse
   */
  createResponsePayload(data: TResponse): TResponse {
    return data;
  }

  // errorResponse (status, data)
  /**
   * Creates a handler that returns an error response
   * @param status - Response status code
   * @param data - Response data or function that returns response data
   */
  errorResponse(status: number, data?: JsonBodyType | Callback<JsonBodyType>): HttpHandler {
    return http[this.method](this.url, async (...args) => {
      const responseData: JsonBodyType = typeof data === 'function' ? await data(...args) : data;
      return HttpResponse.json(responseData ?? null, { status });
    });
  }

  /**
   * Creates a handler with a custom response
   * @param handlerFn - Custom response handler function
   */
  anyResponse(handlerFn: NativeCallback<any>): HttpHandler {
    return http[this.method](this.url, handlerFn as never);
  }
}

/**
 * Creates a typed mock endpoint
 * @param method - HTTP method
 * @param url - Endpoint URL
 * @returns Typed mock endpoint
 */
export function createMockEndpoint<TResponse extends JsonBodyType | void>(method: HttpMethod, url: string) {
  return new MockEndpoint<TResponse extends void ? null : TResponse>(method, url);
}
