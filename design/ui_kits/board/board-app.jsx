const { HIcon, HButton, HIconButton, HCheck, HProgress, HStatus, HBadge, HTabs, HMenu, HInput, HItem } = window.KitUI;
const { useState, useRef } = React;

const INITIAL = [
  { id: 1, title: 'Provision Postgres + run schema migrations', status: 'done', done: true },
  { id: 2, title: 'Wire MCP tools → widget render bridge', status: 'active' },
  { id: 3, title: 'Add OAuth + per-user boards', status: 'active' },
  { id: 4, title: 'Handle optimistic check / reorder writes', status: 'blocked' },
  { id: 5, title: 'Ship the self-host Docker image', status: 'todo' },
];

function Widget({ theme, onToggleTheme }) {
  const [tasks, setTasks] = useState(INITIAL);
  const [filter, setFilter] = useState('all');
  const [draft, setDraft] = useState('');
  const dragId = useRef(null);
  const [dragging, setDragging] = useState(null);

  const done = tasks.filter((t) => t.done).length;
  const complete = tasks.length > 0 && done === tasks.length;
  const shown = tasks.filter((t) => (filter === 'all' ? true : filter === 'open' ? !t.done : t.done));

  const toggle = (id) => setTasks((ts) => ts.map((t) => t.id === id
    ? { ...t, done: !t.done, status: !t.done ? 'done' : (t.status === 'done' ? 'active' : t.status) }
    : t));
  const remove = (id) => setTasks((ts) => ts.filter((t) => t.id !== id));
  const add = () => { const v = draft.trim(); if (!v) return; setTasks((ts) => [...ts, { id: Date.now(), title: v, status: 'todo' }]); setDraft(''); };
  const reorder = (overId) => {
    const from = dragId.current;
    if (from == null || from === overId) return;
    setTasks((ts) => { const a = [...ts]; const fi = a.findIndex((t) => t.id === from); const ti = a.findIndex((t) => t.id === overId); const [m] = a.splice(fi, 1); a.splice(ti, 0, m); return a; });
  };

  const metaFor = (t) => {
    if (t.done) return null;
    if (t.status === 'active') return <><span className="helm-item__meta-item"><HIcon name="anchor" size={13} />infra</span><span className="helm-item__meta-item"><HIcon name="clock" size={13} />due Fri</span></>;
    if (t.status === 'blocked') return <span className="helm-item__meta-item">blocked on review</span>;
    return null;
  };

  return (
    <div className="hw" data-theme={theme}>
      <header className="hw__head">
        <div className="hw__brand">
          <span className="hw__mark">Helm<span className="hw__dot">.</span></span>
          <span className="hw__sep" />
          <span className="hw__title">Launch readiness</span>
        </div>
        <div className="hw__tools">
          <HIconButton icon={theme === 'dark' ? 'sun' : 'moon'} label="Toggle theme" size="sm" onClick={onToggleTheme} />
          <HMenu label="Board menu" align="end" items={[
            { label: 'Rename board', icon: 'pencil' },
            { label: 'Duplicate', icon: 'copy' },
            { label: 'Connect Postgres', icon: 'database' },
            { divider: true },
            { label: 'Delete board', icon: 'trash', danger: true },
          ]} />
        </div>
      </header>

      <div className="hw__meter">
        <HProgress label={complete ? 'Ready to ship' : 'Launch readiness'} value={done} max={tasks.length} valueFormat={(v, m) => `${v} / ${m}`} size="lg" />
      </div>

      <div className="hw__controls">
        <HTabs variant="pill" value={filter} onChange={setFilter} tabs={[
          { value: 'all', label: 'All', count: tasks.length },
          { value: 'open', label: 'Open', count: tasks.length - done },
          { value: 'done', label: 'Done', count: done },
        ]} />
      </div>

      <div className="hw__list">
        {shown.map((t) => (
          <div key={t.id} className="hw__row" draggable
            onDragStart={() => { dragId.current = t.id; setDragging(t.id); }}
            onDragEnter={() => reorder(t.id)}
            onDragEnd={() => { dragId.current = null; setDragging(null); }}
            onDragOver={(e) => e.preventDefault()}>
            <HItem title={t.title} status={t.status} done={t.done} dragging={dragging === t.id}
              onToggle={() => toggle(t.id)} onEdit={() => {}} onDelete={() => remove(t.id)} meta={metaFor(t)} />
          </div>
        ))}
        {shown.length === 0 && <div className="hw__empty">Nothing here — you're all clear.</div>}
      </div>

      <div className="hw__add">
        <HInput iconLeft="plus" placeholder="Add a task…" value={draft}
          onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
        <HButton variant="tinted" onClick={add}>Add</HButton>
      </div>

      <footer className="hw__foot">
        <span className="hw__count">{complete ? 'All tasks complete — go for launch.' : `${tasks.length - done} to go before launch`}</span>
        <HButton variant="primary" iconLeft="rocket" disabled={!complete}>{complete ? 'Ship it' : 'Not ready'}</HButton>
      </footer>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState('light');
  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return (
    <div className="stage" data-theme={theme}>
      <div className="host">
        <div className="host__bar">
          <span className="host__dot" /><span className="host__dot" /><span className="host__dot" />
          <span className="host__label">Assistant chat · MCP Apps widget</span>
          <button className="host__theme" onClick={toggle}><HIcon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />{theme === 'dark' ? 'Light' : 'Dark'}</button>
        </div>
        <div className="host__thread">
          <div className="msg msg--user"><div className="bubble">Set up a launch-readiness board for the Helm rollout.</div></div>
          <div className="msg msg--assistant">
            <span className="avatar" />
            <div className="assistant__body">
              <p className="assistant__say">Here's your board — check things off as you go and I'll keep the Postgres copy in sync. Drag to reorder; add tasks inline.</p>
              <Widget theme={theme} onToggleTheme={toggle} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { App });
