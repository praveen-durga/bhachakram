export type Graha = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

// Modern Western-astrology-only bodies, not part of the classical Vedic
// Navagraha - kept separate from Graha rather than folded into it, since
// every Vedic-specific calculation in this app (Shadbala, Vargas, Dashas,
// ...) assumes the 9-graha set. Only Transit Aspects needs these.
export type OuterPlanet = 'Uranus' | 'Neptune' | 'Pluto';

export type Ayanamsa = 'lahiri' | 'raman' | 'kp' | 'yukteshwar' | 'fagan-bradley';

export type GrahaPosition = {
  graha: Graha;
  longitude: number;
  rasi: number;
  isRetrograde: boolean;
  isCombust: boolean;
};

export type D1Chart = {
  ascendantRasi: number;
  ascendantLongitude?: number;
  grahas: GrahaPosition[];
  cusps?: number[];
};

export type HoraResult = {
  horaIndex: number;
  isDayHora: boolean;
};

export type SunTimes = {
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
};

// Varshapravesh (Tajik annual return) chart - relocated here from
// pages/tajik/tajik.model.ts since the root app component's D1/D9/Bhava
// Chalit display is now a 2nd consumer.
export type AnnualChart = {
  chart: D1Chart;
  munthaRasi: number;
  instant: Date;
  age: number;
};

// The Ascendant + 9 grahas as a single flat list, each with its own
// nakshatra/pada - relocated here from pages/navatara since Kumara Swameeyam
// is a 2nd consumer of the same "one row per chart body" shape.
export type ChartBody = {
  key: string;
  label: string;
  abbreviation: string;
  nakshatraIndex: number;
  pada: number;
};
