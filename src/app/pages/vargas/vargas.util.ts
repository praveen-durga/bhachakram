import { D1Chart } from '../../shared/services';
import { findGraha, GRAHA_ORDER, getRasiDistances, getRasiModality, RASI_NAMES } from '../../shared/utils';
import { MODALITY_GRADE_MATRIX } from './vargas.data';
import { ModalityGradeRow, RasiDistanceRow, VargaOption } from './vargas.model';

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

// One "house axis" cell per varga (forward-backward sign count between the
// D1 sign and that varga's sign, same distance calculation Planet Positions
// already uses for its Rasi Combination column) - "1-1" (Vargottam) when the
// planet lands in the same sign in both charts.
function buildRasiDistanceRow(
  body: string,
  longitude: number,
  d1Rasi: number,
  vargaOptions: VargaOption[],
): RasiDistanceRow {
  return {
    body,
    d1SignLabel: RASI_NAMES[d1Rasi],
    cells: vargaOptions.map((option) => {
      const { forward, backward, isVargottam } = getRasiDistances(d1Rasi, option.calculateRasi(longitude));
      return { vargaKey: option.key, label: `${forward}-${backward}`, isVargottam };
    }),
  };
}

export function buildRasiDistanceRows(d1Chart: D1Chart, vargaOptions: VargaOption[]): RasiDistanceRow[] {
  const ascendantRow = buildRasiDistanceRow(
    'Ascendant',
    d1Chart.ascendantLongitude ?? 0,
    d1Chart.ascendantRasi,
    vargaOptions,
  );
  const grahaRows = GRAHA_ORDER.map((graha) => {
    const position = findGraha(d1Chart.grahas, graha);
    return buildRasiDistanceRow(graha, position.longitude, position.rasi, vargaOptions);
  });

  return [ascendantRow, ...grahaRows];
}

// One grade per varga (per MODALITY_GRADE_MATRIX) comparing the D1 sign's
// modality (Movable/Fixed/Dual) against that varga sign's modality.
function buildModalityGradeRow(
  body: string,
  longitude: number,
  d1Rasi: number,
  vargaOptions: VargaOption[],
): ModalityGradeRow {
  const d1Modality = getRasiModality(d1Rasi);

  return {
    body,
    d1SignLabel: RASI_NAMES[d1Rasi],
    d1ModalityLabel: d1Modality.charAt(0),
    cells: vargaOptions.map((option) => {
      const vargaModality = getRasiModality(option.calculateRasi(longitude));
      return { vargaKey: option.key, grade: MODALITY_GRADE_MATRIX[d1Modality][vargaModality] };
    }),
  };
}

export function buildModalityGradeRows(d1Chart: D1Chart, vargaOptions: VargaOption[]): ModalityGradeRow[] {
  const ascendantRow = buildModalityGradeRow(
    'Ascendant',
    d1Chart.ascendantLongitude ?? 0,
    d1Chart.ascendantRasi,
    vargaOptions,
  );
  const grahaRows = GRAHA_ORDER.map((graha) => {
    const position = findGraha(d1Chart.grahas, graha);
    return buildModalityGradeRow(graha, position.longitude, position.rasi, vargaOptions);
  });

  return [ascendantRow, ...grahaRows];
}
