import React from 'react';

export function Switch({ label, checked, defaultChecked, onChange, disabled = false, id, className = '', ...rest }) {
  const rid = React.useId();
  const fid = id || rid;
  return (
    <label className={['helm-switch', disabled && 'helm-switch--disabled', className].filter(Boolean).join(' ')} htmlFor={fid}>
      <input
        id={fid}
        type="checkbox"
        role="switch"
        className="helm-switch__input"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
        {...rest}
      />
      <span className="helm-switch__track" aria-hidden="true"><span className="helm-switch__thumb" /></span>
      {label != null && <span className="helm-switch__label">{label}</span>}
    </label>
  );
}
