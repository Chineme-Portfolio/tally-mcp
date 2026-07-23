import React from 'react';

export function Tooltip({ label, side = 'top', children, className = '', ...rest }) {
  return (
    <span className={['helm-tooltip', className].filter(Boolean).join(' ')} {...rest}>
      {children}
      <span className={`helm-tooltip__bubble helm-tooltip__bubble--${side}`} role="tooltip">{label}</span>
    </span>
  );
}
