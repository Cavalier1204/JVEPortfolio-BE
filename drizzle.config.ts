import { env } from "./src/config/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "./src/drizzle",
  schema: "./src/drizzle/schema.ts",
  dbCredentials: {
    host: env.DB.HOST!,
    port: Number(env.DB.PORT!),
    user: env.DB.USERNAME!,
    password: env.DB.PASSWORD!,
    database: env.DB.NAME!,
    ssl: false,
  },
  verbose: true,
  strict: true,
});
