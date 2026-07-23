import * as React from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

/** On/off toggle for immediate settings. Thumb slides with a spring; track fills green when on. */
export function Switch(props: SwitchProps): JSX.Element;
