import { D1Chart } from '../../shared/services';

// Reuses D1's raw graha longitudes (for the chart's degree-in-rasi labels,
// same as how the D9 chart shown on the home page already works) with each
// graha/ascendant's rasi remapped by the given varga's rasi-calculation
// function - no new ephemeris calls needed.
export function buildVargaChart(d1Chart: D1Chart, calculateRasi: (longitude: number) => number): D1Chart {
  return {
    ascendantRasi: calculateRasi(d1Chart.ascendantLongitude ?? 0),
    ascendantLongitude: d1Chart.ascendantLongitude,
    grahas: d1Chart.grahas.map((graha) => ({ ...graha, rasi: calculateRasi(graha.longitude) })),
  };
}
