/* @ds-bundle: {"format":4,"namespace":"HelmDesignSystem_94b187","components":[{"name":"Button","sourcePath":"actions/Button.jsx"},{"name":"IconButton","sourcePath":"actions/IconButton.jsx"},{"name":"ChecklistItem","sourcePath":"board/ChecklistItem.jsx"},{"name":"Badge","sourcePath":"data/Badge.jsx"},{"name":"ProgressBar","sourcePath":"data/ProgressBar.jsx"},{"name":"Status","sourcePath":"data/Status.jsx"},{"name":"Tag","sourcePath":"data/Tag.jsx"},{"name":"Checkbox","sourcePath":"forms/Checkbox.jsx"},{"name":"Input","sourcePath":"forms/Input.jsx"},{"name":"Radio","sourcePath":"forms/Radio.jsx"},{"name":"Select","sourcePath":"forms/Select.jsx"},{"name":"Switch","sourcePath":"forms/Switch.jsx"},{"name":"Textarea","sourcePath":"forms/Textarea.jsx"},{"name":"Icon","sourcePath":"icon/Icon.jsx"},{"name":"Tabs","sourcePath":"navigation/Tabs.jsx"},{"name":"Dialog","sourcePath":"overlays/Dialog.jsx"},{"name":"Menu","sourcePath":"overlays/Menu.jsx"},{"name":"Toast","sourcePath":"overlays/Toast.jsx"},{"name":"Tooltip","sourcePath":"overlays/Tooltip.jsx"},{"name":"Card","sourcePath":"surfaces/Card.jsx"}],"sourceHashes":{"actions/Button.jsx":"05208ae6d492","actions/IconButton.jsx":"d29e2f5f1814","board/ChecklistItem.jsx":"4a065bc0e918","data/Badge.jsx":"52fe60ce0dc6","data/ProgressBar.jsx":"c712079b3a3a","data/Status.jsx":"bb2f9dacf194","data/Tag.jsx":"f2346373f8a7","forms/Checkbox.jsx":"270387a8e37d","forms/Input.jsx":"b1f705af5703","forms/Radio.jsx":"19008d3224e3","forms/Select.jsx":"d38d429c04d1","forms/Switch.jsx":"d2ca6fa7e5fa","forms/Textarea.jsx":"eddc43351cfe","icon/Icon.jsx":"bfce7b844c11","navigation/Tabs.jsx":"a41d2a16f2fd","overlays/Dialog.jsx":"33f61aa24056","overlays/Menu.jsx":"af3eacc90549","overlays/Toast.jsx":"5b5bdf7ddc3c","overlays/Tooltip.jsx":"d73b2306469b","surfaces/Card.jsx":"bd04e940c105","ui_kits/board/board-app.jsx":"2ae88b9b1b54","ui_kits/board/kit-ui.jsx":"f0d27a78087c"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.HelmDesignSystem_94b187 = window.HelmDesignSystem_94b187 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// data/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Launch-readiness meter. Fill springs to width; at 100% it lights up (completion glow). */
function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = true,
  valueFormat,
  size = 'md',
  className = '',
  ...rest
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, value / max * 100)) : 0;
  const complete = pct >= 100;
  const cls = ['helm-progress', size !== 'md' && `helm-progress--${size}`, complete && 'helm-progress--complete', className].filter(Boolean).join(' ');
  const display = valueFormat ? valueFormat(value, max, pct) : `${Math.round(pct)}%`;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), (label || showValue) && /*#__PURE__*/React.createElement("div", {
    className: "helm-progress__head"
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "helm-progress__label"
  }, label), showValue && /*#__PURE__*/React.createElement("span", {
    className: "helm-progress__value"
  }, display)), /*#__PURE__*/React.createElement("div", {
    className: "helm-progress__track",
    role: "progressbar",
    "aria-valuenow": Math.round(pct),
    "aria-valuemin": 0,
    "aria-valuemax": 100
  }, /*#__PURE__*/React.createElement("div", {
    className: "helm-progress__fill",
    style: {
      width: `${pct}%`
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "data/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  label,
  name,
  value,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  id,
  className = '',
  ...rest
}) {
  const rid = React.useId();
  const fid = id || rid;
  return /*#__PURE__*/React.createElement("label", {
    className: ['helm-radio', disabled && 'helm-radio--disabled', className].filter(Boolean).join(' '),
    htmlFor: fid
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    type: "radio",
    className: "helm-radio__input",
    name: name,
    value: value,
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "helm-radio__box",
    "aria-hidden": "true"
  }), label != null && /*#__PURE__*/React.createElement("span", {
    className: "helm-radio__label"
  }, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "forms/Radio.jsx", error: String((e && e.message) || e) }); }

// forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  id,
  className = '',
  ...rest
}) {
  const rid = React.useId();
  const fid = id || rid;
  return /*#__PURE__*/React.createElement("label", {
    className: ['helm-switch', disabled && 'helm-switch--disabled', className].filter(Boolean).join(' '),
    htmlFor: fid
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    type: "checkbox",
    role: "switch",
    className: "helm-switch__input",
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "helm-switch__track",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "helm-switch__thumb"
  })), label != null && /*#__PURE__*/React.createElement("span", {
    className: "helm-switch__label"
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "forms/Switch.jsx", error: String((e && e.message) || e) }); }

// forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Textarea({
  label,
  hint,
  error,
  id,
  className = '',
  rows = 4,
  ...rest
}) {
  const rid = React.useId();
  const fid = id || rid;
  const invalid = !!error;
  const area = /*#__PURE__*/React.createElement("textarea", _extends({
    id: fid,
    rows: rows,
    className: ['helm-textarea', invalid && 'helm-input--invalid', className].filter(Boolean).join(' '),
    "aria-invalid": invalid || undefined
  }, rest));
  if (!label && !hint && !error) return area;
  return /*#__PURE__*/React.createElement("span", {
    className: "helm-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "helm-field__label",
    htmlFor: fid
  }, label), area, error ? /*#__PURE__*/React.createElement("span", {
    className: "helm-field__error"
  }, error) : hint && /*#__PURE__*/React.createElement("span", {
    className: "helm-field__hint"
  }, hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// icon/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Curated, Lucide-derived (ISC) glyph set — only the marks Helm's UI uses.
   Outline glyphs render as stroked paths; handle/menu glyphs render as filled dots. */
const PATHS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-up': '<path d="m18 15-6-6-6 6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  circle: '<circle cx="12" cy="12" r="10"/>',
  'circle-dot': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>',
  'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  anchor: '<circle cx="12" cy="5" r="3"/><line x1="12" x2="12" y1="22" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 2v4"/><path d="M16 2v4"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'
};
const DOTS = {
  'grip-vertical': [[9, 5], [9, 12], [9, 19], [15, 5], [15, 12], [15, 19]],
  'more-vertical': [[12, 5], [12, 12], [12, 19]],
  'more-horizontal': [[5, 12], [12, 12], [19, 12]]
};
function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  className = '',
  style,
  ...rest
}) {
  const common = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    className: ['helm-icon', className].filter(Boolean).join(' '),
    style,
    'aria-hidden': true,
    focusable: 'false',
    ...rest
  };
  const dots = DOTS[name];
  if (dots) {
    return /*#__PURE__*/React.createElement("svg", _extends({}, common, {
      fill: "currentColor",
      stroke: "none"
    }), dots.map(([cx, cy], i) => /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: cx,
      cy: cy,
      r: "1.25"
    })));
  }
  return /*#__PURE__*/React.createElement("svg", _extends({}, common, {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    dangerouslySetInnerHTML: {
      __html: PATHS[name] || PATHS.circle
    }
  }));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "icon/Icon.jsx", error: String((e && e.message) || e) }); }

// actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ICON_SIZE = {
  sm: 16,
  md: 18,
  lg: 20
};
function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  block = false,
  href,
  type = 'button',
  className = '',
  ...rest
}) {
  const cls = ['helm-btn', `helm-btn--${variant}`, size !== 'md' && `helm-btn--${size}`, block && 'helm-btn--block', loading && 'is-loading', className].filter(Boolean).join(' ');
  const isDisabled = disabled || loading;
  const iz = ICON_SIZE[size] || 18;
  const inner = /*#__PURE__*/React.createElement(React.Fragment, null, loading && /*#__PURE__*/React.createElement("span", {
    className: "helm-btn__spinner",
    "aria-hidden": "true"
  }), !loading && iconLeft && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: iz
  }), children != null && /*#__PURE__*/React.createElement("span", {
    className: "helm-btn__label"
  }, children), iconRight && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: iz
  }));
  if (href && !isDisabled) {
    return /*#__PURE__*/React.createElement("a", _extends({
      className: cls,
      href: href
    }, rest), inner);
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    type: type,
    disabled: isDisabled,
    "aria-busy": loading || undefined
  }, rest), inner);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "actions/Button.jsx", error: String((e && e.message) || e) }); }

// actions/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ICON_SIZE = {
  sm: 16,
  md: 20,
  lg: 22
};
function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  round = false,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) {
  const cls = ['helm-iconbtn', `helm-iconbtn--${variant}`, size !== 'md' && `helm-iconbtn--${size}`, round && 'helm-iconbtn--round', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    type: type,
    disabled: disabled,
    "aria-label": label,
    title: label
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: ICON_SIZE[size] || 20
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "actions/IconButton.jsx", error: String((e && e.message) || e) }); }

