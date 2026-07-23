import * as React from 'react';
import type { MenuItem } from '../overlays/Menu';

export interface ChecklistItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: React.ReactNode;
  /** Completed — strikes the title and tints the row green. */
  done?: boolean;
  /** Task status pill (hidden when done). */
  status?: 'todo' | 'active' | 'blocked' | 'done';
  /** Secondary line (owner, due date, labels). */
  meta?: React.ReactNode;
  onToggle?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Override the default actions menu. */
  menuItems?: MenuItem[];
  /** Elevated "being dragged" appearance. */
  dragging?: boolean;
  showHandle?: boolean;
  showStatus?: boolean;
}

export function ChecklistItem(props: ChecklistItemProps): JSX.Element;
