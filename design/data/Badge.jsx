import React from 'react';
import { Icon } from '../icon/Icon.jsx';

export function Badge({ children, variant = 'neutral', tone = 'soft', size = 'md', dot = false, icon, className = '', ...rest }) {
  const cls = [
    'helm-badge',
    `helm-badge--${variant}`,
    tone === 'solid' && 'helm-badge--solid',
    tone === 'outline' && 'helm-badge--outline',
    size !== 'md' && `helm-badge--${size}`,
    className,
  ].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {dot && <span className="helm-badge__dot" aria-hidden="true" />}
      {icon && <Icon name={icon} size={size === 'sm' ? 11 : 12} />}
      {children}
    </span>
  );
}
