// In memory state for the render spike. No database this slice (spec 0001).
//
// This lives at module scope on purpose. The streamable HTTP transport runs in
// stateless mode, so it builds a fresh MCP server for every request; if the
// counter lived inside that per request server it would reset on every call.
// At module scope it persists for the life of the Node process (and resets on
// restart, which is fine for a spike).

let count = 0;

export function getCount(): number {
  return count;
}

export function increment(): number {
  count += 1;
  return count;
}
