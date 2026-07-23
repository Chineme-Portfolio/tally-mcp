import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env.js";
import * as schema from "./schema.js";

// Module scope singleton, created ONCE at module load. The streamable HTTP
// transport builds a fresh MCP server per request (stateless, spec 0001), so
// the connection must live here, not inside that per request factory; a per
// request client would open and leak a new connection pool on every call
// (spec 0002, the DB client lifecycle rule).
export const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, { schema });
