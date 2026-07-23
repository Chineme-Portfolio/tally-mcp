import * as React from 'react';
import type { IconName } from '../icon/Icon';

export interface TagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onClick'> {
  icon?: IconName | string;
  /** Show a remove affordance; called when clicked. */
  onRemove?: (e: React.MouseEvent) => void;
  /** Selected (filter) state — fills with the brand tint. */
  selected?: boolean;
  /** Makes the tag interactive (pointer + hover). */
  onClick?: (e: React.MouseEvent) => void;
}

/** Chip for labels, owners, and filters. Removable and/or selectable. */
export function Tag(props: TagProps): JSX.Element;
