import * as React from 'react';

export interface StatusProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** todo (grey) · active (amber) · blocked (red) · done (green + check). */
  status?: 'todo' | 'active' | 'blocked' | 'done';
  /** Override the default label text. */
  label?: React.ReactNode;
  /** Swap the check glyph for `done` (default true). */
  showIcon?: boolean;
}

/** The task-status pill used across the board. Fixed four-state vocabulary. */
export function Status(props: StatusProps): JSX.Element;
