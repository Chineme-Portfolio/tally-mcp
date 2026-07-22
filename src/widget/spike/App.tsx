import { type CSSProperties, useEffect, useState } from "react";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import { SpikePing, SpikeState } from "../../shared/schemas";

// Pulls the count out of whatever the host hands back for a tool call. We accept
// either the structured content or the text payload, whichever is present, so a
// small difference in the host's result shape does not break the spike.
function readCount(result: unknown): number | null {
  if (!result || typeof result !== "object") return null;
  const r = result as {
    structuredContent?: unknown;
    content?: Array<{ type?: string; text?: string }>;
  };

  const structured =
    SpikeState.safeParse(r.structuredContent).data ??
    SpikePing.safeParse(r.structuredContent).data;
  if (structured) return structured.count;

  const text = r.content?.find((c) => c.type === "text")?.text;
  if (text) {
    try {
      const parsed: unknown = JSON.parse(text);
      const fromText =
        SpikeState.safeParse(parsed).data ?? SpikePing.safeParse(parsed).data;
      if (fromText) return fromText.count;
    } catch {
      // Not JSON, fall through to null.
    }
  }
  return null;
}

export function App() {
  const [count, setCount] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("connecting");

  const { app, error } = useApp({
    appInfo: { name: "Helm render spike", version: "0.1.0" },
    capabilities: {},
  });

  // Once the bridge is ready, read the current count (the pull model, AC-2).
  useEffect(() => {
    if (!app) return;
    let cancelled = false;
    void (async () => {
      try {
        const result = await app.callServerTool({
          name: "spike_state",
          arguments: {},
        });
        if (!cancelled) {
          setCount(readCount(result));
          setStatus("ready");
        }
      } catch (e) {
        if (!cancelled) setStatus(`could not read state: ${String(e)}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [app]);

  // The button calls the app only write tool (AC-3).
  async function onPing() {
    if (!app) return;
    try {
      const result = await app.callServerTool({
        name: "spike_ping",
        arguments: {},
      });
      setCount(readCount(result));
    } catch (e) {
      setStatus(`ping failed: ${String(e)}`);
    }
  }

  if (error) {
    return <main style={styles.main}>Bridge error: {String(error)}</main>;
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.title}>Helm render spike</h1>
      <p style={styles.sub}>
        If you can read this inside Claude, the widget renders.
      </p>
      <div style={styles.countRow}>
        <span style={styles.countLabel}>count</span>
        <span style={styles.count}>{count === null ? "…" : count}</span>
      </div>
      <button style={styles.button} onClick={onPing} disabled={!app}>
        Ping the server
      </button>
      <p style={styles.status}>{status}</p>
    </main>
  );
}

// Neutral placeholder styling only. The real design system (the UI trio) is
// PENDING the Claude Design export, so these inline styles are written to be
// ripped out and replaced by tokens (code-standards.md section 7).
const styles: Record<string, CSSProperties> = {
  main: {
    fontFamily: "system-ui, sans-serif",
    padding: "20px",
    maxWidth: "360px",
    color: "#1a1a1a",
  },
  title: { fontSize: "18px", margin: "0 0 4px" },
  sub: { fontSize: "13px", color: "#666", margin: "0 0 16px" },
  countRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    margin: "0 0 16px",
  },
  countLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#888",
  },
  count: { fontSize: "40px", fontWeight: 700, fontVariantNumeric: "tabular-nums" },
  button: {
    fontSize: "14px",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "#fafafa",
    cursor: "pointer",
  },
  status: { fontSize: "11px", color: "#999", marginTop: "12px" },
};
