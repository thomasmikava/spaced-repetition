/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { screen } from '@testing-library/react';
import {
  within as extendedWithin,
  screen as extendedScreen,
  enhanceQueries,
  // @ts-ignore
} from 'query-extensions';
import type { BoundFunctions, Queries, queries } from '@testing-library/dom';

export interface SelectorQueries {
  getBySelector<T extends HTMLElement = HTMLElement>(selector: string): T;
  getAllBySelector<T extends HTMLElement = HTMLElement>(selector: string): [T, ...T[]];
  queryBySelector<T extends HTMLElement = HTMLElement>(selector: string): T | null;
  queryAllBySelector<T extends HTMLElement = HTMLElement>(selector: string): T[];
  findBySelector<T extends HTMLElement = HTMLElement>(selector: string): Promise<T>;
  findAllBySelector<T extends HTMLElement = HTMLElement>(selector: string): Promise<[T, ...T[]]>;
}

type AllBoundFunctions = BoundFunctions<typeof queries> & SelectorQueries;
type WithPrefix<Key extends PropertyKey, prefix extends string> = Key extends `${prefix}${string}` ? Key : never;
type RemovePrefix<Key extends string, prefix extends string> = Key extends `${prefix}${infer Rest}` ? Rest : never;
type Filter = Uncapitalize<RemovePrefix<WithPrefix<keyof AllBoundFunctions, 'getBy'>, 'getBy'>>;

export interface TestingQueryParams<T extends HTMLElement = HTMLElement, F extends Filter = Filter> {
  filter: F;
  params: Parameters<AllBoundFunctions[`getBy${Capitalize<F>}`]>;
  _element?: T;
}

// Custom query types
export interface CustomQueryParams<T extends HTMLElement = HTMLElement> {
  filter: 'custom';
  params: [CustomQueryFunction<T>];
  _element?: T;
}

export type CustomQueryFunction<T extends HTMLElement = HTMLElement> = {
  queryAll: (container: HTMLElement) => T[];
  getMultipleError?: (container: Element | null) => string;
  getMissingError?: (container: Element | null) => string;
};

// Extend the existing types to support custom queries
export type ExtendedTestingQueryParams<T extends HTMLElement = HTMLElement, F extends Filter = Filter> =
  | TestingQueryParams<T, F>
  | CustomQueryParams<T>;

export type GetFn = {
  <F extends Filter, T extends HTMLElement = HTMLElement>(args: {
    filter: F;
    params: Parameters<AllBoundFunctions[`getBy${Capitalize<F>}`]>;
    _element?: T;
  }): T;
  <T extends HTMLElement = HTMLElement>(args: CustomQueryParams<T>): T;
};

export type GetAllFn = {
  <F extends Filter, T extends HTMLElement = HTMLElement>(args: {
    filter: F;
    params: Parameters<AllBoundFunctions[`getAllBy${Capitalize<F>}`]>;
    _element?: T;
  }): [T, ...T[]];
  <T extends HTMLElement = HTMLElement>(args: CustomQueryParams<T>): [T, ...T[]];
};

export type QueryFn = {
  <F extends Filter, T extends HTMLElement = HTMLElement>(args: {
    filter: F;
    params: Parameters<AllBoundFunctions[`queryBy${Capitalize<F>}`]>;
    _element?: T;
  }): T | null;
  <T extends HTMLElement = HTMLElement>(args: CustomQueryParams<T>): T | null;
};

export type QueryAllFn = {
  <F extends Filter, T extends HTMLElement = HTMLElement>(args: {
    filter: F;
    params: Parameters<AllBoundFunctions[`queryAllBy${Capitalize<F>}`]>;
    _element?: T;
  }): T[];
  <T extends HTMLElement = HTMLElement>(args: CustomQueryParams<T>): T[];
};

export type FindFn = {
  <F extends Filter, T extends HTMLElement = HTMLElement>(args: {
    filter: F;
    params: Parameters<AllBoundFunctions[`findBy${Capitalize<F>}`]>;
    _element?: T;
  }): Promise<T>;
  <T extends HTMLElement = HTMLElement>(args: CustomQueryParams<T>): Promise<T>;
};

export type FindAllFn = {
  <F extends Filter, T extends HTMLElement = HTMLElement>(args: {
    filter: F;
    params: Parameters<AllBoundFunctions[`findAllBy${Capitalize<F>}`]>;
    _element?: T;
  }): Promise<[T, ...T[]]>;
  <T extends HTMLElement = HTMLElement>(args: CustomQueryParams<T>): Promise<[T, ...T[]]>;
};

export interface QueryFns {
  get: GetFn;
  getAll: GetAllFn;
  query: QueryFn;
  queryAll: QueryAllFn;
  find: FindFn;
  findAll: FindAllFn;
}

export type ExtendedTypes = QueryFns & SelectorQueries;

export type ExtendedWithin = <QueriesToBind extends Queries = typeof queries, T extends QueriesToBind = QueriesToBind>(
  element: HTMLElement,
  queriesToBind?: T,
) => BoundFunctions<T> & ExtendedTypes;

