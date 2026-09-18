import type { D1Chart } from '../services/ephemeris.model';
import type { BirthDetails } from './birth-details.model';

export type BirthChartProfile = {
  id: string;
  details: BirthDetails;
  charts: {
    d1Chart: D1Chart;
    d9Chart: D1Chart;
    bhavaChalitChart: D1Chart;
  };
};
