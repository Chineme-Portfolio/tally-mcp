import * as React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Text beside the box. */
  label?: React.ReactNode;
}

/**
 * The signature control. A strong rounded-square box; on check it springs (pop)
 * and the checkmark draws itself in — the core "completed" feedback moment.
 */
export function Checkbox(props: CheckboxProps): JSX.Element;
