import { classifyError, type ErrorKind } from "./classifyError.ts";
import { debounce } from "./debounce.ts";
import { searchCountries } from "./searchCountries.ts";
import type { Country } from "./types.ts";

export const DEBOUNCE_DELAY_MS = 300;

export type SearchState =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "results"; query: string; countries: Country[] }
  | { status: "empty"; query: string }
  | { status: "error"; query: string; kind: Exclude<ErrorKind, "abort"> };

export function createSearchController(onChange: (state: SearchState) => void) {
  let activeController: AbortController | null = null;
  let lastQuery = "";

  function abortActive(): void {
    activeController?.abort();
    activeController = null;
  }

  async function run(query: string): Promise<void> {
    if (!query) {
      return;
    }

    abortActive();
    const controller = new AbortController();
    activeController = controller;
    onChange({ status: "loading", query });

    try {
      const countries = await searchCountries(query, controller.signal);
      onChange(
        countries.length > 0
          ? { status: "results", query, countries }
          : { status: "empty", query },
      );
    } catch (error) {
      const kind = classifyError(error);
      if (kind !== "abort") {
        onChange({ status: "error", query, kind });
      }
    }
  }

  const debouncedRun = debounce(run, DEBOUNCE_DELAY_MS);

  function input(rawQuery: string): void {
    const query = rawQuery.trim();
    lastQuery = query;
    abortActive();

    if (!query) {
      onChange({ status: "idle" });
    } else {
      onChange({ status: "loading", query });
    }

    debouncedRun(query);
  }

  function retry(): void {
    if (lastQuery) {
      void run(lastQuery);
    }
  }

  return { input, retry };
}
