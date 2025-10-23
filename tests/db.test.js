import { describe, it, expect, beforeEach, vi } from "vitest";

const { configMock, setItemMock, iterateMock } = vi.hoisted(() => {
  return {
    configMock: vi.fn(),
    setItemMock: vi.fn(async (key, value) => value),
    iterateMock: vi.fn(),
  };
});

vi.mock("localforage", () => ({
  default: {
    config: configMock,
    setItem: setItemMock,
    iterate: iterateMock,
  },
}));

import { addCapturedLink, listCapturedLinks } from "../src/lib/db.js";

describe("db persistence helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    iterateMock.mockImplementation(async () => undefined);
  });

  it("stores the captured link under an id-based key", async () => {
    const capturedLink = { id: "123", url: "https://example.com", capturedAt: 5 };

    const result = await addCapturedLink(capturedLink);

    expect(setItemMock).toHaveBeenCalledTimes(1);
    expect(setItemMock).toHaveBeenCalledWith("link_123", capturedLink);
    expect(result).toBe(capturedLink);
  });

  it("returns captured links sorted with the newest first", async () => {
    const older = { id: "a", capturedAt: 10 };
    const newer = { id: "b", capturedAt: 20 };

    iterateMock.mockImplementation(async (callback) => {
      await callback(older, "link_a");
      await callback(newer, "link_b");
      return undefined;
    });

    const links = await listCapturedLinks();

    expect(links).toEqual([newer, older]);
  });

  it("ignores values that are not stored under a link key", async () => {
    const validLink = { id: "c", capturedAt: 30 };

    iterateMock.mockImplementation(async (callback) => {
      await callback({ id: "metadata", capturedAt: 1 }, "settings");
      await callback(validLink, "link_c");
      return undefined;
    });

    const links = await listCapturedLinks();

    expect(links).toEqual([validLink]);
  });
});
