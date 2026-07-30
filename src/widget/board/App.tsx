import { useApp } from "@modelcontextprotocol/ext-apps/react";
import { useEffect, useRef, useState } from "react";
import {
  BoardMutation,
  type BoardItem,
  type BoardItemStatus,
  type BoardSummary,
  BoardView,
  ShipResult,
} from "../../shared/board.js";
import {
  HBadge,
  HButton,
  HIcon,
  HIconButton,
  HInput,
  HItem,
  HMenu,
  HProgress,
  HTabs,
} from "./kit-ui.js";

type Filter = "all" | "open" | "done";

// Reads a full board view (current board + tabs + items) out of a tool result's
// structured content. Used for the mount fetch and any board level change.
function readView(result: unknown): BoardView | null {
  const sc = (result as { structuredContent?: unknown })?.structuredContent;
  const p = BoardView.safeParse(sc);
  return p.success ? p.data : null;
}

// Reads an item mutation result (the current board's new items, no tab set).
function readMutation(result: unknown): BoardMutation | null {
  const sc = (result as { structuredContent?: unknown })?.structuredContent;
  const p = BoardMutation.safeParse(sc);
  return p.success ? p.data : null;
}

function readShip(result: unknown): ShipResult | null {
  const sc = (result as { structuredContent?: unknown })?.structuredContent;
  const p = ShipResult.safeParse(sc);
  return p.success ? p.data : null;
}

