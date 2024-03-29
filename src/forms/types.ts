import type { PartialRecord } from '../utils/types';

export interface FormProps<T> {
  onSubmit: (data: T) => void;
  isLoading: boolean;
  generalErrorMessage?: string | null;
  errors?: PartialRecord<keyof T, string> | null;
  onErrorClear?: () => void;
}
