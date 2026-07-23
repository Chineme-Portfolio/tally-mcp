import * as React from 'react';
import type { IconName } from '../icon/Icon';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
  title?: React.ReactNode;
  /** Leading glyph override (defaults per variant). */
  icon?: IconName | string;
  /** Show a dismiss button wired to this handler. */
  onClose?: () => void;
}

/** Transient confirmation/notice. Presentational — you own placement & timing. */
export function Toast(props: ToastProps): JSX.Element;
