import { Graha } from '../../shared/services';

export type SthanaBala = {
  ucchaBala: number;
  saptavargajaBala: number;
  ojhayugmaBala: number;
  kendradiBala: number;
  drekkanaBala: number;
  total: number;
};

export type KaalaBala = {
  nataUnnataBala: number;
  pakshaBala: number;
  tribhagaBala: number;
  varshaBala: number;
  maasaBala: number;
  vaaraBala: number;
  horaBala: number;
  ayanaBala: number;
  yuddhaBala: number;
  total: number;
};

export type ShadbalaRow = {
  graha: Graha;
  sthanaBala: SthanaBala;
  digBala: number;
  kaalaBala: KaalaBala;
  chestaBala: number;
  naisargikaBala: number;
  drigBala: number;
  totalShadbala: number;
  shadbalaInRupas: number;
  minimumRequirement: number;
  percentOfRequired: number;
  relativeRank: number;
  ishtaPhala: number;
  kashtaPhala: number;
};

export type BhavaBalaColumn = {
  house: number;
  rasi: number;
  degreeInRasi: string;
  fromLordBala: number;
  digBala: number;
  drishtiBala: number;
  total: number;
};

export type SthanaBalaStrengthRow = {
  rank: number;
  graha: Graha;
  sthanaBala: number;
  drigBala: number;
  computedSthanaBala: number;
  minimum: number;
  strength: number;
  isBelowMinimum: boolean;
  significance: string;
};

export type KaalaBalaStrengthRow = {
  rank: number;
  graha: Graha;
  kaalaBala: number;
  drigBala: number;
  computedKaalaBala: number;
  minimum: number;
  strength: number;
  isBelowMinimum: boolean;
  nature: string;
};

export type DigBalaStrengthRow = {
  rank: number;
  graha: Graha;
  direction: string;
  securedDigBala: number;
  minimum: number;
  ratio: number;
  isBelowMinimum: boolean;
};

export type ChestaBalaStrengthRow = {
  rank: number;
  graha: Graha;
  securedChestaBala: number;
  minimum: number;
  ratio: number;
  isBelowMinimum: boolean;
};

export type FinalAssessmentRow = {
  rank: number;
  bala: string;
  totalBala: number;
  minimumBala: number;
  ratio: number;
  isBelowMinimum: boolean;
};