// data/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Badge({
  children,
  variant = 'neutral',
  tone = 'soft',
  size = 'md',
  dot = false,
  icon,
  className = '',
  ...rest
}) {
  const cls = ['helm-badge', `helm-badge--${variant}`, tone === 'solid' && 'helm-badge--solid', tone === 'outline' && 'helm-badge--outline', size !== 'md' && `helm-badge--${size}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: "helm-badge__dot",
    "aria-hidden": "true"
  }), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === 'sm' ? 11 : 12
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "data/Badge.jsx", error: String((e && e.message) || e) }); }

// data/Status.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const LABELS = {
  todo: 'Not started',
  active: 'In progress',
  blocked: 'Blocked',
  done: 'Done'
};

/** Task status pill. status: todo | active | blocked | done. */
function Status({
  status = 'todo',
  label,
  showIcon = true,
  className = '',
  ...rest
}) {
  const text = label ?? LABELS[status] ?? LABELS.todo;
  const cls = ['helm-status', `helm-status--${status}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), status === 'done' && showIcon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 12,
    strokeWidth: 3
  }) : /*#__PURE__*/React.createElement("span", {
    className: "helm-status__dot",
    "aria-hidden": "true"
  }), text);
}
Object.assign(__ds_scope, { Status });
})(); } catch (e) { __ds_ns.__errors.push({ path: "data/Status.jsx", error: String((e && e.message) || e) }); }

// data/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  children,
  icon,
  onRemove,
  selected = false,
  onClick,
  className = '',
  ...rest
}) {
  const interactive = !!onClick;
  const cls = ['helm-tag', interactive && 'helm-tag--interactive', selected && 'helm-tag--selected', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    onClick: onClick
  }, rest), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 14
  }), children, onRemove && /*#__PURE__*/React.createElement("span", {
    className: "helm-tag__remove",
    role: "button",
    "aria-label": "Remove",
    onClick: e => {
      e.stopPropagation();
      onRemove(e);
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 13
  })));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "data/Tag.jsx", error: String((e && e.message) || e) }); }

// forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** The satisfying check. Springy pop + a check that draws itself in on complete. */
function Checkbox({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  id,
  className = '',
  ...rest
}) {
  const rid = React.useId();
  const fid = id || rid;
  return /*#__PURE__*/React.createElement("label", {
    className: ['helm-check', disabled && 'helm-check--disabled', className].filter(Boolean).join(' '),
    htmlFor: fid
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    type: "checkbox",
    className: "helm-check__input",
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "helm-check__box",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 15,
    strokeWidth: 3
  })), label != null && /*#__PURE__*/React.createElement("span", {
    className: "helm-check__label"
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  hint,
  error,
  iconLeft,
  size = 'md',
  id,
  className = '',
  ...rest
}) {
  const rid = React.useId();
  const fid = id || rid;
  const invalid = !!error;
  const input = /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    className: ['helm-input', size !== 'md' && `helm-input--${size}`, invalid && 'helm-input--invalid', iconLeft && 'helm-input--has-icon', className].filter(Boolean).join(' '),
    "aria-invalid": invalid || undefined
  }, rest));
  const control = iconLeft ? /*#__PURE__*/React.createElement("span", {
    className: "helm-input-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "helm-input-wrap__icon"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: 18
  })), input) : input;
  if (!label && !hint && !error) return control;
  return /*#__PURE__*/React.createElement("span", {
    className: "helm-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "helm-field__label",
    htmlFor: fid
  }, label), control, error ? /*#__PURE__*/React.createElement("span", {
    className: "helm-field__error"
  }, error) : hint && /*#__PURE__*/React.createElement("span", {
    className: "helm-field__hint"
  }, hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "forms/Input.jsx", error: String((e && e.message) || e) }); }

// forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  label,
  hint,
  error,
  options,
  children,
  id,
  className = '',
  ...rest
}) {
  const rid = React.useId();
  const fid = id || rid;
  const invalid = !!error;
  const control = /*#__PURE__*/React.createElement("span", {
    className: "helm-select-wrap"
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fid,
    className: ['helm-select', invalid && 'helm-input--invalid', className].filter(Boolean).join(' '),
    "aria-invalid": invalid || undefined
  }, rest), options ? options.map(o => {
    const opt = typeof o === 'string' ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value,
      disabled: opt.disabled
    }, opt.label);
  }) : children), /*#__PURE__*/React.createElement("span", {
    className: "helm-select-wrap__icon"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 18
  })));
  if (!label && !hint && !error) return control;
  return /*#__PURE__*/React.createElement("span", {
    className: "helm-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "helm-field__label",
    htmlFor: fid
  }, label), control, error ? /*#__PURE__*/React.createElement("span", {
    className: "helm-field__error"
  }, error) : hint && /*#__PURE__*/React.createElement("span", {
    className: "helm-field__hint"
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "forms/Select.jsx", error: String((e && e.message) || e) }); }

// navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tabs({
  tabs = [],
  value,
  onChange,
  variant = 'line',
  className = '',
  ...rest
}) {
  const cls = ['helm-tabs', `helm-tabs--${variant}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    role: "tablist"
  }, rest), tabs.map(t => {
    const tab = typeof t === 'string' ? {
      value: t,
      label: t
    } : t;
    const selected = tab.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.value,
      type: "button",
      role: "tab",
      "aria-selected": selected,
      className: "helm-tab",
      onClick: () => onChange && onChange(tab.value)
    }, tab.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: tab.icon,
      size: 16
    }), tab.label, tab.count != null && /*#__PURE__*/React.createElement("span", {
      className: "helm-tab__count"
    }, tab.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// overlays/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  contained = false,
  className = '',
  ...rest
}) {
  React.useEffect(() => {
    if (!open || !onClose) return;
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const cls = ['helm-dialog', contained && 'helm-dialog--contained', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "helm-dialog__backdrop",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("div", {
    className: ['helm-dialog__panel', size !== 'md' && `helm-dialog__panel--${size}`].filter(Boolean).join(' '),
    role: "dialog",
    "aria-modal": "true",
    "aria-label": typeof title === 'string' ? title : undefined
  }, onClose && /*#__PURE__*/React.createElement("span", {
    className: "helm-dialog__close"
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "Close",
    onClick: onClose
  })), title && /*#__PURE__*/React.createElement("h2", {
    className: "helm-dialog__title"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "helm-dialog__desc"
  }, description), children && /*#__PURE__*/React.createElement("div", {
    className: "helm-dialog__body"
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "helm-dialog__footer"
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "overlays/Dialog.jsx", error: String((e && e.message) || e) }); }

// overlays/Menu.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Dropdown menu. Pass `items`; render a custom `trigger` or fall back to a "more" IconButton. */
function Menu({
  items = [],
  trigger,
  icon = 'more-vertical',
  label = 'Open menu',
  align = 'end',
  className = '',
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['helm-menu', className].filter(Boolean).join(' '),
    ref: ref
  }, rest), trigger ? /*#__PURE__*/React.createElement("span", {
    onClick: () => setOpen(o => !o)
  }, trigger) : /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: icon,
    label: label,
    onClick: () => setOpen(o => !o),
    "aria-haspopup": "menu",
    "aria-expanded": open
  }), open && /*#__PURE__*/React.createElement("div", {
    className: `helm-menu__list helm-menu__list--${align}`,
    role: "menu"
  }, items.map((it, i) => it.divider ? /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "helm-menu__divider",
    role: "separator"
  }) : /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    role: "menuitem",
    className: ['helm-menu__item', it.danger && 'helm-menu__item--danger'].filter(Boolean).join(' '),
    disabled: it.disabled,
    onClick: () => {
      setOpen(false);
      it.onClick && it.onClick();
    }
  }, it.icon && /*#__PURE__*/React.createElement("span", {
    className: "helm-menu__item-icon"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: it.icon,
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    className: "helm-menu__item-label"
  }, it.label)))));
}
Object.assign(__ds_scope, { Menu });
})(); } catch (e) { __ds_ns.__errors.push({ path: "overlays/Menu.jsx", error: String((e && e.message) || e) }); }

// board/ChecklistItem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * The board's signature row: drag handle · the satisfying check · title (+ meta) ·
 * status · actions menu. Composes Checkbox, Status, and Menu — don't rebuild them.
 */
function ChecklistItem({
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
  const cls = ['helm-item', isDone && 'helm-item--done', dragging && 'helm-item--dragging', className].filter(Boolean).join(' ');
  const items = menuItems || [onEdit && {
    label: 'Edit',
    icon: 'pencil',
    onClick: onEdit
  }, {
    label: 'Duplicate',
    icon: 'copy'
  }, {
    divider: true
  }, onDelete && {
    label: 'Delete',
    icon: 'trash',
    danger: true,
    onClick: onDelete
  }].filter(Boolean);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), showHandle && /*#__PURE__*/React.createElement("span", {
    className: "helm-item__handle",
    role: "button",
    "aria-label": "Reorder",
    tabIndex: 0
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "grip-vertical",
    size: 18
  })), /*#__PURE__*/React.createElement(__ds_scope.Checkbox, {
    checked: isDone,
    onChange: onToggle,
    "aria-label": title
  }), /*#__PURE__*/React.createElement("div", {
    className: "helm-item__main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "helm-item__title"
  }, title), meta && /*#__PURE__*/React.createElement("span", {
    className: "helm-item__meta"
  }, meta)), /*#__PURE__*/React.createElement("div", {
    className: "helm-item__trail"
  }, showStatus && status && !isDone && /*#__PURE__*/React.createElement(__ds_scope.Status, {
    status: status
  }), items.length > 0 && /*#__PURE__*/React.createElement(__ds_scope.Menu, {
    items: items,
    label: "Task actions"
  })));
}
Object.assign(__ds_scope, { ChecklistItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "board/ChecklistItem.jsx", error: String((e && e.message) || e) }); }

// overlays/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TOAST_ICON = {
  default: 'flag',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-circle'
};
function Toast({
  variant = 'default',
  title,
  children,
  icon,
  onClose,
  className = '',
  ...rest
}) {
  const cls = ['helm-toast', `helm-toast--${variant}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    role: "status"
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "helm-toast__icon"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon || TOAST_ICON[variant],
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "helm-toast__body"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "helm-toast__title"
  }, title), children && /*#__PURE__*/React.createElement("div", {
    className: "helm-toast__msg"
  }, children)), onClose && /*#__PURE__*/React.createElement("span", {
    className: "helm-toast__close"
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "Dismiss",
    size: "sm",
    onClick: onClose
  })));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "overlays/Toast.jsx", error: String((e && e.message) || e) }); }

