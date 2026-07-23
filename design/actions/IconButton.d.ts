import * as React from 'react';
import type { IconName } from '../icon/Icon';

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Glyph to render. */
  icon: IconName | string;
  /** Accessible label — required (renders as aria-label + title). */
  label: string;
  variant?: 'ghost' | 'secondary' | 'primary' | 'tinted' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** Fully round (pill) instead of the confident square radius. */
  round?: boolean;
}

/**
 * Square icon-only control for row actions, toolbars, and dismiss buttons.
 * Always pass `label` for accessibility.
 */
export function IconButton(props: IconButtonProps): JSX.Element;
