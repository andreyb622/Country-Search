import { describe, expect, it } from "vitest";
import { mapCountryResponse } from "./mapCountryResponse.ts";
import type { RawCountry } from "./types.ts";

const spain: RawCountry = {
  name: "Spain",
  capital: "Madrid",
  region: "Europe",
  subregion: "Southern Europe",
  population: 47351567,
  area: 505992,
  flags: {
    png: "https://flagcdn.com/w320/es.png",
    svg: "https://flagcdn.com/es.svg",
  },
  borders: ["AND", "FRA"],
  languages: [{ name: "Spanish" }],
  currencies: [{ code: "EUR", name: "Euro", symbol: "€" }],
};

const antarctica: RawCountry = {
  name: "Antarctica",
  region: "Polar",
  population: 1000,
  flags: { png: "aq.png", svg: "aq.svg" },
};

describe("mapCountryResponse", () => {
  it("maps full country to card data", () => {
    expect(mapCountryResponse(spain)).toEqual({
      name: "Spain",
      flag: "https://flagcdn.com/es.svg",
      capital: "Madrid",
      region: "Europe",
      subregion: "Southern Europe",
      population: 47351567,
      area: 505992,
      borders: ["AND", "FRA"],
      languages: ["Spanish"],
      currencies: ["Euro (€)"],
    });
  });

  it("fills defaults for missing optional fields", () => {
    expect(mapCountryResponse(antarctica)).toEqual({
      name: "Antarctica",
      flag: "aq.svg",
      capital: "—",
      region: "Polar",
      subregion: "—",
      population: 1000,
      area: null,
      borders: [],
      languages: [],
      currencies: [],
    });
  });

  it("does not mutate input", () => {
    const copy = structuredClone(spain);
    mapCountryResponse(spain);
    expect(spain).toEqual(copy);
  });
});
