import React from 'react';
import { IconButton } from '../actions/IconButton.jsx';

export function Dialog({ open, onClose, title, description, children, footer, size = 'md', contained = false, className = '', ...rest }) {
  React.useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const cls = ['helm-dialog', contained && 'helm-dialog--contained', className].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      <div className="helm-dialog__backdrop" onClick={onClose} />
      <div className={['helm-dialog__panel', size !== 'md' && `helm-dialog__panel--${size}`].filter(Boolean).join(' ')} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
        {onClose && <span className="helm-dialog__close"><IconButton icon="x" label="Close" onClick={onClose} /></span>}
        {title && <h2 className="helm-dialog__title">{title}</h2>}
        {description && <p className="helm-dialog__desc">{description}</p>}
        {children && <div className="helm-dialog__body">{children}</div>}
        {footer && <div className="helm-dialog__footer">{footer}</div>}
      </div>
    </div>
  );
}
