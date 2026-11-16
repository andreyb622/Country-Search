import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSearchController,
  DEBOUNCE_DELAY_MS,
  type SearchState,
} from "./searchController.ts";

interface PendingRequest {
  url: string;
  signal: AbortSignal;
  resolve: (response: Response) => void;
}

function okResponse(name: string): Response {
  const raw = {
    name,
    region: "Europe",
    population: 1,
    flags: { png: "", svg: "" },
  };
  return { ok: true, status: 200, json: async () => [raw] } as Response;
}

describe("search controller race condition", () => {
  let pending: PendingRequest[];

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    pending = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(
        (url: string, init: RequestInit) =>
          new Promise<Response>((resolve, reject) => {
            const signal = init.signal as AbortSignal;
            signal.addEventListener("abort", () => reject(signal.reason));
            pending.push({ url, signal, resolve });
          }),
      ),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("shows only the latest query result when older response arrives later", async () => {
    const states: SearchState[] = [];
    const controller = createSearchController((state) => states.push(state));

    controller.input("sp");
    vi.advanceTimersByTime(DEBOUNCE_DELAY_MS);
    const [spRequest] = pending;

    controller.input("spain");
    expect(spRequest.signal.aborted).toBe(true);

    vi.advanceTimersByTime(DEBOUNCE_DELAY_MS);
    const [, spainRequest] = pending;

    spainRequest.resolve(okResponse("Spain"));
    await vi.advanceTimersByTimeAsync(0);
    spRequest.resolve(okResponse("Sp-stale"));
    await vi.advanceTimersByTimeAsync(0);

    expect(pending.map((request) => request.url)).toEqual([
      "https://countries.dev/name/sp",
      "https://countries.dev/name/spain",
    ]);
    expect(states.at(-1)).toMatchObject({
      status: "results",
      query: "spain",
      countries: [{ name: "Spain" }],
    });
    expect(
      states.some(
        (state) => state.status === "results" && state.query === "sp",
      ),
    ).toBe(false);
    expect(states.some((state) => state.status === "error")).toBe(false);
  });
});
