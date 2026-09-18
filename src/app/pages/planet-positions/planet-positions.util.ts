import { D1Chart, Graha } from '../../shared/services';
import {
  calculateNakshatra,
  calculatePada,
  findGraha,
  formatDegreeInRasi,
  getRasiDistances,
  isGandanta,
  isMrityuBhaga,
  isPushkarBhaga,
  isPushkarNavamsa,
  isSarpaDrekkana,
  isTempGandanta,
  isVishaNavamsa,
  NAKSHATRA_NAMES,
  RASI_LORD,
  RASI_NAMES,
} from '../../shared/utils';
import {
  KARMIC_NAKSHATRAS,
  KARMIC_PLANETS,
  NAKSHATRA_CHARACTERISTICS_DATA,
  NAKSHATRA_PADA_DATA,
} from '../../shared/data';
import {
  DHUMA_OFFSET_DEG,
  INDU_LAGNA_KALANADI,
  KARAKA_ABBREVIATIONS,
  KARAKA_GRAHAS,
  NAKSHATRA_KARMA,
  RASHI_KARMA,
  UPAKETU_OFFSET_DEG,
} from './planet-positions.data';
import { BhavaPositionColumn, CharaKarakaInfo, DnaKarmaColumn, PlanetPositionRow } from './planet-positions.model';

function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

export function buildRow(
  body: string,
  longitude: number,
  rasiIndex: number,
  navamsaRasiIndex: number,
  ascendantLongitude: number,
): PlanetPositionRow {
  const nakshatraIndex = calculateNakshatra(longitude);
  const pada = calculatePada(longitude);
  const { forward, backward, isVargottam } = getRasiDistances(rasiIndex, navamsaRasiIndex);
  const padaInfo = NAKSHATRA_PADA_DATA[nakshatraIndex][pada as 1 | 2 | 3 | 4];
  const nakshatraCharacteristics = NAKSHATRA_CHARACTERISTICS_DATA[nakshatraIndex];
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
    isPushkarBhaga: isPushkarBhaga(longitude),
    isMrityuBhaga: isMrityuBhaga(body, longitude),
    isSarpaDrekkana: isSarpaDrekkana(longitude),
    nakshatra: NAKSHATRA_NAMES[nakshatraIndex],
    isGandanta: isGandanta(longitude),
    isTempGandanta: isTempGandanta(longitude, ascendantLongitude),
    isPushkarNavamsa: isPushkarNavamsa(longitude),
    isVishaNavamsa: isVishaNavamsa(longitude),
    pada,
    rasi: RASI_NAMES[rasiIndex],
    navamsa: RASI_NAMES[navamsaRasiIndex],
    rasiCombination: `${forward},${backward}${isVargottam ? ' (Vargottam)' : ''}`,
    characteristics: nakshatraCharacteristics.generalPoints,
    characteristicsKeyPhrase: nakshatraCharacteristics.keyPhrase,
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

// Jaimini Chara Karakas (7-planet scheme, see planet-positions.data.ts):
// rank Sun-Saturn by degree-within-sign descending, highest gets Atmakaraka
// (AK) down to Darakaraka (DK) for the lowest. `speedByGraha` is only used
// to label retrograde planets in the table, not to adjust the ranking
// itself (retrograde planets rank by their degree as-is, per BPHS/Jaimini
// sources - the "30 minus degree" adjustment is specific to Rahu in the
// 8-planet scheme, not applicable here).
export function calculateCharaKarakas(
  d1Chart: D1Chart,
  speedByGraha: Record<Graha, { longitudeSpeed: number }>,
): Partial<Record<Graha, CharaKarakaInfo>> {
  const withDegree = KARAKA_GRAHAS.map((graha) => {
    const position = findGraha(d1Chart.grahas, graha);
    return { graha, degreeInSign: position.longitude % 30, isRetrograde: speedByGraha[graha].longitudeSpeed < 0 };
  });

  const ranked = [...withDegree].sort((a, b) => b.degreeInSign - a.degreeInSign);

  const result: Partial<Record<Graha, CharaKarakaInfo>> = {};
  ranked.forEach(({ graha, isRetrograde }, index) => {
    result[graha] = { abbreviation: KARAKA_ABBREVIATIONS[index], isRetrograde };
  });
  return result;
}

export function formatGrahaBodyLabel(body: string, karaka?: CharaKarakaInfo): string {
  if (!karaka) {
    return body;
  }
  return `${body}${karaka.isRetrograde ? ' (R)' : ''} - ${karaka.abbreviation}`;
}

// Bhava (house) positions, houses 1-12 as whole signs from the Ascendant
// (house N's sign = Ascendant's sign + N-1), matching how every other
// house-counting feature in this app already works. For each house:
// - House Lord: the lord of that house's D1 sign.
// - NTR: the D9 sign the house lord is posited in.
// - Dispositors: the D1 dispositor (lord of the house lord's own D1 sign)
//   and D9 dispositor (lord of the house lord's D9 sign, i.e. lord of NTR).
// - Dispositor combinations: the D1/D9 dispositors' OWN already-computed
//   Rasi Combination values from the main table (grahaRows) - reused, not
//   recalculated, per the user's explicit instruction.
export function buildBhavaPositionColumns(
  d1Chart: D1Chart,
  d9Chart: D1Chart,
  grahaRows: PlanetPositionRow[],
): BhavaPositionColumn[] {
  const combinationByGraha = new Map(grahaRows.map((row) => [row.body, row.rasiCombination]));

  return Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    const houseRasi = (d1Chart.ascendantRasi + index) % 12;
    const houseLord = RASI_LORD[houseRasi];

    const houseLordD1Rasi = findGraha(d1Chart.grahas, houseLord).rasi;
    const houseLordD9Rasi = findGraha(d9Chart.grahas, houseLord).rasi;

    const d1Dispositor = RASI_LORD[houseLordD1Rasi];
    const d9Dispositor = RASI_LORD[houseLordD9Rasi];

    return {
      house,
      houseLord,
      ntr: RASI_NAMES[houseLordD9Rasi],
      d1Dispositor,
      d9Dispositor,
      d1DispositorCombination: combinationByGraha.get(d1Dispositor) ?? '',
      d9DispositorCombination: combinationByGraha.get(d9Dispositor) ?? '',
    };
  });
}

