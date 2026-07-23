import React from 'react';
import { Icon } from '../icon/Icon.jsx';

export function Tabs({ tabs = [], value, onChange, variant = 'line', className = '', ...rest }) {
  const cls = ['helm-tabs', `helm-tabs--${variant}`, className].filter(Boolean).join(' ');
  return (
    <div className={cls} role="tablist" {...rest}>
      {tabs.map((t) => {
        const tab = typeof t === 'string' ? { value: t, label: t } : t;
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className="helm-tab"
            onClick={() => onChange && onChange(tab.value)}
          >
            {tab.icon && <Icon name={tab.icon} size={16} />}
            {tab.label}
            {tab.count != null && <span className="helm-tab__count">{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
