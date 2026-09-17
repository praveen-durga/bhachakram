import {
  calculateNakshatra,
  calculatePada,
  formatDegreeInRasi,
  getRasiDistances,
  NAKSHATRA_NAMES,
  RASI_LORD,
  RASI_NAMES,
} from '../../shared/utils';
import { KARMIC_NAKSHATRAS, KARMIC_PLANETS, NAKSHATRA_PADA_DATA } from '../../shared/data';
import { DHUMA_OFFSET_DEG, INDU_LAGNA_KALANADI, UPAKETU_OFFSET_DEG } from './planet-positions.data';
import { PlanetPositionRow } from './planet-positions.model';

function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

export function buildRow(
  body: string,
  longitude: number,
  rasiIndex: number,
  navamsaRasiIndex: number,
): PlanetPositionRow {
  const nakshatraIndex = calculateNakshatra(longitude);
  const pada = calculatePada(longitude);
  const { forward, backward, isVargottam } = getRasiDistances(rasiIndex, navamsaRasiIndex);
  const padaInfo = NAKSHATRA_PADA_DATA[nakshatraIndex][pada as 1 | 2 | 3 | 4];
  const hasKarmicDosha = KARMIC_NAKSHATRAS[rasiIndex].includes(nakshatraIndex);

  let karmicPlanet = '';
  let karmicPlanetResults = '';
  for (const [planet, data] of Object.entries(KARMIC_PLANETS)) {
    if (data.stars.includes(nakshatraIndex)) {
      karmicPlanet = planet;
      karmicPlanetResults = data.result;
    }
  }

  return {
    body,
    longitude: `${RASI_NAMES[rasiIndex]} ${formatDegreeInRasi(longitude)}`,
    nakshatra: NAKSHATRA_NAMES[nakshatraIndex],
    pada,
    rasi: RASI_NAMES[rasiIndex],
    navamsa: RASI_NAMES[navamsaRasiIndex],
    rasiCombination: `${forward},${backward}${isVargottam ? ' (Vargottam)' : ''}`,
    characteristics: padaInfo.characteristics,
    careerPath: padaInfo.careerPath,
    hasKarmicDosha,
    nakshatraIndex,
    rasiIndex,
    navamsaRasiIndex,
    karmicPlanet,
    karmicPlanetResults,
  };
}

// Hora Lagna, BPHS Ch.5 v.4-5: "from sunrise till birth, Hora Lagna repeats
// every 2.5 ghatis (60 minutes) - divide elapsed time by 2.5 ghatis and add
// the result to Surya's longitude at sunrise." 2.5 ghatis = 60 minutes, so
// this is simply +30° (1 rasi) of longitude per hour elapsed since sunrise,
// added to the Sun's own longitude at that sunrise instant (not at birth).
export function calculateHoraLagna(sunriseSunLongitude: number, birthTime: Date, sunriseTime: Date): number {
  const elapsedHours = (birthTime.getTime() - sunriseTime.getTime()) / (1000 * 60 * 60);
  return normalizeDegrees(sunriseSunLongitude + elapsedHours * 30);
}

// Bhrigu Bindu - not in BPHS (a later Jyotish addition), but its formula is
// simple and well-established: the midpoint of Moon and Rahu, taken along
// the SHORTER of the two arcs between them (naive averaging picks the wrong
// side of the zodiac whenever they're more than 180° apart).
export function calculateBhriguBindu(moonLongitude: number, rahuLongitude: number): number {
  const forwardArc = normalizeDegrees(rahuLongitude - moonLongitude);
  const midpointOffset = forwardArc <= 180 ? forwardArc / 2 : forwardArc / 2 - 180;
  return normalizeDegrees(moonLongitude + midpointOffset);
}

// Indu Lagna - not in BPHS, best-effort per the user's explicit request (see
// INDU_LAGNA_KALANADI). Sum the Kalanadi values of the 9th lord from
// Ascendant and the 9th lord from Moon, take the sum mod 12 (12 if the
// remainder is 0), and count that many signs from Moon's own sign. Indu
// Lagna is classically a sign only (no finer degree), so this returns a
// rasi index, not a longitude.
export function calculateInduLagna(ascendantRasi: number, moonRasi: number): number {
  const lordFromAscendant = RASI_LORD[(ascendantRasi + 8) % 12];
  const lordFromMoon = RASI_LORD[(moonRasi + 8) % 12];
  const sum = (INDU_LAGNA_KALANADI[lordFromAscendant] ?? 0) + (INDU_LAGNA_KALANADI[lordFromMoon] ?? 0);
  const remainder = sum % 12 === 0 ? 12 : sum % 12;
  return (moonRasi + remainder - 1) % 12;
}

// The 5 Sun-based Upagrahas, BPHS Ch.3 v.61-64 - each computed from the
// previous per the verse's own chain (see planet-positions.data.ts).
export function calculateDhuma(sunLongitude: number): number {
  return normalizeDegrees(sunLongitude + DHUMA_OFFSET_DEG);
}

export function calculateVyatipata(dhumaLongitude: number): number {
  return normalizeDegrees(360 - dhumaLongitude);
}

export function calculateParivesha(vyatipataLongitude: number): number {
  return normalizeDegrees(vyatipataLongitude + 180);
}

export function calculateChapa(pariveshaLongitude: number): number {
  return normalizeDegrees(360 - pariveshaLongitude);
}

export function calculateUpaketu(chapaLongitude: number): number {
  return normalizeDegrees(chapaLongitude + UPAKETU_OFFSET_DEG);
}
