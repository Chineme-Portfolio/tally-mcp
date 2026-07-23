import * as React from 'react';
import type { IconName } from '../icon/Icon';

export interface TabItem {
  value: string;
  label: string;
  icon?: IconName | string;
  /** Optional trailing count (mono). */
  count?: number;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Tab items (objects) or plain strings. */
  tabs: (TabItem | string)[];
  /** Selected tab value. */
  value: string;
  onChange?: (value: string) => void;
  /** line (underline, default) · pill (segmented control). */
  variant?: 'line' | 'pill';
}

/** Horizontal view switcher. Underline for page-level nav, pill for compact filters. */
export function Tabs(props: TabsProps): JSX.Element;
