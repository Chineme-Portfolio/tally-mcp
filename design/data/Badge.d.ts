import * as React from 'react';
import type { IconName } from '../icon/Icon';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** soft (tinted, default) · solid (filled) · outline. */
  tone?: 'soft' | 'solid' | 'outline';
  size?: 'sm' | 'md';
  /** Leading status dot. */
  dot?: boolean;
  icon?: IconName | string;
}

/** Compact count/label pill. Soft tone by default; use solid sparingly for emphasis. */
export function Badge(props: BadgeProps): JSX.Element;
