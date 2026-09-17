export type Guna = 'Sathvik' | 'Rajasik' | 'Tamasik';

export type ComfortBand = 'Exceptional Comfort' | 'Moderate Comfort' | 'Friction Strain' | 'Severe Distress';

export type PlanetComfortRow = {
  planet: string;
  starLabel: string;
  starDevata: string;
  isSpecificEnemy: boolean;
  planetGuna: Guna;
  starGuna: Guna;
  tier1: number;
  tier2: number;
  tier3: number;
  tier3Label: string;
  total: number;
  isPushkarNavamsa: boolean;
  band: ComfortBand;
};
