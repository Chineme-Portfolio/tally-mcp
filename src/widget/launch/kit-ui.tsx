import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

// Ported from the design system (design/ui_kits/board/kit-ui.jsx): thin React
// wrappers over the shipped helm-* CSS classes. Copied here as .tsx (not loaded
// from the global bundle) so the widget is one self contained file
// (ui-registry.md port contract).

type IconName =
  | "check" | "plus" | "minus" | "x" | "chevron-down" | "chevron-right"
  | "arrow-right" | "arrow-up-right" | "search" | "pencil" | "trash" | "copy"
  | "check-circle" | "alert-circle" | "target" | "flag" | "anchor" | "clock"
  | "rocket" | "terminal" | "database" | "external-link" | "settings" | "sun"
  | "moon" | "grip-vertical" | "more-vertical" | "more-horizontal";

const ICON: Partial<Record<IconName, string>> = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash:
    '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  copy:
    '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  anchor:
    '<circle cx="12" cy="5" r="3"/><line x1="12" x2="12" y1="22" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  rocket:
    '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
};
const DOTS: Partial<Record<IconName, Array<[number, number]>>> = {
  "grip-vertical": [[9, 5], [9, 12], [9, 19], [15, 5], [15, 12], [15, 19]],
  "more-vertical": [[12, 5], [12, 12], [12, 19]],
};

export function HIcon({
  name,
  size = 20,
  strokeWidth = 2,
  className = "",
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    className: ("helm-icon " + className).trim(),
    "aria-hidden": true,
  } as const;
  const dots = DOTS[name];
  if (dots) {
    return (
      <svg {...common} fill="currentColor" stroke="none">
        {dots.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="1.25" />)}
      </svg>
    );
  }
  return (
    <svg
      {...common}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: ICON[name] ?? "" }}
    />
  );
}

type BtnVariant = "primary" | "secondary" | "ghost" | "tinted" | "danger";
type Size = "sm" | "md" | "lg";
const IZ: Record<Size, number> = { sm: 16, md: 18, lg: 20 };

export function HButton({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: Size;
  iconLeft?: IconName;
  iconRight?: IconName;
}) {
  const cls = [
    "helm-btn",
    "helm-btn--" + variant,
    size !== "md" && "helm-btn--" + size,
    className,
  ].filter(Boolean).join(" ");
  return (
    <button className={cls} {...rest}>
      {iconLeft && <HIcon name={iconLeft} size={IZ[size]} />}
      {children != null && <span className="helm-btn__label">{children}</span>}
      {iconRight && <HIcon name={iconRight} size={IZ[size]} />}
    </button>
  );
}

export function HIconButton({
  icon,
  label,
  size = "md",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName;
  label: string;
  size?: Size;
}) {
  const cls = ["helm-iconbtn", "helm-iconbtn--ghost", size !== "md" && "helm-iconbtn--" + size, className]
    .filter(Boolean).join(" ");
  return (
    <button className={cls} aria-label={label} title={label} {...rest}>
      <HIcon name={icon} size={{ sm: 16, md: 20, lg: 22 }[size]} />
    </button>
  );
}

export function HCheck({
  checked,
  onChange,
  label,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode }) {
  const id = useId();
  return (
    <label className="helm-check" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="helm-check__input"
        checked={checked}
        onChange={onChange}
        {...rest}
      />
      <span className="helm-check__box" aria-hidden="true">
        <HIcon name="check" size={15} strokeWidth={3} />
      </span>
      {label != null && <span className="helm-check__label">{label}</span>}
    </label>
  );
}

