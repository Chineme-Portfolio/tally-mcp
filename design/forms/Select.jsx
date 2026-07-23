import React from 'react';
import { Icon } from '../icon/Icon.jsx';

export function Select({ label, hint, error, options, children, id, className = '', ...rest }) {
  const rid = React.useId();
  const fid = id || rid;
  const invalid = !!error;
  const control = (
    <span className="helm-select-wrap">
      <select
        id={fid}
        className={['helm-select', invalid && 'helm-input--invalid', className].filter(Boolean).join(' ')}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {options
          ? options.map((o) => {
              const opt = typeof o === 'string' ? { value: o, label: o } : o;
              return <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>;
            })
          : children}
      </select>
      <span className="helm-select-wrap__icon"><Icon name="chevron-down" size={18} /></span>
    </span>
  );
  if (!label && !hint && !error) return control;
  return (
    <span className="helm-field">
      {label && <label className="helm-field__label" htmlFor={fid}>{label}</label>}
      {control}
      {error ? <span className="helm-field__error">{error}</span> : hint && <span className="helm-field__hint">{hint}</span>}
    </span>
  );
}
