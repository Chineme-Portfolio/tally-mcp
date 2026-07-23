import "dotenv/config";
import { z } from "zod";

// All environment reading happens here, once, validated (code-standards.md
// section 9). A missing or bad value fails loudly at startup, not later at a
// random call site. dotenv loads a local .env if present (dev); on Railway the
// vars are injected and dotenv is a no op.
const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  // The single user in v1. The seed inserts a users row with this exact id, so
  // resolveUserId() and the seeded row are the same value by construction.
  DEFAULT_USER_ID: z.string().uuid("DEFAULT_USER_ID must be a uuid"),
});

export const env = EnvSchema.parse(process.env);