// overlays/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tooltip({
  label,
  side = 'top',
  children,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['helm-tooltip', className].filter(Boolean).join(' ')
  }, rest), children, /*#__PURE__*/React.createElement("span", {
    className: `helm-tooltip__bubble helm-tooltip__bubble--${side}`,
    role: "tooltip"
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "overlays/Tooltip.jsx", error: String((e && e.message) || e) }); }

// surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  children,
  variant = 'default',
  padding = 'md',
  interactive = false,
  complete = false,
  className = '',
  as,
  ...rest
}) {
  const Tag = as || 'div';
  const cls = ['helm-card', variant !== 'default' && `helm-card--${variant}`, padding !== 'none' && `helm-card--pad-${padding}`, interactive && 'helm-card--interactive', complete && 'helm-card--complete', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// ui_kits/board/board-app.jsx
try { (() => {
const {
  HIcon,
  HButton,
  HIconButton,
  HCheck,
  HProgress,
  HStatus,
  HBadge,
  HTabs,
  HMenu,
  HInput,
  HItem
} = window.KitUI;
const {
  useState,
  useRef
} = React;
const INITIAL = [{
  id: 1,
  title: 'Provision Postgres + run schema migrations',
  status: 'done',
  done: true
}, {
  id: 2,
  title: 'Wire MCP tools → widget render bridge',
  status: 'active'
}, {
  id: 3,
  title: 'Add OAuth + per-user boards',
  status: 'active'
}, {
  id: 4,
  title: 'Handle optimistic check / reorder writes',
  status: 'blocked'
}, {
  id: 5,
  title: 'Ship the self-host Docker image',
  status: 'todo'
}];
function Widget({
  theme,
  onToggleTheme
}) {
  const [tasks, setTasks] = useState(INITIAL);
  const [filter, setFilter] = useState('all');
  const [draft, setDraft] = useState('');
  const dragId = useRef(null);
  const [dragging, setDragging] = useState(null);
  const done = tasks.filter(t => t.done).length;
  const complete = tasks.length > 0 && done === tasks.length;
  const shown = tasks.filter(t => filter === 'all' ? true : filter === 'open' ? !t.done : t.done);
  const toggle = id => setTasks(ts => ts.map(t => t.id === id ? {
    ...t,
    done: !t.done,
    status: !t.done ? 'done' : t.status === 'done' ? 'active' : t.status
  } : t));
  const remove = id => setTasks(ts => ts.filter(t => t.id !== id));
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    setTasks(ts => [...ts, {
      id: Date.now(),
      title: v,
      status: 'todo'
    }]);
    setDraft('');
  };
  const reorder = overId => {
    const from = dragId.current;
    if (from == null || from === overId) return;
    setTasks(ts => {
      const a = [...ts];
      const fi = a.findIndex(t => t.id === from);
      const ti = a.findIndex(t => t.id === overId);
      const [m] = a.splice(fi, 1);
      a.splice(ti, 0, m);
      return a;
    });
  };
  const metaFor = t => {
    if (t.done) return null;
    if (t.status === 'active') return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      className: "helm-item__meta-item"
    }, /*#__PURE__*/React.createElement(HIcon, {
      name: "anchor",
      size: 13
    }), "infra"), /*#__PURE__*/React.createElement("span", {
      className: "helm-item__meta-item"
    }, /*#__PURE__*/React.createElement(HIcon, {
      name: "clock",
      size: 13
    }), "due Fri"));
    if (t.status === 'blocked') return /*#__PURE__*/React.createElement("span", {
      className: "helm-item__meta-item"
    }, "blocked on review");
    return null;
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "hw",
    "data-theme": theme
  }, /*#__PURE__*/React.createElement("header", {
    className: "hw__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hw__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hw__mark"
  }, "Helm", /*#__PURE__*/React.createElement("span", {
    className: "hw__dot"
  }, ".")), /*#__PURE__*/React.createElement("span", {
    className: "hw__sep"
  }), /*#__PURE__*/React.createElement("span", {
    className: "hw__title"
  }, "Launch readiness")), /*#__PURE__*/React.createElement("div", {
    className: "hw__tools"
  }, /*#__PURE__*/React.createElement(HIconButton, {
    icon: theme === 'dark' ? 'sun' : 'moon',
    label: "Toggle theme",
    size: "sm",
    onClick: onToggleTheme
  }), /*#__PURE__*/React.createElement(HMenu, {
    label: "Board menu",
    align: "end",
    items: [{
      label: 'Rename board',
      icon: 'pencil'
    }, {
      label: 'Duplicate',
      icon: 'copy'
    }, {
      label: 'Connect Postgres',
      icon: 'database'
    }, {
      divider: true
    }, {
      label: 'Delete board',
      icon: 'trash',
      danger: true
    }]
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hw__meter"
  }, /*#__PURE__*/React.createElement(HProgress, {
    label: complete ? 'Ready to ship' : 'Launch readiness',
    value: done,
    max: tasks.length,
    valueFormat: (v, m) => `${v} / ${m}`,
    size: "lg"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hw__controls"
  }, /*#__PURE__*/React.createElement(HTabs, {
    variant: "pill",
    value: filter,
    onChange: setFilter,
    tabs: [{
      value: 'all',
      label: 'All',
      count: tasks.length
    }, {
      value: 'open',
      label: 'Open',
      count: tasks.length - done
    }, {
      value: 'done',
      label: 'Done',
      count: done
    }]
  })), /*#__PURE__*/React.createElement("div", {
    className: "hw__list"
  }, shown.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    className: "hw__row",
    draggable: true,
    onDragStart: () => {
      dragId.current = t.id;
      setDragging(t.id);
    },
    onDragEnter: () => reorder(t.id),
    onDragEnd: () => {
      dragId.current = null;
      setDragging(null);
    },
    onDragOver: e => e.preventDefault()
  }, /*#__PURE__*/React.createElement(HItem, {
    title: t.title,
    status: t.status,
    done: t.done,
    dragging: dragging === t.id,
    onToggle: () => toggle(t.id),
    onEdit: () => {},
    onDelete: () => remove(t.id),
    meta: metaFor(t)
  }))), shown.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "hw__empty"
  }, "Nothing here \u2014 you're all clear.")), /*#__PURE__*/React.createElement("div", {
    className: "hw__add"
  }, /*#__PURE__*/React.createElement(HInput, {
    iconLeft: "plus",
    placeholder: "Add a task\u2026",
    value: draft,
    onChange: e => setDraft(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter') add();
    }
  }), /*#__PURE__*/React.createElement(HButton, {
    variant: "tinted",
    onClick: add
  }, "Add")), /*#__PURE__*/React.createElement("footer", {
    className: "hw__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hw__count"
  }, complete ? 'All tasks complete — go for launch.' : `${tasks.length - done} to go before launch`), /*#__PURE__*/React.createElement(HButton, {
    variant: "primary",
    iconLeft: "rocket",
    disabled: !complete
  }, complete ? 'Ship it' : 'Not ready')));
}
function App() {
  const [theme, setTheme] = useState('light');
  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return /*#__PURE__*/React.createElement("div", {
    className: "stage",
    "data-theme": theme
  }, /*#__PURE__*/React.createElement("div", {
    className: "host"
  }, /*#__PURE__*/React.createElement("div", {
    className: "host__bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "host__dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "host__dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "host__dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "host__label"
  }, "Assistant chat \xB7 MCP Apps widget"), /*#__PURE__*/React.createElement("button", {
    className: "host__theme",
    onClick: toggle
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: theme === 'dark' ? 'sun' : 'moon',
    size: 15
  }), theme === 'dark' ? 'Light' : 'Dark')), /*#__PURE__*/React.createElement("div", {
    className: "host__thread"
  }, /*#__PURE__*/React.createElement("div", {
    className: "msg msg--user"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bubble"
  }, "Set up a launch-readiness board for the Helm rollout.")), /*#__PURE__*/React.createElement("div", {
    className: "msg msg--assistant"
  }, /*#__PURE__*/React.createElement("span", {
    className: "avatar"
  }), /*#__PURE__*/React.createElement("div", {
    className: "assistant__body"
  }, /*#__PURE__*/React.createElement("p", {
    className: "assistant__say"
  }, "Here's your board \u2014 check things off as you go and I'll keep the Postgres copy in sync. Drag to reorder; add tasks inline."), /*#__PURE__*/React.createElement(Widget, {
    theme: theme,
    onToggleTheme: toggle
  }))))));
}
Object.assign(window, {
  App
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/board/board-app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/board/kit-ui.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Helm UI-kit mini-library — thin React wrappers over the shipped design-system
   CSS classes (helm-*). Visually identical to window.HelmDesignSystem_94b187, inlined
   here so the kit is a standalone, offline-renderable recreation. */
const {
  useState,
  useRef,
  useEffect,
  useId
} = React;
const ICON = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  anchor: '<circle cx="12" cy="5" r="3"/><line x1="12" x2="12" y1="22" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'
};
const DOTS = {
  'grip-vertical': [[9, 5], [9, 12], [9, 19], [15, 5], [15, 12], [15, 19]],
  'more-vertical': [[12, 5], [12, 12], [12, 19]],
  'more-horizontal': [[5, 12], [12, 12], [19, 12]]
};
function HIcon({
  name,
  size = 20,
  strokeWidth = 2,
  style,
  className = ''
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    className: ('helm-icon ' + className).trim(),
    style,
    'aria-hidden': true
  };
  if (DOTS[name]) return /*#__PURE__*/React.createElement("svg", _extends({}, common, {
    fill: "currentColor",
    stroke: "none"
  }), DOTS[name].map(([cx, cy], i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: cx,
    cy: cy,
    r: "1.25"
  })));
  return /*#__PURE__*/React.createElement("svg", _extends({}, common, {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    dangerouslySetInnerHTML: {
      __html: ICON[name] || ICON.target
    }
  }));
}
const IZ = {
  sm: 16,
  md: 18,
  lg: 20
};
function HButton({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading,
  block,
  className = '',
  ...rest
}) {
  const cls = ['helm-btn', 'helm-btn--' + variant, size !== 'md' && 'helm-btn--' + size, block && 'helm-btn--block', loading && 'is-loading', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    disabled: rest.disabled || loading
  }, rest), loading && /*#__PURE__*/React.createElement("span", {
    className: "helm-btn__spinner"
  }), !loading && iconLeft && /*#__PURE__*/React.createElement(HIcon, {
    name: iconLeft,
    size: IZ[size]
  }), children != null && /*#__PURE__*/React.createElement("span", {
    className: "helm-btn__label"
  }, children), iconRight && /*#__PURE__*/React.createElement(HIcon, {
    name: iconRight,
    size: IZ[size]
  }));
}
function HIconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  round,
  className = '',
  ...rest
}) {
  const cls = ['helm-iconbtn', 'helm-iconbtn--' + variant, size !== 'md' && 'helm-iconbtn--' + size, round && 'helm-iconbtn--round', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    "aria-label": label,
    title: label
  }, rest), /*#__PURE__*/React.createElement(HIcon, {
    name: icon,
    size: {
      sm: 16,
      md: 20,
      lg: 22
    }[size]
  }));
}
function HCheck({
  checked,
  onChange,
  label,
  disabled,
  className = '',
  ...rest
}) {
  const id = useId();
  return /*#__PURE__*/React.createElement("label", {
    className: ['helm-check', disabled && 'helm-check--disabled', className].filter(Boolean).join(' '),
    htmlFor: id
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    type: "checkbox",
    className: "helm-check__input",
    checked: checked,
    onChange: onChange,
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "helm-check__box",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "check",
    size: 15,
    strokeWidth: 3
  })), label != null && /*#__PURE__*/React.createElement("span", {
    className: "helm-check__label"
  }, label));
}
function HProgress({
  value = 0,
  max = 100,
  label,
  showValue = true,
  valueFormat,
  size = 'md'
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, value / max * 100)) : 0;
  const complete = pct >= 100;
  const disp = valueFormat ? valueFormat(value, max, pct) : Math.round(pct) + '%';
  return /*#__PURE__*/React.createElement("div", {
    className: ['helm-progress', size !== 'md' && 'helm-progress--' + size, complete && 'helm-progress--complete'].filter(Boolean).join(' ')
  }, (label || showValue) && /*#__PURE__*/React.createElement("div", {
    className: "helm-progress__head"
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "helm-progress__label"
  }, label), showValue && /*#__PURE__*/React.createElement("span", {
    className: "helm-progress__value"
  }, disp)), /*#__PURE__*/React.createElement("div", {
    className: "helm-progress__track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "helm-progress__fill",
    style: {
      width: pct + '%'
    }
  })));
}
const SLABEL = {
  todo: 'Not started',
  active: 'In progress',
  blocked: 'Blocked',
  done: 'Done'
};
function HStatus({
  status = 'todo',
  label,
  showIcon = true
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: 'helm-status helm-status--' + status
  }, status === 'done' && showIcon ? /*#__PURE__*/React.createElement(HIcon, {
    name: "check",
    size: 12,
    strokeWidth: 3
  }) : /*#__PURE__*/React.createElement("span", {
    className: "helm-status__dot"
  }), label ?? SLABEL[status]);
}
function HBadge({
  children,
  variant = 'neutral',
  tone = 'soft',
  dot,
  icon,
  size = 'md'
}) {
  const cls = ['helm-badge', 'helm-badge--' + variant, tone === 'solid' && 'helm-badge--solid', tone === 'outline' && 'helm-badge--outline', size !== 'md' && 'helm-badge--' + size].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", {
    className: cls
  }, dot && /*#__PURE__*/React.createElement("span", {
    className: "helm-badge__dot"
  }), icon && /*#__PURE__*/React.createElement(HIcon, {
    name: icon,
    size: 12
  }), children);
}
function HTabs({
  tabs = [],
  value,
  onChange,
  variant = 'line'
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: 'helm-tabs helm-tabs--' + variant,
    role: "tablist"
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.value,
    role: "tab",
    "aria-selected": t.value === value,
    className: "helm-tab",
    onClick: () => onChange && onChange(t.value)
  }, t.icon && /*#__PURE__*/React.createElement(HIcon, {
    name: t.icon,
    size: 16
  }), t.label, t.count != null && /*#__PURE__*/React.createElement("span", {
    className: "helm-tab__count"
  }, t.count))));
}
function HMenu({
  items = [],
  trigger,
  icon = 'more-vertical',
  label = 'Menu',
  align = 'end'
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const d = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const k = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', d);
    document.addEventListener('keydown', k);
    return () => {
      document.removeEventListener('mousedown', d);
      document.removeEventListener('keydown', k);
    };
  }, [open]);
  return /*#__PURE__*/React.createElement("div", {
    className: "helm-menu",
    ref: ref
  }, trigger ? /*#__PURE__*/React.createElement("span", {
    onClick: () => setOpen(o => !o)
  }, trigger) : /*#__PURE__*/React.createElement(HIconButton, {
    icon: icon,
    label: label,
    onClick: () => setOpen(o => !o)
  }), open && /*#__PURE__*/React.createElement("div", {
    className: 'helm-menu__list helm-menu__list--' + align,
    role: "menu"
  }, items.map((it, i) => it.divider ? /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "helm-menu__divider"
  }) : /*#__PURE__*/React.createElement("button", {
    key: i,
    className: ['helm-menu__item', it.danger && 'helm-menu__item--danger'].filter(Boolean).join(' '),
    disabled: it.disabled,
    onClick: () => {
      setOpen(false);
      it.onClick && it.onClick();
    }
  }, it.icon && /*#__PURE__*/React.createElement("span", {
    className: "helm-menu__item-icon"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: it.icon,
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    className: "helm-menu__item-label"
  }, it.label)))));
}
function HInput({
  iconLeft,
  className = '',
  ...rest
}) {
  const input = /*#__PURE__*/React.createElement("input", _extends({
    className: ['helm-input', iconLeft && 'helm-input--has-icon', className].filter(Boolean).join(' ')
  }, rest));
  return iconLeft ? /*#__PURE__*/React.createElement("span", {
    className: "helm-input-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "helm-input-wrap__icon"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: iconLeft,
    size: 18
  })), input) : input;
}
function HItem({
  title,
  done,
  status,
  meta,
  onToggle,
  onEdit,
  onDelete,
  menuItems,
  dragging,
  showHandle = true,
  showStatus = true
}) {
  const isDone = done || status === 'done';
  const items = menuItems || [onEdit && {
    label: 'Edit',
    icon: 'pencil',
    onClick: onEdit
  }, {
    label: 'Duplicate',
    icon: 'copy'
  }, {
    divider: true
  }, onDelete && {
    label: 'Delete',
    icon: 'trash',
    danger: true,
    onClick: onDelete
  }].filter(Boolean);
  return /*#__PURE__*/React.createElement("div", {
    className: ['helm-item', isDone && 'helm-item--done', dragging && 'helm-item--dragging'].filter(Boolean).join(' ')
  }, showHandle && /*#__PURE__*/React.createElement("span", {
    className: "helm-item__handle",
    role: "button",
    "aria-label": "Reorder",
    tabIndex: 0
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "grip-vertical",
    size: 18
  })), /*#__PURE__*/React.createElement(HCheck, {
    checked: isDone,
    onChange: onToggle,
    "aria-label": title
  }), /*#__PURE__*/React.createElement("div", {
    className: "helm-item__main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "helm-item__title"
  }, title), meta && /*#__PURE__*/React.createElement("span", {
    className: "helm-item__meta"
  }, meta)), /*#__PURE__*/React.createElement("div", {
    className: "helm-item__trail"
  }, showStatus && status && !isDone && /*#__PURE__*/React.createElement(HStatus, {
    status: status
  }), items.length > 0 && /*#__PURE__*/React.createElement(HMenu, {
    items: items,
    label: "Task actions"
  })));
}
Object.assign(window, {
  KitUI: {
    HIcon,
    HButton,
    HIconButton,
    HCheck,
    HProgress,
    HStatus,
    HBadge,
    HTabs,
    HMenu,
    HInput,
    HItem
  }
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/board/kit-ui.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.ChecklistItem = __ds_scope.ChecklistItem;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Status = __ds_scope.Status;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Menu = __ds_scope.Menu;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Card = __ds_scope.Card;

})();
