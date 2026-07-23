import React from 'react';
import { Icon } from '../icon/Icon.jsx';

const LABELS = { todo: 'Not started', active: 'In progress', blocked: 'Blocked', done: 'Done' };

/** Task status pill. status: todo | active | blocked | done. */
export function Status({ status = 'todo', label, showIcon = true, className = '', ...rest }) {
  const text = label ?? LABELS[status] ?? LABELS.todo;
  const cls = ['helm-status', `helm-status--${status}`, className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {status === 'done' && showIcon
        ? <Icon name="check" size={12} strokeWidth={3} />
        : <span className="helm-status__dot" aria-hidden="true" />}
      {text}
    </span>
  );
}
