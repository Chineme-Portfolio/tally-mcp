import React from 'react';

export function Card({ children, variant = 'default', padding = 'md', interactive = false, complete = false, className = '', as, ...rest }) {
  const Tag = as || 'div';
  const cls = [
    'helm-card',
    variant !== 'default' && `helm-card--${variant}`,
    padding !== 'none' && `helm-card--pad-${padding}`,
    interactive && 'helm-card--interactive',
    complete && 'helm-card--complete',
    className,
  ].filter(Boolean).join(' ');
  return <Tag className={cls} {...rest}>{children}</Tag>;
}
