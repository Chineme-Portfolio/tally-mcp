import * as React from 'react';

/** Names in the curated Helm glyph set (Lucide-derived). */
export type IconName =
  | 'check' | 'plus' | 'minus' | 'x'
  | 'chevron-down' | 'chevron-up' | 'chevron-right' | 'chevron-left'
  | 'arrow-right' | 'arrow-up-right' | 'search' | 'pencil' | 'trash'
  | 'circle' | 'circle-dot' | 'check-circle' | 'alert-circle' | 'alert-triangle'
  | 'target' | 'flag' | 'anchor' | 'clock' | 'calendar' | 'rocket'
  | 'terminal' | 'database' | 'copy' | 'external-link' | 'sun' | 'moon' | 'settings'
  | 'grip-vertical' | 'more-vertical' | 'more-horizontal';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  /** Glyph name from the curated set. Unknown names fall back to `circle`. */
  name: IconName | string;
  /** Width & height in px. Default 20. */
  size?: number;
  /** Stroke width for outline glyphs. Default 2. */
  strokeWidth?: number;
}

export function Icon(props: IconProps): JSX.Element;
