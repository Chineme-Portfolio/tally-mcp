import React from 'react';
import { Icon } from '../icon/Icon.jsx';

const ICON_SIZE = { sm: 16, md: 20, lg: 22 };

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  round = false,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) {
  const cls = [
    'helm-iconbtn',
    `helm-iconbtn--${variant}`,
    size !== 'md' && `helm-iconbtn--${size}`,
    round && 'helm-iconbtn--round',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={cls} type={type} disabled={disabled} aria-label={label} title={label} {...rest}>
      <Icon name={icon} size={ICON_SIZE[size] || 20} />
    </button>
  );
}
