import React from 'react';
import { Icon } from '../icon/Icon.jsx';

const ICON_SIZE = { sm: 16, md: 18, lg: 20 };

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  block = false,
  href,
  type = 'button',
  className = '',
  ...rest
}) {
  const cls = [
    'helm-btn',
    `helm-btn--${variant}`,
    size !== 'md' && `helm-btn--${size}`,
    block && 'helm-btn--block',
    loading && 'is-loading',
    className,
  ].filter(Boolean).join(' ');

  const isDisabled = disabled || loading;
  const iz = ICON_SIZE[size] || 18;

  const inner = (
    <>
      {loading && <span className="helm-btn__spinner" aria-hidden="true" />}
      {!loading && iconLeft && <Icon name={iconLeft} size={iz} />}
      {children != null && <span className="helm-btn__label">{children}</span>}
      {iconRight && <Icon name={iconRight} size={iz} />}
    </>
  );

  if (href && !isDisabled) {
    return <a className={cls} href={href} {...rest}>{inner}</a>;
  }
  return (
    <button className={cls} type={type} disabled={isDisabled} aria-busy={loading || undefined} {...rest}>
      {inner}
    </button>
  );
}
