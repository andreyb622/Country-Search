import { Country, RawCountry } from "./types";

const NO_DATA = "—";

export function mapCountryResponse(raw: RawCountry): Country {
  return {
    name: raw.name,
    flag: raw.flags.svg,
    capital: raw.capital ?? NO_DATA,
    region: raw.region,
    subregion: raw.subregion ?? NO_DATA,
    population: raw.population,
    area: raw.area ?? null,
    borders: [...(raw.borders ?? [])],
    languages: (raw.languages ?? []).map((language) => language.name),
    currencies: (raw.currencies ?? []).map((currency) =>
      currency.symbol ? `${currency.name} (${currency.symbol})` : currency.name,
    ),
  };
}
