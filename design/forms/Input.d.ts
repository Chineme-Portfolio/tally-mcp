import * as React from 'react';
import type { IconName } from '../icon/Icon';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label rendered above the input. */
  label?: string;
  /** Helper text below the field. */
  hint?: string;
  /** Error message — turns the field red and replaces the hint. */
  error?: string;
  /** Leading glyph inside the field. */
  iconLeft?: IconName | string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Single-line text field. Renders bare when no label/hint/error, otherwise wrapped
 * in a labelled field group. Green focus ring; red ring on error.
 */
export function Input(props: InputProps): JSX.Element;
