import * as React from 'react';

export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Tooltip text. */
  label: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** The trigger element. */
  children: React.ReactNode;
}

/** CSS-driven tooltip. Wrap any focusable/hoverable trigger. Keep labels terse. */
export function Tooltip(props: TooltipProps): JSX.Element;
