export type Graha = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

export type GrahaPosition = {
  graha: Graha;
  longitude: number;
  rasi: number;
};

export type D1Chart = {
  ascendantRasi: number;
  grahas: GrahaPosition[];
};
