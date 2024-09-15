import type { ReactNode } from 'react';
import styles from './styles.module.css';

type Option<T> = { value: T; label: ReactNode };

interface ChipsSwitchProps<T, AllowClear extends boolean> {
  options: Option<T>[];
  value: T | null;
  onChange: (value: AllowClear extends true ? T | null : T) => void;
  allowClear?: AllowClear;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const ChipsSwitch = <T extends unknown, AllowClear extends boolean>({
  onChange,
  options,
  value,
  allowClear,
}: ChipsSwitchProps<T, AllowClear>) => {
  const handleClick = (option: Option<T>, isSelected: boolean) => {
    if (isSelected && allowClear) {
      (onChange as (value: T | null) => void)(null);
    } else {
      onChange(option.value);
    }
  };
  return (
    <div className={styles.chipsContainer}>
      {options.map((option, i) => {
        const isSelected = option.value === value;
        const className = `${styles.chip} ${isSelected ? styles.selected : ''}`;
        return (
          <button type='button' key={i} className={className} onClick={() => handleClick(option, isSelected)}>
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
