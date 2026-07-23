import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** default (surface + hairline) · raised · outline · sunken · flat. */
  variant?: 'default' | 'raised' | 'outline' | 'sunken' | 'flat';
  /** Inner padding. `none` to lay out your own. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Hover-lift + pointer for clickable cards. */
  interactive?: boolean;
  /** Completion glow (green border + halo) — the "done" surface. */
  complete?: boolean;
  /** Render as another element/component. */
  as?: any;
}

/** The surface primitive. Everything that reads as a panel sits on a Card. */
export function Card(props: CardProps): JSX.Element;
