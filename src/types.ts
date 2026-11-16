export interface RawCountry {
  name: string;
  capital?: string;
  region: string;
  subregion?: string;
  population: number;
  area?: number;
  flags: {
    svg: string;
    png: string;
  };
  borders?: string[];
  languages?: {
    name: string;
  }[];
  currencies?: {
    code: string;
    name: string;
    symbol?: string;
  }[];
}

export interface Country {
  name: string;
  flag: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area: number | null;
  borders: string[];
  languages: string[];
  currencies: string[];
}
