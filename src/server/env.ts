import { z } from "zod";

// All environment reading happens here, once, validated (code-standards.md
// section 9). A missing or bad value fails loudly at startup, not later at a
// random call site.
const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
});

export const env = EnvSchema.parse(process.env);
