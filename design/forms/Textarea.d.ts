import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

/** Multi-line text field — vertically resizable. Used for editing task detail. */
export function Textarea(props: TextareaProps): JSX.Element;
