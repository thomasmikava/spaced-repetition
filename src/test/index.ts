import { render, renderHook, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { createTestingQuery, typedEnhanceQueries, typedExtendedScreen, typedExtendedWithin } from './query-extension';
import userEvent from '@testing-library/user-event';
export type { TestingQueryParams } from './query-extension';

export {
  createTestingQuery,
  typedEnhanceQueries as enhanceQueries,
  render,
  renderHook,
  typedExtendedScreen as screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  typedExtendedWithin as within,
};
