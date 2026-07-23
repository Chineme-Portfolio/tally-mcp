import * as React from 'react';
import type { IconName } from '../icon/Icon';

export interface MenuItem {
  label?: React.ReactNode;
  icon?: IconName | string;
  onClick?: () => void;
  /** Destructive styling (red). */
  danger?: boolean;
  disabled?: boolean;
  /** Render a separator instead of an item. */
  divider?: boolean;
}

export interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  items: MenuItem[];
  /** Custom trigger; defaults to a "more" IconButton. */
  trigger?: React.ReactNode;
  /** Default-trigger glyph. */
  icon?: IconName | string;
  /** Default-trigger accessible label. */
  label?: string;
  /** Align menu to the trigger's start or end edge. */
  align?: 'start' | 'end';
}

/** Row/action dropdown — edit, duplicate, delete, reorder. Closes on select, outside-click, Esc. */
export function Menu(props: MenuProps): JSX.Element;
