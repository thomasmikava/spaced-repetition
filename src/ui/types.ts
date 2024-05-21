import type { ForwardRefExoticComponent } from 'react';

export type ExtractRef<T> = T extends ForwardRefExoticComponent<React.RefAttributes<infer R>> ? R : never;
