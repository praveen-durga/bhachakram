import { D1Chart } from '../../shared/services';
import { buildVargaChart } from '../vargas/vargas.util';

// Gochara (transit) charts keep the natal Ascendant fixed as the reference
// point - only the grahas are the currently transiting positions - rather
// than computing a fresh "transiting Ascendant" from the current moment,
// per the classical convention of reading transits against the natal wheel.
export function buildTransitD1Chart(currentPositions: D1Chart, natalAscendantRasi: number): D1Chart {
  return { ascendantRasi: natalAscendantRasi, grahas: currentPositions.grahas };
}

export function buildTransitVargaChart(
  currentPositions: D1Chart,
  natalVargaAscendantRasi: number,
  calculateRasi: (longitude: number) => number,
): D1Chart {
  return { ...buildVargaChart(currentPositions, calculateRasi), ascendantRasi: natalVargaAscendantRasi };
}
