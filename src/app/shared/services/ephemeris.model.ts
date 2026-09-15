export type Graha = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

export type Ayanamsa = 'lahiri' | 'raman' | 'kp' | 'yukteshwar' | 'fagan-bradley';

export type GrahaPosition = {
  graha: Graha;
  longitude: number;
  rasi: number;
};

export type D1Chart = {
  ascendantRasi: number;
  ascendantLongitude?: number;
  grahas: GrahaPosition[];
};
