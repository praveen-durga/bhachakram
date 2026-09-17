import {
  D3_DEITIES,
  D4_DEITIES,
  D9_DEITIES,
  D10_DEITIES_ODD,
  D12_DEITIES,
  D16_DEITIES_ODD,
  D24_DEITIES_ODD,
  D30_BOUNDARIES_EVEN,
  D30_BOUNDARIES_ODD,
  D30_DEITIES_EVEN,
  D30_DEITIES_ODD,
  D45_DEITIES_DUAL,
  D45_DEITIES_FIXED,
  D45_DEITIES_MOVABLE,
  D60_DEITIES_ODD,
  D60_DEITY_DETAILS,
} from './deities.data';
import { DeityRow } from './deities.model';

function reversed(list: string[]): string[] {
  return [...list].reverse();
}

// The Nth deity for an equal-division varga only depends on which of the N
// divisions a degree falls into within its own sign, not on which sign that
// division maps to — so this doesn't need any of the calculateDxRasi
// functions used elsewhere for rasi mapping.
function deityByDivision(degreeInRasi: number, divisionCount: number, list: string[]): string {
  const division = Math.floor(degreeInRasi / (30 / divisionCount));
  return list[division % list.length];
}

function isOddRasi(rasi: number): boolean {
  return rasi % 2 === 0; // rasi 0 = Aries = 1st sign = odd
}

export function getD3Deity(longitude: number): string {
  return deityByDivision(longitude % 30, 3, D3_DEITIES);
}

export function getD4Deity(longitude: number): string {
  return deityByDivision(longitude % 30, 4, D4_DEITIES);
}

export function getD9Deity(longitude: number): string {
  return deityByDivision(longitude % 30, 9, D9_DEITIES);
}

export function getD10Deity(longitude: number): string {
  const rasi = Math.floor(longitude / 30);
  const list = isOddRasi(rasi) ? D10_DEITIES_ODD : reversed(D10_DEITIES_ODD);
  return deityByDivision(longitude % 30, 10, list);
}

export function getD12Deity(longitude: number): string {
  return deityByDivision(longitude % 30, 12, D12_DEITIES);
}

export function getD16Deity(longitude: number): string {
  const rasi = Math.floor(longitude / 30);
  const list = isOddRasi(rasi) ? D16_DEITIES_ODD : reversed(D16_DEITIES_ODD);
  return deityByDivision(longitude % 30, 16, list);
}

export function getD24Deity(longitude: number): string {
  const rasi = Math.floor(longitude / 30);
  const list = isOddRasi(rasi) ? D24_DEITIES_ODD : reversed(D24_DEITIES_ODD);
  return deityByDivision(longitude % 30, 24, list);
}

export function getD30Deity(longitude: number): string {
  const rasi = Math.floor(longitude / 30);
  const degreeInRasi = longitude % 30;
  const boundaries = isOddRasi(rasi) ? D30_BOUNDARIES_ODD : D30_BOUNDARIES_EVEN;
  const deities = isOddRasi(rasi) ? D30_DEITIES_ODD : D30_DEITIES_EVEN;

  for (let i = 0; i < boundaries.length; i++) {
    if (degreeInRasi < boundaries[i]) {
      return deities[i];
    }
  }
  return deities[deities.length - 1];
}

export function getD45Deity(longitude: number): string {
  const rasi = Math.floor(longitude / 30);
  const modality = rasi % 3; // 0 = movable (chara), 1 = fixed (sthira), 2 = dual (dwiswabhava)
  const list = modality === 0 ? D45_DEITIES_MOVABLE : modality === 1 ? D45_DEITIES_FIXED : D45_DEITIES_DUAL;
  return deityByDivision(longitude % 30, 45, list);
}

export function getD60Deity(longitude: number): string {
  const rasi = Math.floor(longitude / 30);
  const list = isOddRasi(rasi) ? D60_DEITIES_ODD : reversed(D60_DEITIES_ODD);
  return deityByDivision(longitude % 30, 60, list);
}

export function buildDeityRow(body: string, longitude: number): DeityRow {
  const d60 = getD60Deity(longitude);
  const d60Detail = D60_DEITY_DETAILS[d60];

  return {
    body,
    d3: getD3Deity(longitude),
    d4: getD4Deity(longitude),
    d9: getD9Deity(longitude),
    d10: getD10Deity(longitude),
    d12: getD12Deity(longitude),
    d16: getD16Deity(longitude),
    d24: getD24Deity(longitude),
    d30: getD30Deity(longitude),
    d45: getD45Deity(longitude),
    d60,
    d60Nature: d60Detail.nature,
    d60Meaning: d60Detail.meaning,
  };
}
