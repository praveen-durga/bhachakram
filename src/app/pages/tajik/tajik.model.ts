import { Graha } from '../../shared/services';

export type DecadeKey = '1-10' | '10-20' | '20-30' | '30-40' | '40-50' | '50-60' | '60-70' | '70-80' | '80-90';

export type TajikTab = 'current' | DecadeKey;

// The 5 Panchadhikari candidates competing for Varsheshwar (Year Lord).
export type PanchadhikariRole = 'Janma Lagna' | 'Varsha Lagna' | 'Muntha' | 'Dina-Ratri' | 'Tri-Rashi';

export type PanchadhikariCandidate = {
  role: PanchadhikariRole;
  lord: Graha;
  bala: number;
};

export type PlanetBala = {
  graha: Graha;
  kshetra: number;
  uchcha: number;
  hadda: number;
  drekkana: number;
  navamsa: number;
  total: number;
};

export type YogiAvayogi = {
  yogiPlanet: Graha;
  yogiNakshatra: string;
  avayogiPlanet: Graha;
  avayogiNakshatra: string;
};

export type TajikDashaNode = {
  id: string;
  lord: string;
  level: number;
  start: Date;
  end: Date;
  children: TajikDashaNode[] | null;
};
