import app from "./app";
import { env } from "./config/env";
import { pool } from "./drizzle/db";

const server = app.listen(env.PORT, () => {
  console.log("NODE_ENV:", env.NODE_ENV, "PORT:", env.PORT);
});

export const handleShutdown = (signal: string): Promise<void> => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  return new Promise((resolve) => {
    server.close(async () => {
      console.log("HTTP server closed.");
      try {
        await pool.end();
        console.log("Database connection pool closed.");
        resolve();
        process.exit(0);
      } catch (err) {
        console.error("Error during pool shutdown:", err);
        resolve();
        process.exit(1);
      }
    });
  });
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

export default server;
