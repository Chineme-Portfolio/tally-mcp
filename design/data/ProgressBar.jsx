import React from 'react';

/** Launch-readiness meter. Fill springs to width; at 100% it lights up (completion glow). */
export function ProgressBar({ value = 0, max = 100, label, showValue = true, valueFormat, size = 'md', className = '', ...rest }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const complete = pct >= 100;
  const cls = [
    'helm-progress',
    size !== 'md' && `helm-progress--${size}`,
    complete && 'helm-progress--complete',
    className,
  ].filter(Boolean).join(' ');
  const display = valueFormat ? valueFormat(value, max, pct) : `${Math.round(pct)}%`;
  return (
    <div className={cls} {...rest}>
      {(label || showValue) && (
        <div className="helm-progress__head">
          {label && <span className="helm-progress__label">{label}</span>}
          {showValue && <span className="helm-progress__value">{display}</span>}
        </div>
      )}
      <div className="helm-progress__track" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="helm-progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
