import React from 'react';

export function Radio({ label, name, value, checked, defaultChecked, onChange, disabled = false, id, className = '', ...rest }) {
  const rid = React.useId();
  const fid = id || rid;
  return (
    <label className={['helm-radio', disabled && 'helm-radio--disabled', className].filter(Boolean).join(' ')} htmlFor={fid}>
      <input
        id={fid}
        type="radio"
        className="helm-radio__input"
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
        {...rest}
      />
      <span className="helm-radio__box" aria-hidden="true" />
      {label != null && <span className="helm-radio__label">{label}</span>}
    </label>
  );
}
