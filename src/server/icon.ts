import { env } from "./env.js";

/** Where this server is reachable. Used to build absolute urls (the icon), and
 * falls back to localhost when running without a configured public url. */
export function publicBaseUrl(): string {
  return (env.TALLY_RESOURCE_URL ?? `http://localhost:${env.PORT}`).replace(/\/$/, "");
}

/** The Tally mark: tally strokes in Tally Copper, the product's signature
 * colour (design/tokens/colors.css, `--copper-500`). Served as a real file at
 * /icon.svg so a client can fetch it, and declared in the server's icons so a
 * client that renders server icons has one to show. Deliberately simple: it has
 * to stay legible at about 16 pixels in a connector list. */
export const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Tally">
  <rect width="64" height="64" rx="14" fill="#1c1917"/>
  <g stroke="#cf6e45" stroke-width="6" stroke-linecap="round" fill="none">
    <line x1="19" y1="21" x2="19" y2="43"/>
    <line x1="31" y1="21" x2="31" y2="43"/>
    <line x1="43" y1="21" x2="43" y2="43"/>
    <line x1="13" y1="45" x2="49" y2="19"/>
  </g>
</svg>`;
