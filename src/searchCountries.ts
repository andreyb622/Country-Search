import type { Country } from "./types.ts";

export async function searchCountries(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  query: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signal: AbortSignal,
): Promise<Country[]> {
  throw new Error("Not implemented");
}