// DNA Karma, houses 1-12 as whole signs from the Ascendant, per the user's
// own tables. For each house:
// - Degree: the Ascendant's own degree-within-sign, placed into that
//   house's rasi - the nakshatra that longitude falls in gives the Karma.
// - Sign: that house's rasi's own Karma (may be "No Karma" or a combined
//   Karma, per RASHI_KARMA).
// - Lord: that house's lord's own natal nakshatra gives the Karma.
// - Final Active Karma: the above 3 combined, dropping any "-" (No Karma).
export function buildDnaKarmaColumns(d1Chart: D1Chart): DnaKarmaColumn[] {
  const ascendantLongitude = d1Chart.ascendantLongitude ?? d1Chart.ascendantRasi * 30;
  const ascendantDegreeInRasi = ascendantLongitude % 30;

  return Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    const houseRasi = (d1Chart.ascendantRasi + index) % 12;

    const degreeLongitude = houseRasi * 30 + ascendantDegreeInRasi;
    const degreeKarma = NAKSHATRA_KARMA[calculateNakshatra(degreeLongitude)];

    const signKarma = RASHI_KARMA[houseRasi];

    const houseLord = RASI_LORD[houseRasi];
    const lordLongitude = findGraha(d1Chart.grahas, houseLord).longitude;
    const lordKarma = NAKSHATRA_KARMA[calculateNakshatra(lordLongitude)];

    const finalKarma = [degreeKarma, signKarma, lordKarma].filter((karma) => karma !== '-').join(' / ');

    return { house, degreeKarma, signKarma, lordKarma, finalKarma };
  });
}
