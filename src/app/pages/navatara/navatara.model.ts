import { ChartBody } from '../../shared/services';

export type NavaTaraCard = {
  position: number;
  tara: string;
  animal: string;
  description: string;
  inauspicious: boolean;
  nakshatras: string[];
  lordGraha: string;
  bodyBadges: ChartBody[];
};

export type NavaTaraBodyRow = {
  body: string;
  nakshatra: string;
  pada: number;
  position: number;
  tara: string;
  animal: string;
};
