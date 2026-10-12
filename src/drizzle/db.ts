import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/env";
import * as schema from "./schema";

export const pool = new Pool({
  host: env.DB.HOST,
  port: env.DB.PORT,
  user: env.DB.USERNAME,
  password: String(env.DB.PASSWORD),
  database: env.DB.NAME,
});

export const client = pool;
export const db = drizzle({ client: pool, schema });
