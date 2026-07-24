import { useApp } from "@modelcontextprotocol/ext-apps/react";
import { useEffect, useRef, useState } from "react";
import {
  BoardState,
  type LaunchItem,
  type LaunchItemStatus,
} from "../../shared/launch.js";
import {
  HBadge,
  HButton,
  HCheck,
  HIcon,
  HIconButton,
  HInput,
  HItem,
  HMenu,
  HProgress,
  HStatus,
  HTabs,
} from "./kit-ui.js";

type Filter = "all" | "open" | "done";

// Reads the board out of a tool result's structured content (the pull model:
// the widget calls a tool, then reads the result).
function readBoard(result: unknown): BoardState | null {
  if (!result || typeof result !== "object") return null;
  const parsed = BoardState.safeParse((result as { structuredContent?: unknown }).structuredContent);
  return parsed.success ? parsed.data : null;
}

// Pulls the shipped item count out of a launch_board_ship result (its run key).
function readShipCount(result: unknown): number {
  const sc = (result as { structuredContent?: { run?: { itemCount?: number } } })?.structuredContent;
  return sc?.run?.itemCount ?? 0;
}

function initialTheme(): "light" | "dark" {
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function App() {
  const { app, error } = useApp({
    appInfo: { name: "Helm launch board", version: "0.1.0" },
    capabilities: {},
  });

  const [items, setItems] = useState<LaunchItem[]>([]);
  const [readiness, setReadiness] = useState(0);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("connecting");
  const [filter, setFilter] = useState<Filter>("all");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const dragId = useRef<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [themeState, setThemeState] = useState<"light" | "dark">(initialTheme);
  const [confirming, setConfirming] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [shipped, setShipped] = useState(false);
  const confirmTimer = useRef<number | null>(null);

  // Applies a board returned by any tool.
  function apply(board: BoardState | null) {
    if (!board) return;
    setItems(board.items);
    setReadiness(board.readiness);
  }

  // The tool call helper. Returns the board from the result, or null.
  async function call(name: string, args: Record<string, unknown> = {}) {
    if (!app) return null;
    try {
      const result = await app.callServerTool({ name, arguments: args });
      const board = readBoard(result);
      apply(board);
      return board;
    } catch (e) {
      setStatus(`error: ${String(e)}`);
      return null;
    }
  }

  // On mount: fetch the board (launch_status is the structured read).
  useEffect(() => {
    if (!app) return;
    let cancelled = false;
    void (async () => {
      const board = await call("launch_status");
      if (!cancelled) {
        if (board) setReady(true);
        setStatus("ready");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app]);

  const done = items.filter((t) => t.status === "done").length;
  const complete = items.length > 0 && done === items.length;
  const shown = items.filter((t) =>
    filter === "all" ? true : filter === "open" ? t.status !== "done" : t.status === "done",
  );

  // If the board stops being complete mid-confirm (a task un-ticked between the
  // two clicks), drop the confirm state so no button lingers below 100 percent.
  useEffect(() => {
    if (!complete && confirming) cancelConfirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, confirming]);

  function toggle(item: LaunchItem) {
    void call("launch_item_set_status", {
      id: item.id,
      status: item.status === "done" ? "todo" : "done",
    });
  }
  function setItemStatus(id: string, next: LaunchItemStatus) {
    void call("launch_item_set_status", { id, status: next });
  }
  function remove(id: string) {
    void call("launch_item_delete", { id });
  }
  function add() {
    const title = draft.trim();
    if (!title) return;
    setDraft("");
    void call("launch_item_add", { title });
  }
  function saveEdit(id: string) {
    const title = editDraft.trim();
    setEditingId(null);
    if (title) void call("launch_item_edit", { id, title });
  }

  // Optimistic drag reorder in local state; persist on drop.
  function reorderLocal(overId: string) {
    const from = dragId.current;
    if (from == null || from === overId) return;
    setItems((ts) => {
      const a = [...ts];
      const fi = a.findIndex((t) => t.id === from);
      const ti = a.findIndex((t) => t.id === overId);
      if (fi < 0 || ti < 0) return ts;
      const [m] = a.splice(fi, 1);
      if (m) a.splice(ti, 0, m);
      return a;
    });
  }
  function persistOrder() {
    void call("launch_item_reorder", { orderedIds: items.map((t) => t.id) });
  }

  // Ship: a two step confirm, then archive and clear.
  function clearConfirmTimer() {
    if (confirmTimer.current !== null) {
      window.clearTimeout(confirmTimer.current);
      confirmTimer.current = null;
    }
  }
  function startConfirm() {
    setConfirming(true);
    clearConfirmTimer();
    confirmTimer.current = window.setTimeout(() => setConfirming(false), 5000);
  }
  function cancelConfirm() {
    clearConfirmTimer();
    setConfirming(false);
  }

  // Best effort: tell Claude the launch shipped. A host that does not support
  // messages, or rejects it, must never break or undo the ship.
  async function tellClaude(count: number) {
    if (!app) return;
    try {
      if (!app.getHostCapabilities()?.message?.text) return;
      const noun = count === 1 ? "task" : "tasks";
      await app.sendMessage({
        role: "user",
        content: [{ type: "text", text: `Shipped. ${count} ${noun} done, board's green.` }],
      });
    } catch {
      // swallow: the ship already committed
    }
  }

  async function ship() {
    if (!app || shipping) return;
    cancelConfirm();
    setShipping(true);
    try {
      const result = await app.callServerTool({ name: "launch_board_ship", arguments: {} });
      const board = readBoard(result);
      const count = readShipCount(result);
      if (board) {
        apply(board);
      } else {
        await call("launch_status"); // could not parse the result; reload the truth
      }
      setShipped(true);
      window.setTimeout(() => setShipped(false), 4000);
      void tellClaude(count);
    } catch (e) {
      // The server may have committed before the response was lost, so never
      // trust local state here; reload from the server.
      setStatus(`ship failed: ${String(e)}`);
      await call("launch_status");
    } finally {
      setShipping(false);
    }
  }

  return (
    <div className="hw" data-theme={themeState}>
      <header className="hw__head">
        <div className="hw__brand">
          <span className="hw__mark">Helm<span className="hw__dot">.</span></span>
          <span className="hw__sep" />
          <span className="hw__title">Launch readiness</span>
        </div>
        <div className="hw__tools">
          <HIconButton
            icon={themeState === "dark" ? "sun" : "moon"}
            label="Toggle theme"
            size="sm"
            onClick={() => setThemeState((t) => (t === "dark" ? "light" : "dark"))}
          />
          <HMenu
            label="Board menu"
            items={[
              { label: "Reset board", icon: "database", onClick: () => void call("launch_board_reset") },
            ]}
          />
        </div>
      </header>

      <div className="hw__meter">
        <HProgress
          label={complete ? "Ready to ship" : "Launch readiness"}
          value={done}
          max={Math.max(items.length, 1)}
          valueFormat={(v) => `${v} / ${items.length}`}
          size="lg"
        />
      </div>

      <div className="hw__controls">
        <HTabs<Filter>
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: "all", label: "All", count: items.length },
            { value: "open", label: "Open", count: items.length - done },
            { value: "done", label: "Done", count: done },
          ]}
        />
      </div>

      <div className="hw__list">
        {shown.map((t) => (
          <div
            key={t.id}
            className="hw__row"
            draggable={editingId !== t.id}
            onDragStart={() => {
              dragId.current = t.id;
              setDragging(t.id);
            }}
            onDragEnter={() => reorderLocal(t.id)}
            onDragEnd={() => {
              dragId.current = null;
              setDragging(null);
              persistOrder();
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {editingId === t.id
              ? (
                <div className="hw__add">
                  <HInput
                    autoFocus
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(t.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <HButton variant="tinted" onClick={() => saveEdit(t.id)}>Save</HButton>
                </div>
              )
              : (
                <HItem
                  title={t.title}
                  status={t.status}
                  done={t.status === "done"}
                  dragging={dragging === t.id}
                  onToggle={() => toggle(t)}
                  menuItems={[
                    { label: "Edit", icon: "pencil", onClick: () => { setEditingId(t.id); setEditDraft(t.title); } },
                    { label: "Mark active", onClick: () => setItemStatus(t.id, "active") },
                    { label: "Mark blocked", onClick: () => setItemStatus(t.id, "blocked") },
                    { label: "Reset to todo", onClick: () => setItemStatus(t.id, "todo") },
                    { divider: true },
                    { label: "Delete", icon: "trash", danger: true, onClick: () => remove(t.id) },
                  ]}
                />
              )}
          </div>
        ))}
        {ready && shown.length === 0 && (
          <div className="hw__empty">Nothing here yet. Add the first task and let's get moving.</div>
        )}
      </div>

      <div className="hw__add">
        <HInput
          iconLeft="plus"
          placeholder="Add a task…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
        />
        <HButton variant="tinted" onClick={add}>Add</HButton>
      </div>

      <footer className="hw__foot">
        {shipped ? (
          <span className="hw__count">
            <HBadge variant="success" icon="check">Shipped, board's green</HBadge>
          </span>
        ) : complete ? (
          <>
            <span className="hw__count">
              <HBadge variant="success" icon="rocket">Go for launch</HBadge>
            </span>
            <HButton
              variant={confirming ? "danger" : "primary"}
              iconLeft="rocket"
              disabled={shipping}
              onClick={() => (confirming ? void ship() : startConfirm())}
              onBlur={cancelConfirm}
            >
              {shipping ? "Shipping…" : confirming ? "Confirm ship" : "Ship it"}
            </HButton>
          </>
        ) : (
          <span className="hw__count">
            {error
              ? "Could not reach the host"
              : items.length === 0
                ? status
                : `${items.length - done} to go before launch`}
          </span>
        )}
      </footer>
    </div>
  );
}