export function HProgress({
  value = 0,
  max = 100,
  label,
  showValue = true,
  valueFormat,
  size = "md",
}: {
  value?: number;
  max?: number;
  label?: ReactNode;
  showValue?: boolean;
  valueFormat?: (value: number, max: number, pct: number) => ReactNode;
  size?: Size;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const complete = pct >= 100;
  const disp = valueFormat ? valueFormat(value, max, pct) : Math.round(pct) + "%";
  const cls = [
    "helm-progress",
    size !== "md" && "helm-progress--" + size,
    complete && "helm-progress--complete",
  ].filter(Boolean).join(" ");
  return (
    <div className={cls}>
      {(label || showValue) && (
        <div className="helm-progress__head">
          {label && <span className="helm-progress__label">{label}</span>}
          {showValue && <span className="helm-progress__value">{disp}</span>}
        </div>
      )}
      <div className="helm-progress__track">
        <div className="helm-progress__fill" style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}

type StatusValue = "todo" | "active" | "blocked" | "done";
const SLABEL: Record<StatusValue, string> = {
  todo: "Not started",
  active: "In progress",
  blocked: "Blocked",
  done: "Done",
};
export function HStatus({
  status = "todo",
  label,
  showIcon = true,
}: {
  status?: StatusValue;
  label?: ReactNode;
  showIcon?: boolean;
}) {
  return (
    <span className={"helm-status helm-status--" + status}>
      {status === "done" && showIcon
        ? <HIcon name="check" size={12} strokeWidth={3} />
        : <span className="helm-status__dot" />}
      {label ?? SLABEL[status]}
    </span>
  );
}

export function HTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ value: T; label: ReactNode; count?: number }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="helm-tabs helm-tabs--pill" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={t.value === value}
          className="helm-tab"
          onClick={() => onChange(t.value)}
        >
          {t.label}
          {t.count != null && <span className="helm-tab__count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export interface MenuItem {
  label?: string;
  icon?: IconName;
  danger?: boolean;
  divider?: boolean;
  onClick?: () => void;
}
export function HMenu({ items, label = "Menu" }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const d = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", d);
    document.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("mousedown", d);
      document.removeEventListener("keydown", k);
    };
  }, [open]);
  return (
    <div className="helm-menu" ref={ref}>
      <HIconButton icon="more-vertical" label={label} onClick={() => setOpen((o) => !o)} />
      {open && (
        <div className="helm-menu__list helm-menu__list--end" role="menu">
          {items.map((it, i) =>
            it.divider
              ? <div key={i} className="helm-menu__divider" />
              : (
                <button
                  key={i}
                  className={["helm-menu__item", it.danger && "helm-menu__item--danger"]
                    .filter(Boolean).join(" ")}
                  onClick={() => {
                    setOpen(false);
                    it.onClick?.();
                  }}
                >
                  {it.icon && (
                    <span className="helm-menu__item-icon"><HIcon name={it.icon} size={16} /></span>
                  )}
                  <span className="helm-menu__item-label">{it.label}</span>
                </button>
              ),
          )}
        </div>
      )}
    </div>
  );
}

export function HInput({
  iconLeft,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { iconLeft?: IconName }) {
  const input = (
    <input
      className={["helm-input", iconLeft && "helm-input--has-icon", className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
  return iconLeft
    ? (
      <span className="helm-input-wrap">
        <span className="helm-input-wrap__icon"><HIcon name={iconLeft} size={18} /></span>
        {input}
      </span>
    )
    : input;
}

export function HItem({
  title,
  done,
  status,
  meta,
  onToggle,
  menuItems,
  dragging,
  showStatus = true,
}: {
  title: ReactNode;
  done?: boolean;
  status?: StatusValue;
  meta?: ReactNode;
  onToggle?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  menuItems?: MenuItem[];
  dragging?: boolean;
  showStatus?: boolean;
}) {
  const isDone = done || status === "done";
  return (
    <div
      className={["helm-item", isDone && "helm-item--done", dragging && "helm-item--dragging"]
        .filter(Boolean).join(" ")}
    >
      <span className="helm-item__handle" role="button" aria-label="Reorder" tabIndex={0}>
        <HIcon name="grip-vertical" size={18} />
      </span>
      <HCheck checked={isDone} onChange={onToggle} aria-label={typeof title === "string" ? title : "task"} />
      <div className="helm-item__main">
        <span className="helm-item__title">{title}</span>
        {meta && <span className="helm-item__meta">{meta}</span>}
      </div>
      <div className="helm-item__trail">
        {showStatus && status && !isDone && <HStatus status={status} />}
        {menuItems && menuItems.length > 0 && <HMenu items={menuItems} label="Task actions" />}
      </div>
    </div>
  );
}
