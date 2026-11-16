import { HttpError } from "./HttpError.ts";
import { mapCountryResponse } from "./mapCountryResponse.ts";
import type { Country, RawCountry } from "./types.ts";

const API_URL = "https://countries.dev/name/";
const REQUEST_TIMEOUT_MS = 8000;
const NOT_FOUND_STATUS = 404;

export async function searchCountries(
  query: string,
  signal: AbortSignal,
): Promise<Country[]> {
  const response = await fetch(`${API_URL}${encodeURIComponent(query)}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
  });

  if (response.status === NOT_FOUND_STATUS) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(response.status);
  }

  const data: RawCountry[] = await response.json();
  return data.map(mapCountryResponse);
}
