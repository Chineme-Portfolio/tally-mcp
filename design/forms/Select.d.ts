import * as React from 'react';

export interface SelectOption { value: string; label: string; disabled?: boolean; }

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Options as objects/strings; omit to pass <option> children directly. */
  options?: (SelectOption | string)[];
}

/** Native select styled to match, with the brand chevron affordance. */
export function Select(props: SelectProps): JSX.Element;
