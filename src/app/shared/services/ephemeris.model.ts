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
