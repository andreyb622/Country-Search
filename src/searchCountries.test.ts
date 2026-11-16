import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "./HttpError.ts";
import { searchCountries } from "./searchCountries.ts";

const rawSpain = {
  name: "Spain",
  capital: "Madrid",
  region: "Europe",
  population: 47351567,
  flags: { png: "es.png", svg: "es.svg" },
};

function mockFetchResponse(body: string, status: number) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(body, { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function mockHangingFetch() {
  const fetchMock = vi.fn(
    (_url: string, init?: RequestInit) =>
      new Promise<Response>((_, reject) => {
        const signal = init?.signal;
        signal?.addEventListener("abort", () => reject(signal.reason));
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("searchCountries", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("requests encoded query with signal", async () => {
    const fetchMock = mockFetchResponse("[]", 200);

    await searchCountries("united states", new AbortController().signal);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://countries.dev/name/united%20states",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("returns mapped countries on 200", async () => {
    mockFetchResponse(JSON.stringify([rawSpain]), 200);

    const result = await searchCountries("spain", new AbortController().signal);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: "Spain",
      flag: "es.svg",
      capital: "Madrid",
    });
  });

  it("returns empty array on 404", async () => {
    mockFetchResponse("Country not found", 404);

    const result = await searchCountries("zzz", new AbortController().signal);

    expect(result).toEqual([]);
  });

  it("throws HttpError with status on other non-ok response", async () => {
    mockFetchResponse("Server error", 500);

    const promise = searchCountries("spain", new AbortController().signal);

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ status: 500 });
  });

  it("rejects with AbortError when caller aborts", async () => {
    mockHangingFetch();
    const controller = new AbortController();

    const promise = searchCountries("spain", controller.signal);
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  });

  it("rejects with TimeoutError when request times out", async () => {
    mockHangingFetch();
    const timeoutController = new AbortController();
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(timeoutController.signal);

    const promise = searchCountries("spain", new AbortController().signal);
    timeoutController.abort(new DOMException("Timeout", "TimeoutError"));

    await expect(promise).rejects.toMatchObject({ name: "TimeoutError" });
  });
});
