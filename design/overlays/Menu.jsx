import React from 'react';
import { Icon } from '../icon/Icon.jsx';
import { IconButton } from '../actions/IconButton.jsx';

/** Dropdown menu. Pass `items`; render a custom `trigger` or fall back to a "more" IconButton. */
export function Menu({ items = [], trigger, icon = 'more-vertical', label = 'Open menu', align = 'end', className = '', ...rest }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className={['helm-menu', className].filter(Boolean).join(' ')} ref={ref} {...rest}>
      {trigger
        ? <span onClick={() => setOpen((o) => !o)}>{trigger}</span>
        : <IconButton icon={icon} label={label} onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} />}
      {open && (
        <div className={`helm-menu__list helm-menu__list--${align}`} role="menu">
          {items.map((it, i) => it.divider
            ? <div key={i} className="helm-menu__divider" role="separator" />
            : (
              <button
                key={i}
                type="button"
                role="menuitem"
                className={['helm-menu__item', it.danger && 'helm-menu__item--danger'].filter(Boolean).join(' ')}
                disabled={it.disabled}
                onClick={() => { setOpen(false); it.onClick && it.onClick(); }}
              >
                {it.icon && <span className="helm-menu__item-icon"><Icon name={it.icon} size={16} /></span>}
                <span className="helm-menu__item-label">{it.label}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
