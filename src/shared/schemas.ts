import { z } from "zod";

// One source of truth for the shapes both the server and the widget use
// (code-standards.md section 2). The server builds these payloads; the widget
// parses them. Defining them once as Zod schemas means the runtime check and
// the TypeScript type can never drift apart.

/** Payload returned by spike_state (the read the widget does on mount). */
export const SpikeState = z.object({
  count: z.number().int().nonnegative(),
});
export type SpikeState = z.infer<typeof SpikeState>;

/** Payload returned by spike_ping (the write the button does). */
export const SpikePing = z.object({
  count: z.number().int().nonnegative(),
  at: z.string(),
});
export type SpikePing = z.infer<typeof SpikePing>;