type EnhanceQueries = <T>(queries: T) => T & ExtendedTypes;

const extendedEnhanceQueries = <T extends { container: HTMLElement }>(queries: T): T & ExtendedTypes => {
  const withA = (extendedWithin as ExtendedWithin)(queries.container);
  return enhanceQueries({ ...withA, ...queries });
};

export const typedEnhanceQueries = extendedEnhanceQueries as EnhanceQueries;

type TestingQuery = {
  [F in Filter]: <T extends HTMLElement = HTMLElement>(
    ...params: TestingQueryParams<T, F>['params']
  ) => TestingQueryParams<T, F>;
};

export const createTestingQuery: TestingQuery = new Proxy({} as never, {
  get<F extends Filter>(_target: any, prop: F) {
    if (prop in _target) return _target[prop];
    const fn = (...params: TestingQueryParams<HTMLElement, F>['params']) => ({
      filter: prop,
      params,
    });
    _target[prop] = fn;
    return fn;
  },
});

// ============= CUSTOM QUERY HELPERS =============

// Custom query types

/**
 * Creates a custom query that can be used with all query variants (get, query, find, getAll, queryAll, findAll)
 *
 * @param queryAll - Function that returns all matching elements
 * @param options - Optional error messages
 * @returns A CustomQueryParams object that can be used with screen/within methods
 *
 * @example
 * const myCustomQuery = createCustomQuery(
 *   (container) => Array.from(container.querySelectorAll('[data-custom]')),
 *   { name: 'custom element' }
 * );
 * screen.get(myCustomQuery);
 * within(element).query(myCustomQuery);
 */
function fromQueryAll<T extends HTMLElement = HTMLElement>(
  queryAll: (container: HTMLElement) => T[],
  options?: {
    name?: string;
    getMultipleError?: (container: Element | null) => string;
    getMissingError?: (container: Element | null) => string;
  },
): CustomQueryParams<T> {
  const name = options?.name || 'element';
  return {
    filter: 'custom',
    params: [
      {
        queryAll,
        getMultipleError: options?.getMultipleError || (() => `Found multiple ${name}s`),
        getMissingError: options?.getMissingError || (() => `Unable to find ${name}`),
      },
    ],
  };
}

/**
 * Creates a custom query builder with parameters
 *
 * @param builder - Function that takes parameters and returns a custom query
 * @returns A function that creates a CustomQueryParams with the given parameters
 *
 * @example
 * const byDataStatus = createCustomQueryBuilder((status: string, text?: string) =>
 *   createCustomQuery((container) => {
 *     const elements = Array.from(container.querySelectorAll(`[data-status="${status}"]`));
 *     if (text) {
 *       return elements.filter(el => el.textContent?.includes(text));
 *     }
 *     return elements;
 *   }, { name: `element with status ${status}` })
 * );
 *
 * screen.get(byDataStatus('active', 'Hello'));
 */
function createCustomQueryBuilder<TParams extends any[], T extends HTMLElement = HTMLElement>(
  builder: (...params: TParams) => CustomQueryParams<T>,
): (...params: TParams) => CustomQueryParams<T> {
  return (...params: TParams) => builder(...params);
}

/**
 * Creates a custom query that transforms elements after finding them
 *
 * @param baseQuery - The base query function
 * @param transform - Function to transform each found element
 * @param options - Optional configuration
 * @returns A CustomQueryParams that applies the transformation
 *
 * @example
 * const questionCard = createTransformQuery(
 *   (container) => Array.from(container.querySelectorAll('[data-question-header]')),
 *   (element) => element.closest('[data-question-card]') as HTMLElement,
 *   { name: 'question card', filterNull: true }
 * );
 */
function createTransformQuery<TBase extends HTMLElement = HTMLElement, TResult extends HTMLElement = HTMLElement>(
  baseQuery: (container: HTMLElement) => TBase[],
  transform: (element: TBase) => TResult | TResult[] | null,
  options?: {
    name?: string;
    filterNull?: boolean;
    getMultipleError?: (container: Element | null) => string;
    getMissingError?: (container: Element | null) => string;
  },
): CustomQueryParams<TResult> {
  const name = options?.name || 'element';
  return {
    filter: 'custom',
    params: [
      {
        queryAll: (container: HTMLElement) => {
          const baseElements = baseQuery(container);
          const transformed = baseElements.map(transform);
          if (options?.filterNull) {
            return transformed.flat().filter((el): el is TResult => el !== null);
          }
          return transformed.flat() as TResult[];
        },
        getMultipleError: options?.getMultipleError || (() => `Found multiple ${name}s`),
        getMissingError: options?.getMissingError || (() => `Unable to find ${name}`),
      },
    ],
  };
}

/**
 * Combines multiple queries with AND logic
 *
 * @param queries - Array of query functions to combine
 * @param options - Optional configuration
 * @returns A CustomQueryParams that matches elements satisfying all queries
 *
 * @example
 * const activeButton = combineQueries(
 *   [(c) => Array.from(c.querySelectorAll('button')),
 *    (c) => Array.from(c.querySelectorAll('[data-active="true"]'))],
 *   { name: 'active button' }
 * );
 */
