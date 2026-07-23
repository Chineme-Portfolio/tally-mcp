import * as React from 'react';

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  /** Close handler — wired to backdrop click, Esc, and the close button. */
  onClose?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Footer node — usually right-aligned Buttons. */
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Position absolutely within the nearest positioned ancestor instead of the viewport. */
  contained?: boolean;
}

/** Modal dialog. Springs in; dims + blurs behind. Provide `footer` actions for decisions. */
export function Dialog(props: DialogProps): JSX.Element;
