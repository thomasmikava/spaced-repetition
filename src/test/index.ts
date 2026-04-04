import { render, renderHook, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { by, screen, within } from 'testing-library-queries';
import userEvent from '@testing-library/user-event';
export type { ByParams as TestingQueryParams } from 'testing-library-queries';

export {
  by as by,
  render,
  renderHook,
  screen as screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within as within,
};
