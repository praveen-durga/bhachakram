import { Graha } from '../../shared/services';

export type DeclinationRow = {
  graha: Graha;
  declination: number;
};

export type DeclinationPoint = {
  date: Date;
  dayOfYear: number;
  value: number;
};

export type DeclinationSeries = {
  graha: Graha;
  color: string;
  dashed: boolean;
  points: DeclinationPoint[];
};

export type DeclinationChartData = {
  year: number;
  series: DeclinationSeries[];
  minValue: number;
  maxValue: number;
};

export type DeclinationDirection = 'N to S' | 'S to N';

export type DeclinationEventType = 'Equator Crossing' | 'Turning Point';

export type DeclinationEvent = {
  graha: Graha;
  date: Date;
  type: DeclinationEventType;
  direction: DeclinationDirection;
};
