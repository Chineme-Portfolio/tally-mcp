import React from 'react';
import { Icon } from '../icon/Icon.jsx';

export function Input({
  label, hint, error, iconLeft,
  size = 'md', id, className = '', ...rest
}) {
  const rid = React.useId();
  const fid = id || rid;
  const invalid = !!error;

  const input = (
    <input
      id={fid}
      className={['helm-input', size !== 'md' && `helm-input--${size}`, invalid && 'helm-input--invalid', iconLeft && 'helm-input--has-icon', className].filter(Boolean).join(' ')}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );

  const control = iconLeft ? (
    <span className="helm-input-wrap">
      <span className="helm-input-wrap__icon"><Icon name={iconLeft} size={18} /></span>
      {input}
    </span>
  ) : input;

  if (!label && !hint && !error) return control;
  return (
    <span className="helm-field">
      {label && <label className="helm-field__label" htmlFor={fid}>{label}</label>}
      {control}
      {error ? <span className="helm-field__error">{error}</span> : hint && <span className="helm-field__hint">{hint}</span>}
    </span>
  );
}
