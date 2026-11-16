import { describe, expect, it } from "vitest";
import { classifyError } from "./classifyError.ts";
import { HttpError } from "./HttpError.ts";

describe("classifyError", () => {
  it('returns "abort" for AbortError', () => {
    expect(classifyError(new DOMException("Aborted", "AbortError"))).toBe(
      "abort",
    );
  });

  it('returns "timeout" for TimeoutError', () => {
    expect(classifyError(new DOMException("Timeout", "TimeoutError"))).toBe(
      "timeout",
    );
  });

  it('returns "http" for HttpError', () => {
    expect(classifyError(new HttpError(500))).toBe("http");
  });

  it('returns "network" for fetch network failure', () => {
    expect(classifyError(new TypeError("Failed to fetch"))).toBe("network");
  });

  it("does not confuse AbortError with TimeoutError", () => {
    expect(classifyError(new DOMException("Aborted", "AbortError"))).not.toBe(
      "timeout",
    );
    expect(classifyError(new DOMException("Timeout", "TimeoutError"))).not.toBe(
      "abort",
    );
  });
});
