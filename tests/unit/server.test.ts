import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../../src/drizzle/db", () => ({
  pool: {
    end: vi.fn(),
  },
  db: {},
}));

import { handleShutdown } from "../../src/server";
import { pool } from "../../src/drizzle/db";

describe("Server: Lifecycle & Graceful Shutdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle graceful shutdown successfully upon receiving signal", async () => {
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as any);
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    vi.mocked(pool.end).mockResolvedValue(undefined as any);

    await handleShutdown("SIGTERM");

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Received SIGTERM"),
    );
    expect(pool.end).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("should handle pool end failure during shutdown and exit with code 1", async () => {
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as any);
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleErrSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.mocked(pool.end).mockRejectedValueOnce(new Error("Pool drain failed"));

    await handleShutdown("SIGINT");

    expect(consoleErrSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error during pool shutdown:"),
      expect.any(Error),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
    consoleLogSpy.mockRestore();
    consoleErrSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
