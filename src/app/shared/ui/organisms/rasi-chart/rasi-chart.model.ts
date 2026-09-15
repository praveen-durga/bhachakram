export type TextAnchor = 'start' | 'middle' | 'end';

export type ChartStyle = 'north' | 'south' | 'east';

export type GrahaLabelPosition = {
  text: string;
  x: number;
  y: number;
};

export type RasiHouseRegion = {
  rasi: number;
  rasiLabelX: number;
  rasiLabelY: number;
  grahaTextAnchor: TextAnchor;
  grahaLabels: GrahaLabelPosition[];
};
