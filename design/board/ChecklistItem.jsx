import React from 'react';
import { Checkbox } from '../forms/Checkbox.jsx';
import { Status } from '../data/Status.jsx';
import { Icon } from '../icon/Icon.jsx';
import { Menu } from '../overlays/Menu.jsx';

/**
 * The board's signature row: drag handle · the satisfying check · title (+ meta) ·
 * status · actions menu. Composes Checkbox, Status, and Menu — don't rebuild them.
 */
export function ChecklistItem({
  title,
  done = false,
  status,
  meta,
  onToggle,
  onEdit,
  onDelete,
  menuItems,
  dragging = false,
  showHandle = true,
  showStatus = true,
  className = '',
  ...rest
}) {
  const isDone = done || status === 'done';
  const cls = [
    'helm-item',
    isDone && 'helm-item--done',
    dragging && 'helm-item--dragging',
    className,
  ].filter(Boolean).join(' ');

  const items = menuItems || [
    onEdit && { label: 'Edit', icon: 'pencil', onClick: onEdit },
    { label: 'Duplicate', icon: 'copy' },
    { divider: true },
    onDelete && { label: 'Delete', icon: 'trash', danger: true, onClick: onDelete },
  ].filter(Boolean);

  return (
    <div className={cls} {...rest}>
      {showHandle && (
        <span className="helm-item__handle" role="button" aria-label="Reorder" tabIndex={0}>
          <Icon name="grip-vertical" size={18} />
        </span>
      )}
      <Checkbox checked={isDone} onChange={onToggle} aria-label={title} />
      <div className="helm-item__main">
        <span className="helm-item__title">{title}</span>
        {meta && <span className="helm-item__meta">{meta}</span>}
      </div>
      <div className="helm-item__trail">
        {showStatus && status && !isDone && <Status status={status} />}
        {items.length > 0 && <Menu items={items} label="Task actions" />}
      </div>
    </div>
  );
}