function initialTheme(): "light" | "dark" {
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function App() {
  const { app, error } = useApp({
    appInfo: { name: "Tally board", version: "0.1.0" },
    capabilities: {},
  });

  // Board level state: every board (the tabs) and which one is current.
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  // Current board's items + readiness.
  const [items, setItems] = useState<BoardItem[]>([]);
  const [readiness, setReadiness] = useState(0);

  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("connecting");
  // True when the session looks expired and the connector needs reconnecting.
  const [expired, setExpired] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [addingBoard, setAddingBoard] = useState(false);
  const [boardDraft, setBoardDraft] = useState("");
  const dragId = useRef<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [themeState, setThemeState] = useState<"light" | "dark">(initialTheme);
  const [confirming, setConfirming] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [shipped, setShipped] = useState(false);
  const confirmTimer = useRef<number | null>(null);

  const currentName = boards.find((b) => b.id === currentId)?.name ?? "";

  // A board level result (mount, switch, create, rename, delete): replace the
  // tab set, the current board, and its items wholesale.
  function applyView(view: BoardView | null) {
    if (!view) return;
    setBoards(view.boards);
    setCurrentId(view.board.id);
    setItems(view.items);
    setReadiness(view.readiness);
  }

  // An item mutation result: update the current board's items, and refresh only
  // the current tab's count and readiness from the same payload (so tabs never
  // go stale, without shipping the whole tab set on every item write).
  function applyMutation(m: BoardMutation | null) {
    if (!m) return;
    setItems(m.items);
    setReadiness(m.readiness);
    const done = m.items.filter((i) => i.status === "done").length;
    setBoards((bs) =>
      bs.map((b) =>
        b.id === m.board.id
          ? { ...b, itemCount: m.items.length, readiness: m.readiness, name: m.board.name }
          : b,
      ),
    );
    void done;
  }

  // Access tokens expire (about an hour) and hosts do not reliably refresh them
  // mid conversation, so a tool call can start failing part way through a
  // session. Whether the host bridge tells widget code that the failure was an
  // auth failure is a host detail we cannot rely on, so this sniffs the error
  // text and falls back to a generic reconnect message when it cannot tell.
  // Either way the board never just sits there looking empty (spec 0005 AC-8).
  function looksLikeAuthFailure(e: unknown): boolean {
    const text = String(e).toLowerCase();
    return (
      text.includes("401") ||
      text.includes("unauthorized") ||
      text.includes("unauthenticated") ||
      text.includes("authentication") ||
      text.includes("invalid_token") ||
      text.includes("expired")
    );
  }

  function reportError(e: unknown) {
    if (looksLikeAuthFailure(e)) {
      setExpired(true);
      setStatus("session expired");
    } else {
      setStatus(`error: ${String(e)}`);
    }
  }

  async function callView(name: string, args: Record<string, unknown> = {}) {
    if (!app) return null;
    try {
      const view = readView(await app.callServerTool({ name, arguments: args }));
      applyView(view);
      setExpired(false);
      return view;
    } catch (e) {
      reportError(e);
      return null;
    }
  }

  async function callMutation(name: string, args: Record<string, unknown> = {}) {
    if (!app) return null;
    try {
      const m = readMutation(await app.callServerTool({ name, arguments: args }));
      applyMutation(m);
      setExpired(false);
      return m;
    } catch (e) {
      reportError(e);
      return null;
    }
  }

  // On mount: fetch the current board and the tab set (board_status).
  useEffect(() => {
    if (!app) return;
    let cancelled = false;
    void (async () => {
      const view = await callView("board_status");
      if (!cancelled) {
        if (view) setReady(true);
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

  useEffect(() => {
    if (!complete && confirming) cancelConfirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, confirming]);

  // ---- Board switching / creating ----
  function switchBoard(id: string) {
    if (id === currentId) return;
    const b = boards.find((x) => x.id === id);
    if (b) void callView("board_switch", { name: b.name });
  }
  async function createBoard() {
    const name = boardDraft.trim();
    if (!name) return;
    const view = await callView("board_create", { name });
    if (view) {
      setBoardDraft("");
      setAddingBoard(false);
    }
  }

  // ---- Item actions (on the current board) ----
  function toggle(item: BoardItem) {
    void callMutation("board_item_set_status", {
      id: item.id,
      status: item.status === "done" ? "todo" : "done",
    });
  }
  function setItemStatus(id: string, next: BoardItemStatus) {
    void callMutation("board_item_set_status", { id, status: next });
  }
  function remove(id: string) {
    void callMutation("board_item_delete", { id });
  }
  function add() {
    const title = draft.trim();
    if (!title) return;
    setDraft("");
    void callMutation("board_item_add", { title });
  }
  function saveEdit(id: string) {
    const title = editDraft.trim();
    setEditingId(null);
    if (title) void callMutation("board_item_edit", { id, title });
  }

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
    void callMutation("board_item_reorder", { orderedIds: items.map((t) => t.id) });
  }

  // ---- Ship (two step confirm) ----
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

  // Best effort: tell Claude the board shipped. A host that does not support
  // messages, or rejects it, must never break or undo the ship.
  async function tellClaude(name: string, count: number) {
    if (!app) return;
    try {
      if (!app.getHostCapabilities()?.message?.text) return;
      const noun = count === 1 ? "task" : "tasks";
      await app.sendMessage({
        role: "user",
        content: [{ type: "text", text: `Shipped "${name}". ${count} ${noun} done, board's clear.` }],
      });
    } catch {
      // swallow: the ship already committed
    }
  }

  async function ship() {
    if (!app || shipping) return;
    cancelConfirm();
    setShipping(true);
    const name = currentName;
    try {
      const result = await app.callServerTool({ name: "board_ship", arguments: {} });
      const parsed = readShip(result);
      if (parsed) {
        // board stays, now empty; refresh its tab too.
        setItems(parsed.items);
        setReadiness(parsed.readiness);
        setBoards((bs) =>
          bs.map((b) =>
            b.id === parsed.board.id ? { ...b, itemCount: 0, readiness: 0 } : b,
          ),
        );
        setShipped(true);
        window.setTimeout(() => setShipped(false), 4000);
        void tellClaude(parsed.board.name, parsed.run.itemCount);
      } else {
        await callView("board_status"); // could not parse; reload the truth
      }
    } catch (e) {
      // The server may have committed before the response was lost, so never
      // trust local state here; reload from the server.
      setStatus(`ship failed: ${String(e)}`);
      await callView("board_status");
    } finally {
      setShipping(false);
    }
  }

  return (
    <div className="hw" data-theme={themeState}>
      <header className="hw__head">
        <div className="hw__brand">
          <span className="hw__mark">Tally<span className="hw__dot">.</span></span>
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
              { label: "Reset board", icon: "database", onClick: () => void callMutation("board_reset") },
            ]}
          />
        </div>
      </header>

      {/* Board switcher: a tab per board (current highlighted), plus a new board
          affordance. Distinct from the All/Open/Done filter below the meter. */}
      <div className="hw__boards">
        {boards.length > 0 && (
          <HTabs<string>
            value={currentId ?? ""}
            onChange={switchBoard}
            tabs={boards.map((b) => ({ value: b.id, label: b.name, count: b.itemCount }))}
          />
        )}
        {addingBoard ? (
          <div className="hw__newboard">
            <HInput
              autoFocus
              placeholder="Board name…"
              value={boardDraft}
              onChange={(e) => setBoardDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void createBoard();
                if (e.key === "Escape") {
                  setAddingBoard(false);
                  setBoardDraft("");
                }
              }}
            />
            <HButton variant="tinted" size="sm" onClick={() => void createBoard()}>Add</HButton>
          </div>
        ) : (
          <HButton variant="ghost" size="sm" iconLeft="plus" onClick={() => setAddingBoard(true)}>
            New board
          </HButton>
        )}
      </div>

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

      {expired && (
        <div className="hw__expired" role="status">
          <HIcon name="alert-circle" size={16} />
          <span>
            Session expired. Reconnect the Tally connector in your settings to pick up
            where you left off.
          </span>
        </div>
      )}

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
          <div className="hw__empty">Nothing here yet. Add the first item and let's get moving.</div>
        )}
      </div>

      <div className="hw__add">
        <HInput
          iconLeft="plus"
          placeholder="Add an item…"
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
            <HBadge variant="success" icon="check">Shipped, board's clear</HBadge>
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
