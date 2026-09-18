import { Graha } from '../../shared/services';

export type DashaVariationKey = 'Janma' | 'Kshema' | 'Utpanna' | 'Adhana';

export type DashaVariationOption = {
  key: DashaVariationKey;
  label: string;
  nakshatraOffset: number;
};

export type DashaPeriod = {
  lord: Graha;
  start: Date;
  end: Date;
};

export type DashaNode = DashaPeriod & {
  id: string;
  level: number;
  children: DashaNode[] | null;
};

export type DashaBalance = {
  lord: Graha;
  years: number;
};
