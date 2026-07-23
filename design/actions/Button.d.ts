import * as React from 'react';
import type { IconName } from '../icon/Icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. `primary` is the signature green action. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'tinted' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** Leading glyph name. */
  iconLeft?: IconName | string;
  /** Trailing glyph name. */
  iconRight?: IconName | string;
  /** Show a spinner and disable interaction. */
  loading?: boolean;
  /** Stretch to full container width. */
  block?: boolean;
  /** Render as an anchor instead of a button. */
  href?: string;
}

/**
 * The action control. One primary green button per view carries the main move;
 * everything else is secondary / ghost / tinted. `danger` for destructive actions only.
 */
export function Button(props: ButtonProps): JSX.Element;
