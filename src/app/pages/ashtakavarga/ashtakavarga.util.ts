import { D1Chart } from '../../shared/services';
import { findGraha } from '../../shared/utils';
import { ASHTAKAVARGA_DISPLAY_TARGETS, ASHTAKAVARGA_PLANETS, BAV_CONTRIBUTION_HOUSES } from './ashtakavarga.data';
import {
  AshtakavargaContributor,
  AshtakavargaTarget,
  BhinnashtakavargaChart,
  SarvashtakavargaChart,
} from './ashtakavarga.model';

function getContributorRasi(d1Chart: D1Chart, contributor: AshtakavargaContributor): number {
  return contributor === 'Lagna' ? d1Chart.ascendantRasi : findGraha(d1Chart.grahas, contributor).rasi;
}

function buildBindusByRasi(d1Chart: D1Chart, target: AshtakavargaTarget): number[] {
  const bindusByRasi = new Array(12).fill(0);
  const contributionHouses = BAV_CONTRIBUTION_HOUSES[target];

  (Object.keys(contributionHouses) as AshtakavargaContributor[]).forEach((contributor) => {
    const contributorRasi = getContributorRasi(d1Chart, contributor);
    contributionHouses[contributor].forEach((house) => {
      const rasi = (contributorRasi + house - 1) % 12;
      bindusByRasi[rasi] += 1;
    });
  });

  return bindusByRasi;
}

export function buildBhinnashtakavargaCharts(d1Chart: D1Chart): BhinnashtakavargaChart[] {
  return ASHTAKAVARGA_DISPLAY_TARGETS.map((target) => {
    const bindusByRasi = buildBindusByRasi(d1Chart, target);
    return { target, bindusByRasi, total: bindusByRasi.reduce((sum, n) => sum + n, 0) };
  });
}

export function buildSarvashtakavargaChart(bavCharts: BhinnashtakavargaChart[]): SarvashtakavargaChart {
  const planetCharts = bavCharts.filter((chart) => ASHTAKAVARGA_PLANETS.includes(chart.target));
  const bindusByRasi = new Array(12).fill(0);
  planetCharts.forEach((chart) => chart.bindusByRasi.forEach((n, rasi) => (bindusByRasi[rasi] += n)));
  return { bindusByRasi, total: bindusByRasi.reduce((sum, n) => sum + n, 0) };
}
