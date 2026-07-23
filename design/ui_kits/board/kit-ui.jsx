/* Helm UI-kit mini-library — thin React wrappers over the shipped design-system
   CSS classes (helm-*). Visually identical to window.HelmDesignSystem_94b187, inlined
   here so the kit is a standalone, offline-renderable recreation. */
const { useState, useRef, useEffect, useId } = React;

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
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
};
const DOTS = { 'grip-vertical': [[9,5],[9,12],[9,19],[15,5],[15,12],[15,19]], 'more-vertical': [[12,5],[12,12],[12,19]], 'more-horizontal': [[5,12],[12,12],[19,12]] };

function HIcon({ name, size = 20, strokeWidth = 2, style, className = '' }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', className: ('helm-icon ' + className).trim(), style, 'aria-hidden': true };
  if (DOTS[name]) return <svg {...common} fill="currentColor" stroke="none">{DOTS[name].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="1.25"/>)}</svg>;
  return <svg {...common} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: ICON[name] || ICON.target}} />;
}

const IZ = { sm: 16, md: 18, lg: 20 };
function HButton({ children, variant='primary', size='md', iconLeft, iconRight, loading, block, className='', ...rest }) {
  const cls = ['helm-btn', 'helm-btn--'+variant, size!=='md'&&'helm-btn--'+size, block&&'helm-btn--block', loading&&'is-loading', className].filter(Boolean).join(' ');
  return <button className={cls} disabled={rest.disabled||loading} {...rest}>
    {loading && <span className="helm-btn__spinner" />}
    {!loading && iconLeft && <HIcon name={iconLeft} size={IZ[size]} />}
    {children!=null && <span className="helm-btn__label">{children}</span>}
    {iconRight && <HIcon name={iconRight} size={IZ[size]} />}
  </button>;
}
function HIconButton({ icon, label, variant='ghost', size='md', round, className='', ...rest }) {
  const cls = ['helm-iconbtn','helm-iconbtn--'+variant, size!=='md'&&'helm-iconbtn--'+size, round&&'helm-iconbtn--round', className].filter(Boolean).join(' ');
  return <button className={cls} aria-label={label} title={label} {...rest}><HIcon name={icon} size={{sm:16,md:20,lg:22}[size]} /></button>;
}
function HCheck({ checked, onChange, label, disabled, className='', ...rest }) {
  const id = useId();
  return <label className={['helm-check', disabled&&'helm-check--disabled', className].filter(Boolean).join(' ')} htmlFor={id}>
    <input id={id} type="checkbox" className="helm-check__input" checked={checked} onChange={onChange} disabled={disabled} {...rest} />
    <span className="helm-check__box" aria-hidden="true"><HIcon name="check" size={15} strokeWidth={3} /></span>
    {label!=null && <span className="helm-check__label">{label}</span>}
  </label>;
}
function HProgress({ value=0, max=100, label, showValue=true, valueFormat, size='md' }) {
  const pct = max>0 ? Math.max(0,Math.min(100,(value/max)*100)) : 0;
  const complete = pct>=100;
  const disp = valueFormat ? valueFormat(value,max,pct) : Math.round(pct)+'%';
  return <div className={['helm-progress', size!=='md'&&'helm-progress--'+size, complete&&'helm-progress--complete'].filter(Boolean).join(' ')}>
    {(label||showValue) && <div className="helm-progress__head">{label&&<span className="helm-progress__label">{label}</span>}{showValue&&<span className="helm-progress__value">{disp}</span>}</div>}
    <div className="helm-progress__track"><div className="helm-progress__fill" style={{width: pct+'%'}} /></div>
  </div>;
}
const SLABEL = { todo:'Not started', active:'In progress', blocked:'Blocked', done:'Done' };
function HStatus({ status='todo', label, showIcon=true }) {
  return <span className={'helm-status helm-status--'+status}>{status==='done'&&showIcon ? <HIcon name="check" size={12} strokeWidth={3} /> : <span className="helm-status__dot" />}{label ?? SLABEL[status]}</span>;
}
function HBadge({ children, variant='neutral', tone='soft', dot, icon, size='md' }) {
  const cls = ['helm-badge','helm-badge--'+variant, tone==='solid'&&'helm-badge--solid', tone==='outline'&&'helm-badge--outline', size!=='md'&&'helm-badge--'+size].filter(Boolean).join(' ');
  return <span className={cls}>{dot&&<span className="helm-badge__dot"/>}{icon&&<HIcon name={icon} size={12}/>}{children}</span>;
}
function HTabs({ tabs=[], value, onChange, variant='line' }) {
  return <div className={'helm-tabs helm-tabs--'+variant} role="tablist">{tabs.map((t)=>(
    <button key={t.value} role="tab" aria-selected={t.value===value} className="helm-tab" onClick={()=>onChange&&onChange(t.value)}>
      {t.icon&&<HIcon name={t.icon} size={16}/>}{t.label}{t.count!=null&&<span className="helm-tab__count">{t.count}</span>}
    </button>))}</div>;
}
function HMenu({ items=[], trigger, icon='more-vertical', label='Menu', align='end' }) {
  const [open,setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{ if(!open) return; const d=(e)=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); }; const k=(e)=>{ if(e.key==='Escape') setOpen(false); }; document.addEventListener('mousedown',d); document.addEventListener('keydown',k); return ()=>{document.removeEventListener('mousedown',d);document.removeEventListener('keydown',k);}; },[open]);
  return <div className="helm-menu" ref={ref}>
    {trigger ? <span onClick={()=>setOpen(o=>!o)}>{trigger}</span> : <HIconButton icon={icon} label={label} onClick={()=>setOpen(o=>!o)} />}
    {open && <div className={'helm-menu__list helm-menu__list--'+align} role="menu">
      {items.map((it,i)=> it.divider ? <div key={i} className="helm-menu__divider"/> :
        <button key={i} className={['helm-menu__item', it.danger&&'helm-menu__item--danger'].filter(Boolean).join(' ')} disabled={it.disabled} onClick={()=>{ setOpen(false); it.onClick&&it.onClick(); }}>
          {it.icon&&<span className="helm-menu__item-icon"><HIcon name={it.icon} size={16}/></span>}<span className="helm-menu__item-label">{it.label}</span>
        </button>)}
    </div>}
  </div>;
}
function HInput({ iconLeft, className='', ...rest }) {
  const input = <input className={['helm-input', iconLeft&&'helm-input--has-icon', className].filter(Boolean).join(' ')} {...rest} />;
  return iconLeft ? <span className="helm-input-wrap"><span className="helm-input-wrap__icon"><HIcon name={iconLeft} size={18}/></span>{input}</span> : input;
}
function HItem({ title, done, status, meta, onToggle, onEdit, onDelete, menuItems, dragging, showHandle=true, showStatus=true }) {
  const isDone = done || status==='done';
  const items = menuItems || [ onEdit&&{label:'Edit',icon:'pencil',onClick:onEdit}, {label:'Duplicate',icon:'copy'}, {divider:true}, onDelete&&{label:'Delete',icon:'trash',danger:true,onClick:onDelete} ].filter(Boolean);
  return <div className={['helm-item', isDone&&'helm-item--done', dragging&&'helm-item--dragging'].filter(Boolean).join(' ')}>
    {showHandle && <span className="helm-item__handle" role="button" aria-label="Reorder" tabIndex={0}><HIcon name="grip-vertical" size={18}/></span>}
    <HCheck checked={isDone} onChange={onToggle} aria-label={title} />
    <div className="helm-item__main"><span className="helm-item__title">{title}</span>{meta && <span className="helm-item__meta">{meta}</span>}</div>
    <div className="helm-item__trail">{showStatus && status && !isDone && <HStatus status={status} />}{items.length>0 && <HMenu items={items} label="Task actions" />}</div>
  </div>;
}

Object.assign(window, { KitUI: { HIcon, HButton, HIconButton, HCheck, HProgress, HStatus, HBadge, HTabs, HMenu, HInput, HItem } });
