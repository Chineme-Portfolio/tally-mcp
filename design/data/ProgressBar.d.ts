import * as React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value. */
  value?: number;
  /** Scale max. Default 100. */
  max?: number;
  label?: React.ReactNode;
  /** Show the numeric value (mono). Default true. */
  showValue?: boolean;
  /** Custom value renderer: (value, max, pct) => node. */
  valueFormat?: (value: number, max: number, pct: number) => React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * The launch-readiness meter. Fill springs to its width; hitting 100% triggers the
 * completion glow (gradient fill + green halo) — the board's payoff moment.
 */
export function ProgressBar(props: ProgressBarProps): JSX.Element;
