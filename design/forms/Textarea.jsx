import React from 'react';

export function Textarea({ label, hint, error, id, className = '', rows = 4, ...rest }) {
  const rid = React.useId();
  const fid = id || rid;
  const invalid = !!error;
  const area = (
    <textarea
      id={fid}
      rows={rows}
      className={['helm-textarea', invalid && 'helm-input--invalid', className].filter(Boolean).join(' ')}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
  if (!label && !hint && !error) return area;
  return (
    <span className="helm-field">
      {label && <label className="helm-field__label" htmlFor={fid}>{label}</label>}
      {area}
      {error ? <span className="helm-field__error">{error}</span> : hint && <span className="helm-field__hint">{hint}</span>}
    </span>
  );
}
