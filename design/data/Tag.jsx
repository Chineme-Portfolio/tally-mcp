import React from 'react';
import { Icon } from '../icon/Icon.jsx';

export function Tag({ children, icon, onRemove, selected = false, onClick, className = '', ...rest }) {
  const interactive = !!onClick;
  const cls = [
    'helm-tag',
    interactive && 'helm-tag--interactive',
    selected && 'helm-tag--selected',
    className,
  ].filter(Boolean).join(' ');
  return (
    <span className={cls} onClick={onClick} {...rest}>
      {icon && <Icon name={icon} size={14} />}
      {children}
      {onRemove && (
        <span
          className="helm-tag__remove"
          role="button"
          aria-label="Remove"
          onClick={(e) => { e.stopPropagation(); onRemove(e); }}
        >
          <Icon name="x" size={13} />
        </span>
      )}
    </span>
  );
}
