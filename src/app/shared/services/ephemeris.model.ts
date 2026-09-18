export type Graha = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

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
