import * as React from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

/** Single-select control. Group by sharing a `name`. Dot springs in on select. */
export function Radio(props: RadioProps): JSX.Element;
