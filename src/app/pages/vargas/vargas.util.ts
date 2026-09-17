import { D1Chart, Graha } from '../../shared/services';
import { findGraha, GRAHA_ORDER, getRasiDistances, getRasiModality, RASI_NAMES } from '../../shared/utils';
import {
  GRAHA_ARUDHA_GREEN_ORDER,
  GRAHA_ARUDHA_LORDSHIP,
  GRAHA_ARUDHA_RED_ORDER,
  MODALITY_GRADE_MATRIX,
} from './vargas.data';
import { GrahaArudhaRow, ModalityGradeRow, RasiDistanceRow, VargaOption } from './vargas.model';

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

const D1_VARGA_OPTION: VargaOption = {
  key: 'D1',
  label: 'D1 - Rasi',
  calculateRasi: (longitude) => Math.floor(longitude / 30),
};
const GRAHA_ARUDHA_KENDRA_OFFSETS = [0, 3, 6, 9]; // 1st/4th/7th/10th from the planet
const GRAHA_ARUDHA_SHADE_INTENSITIES = [85, 68, 54, 42, 30, 20]; // darkest to lightest, % mix

// Graha Arudha (Jaimini): from a planet's own sign S and a sign L it owns,
// count S->L, then count that same number of signs forward from L - that's
// the raw Graha Arudha. If it lands in a kendra (1st/4th/7th/10th) from the
// planet's own sign S, it's corrected by counting 10 more signs from there.
// Verified against a full worked example (all 9 grahas, including both of
// Jupiter's two kendra-correction cases firing) before implementing this.
function calculateFinalGrahaArudha(planetRasi: number, lordRasi: number): number {
  const rawGa = (((2 * lordRasi - planetRasi) % 12) + 12) % 12;
  const offsetFromPlanet = (rawGa - planetRasi + 12) % 12;
  return GRAHA_ARUDHA_KENDRA_OFFSETS.includes(offsetFromPlanet) ? (rawGa + 9) % 12 : rawGa;
}

// Shade per the user's ranked quality table (Best..Good on the green side,
// Worst..Least difficult on the red side), darkest for the strongest result.
function getGrahaArudhaBackground(position: number): string {
  const greenIndex = GRAHA_ARUDHA_GREEN_ORDER.indexOf(position);
  if (greenIndex !== -1) {
    return `color-mix(in oklch, var(--color-success) ${GRAHA_ARUDHA_SHADE_INTENSITIES[greenIndex]}%, var(--color-base-100))`;
  }
  const redIndex = GRAHA_ARUDHA_RED_ORDER.indexOf(position);
  return `color-mix(in oklch, var(--color-error) ${GRAHA_ARUDHA_SHADE_INTENSITIES[redIndex]}%, var(--color-base-100))`;
}

function buildGrahaArudhaRow(
  graha: Graha,
  longitude: number,
  d1Rasi: number,
  ascendantRasi: number,
  allVargaOptions: VargaOption[],
): GrahaArudhaRow {
  const finalGaSigns = GRAHA_ARUDHA_LORDSHIP[graha].map((lordRasi) => calculateFinalGrahaArudha(d1Rasi, lordRasi));

  const cells = allVargaOptions.map((option) => ({
    vargaKey: option.key,
    values: finalGaSigns.map((gaSign) => {
      const vargaSign = option.calculateRasi(longitude);
      const position = ((gaSign - vargaSign + 12) % 12) + 1;
      return { position, background: getGrahaArudhaBackground(position) };
    }),
  }));

  return {
    body: graha,
    d1SignLabel: RASI_NAMES[d1Rasi],
    finalGaLabel: finalGaSigns.map((sign) => RASI_NAMES[sign]).join(', '),
    houseFromLagnaLabel: finalGaSigns.map((sign) => String(((sign - ascendantRasi + 12) % 12) + 1)).join(', '),
    cells,
  };
}

export function buildGrahaArudhaRows(d1Chart: D1Chart, vargaOptions: VargaOption[]): GrahaArudhaRow[] {
  const allVargaOptions = [D1_VARGA_OPTION, ...vargaOptions];

  return GRAHA_ORDER.map((graha) => {
    const position = findGraha(d1Chart.grahas, graha);
    return buildGrahaArudhaRow(graha, position.longitude, position.rasi, d1Chart.ascendantRasi, allVargaOptions);
  });
}
