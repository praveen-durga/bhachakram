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
  sthanaBalaPercentReq: number;
  digBalaPercentReq: number;
  kaalaBalaPercentReq: number;
  chestaBalaPercentReq: number;
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
