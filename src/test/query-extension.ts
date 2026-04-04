/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { screen as originalScreen, within as originalWithin } from '@testing-library/dom';
import { buildQueries, waitFor } from '@testing-library/dom';
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

export interface ByParams<T extends HTMLElement = HTMLElement, F extends Filter = Filter> {
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
  | ByParams<T, F>
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

export type ExtendedScreenMethods = QueryFns & SelectorQueries;

export type ExtendedWithin = <QueriesToBind extends Queries = typeof queries, T extends QueriesToBind = QueriesToBind>(
  element: HTMLElement,
  queriesToBind?: T,
) => BoundFunctions<T> & ExtendedScreenMethods;

type EnhanceQueries = <T>(queries: T) => T & ExtendedScreenMethods;

// ============= SELECTOR QUERIES IMPLEMENTATION =============

// The queryAllBy function signature that buildQueries expects
const queryAllBySelector = (container: HTMLElement, selector: string): HTMLElement[] => {
  return Array.from(container.querySelectorAll(selector));
};

// Error functions with correct signatures
const getMultipleSelectorError = (_container: Element | null, selector: string): string => {
  return `Found multiple elements with selector: ${selector}`;
};

const getMissingSelectorError = (_container: Element | null, selector: string): string => {
  return `Unable to find element with selector: ${selector}`;
};

const [queryBySelector, getAllBySelector, getBySelector, findAllBySelector, findBySelector] = buildQueries(
  queryAllBySelector,
  getMultipleSelectorError,
  getMissingSelectorError,
);

const createSelectorQueries = (container: HTMLElement): SelectorQueries => ({
  getBySelector: (selector: string) => getBySelector(container, selector) as any,
  getAllBySelector: (selector: string) => getAllBySelector(container, selector) as any,
  queryBySelector: (selector: string) => queryBySelector(container, selector) as any,
  queryAllBySelector: (selector: string) => queryAllBySelector(container, selector) as any,
  findBySelector: (selector: string) => findBySelector(container, selector) as any,
  findAllBySelector: (selector: string) => findAllBySelector(container, selector) as any,
});

// ============= ENHANCE QUERIES IMPLEMENTATION =============

const createQueryHandlers = (getContainer: () => HTMLElement, getBoundQueries: () => any) => {
  const get: GetFn = (args: any) => {
    const { filter, params } = args;
    const container = getContainer();

    if (filter === 'selector') {
      const selectorQueries = createSelectorQueries(container);
      return selectorQueries.getBySelector(...(params as [string]));
    }
    if (filter === 'custom') {
      return handleCustomQuery({ container }, 'get', args);
    }
    const methodName = `getBy${filter.charAt(0).toUpperCase()}${filter.slice(1)}`;
    return getBoundQueries()[methodName](...params);
  };

  const getAll: GetAllFn = (args: any) => {
    const { filter, params } = args;
    const container = getContainer();

    if (filter === 'selector') {
      const selectorQueries = createSelectorQueries(container);
      return selectorQueries.getAllBySelector(...(params as [string]));
    }
    if (filter === 'custom') {
      return handleCustomQuery({ container }, 'getAll', args);
    }
    const methodName = `getAllBy${filter.charAt(0).toUpperCase()}${filter.slice(1)}`;
    return getBoundQueries()[methodName](...params);
  };

  const query: QueryFn = (args: any) => {
    const { filter, params } = args;
    const container = getContainer();

    if (filter === 'selector') {
      const selectorQueries = createSelectorQueries(container);
      return selectorQueries.queryBySelector(...(params as [string]));
    }
    if (filter === 'custom') {
      return handleCustomQuery({ container }, 'query', args);
    }
    const methodName = `queryBy${filter.charAt(0).toUpperCase()}${filter.slice(1)}`;
    return getBoundQueries()[methodName](...params);
  };

  const queryAll: QueryAllFn = (args: any) => {
    const { filter, params } = args;
    const container = getContainer();

    if (filter === 'selector') {
      const selectorQueries = createSelectorQueries(container);
      return selectorQueries.queryAllBySelector(...(params as [string]));
    }
    if (filter === 'custom') {
      return handleCustomQuery({ container }, 'queryAll', args);
    }
    const methodName = `queryAllBy${filter.charAt(0).toUpperCase()}${filter.slice(1)}`;
    return getBoundQueries()[methodName](...params);
  };

  const find: FindFn = (args: any) => {
    const { filter, params } = args;
    const container = getContainer();

    if (filter === 'selector') {
      const selectorQueries = createSelectorQueries(container);
      return selectorQueries.findBySelector(...(params as [string]));
    }
    if (filter === 'custom') {
      return handleCustomQuery({ container }, 'find', args);
    }
    const methodName = `findBy${filter.charAt(0).toUpperCase()}${filter.slice(1)}`;
    return getBoundQueries()[methodName](...params);
  };

  const findAll: FindAllFn = (args: any) => {
    const { filter, params } = args;
    const container = getContainer();

    if (filter === 'selector') {
      const selectorQueries = createSelectorQueries(container);
      return selectorQueries.findAllBySelector(...(params as [string]));
    }
    if (filter === 'custom') {
      return handleCustomQuery({ container }, 'findAll', args);
    }
    const methodName = `findAllBy${filter.charAt(0).toUpperCase()}${filter.slice(1)}`;
    return getBoundQueries()[methodName](...params);
  };

  return { get, getAll, query, queryAll, find, findAll };
};

const createEnhancedQueries = (boundQueries: any, container: HTMLElement): ExtendedScreenMethods => {
  const selectorQueries = createSelectorQueries(container);
  const queryHandlers = createQueryHandlers(
    () => container,
    () => boundQueries,
  );

  return {
    ...selectorQueries,
    ...queryHandlers,
  };
};

const enhanceQueries = <T extends { container: HTMLElement }>(queries: T): T & ExtendedScreenMethods => {
  const enhanced = createEnhancedQueries(queries, queries.container);
  return { ...queries, ...enhanced };
};

const extendedEnhanceQueries = <T extends { container: HTMLElement }>(queries: T): T & ExtendedScreenMethods => {
  return enhanceQueries(queries);
};

export const typedEnhanceQueries = extendedEnhanceQueries as EnhanceQueries;

type TestingQuery = {
  [F in Filter]: <T extends HTMLElement = HTMLElement>(...params: ByParams<T, F>['params']) => ByParams<T, F>;
};

export const by: TestingQuery = new Proxy({} as never, {
  get<F extends Filter>(_target: any, prop: F) {
    if (prop in _target) return _target[prop];
    const fn = (...params: ByParams<HTMLElement, F>['params']) => ({
      filter: prop,
      params,
    });
    _target[prop] = fn;
    return fn;
  },
});

// ============= CUSTOM QUERY HELPERS =============

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
function createCustomQueryBuilder<TParams extends readonly any[], T extends HTMLElement = HTMLElement>(
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
function withTextFilter<T extends readonly any[]>(
  selectorBuilder: (...primaryParam: T) => string,
  options?: {
    name?: string;
    textMatcher?: 'exact' | 'partial' | 'regex';
  },
) {
  return createCustomQueryBuilder((text: string | RegExp, ...primaryParam: T) => {
    const selector = selectorBuilder(...primaryParam);
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

export const buildSelector = {
  from: fromQueryAll,
  transform: createTransformQuery,
  combine: combineQueries,
  withText: withTextFilter,
};

// Helper to handle custom queries
const handleCustomQuery = (queries: any, api: string, args: CustomQueryParams<any>): unknown => {
  const customFn = args.params[0];

  if (api === 'get' || api === 'getAll' || api === 'query' || api === 'queryAll') {
    // Create a queryAllBy function with the correct signature for buildQueries
    const queryAllBy = (container: HTMLElement) => customFn.queryAll(container);

    const getMultipleError = (_container: Element | null) =>
      customFn.getMultipleError?.(_container) || 'Found multiple elements';

    const getMissingError = (_container: Element | null) =>
      customFn.getMissingError?.(_container) || 'Unable to find element';

    const [queryBy, getAllBy, getBy] = buildQueries(queryAllBy, getMultipleError, getMissingError);

    const container = queries.container || document.body;

    const fns = {
      get: () => getBy(container),
      getAll: () => getAllBy(container),
      query: () => queryBy(container),
      queryAll: () => queryAllBy(container),
    };

    return fns[api]();
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

// Create extended screen with all query methods
const createExtendedScreen = () => {
  const selectorQueries = {
    getBySelector: (selector: string) => getBySelector(document.body, selector),
    getAllBySelector: (selector: string) => getAllBySelector(document.body, selector),
    queryBySelector: (selector: string) => queryBySelector(document.body, selector),
    queryAllBySelector: (selector: string) => queryAllBySelector(document.body, selector),
    findBySelector: (selector: string) => findBySelector(document.body, selector),
    findAllBySelector: (selector: string) => findAllBySelector(document.body, selector),
  };

  const queryHandlers = createQueryHandlers(
    () => document.body,
    () => originalScreen,
  );

  return {
    ...originalScreen,
    ...selectorQueries,
    ...queryHandlers,
  };
};

// Export wrapped versions
export const screen = createExtendedScreen() as typeof originalScreen & ExtendedScreenMethods;

export const within = ((element: HTMLElement, queriesToBind?: any) => {
  const boundQueries = originalWithin(element, queriesToBind);
  const withContainer = { ...boundQueries, container: element };
  const enhanced = enhanceQueries(withContainer);
  return wrapQueryFns(enhanced);
}) as ExtendedWithin;