function combineQueries<T extends HTMLElement = HTMLElement>(
  queries: Array<(container: HTMLElement) => HTMLElement[]>,
  options?: {
    name?: string;
    getMultipleError?: (container: Element | null) => string;
    getMissingError?: (container: Element | null) => string;
  },
): CustomQueryParams<T> {
  const name = options?.name || 'element';
  return {
    filter: 'custom',
    params: [
      {
        queryAll: (container: HTMLElement) => {
          if (queries.length === 0) return [];

          // Get results from first query
          let results = new Set(queries[0](container));

          // Intersect with results from remaining queries
          for (let i = 1; i < queries.length; i++) {
            const queryResults = new Set(queries[i](container));
            results = new Set([...results].filter((x) => queryResults.has(x)));
          }

          return Array.from(results) as T[];
        },
        getMultipleError: options?.getMultipleError || (() => `Found multiple ${name}s`),
        getMissingError: options?.getMissingError || (() => `Unable to find ${name}`),
      },
    ],
  };
}

/**
 * Helper to create a query that finds elements and optionally filters by text content
 *
 * @example
 * const statusWithText = createSelectorWithTextQuery(
 *   (status: string) => `[data-status="${status}"]`,
 *   { name: 'status element' }
 * );
 *
 * screen.get(statusWithText('active', 'Hello'));
 */
function withTextFilter(
  selectorBuilder: (primaryParam: string) => string,
  options?: {
    name?: string;
    textMatcher?: 'exact' | 'partial' | 'regex';
  },
) {
  return createCustomQueryBuilder((primaryParam: string, text?: string | RegExp) => {
    const selector = selectorBuilder(primaryParam);
    const name = options?.name || 'element';

    return fromQueryAll<HTMLElement>(
      (container) => {
        const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));

        if (!text) return elements;

        return elements.filter((el) => {
          const content = el.textContent || '';
          if (text instanceof RegExp) {
            return text.test(content);
          }
          if (options?.textMatcher === 'exact') {
            return content.trim() === text;
          }
          // Default to partial match
          return content.includes(text);
        });
      },
      { name: text ? `${name} containing "${text}"` : name },
    );
  });
}

export const createSelector = {
  from: fromQueryAll,
  transform: createTransformQuery,
  combine: combineQueries,
  withText: withTextFilter,
};

import { buildQueries, waitFor } from '@testing-library/dom';

// Helper to handle custom queries
const handleCustomQuery = (queries: any, api: string, args: CustomQueryParams<any>): unknown => {
  const customFn = args.params[0];

  if (api === 'get' || api === 'getAll' || api === 'query' || api === 'queryAll') {
    const [queryByCustom, getAllByCustom, getByCustom] = buildQueries(
      customFn.queryAll,
      customFn.getMultipleError || (() => 'Found multiple elements'),
      customFn.getMissingError || (() => 'Unable to find element'),
    );

    const fns = {
      get: getByCustom,
      getAll: getAllByCustom,
      query: queryByCustom,
      queryAll: customFn.queryAll,
    };

    return fns[api](queries.container || document.body);
  }

  if (api === 'find' || api === 'findAll') {
    // For async queries
    return waitFor(() => {
      const syncApi = api === 'find' ? 'get' : 'getAll';
      return handleCustomQuery(queries, syncApi, args);
    });
  }
};

// Wrap the original functions to intercept custom queries
const wrapQueryFns = (queries: any) => {
  const originalGet = queries.get;
  const originalGetAll = queries.getAll;
  const originalQuery = queries.query;
  const originalQueryAll = queries.queryAll;
  const originalFind = queries.find;
  const originalFindAll = queries.findAll;

  return {
    ...queries,
    get: (args: any) => {
      if (args.filter === 'custom') {
        return handleCustomQuery(queries, 'get', args);
      }
      return originalGet(args);
    },
    getAll: (args: any) => {
      if (args.filter === 'custom') {
        return handleCustomQuery(queries, 'getAll', args);
      }
      return originalGetAll(args);
    },
    query: (args: any) => {
      if (args.filter === 'custom') {
        return handleCustomQuery(queries, 'query', args);
      }
      return originalQuery(args);
    },
    queryAll: (args: any) => {
      if (args.filter === 'custom') {
        return handleCustomQuery(queries, 'queryAll', args);
      }
      return originalQueryAll(args);
    },
    find: (args: any) => {
      if (args.filter === 'custom') {
        return handleCustomQuery(queries, 'find', args);
      }
      return originalFind(args);
    },
    findAll: (args: any) => {
      if (args.filter === 'custom') {
        return handleCustomQuery(queries, 'findAll', args);
      }
      return originalFindAll(args);
    },
  };
};

// Export wrapped versions
export const typedExtendedScreen = wrapQueryFns(extendedScreen) as typeof screen & ExtendedTypes;
export const typedExtendedWithin = ((element: HTMLElement, ...rest: any[]) => {
  const queries = (extendedWithin as ExtendedWithin)(element, ...rest);
  return wrapQueryFns(queries);
}) as ExtendedWithin;
