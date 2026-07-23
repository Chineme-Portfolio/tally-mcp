import React from 'react';
import { Icon } from '../icon/Icon.jsx';
import { IconButton } from '../actions/IconButton.jsx';

const TOAST_ICON = { default: 'flag', success: 'check-circle', warning: 'alert-triangle', danger: 'alert-circle' };

export function Toast({ variant = 'default', title, children, icon, onClose, className = '', ...rest }) {
  const cls = ['helm-toast', `helm-toast--${variant}`, className].filter(Boolean).join(' ');
  return (
    <div className={cls} role="status" {...rest}>
      <span className="helm-toast__icon"><Icon name={icon || TOAST_ICON[variant]} size={18} /></span>
      <div className="helm-toast__body">
        {title && <div className="helm-toast__title">{title}</div>}
        {children && <div className="helm-toast__msg">{children}</div>}
      </div>
      {onClose && <span className="helm-toast__close"><IconButton icon="x" label="Dismiss" size="sm" onClick={onClose} /></span>}
    </div>
  );
}
