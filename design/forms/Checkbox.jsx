import React from 'react';
import { Icon } from '../icon/Icon.jsx';

/** The satisfying check. Springy pop + a check that draws itself in on complete. */
export function Checkbox({ label, checked, defaultChecked, onChange, disabled = false, id, className = '', ...rest }) {
  const rid = React.useId();
  const fid = id || rid;
  return (
    <label className={['helm-check', disabled && 'helm-check--disabled', className].filter(Boolean).join(' ')} htmlFor={fid}>
      <input
        id={fid}
        type="checkbox"
        className="helm-check__input"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
        {...rest}
      />
      <span className="helm-check__box" aria-hidden="true"><Icon name="check" size={15} strokeWidth={3} /></span>
      {label != null && <span className="helm-check__label">{label}</span>}
    </label>
  );
}
