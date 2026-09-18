import {
  AnnualChart,
  Ayanamsa,
  ChartBody,
  D1Chart,
  EphemerisService,
  Graha,
  GrahaPosition,
  HoraResult,
  SunTimes,
} from '../services';

export const NAKSHATRA_NAMES = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshta',
  'Moola',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Sravana',
  'Dhanishta',
  'Satabhisha',
  'Purva Bhadra',
  'Uttara Bhadra',
  'Revati',
] as const;

export const RASI_NAMES = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

// Own-sign rulership, index = rasi (0-11). Rahu/Ketu own no sign classically,
// so this is Graha (not the wider set) - Saturn owns both Capricorn and
// Aquarius, Jupiter both Sagittarius and Pisces, etc. Relocated here from
// shadbala.data.ts since Planet Positions' Indu Lagna needs it too.
export const RASI_LORD: Graha[] = [
  'Mars', // Aries
  'Venus', // Taurus
  'Mercury', // Gemini
  'Moon', // Cancer
  'Sun', // Leo
  'Mercury', // Virgo
  'Venus', // Libra
  'Mars', // Scorpio
  'Jupiter', // Sagittarius
  'Saturn', // Capricorn
  'Saturn', // Aquarius
  'Jupiter', // Pisces
];

// Inverse of RASI_LORD (graha -> owned rasis), plus the modern co-rulership
// convention for the nodes (Rahu with Saturn's Aquarius, Ketu with Mars's
// Scorpio) that several house-lordship-based techniques in this app need.
// Relocated here from vargas.data.ts (as GRAHA_ARUDHA_LORDSHIP) since
// Planet Comfort's Tier 3 (Yogakaraka/Subhakaraka) needs the exact same
// mapping.
export const GRAHA_OWNED_RASIS: Record<Graha, number[]> = {
  Sun: [4], // Leo
  Moon: [3], // Cancer
  Mars: [0, 7], // Aries, Scorpio
  Mercury: [2, 5], // Gemini, Virgo
  Jupiter: [8, 11], // Sagittarius, Pisces
  Venus: [1, 6], // Taurus, Libra
  Saturn: [9, 10], // Capricorn, Aquarius
  Rahu: [10], // Aquarius (modern co-lord)
  Ketu: [7], // Scorpio (modern co-lord)
};

export const NAKSHATRA_SPAN = 360 / 27;

export const GRAHA_ORDER: Graha[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

export const MATRIX_PLANETS = ['As', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

// Relocated here from rasi-chart.component.ts since Nava Tara needs it too.
export const GRAHA_ABBREVIATIONS: Record<Graha, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

export function formatDegreeInRasi(longitude: number): string {
  const degreeInRasi = longitude % 30;
  const degrees = Math.floor(degreeInRasi);
  const minutes = Math.floor((degreeInRasi - degrees) * 60);
  return `${degrees}°${minutes.toString().padStart(2, '0')}'`;
}

export function calculateNakshatra(longitude: number): number {
  return Math.floor(longitude / NAKSHATRA_SPAN);
}

// 1-indexed nakshatra distance from `referenceNakshatraIndex` to
// `targetNakshatraIndex`, counting the reference's own nakshatra as 1 (own
// nakshatra -> 1, next -> 2, ... wrapping after 27). Reused by Nava Tara and
// Kumara Swameeyam - each of the 27 nakshatras maps to exactly one position.
export function calculateNakshatraDistance(referenceNakshatraIndex: number, targetNakshatraIndex: number): number {
  return ((targetNakshatraIndex - referenceNakshatraIndex + 27) % 27) + 1;
}

export function calculatePada(longitude: number): number {
  const degreeInNakshatra = longitude % NAKSHATRA_SPAN;
  return Math.floor(degreeInNakshatra / (NAKSHATRA_SPAN / 4)) + 1;
}

export function getRasiDistances(
  rasiA: number,
  rasiB: number,
): { forward: number; backward: number; isVargottam: boolean } {
  const forward = ((rasiB - rasiA + 12) % 12) + 1;
  const backward = ((rasiA - rasiB + 12) % 12) + 1;
  const isVargottam = rasiA === rasiB;

  return { forward, backward, isVargottam };
}

// 1-indexed navamsa pada (1-9) within the planet's own rasi.
export function calculateNavamsaPada(longitude: number): number {
  const degreeInRasi = longitude % 30;
  return Math.floor(degreeInRasi / (30 / 9)) + 1;
}

// Pushkara Navamsa pada pairs by the D1 sign's element (Fire/Earth/Air/Water,
// i.e. rasi index % 4), per Jataka Parijata 1.58 - "7th/9th Navamsa of Fiery
// signs, 3rd/5th in Earth signs, 6th/8th in Airy signs, 1st/3rd in Watery
// signs".
const PUSHKAR_NAVAMSA_PADAS_BY_ELEMENT: number[][] = [
  [7, 9], // Fire: Aries, Leo, Sagittarius
  [3, 5], // Earth: Taurus, Virgo, Capricorn
  [6, 8], // Air: Gemini, Libra, Aquarius
  [1, 3], // Water: Cancer, Scorpio, Pisces
];

export function isPushkarNavamsa(longitude: number): boolean {
  const rasi = Math.floor(longitude / 30) % 12;
  const pada = calculateNavamsaPada(longitude);
  return PUSHKAR_NAVAMSA_PADAS_BY_ELEMENT[rasi % 4].includes(pada);
}

// Visha Navamsa ("poison" navamsa) pada by rasi (0-indexed, Aries first):
// 1st pada of Aries/Taurus/Virgo/Sagittarius (Sarpa), 5th pada of
// Gemini/Leo/Libra/Aquarius (Gridha), 9th pada of Cancer/Scorpio/
// Capricorn/Pisces (Shooker).
const VISHA_NAVAMSA_PADA_BY_RASI = [1, 1, 5, 9, 5, 1, 5, 9, 1, 9, 5, 9];

export function isVishaNavamsa(longitude: number): boolean {
  const rasi = Math.floor(longitude / 30) % 12;
  const pada = calculateNavamsaPada(longitude);
  return VISHA_NAVAMSA_PADA_BY_RASI[rasi] === pada;
}

// Gandanta - the water-to-fire sign junction zone: the 1st navamsa of a Fire
// sign (Aries/Leo/Sagittarius), or the last (9th) navamsa of a Water sign
// (Cancer/Scorpio/Pisces).
export function isGandanta(longitude: number): boolean {
  const rasi = Math.floor(longitude / 30) % 12;
  const pada = calculateNavamsaPada(longitude);
  const element = rasi % 4;
  return (element === 0 && pada === 1) || (element === 3 && pada === 9);
}

// Pushkara Bhaga degree by the D1 sign's element (Fire/Earth/Air/Water), per
// CS Patel / Vidyamadhviyam / Kalamitram / Kalavidhanam. Treated as falling
// within 1 whole degree below to 30' above the listed degree (per the user's
// explicit tolerance), since birth longitudes practically never land on the
// exact minute.
const PUSHKAR_BHAGA_DEGREE_BY_ELEMENT = [21, 14, 24, 7];

export function isPushkarBhaga(longitude: number): boolean {
  const rasi = Math.floor(longitude / 30) % 12;
  const degreeInRasi = longitude % 30;
  const target = PUSHKAR_BHAGA_DEGREE_BY_ELEMENT[rasi % 4];
  return degreeInRasi >= target - 1 && degreeInRasi <= target + 0.5;
}

// Mrityu Bhaga ("death degree") - unlike Pushkara Bhaga, this is per-GRAHA,
// not per-element: each of the 7 classical grahas has its own degree in each
// sign (index = rasi, 0-11), per Phaladeepika. Rahu/Ketu have no classical
// entry (the table predates the nodes' inclusion in such degree-based
// techniques) and are intentionally omitted. Cross-checked against an
// independent 2nd source (astrosaxena.com) on 4 spot values spanning 3
// planets (Sun/Moon in Capricorn, Saturn/Jupiter in Cancer) - all matched
// exactly. Same +/-1deg/+0.5deg tolerance as Pushkara Bhaga above, for
// consistency (no single classical orb convention exists - sources range
// from 15' to a full degree).
const MRITYU_BHAGA_DEGREE: Partial<Record<Graha, number[]>> = {
  Sun: [20, 9, 12, 6, 8, 24, 16, 17, 22, 2, 3, 23],
  Moon: [26, 12, 13, 25, 24, 11, 26, 14, 13, 25, 5, 12],
  Mars: [19, 28, 25, 23, 29, 28, 14, 21, 2, 15, 11, 6],
  Mercury: [15, 14, 13, 12, 8, 18, 20, 10, 21, 22, 7, 5],
  Jupiter: [19, 29, 12, 27, 6, 4, 13, 10, 17, 11, 15, 28],
  Venus: [28, 15, 11, 17, 10, 13, 4, 6, 27, 12, 29, 19],
  Saturn: [10, 4, 7, 9, 12, 16, 3, 18, 28, 14, 13, 15],
};

export function isMrityuBhaga(body: string, longitude: number): boolean {
  const degrees = MRITYU_BHAGA_DEGREE[body as Graha];
  if (!degrees) {
    return false;
  }
  const rasi = Math.floor(longitude / 30) % 12;
  const degreeInRasi = longitude % 30;
  const target = degrees[rasi];
  return degreeInRasi >= target - 1 && degreeInRasi <= target + 0.5;
}

// 1-indexed pada across the full 108-pada zodiac cycle (27 nakshatras x 4
// padas each, 3°20' apart), Ashwini pada 1 = 1, Revati pada 4 = 108.
function calculateGlobalPada(longitude: number): number {
  return calculateNakshatra(longitude) * 4 + calculatePada(longitude);
}

// "Temp Gandanta" - trine-boundary junction padas, counted as whole padas
// forward from (i.e. not including) the Ascendant's own pada: the 36th and
// 37th padas forward straddle the exact 120° trine point, the 72nd and 73rd
// straddle 240°, and the 107th (the "108th" counting the Ascendant's own
// pada as the 1st of 108) is the pada just before completing the full 360°
// circle back to the Ascendant's own pada.
const TEMP_GANDANTA_DISTANCES = [36, 37, 72, 73, 107];

export function isTempGandanta(longitude: number, ascendantLongitude: number): boolean {
  const globalPada = calculateGlobalPada(longitude);
  const ascendantGlobalPada = calculateGlobalPada(ascendantLongitude);
  const distance = (globalPada - ascendantGlobalPada + 108) % 108;
  return TEMP_GANDANTA_DISTANCES.includes(distance);
}

export function calculateD9Rasi(longitude: number): number {
  const rasi = Math.floor(longitude / 30);
  const degreeInRasi = longitude % 30;
  const navamsaIndex = Math.floor(degreeInRasi / (30 / 9));

  const modality = rasi % 3;
  const startRasi = modality === 0 ? rasi : modality === 1 ? (rasi + 8) % 12 : (rasi + 4) % 12;

  return (startRasi + navamsaIndex) % 12;
}

export function findGraha(grahas: GrahaPosition[], graha: Graha): GrahaPosition {
  const found = grahas.find((g) => g.graha === graha);
  if (!found) {
    throw new Error(`Missing graha position for ${graha}`);
  }
  return found;
}

function chartBodyLongitude(d1Chart: D1Chart, bodyKey: string): number {
  if (bodyKey === 'Ascendant') {
    return d1Chart.ascendantLongitude ?? d1Chart.ascendantRasi * 30;
  }
  return findGraha(d1Chart.grahas, bodyKey as Graha).longitude;
}

// The Ascendant + 9 grahas as a single flat list - relocated here from
// pages/navatara since Kumara Swameeyam is a 2nd consumer.
export function buildChartBodies(d1Chart: D1Chart): ChartBody[] {
  return ['Ascendant', ...GRAHA_ORDER].map((key) => {
    const longitude = chartBodyLongitude(d1Chart, key);
    return {
      key,
      label: key === 'Ascendant' ? 'Lagna' : key,
      abbreviation: key === 'Ascendant' ? 'ASC' : GRAHA_ABBREVIATIONS[key as Graha],
      nakshatraIndex: calculateNakshatra(longitude),
      pada: calculatePada(longitude),
    };
  });
}

// Weekday index 0 = Sunday, matching JS Date#getDay().
export const WEEKDAY_LORD: Graha[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// Chaldean order (slowest to fastest orbit), used for Hora lords. The first
// hora of each weekday is that day's own WEEKDAY_LORD; the cycle then
// continues uninterrupted through all 24 day+night horas per BPHS.
export const CHALDEAN_ORDER: Graha[] = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];

export function calculateHora(birthTime: Date, sunTimes: SunTimes, weekday: number): HoraResult {
  const { sunrise, sunset, nextSunrise } = sunTimes;
  const isDayHora = birthTime >= sunrise && birthTime < sunset;

  const segmentStart = isDayHora ? sunrise : sunset;
  const segmentEnd = isDayHora ? sunset : nextSunrise;
  const horaLength = (segmentEnd.getTime() - segmentStart.getTime()) / 12;
  const indexWithinSegment = Math.min(11, Math.floor((birthTime.getTime() - segmentStart.getTime()) / horaLength));
  const horaIndex = (isDayHora ? 0 : 12) + indexWithinSegment + 1;

  return { horaIndex, isDayHora };
}

export function getHoraLord(weekday: number, horaIndex: number): Graha {
  const weekdayLordIndex = CHALDEAN_ORDER.indexOf(WEEKDAY_LORD[weekday]);
  return CHALDEAN_ORDER[(weekdayLordIndex + horaIndex - 1) % 7];
}

// Mandi/Gulika's POSITION (not the "Gulika Kalam" muhurta timing-window
// feature, a different simpler concept using an 8-part division) uses a
// 15-muhurta division of the day: Mandi's instant = sunrise + (dayLength/15)
// * muhurtaCount(weekday), with the classic descending-odd-number sequence
// 13-11-9-7-5-3-1 for Sun-Sat. Verified to sub-second precision against a
// real reference chart's reported Mandi position (an earlier 8-part-portion
// implementation was off by up to a full rasi — do not reintroduce it).
export const MANDI_DAY_MUHURTA_COUNT: number[] = [13, 11, 9, 7, 5, 3, 1]; // index 0 = Sunday

// Night muhurta counts: same descending-odd sequence, rotated by 4 days
// relative to day (night's 8-part cycle for a given weekday starts 5
// planets forward from that weekday's own lord). Cross-checked against two
// independent secondary sources that agree with each other and with the
// day table's part→muhurta conversion — but UNLIKE the day table, this has
// NOT been verified against a real night-birth reference chart. Treat as a
// reasonable default, not a confirmed-correct formula, until tested — see
// .claude/todo-plans/11-panchang-ui.md.
export const MANDI_NIGHT_MUHURTA_COUNT: number[] = [5, 3, 1, 13, 11, 9, 7]; // index 0 = Sunday

// Returns the instant at which the Ascendant must be computed to get Mandi's
// longitude: sunrise + (dayLength / 15) * muhurtaCount for a daytime birth,
// or sunset + (nightLength / 15) * muhurtaCount for a nighttime birth (the
// classical 15-muhurta division). Day formula/table verified to sub-second
// precision against a real reference chart's reported Mandi position — an
// earlier 8-part-day-portion implementation ("Gulika Kalam" — a different,
// unrelated concept: an auspicious/inauspicious TIME WINDOW, not Mandi's
// chart position) was off by up to a full rasi, do not reintroduce it.
// The NIGHT table is only logically derived/cross-checked against secondary
// sources, NOT yet verified against a real night-birth reference chart —
// see .claude/todo-plans/11-panchang-ui.md for the open verification task.
// Also unresolved: for a birth between midnight and that day's own sunrise,
// the "weekday" for the preceding night technically belongs to the previous
// calendar day's sunset — not handled here, `weekday` is always the birth's
// own calendar-day weekday. Relocated here from panchang.util.ts since
// Planet Positions needs it too.
export function getMandiInstant(birthTime: Date, sunTimes: SunTimes, weekday: number): Date {
  const { sunrise, sunset, nextSunrise } = sunTimes;
  const isDay = birthTime >= sunrise && birthTime < sunset;

  if (isDay) {
    const dayLength = sunset.getTime() - sunrise.getTime();
    const muhurtaLength = dayLength / 15;
    return new Date(sunrise.getTime() + MANDI_DAY_MUHURTA_COUNT[weekday] * muhurtaLength);
  }

  const nightLength = nextSunrise.getTime() - sunset.getTime();
  const muhurtaLength = nightLength / 15;
  return new Date(sunset.getTime() + MANDI_NIGHT_MUHURTA_COUNT[weekday] * muhurtaLength);
}

// Standard Vimshottari nakshatra-lord cycle, repeating every 9 nakshatras
// (index 0 = Ashwini). Verified against 3 reference examples (Shatabhisha →
// Rahu, Purva Ashadha → Venus, Moola → Ketu) — all matched exactly. Relocated
// here from panchang.util.ts since Planet Comfort needs it too.
export const NAKSHATRA_LORD_CYCLE: Graha[] = [
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
];

export function getNakshatraLord(nakshatra: number): Graha {
  return NAKSHATRA_LORD_CYCLE[nakshatra % 9];
}

// Full Vimshottari dasha length per lord (years), sums to 120, same 9-lord
// order as NAKSHATRA_LORD_CYCLE. Relocated here from dasha.data.ts since
// Tajik's Mudda Dasha needs it too (it's the same table compressed 3x into
// a 360-day year).
export const VIMSHOTTARI_DASHA_YEARS: Record<Graha, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export const VIMSHOTTARI_TOTAL_YEARS = 120;

// Relocated here from panchang.util.ts since the main D1 chart's Dagdha
// Rasi indicator needs it too.
export function calculateBirthTithiNumber(sunLongitude: number, moonLongitude: number): number {
  const raw = (((moonLongitude - sunLongitude) % 360) + 360) % 360;
  return Math.floor(raw / 12) + 1;
}

// Classical Muhurta Shastra: for each tithi-within-paksha (1-14, index
// 0-13 below; Purnima/Amavasya at 15 have none), the rasi(s) considered
// "dagdha" (burnt) — inauspicious for the Moon to transit for starting new
// activities. Same table applies to both Shukla and Krishna paksha.
// Cross-checked against 3 independent sources: 2 agreed exactly on all 14
// rows; the 3rd broke a tie against a lone outlier on tithis 10 and 13.
const DAGDHA_RASI_BY_TITHI: number[][] = [
  [6, 9], // 1 Pratipada — Libra, Capricorn
  [8, 11], // 2 Dwitiya — Sagittarius, Pisces
  [4, 9], // 3 Tritiya — Leo, Capricorn
  [1, 10], // 4 Chaturthi — Taurus, Aquarius
  [2, 5], // 5 Panchami — Gemini, Virgo
  [0, 4], // 6 Shashti — Aries, Leo
  [3, 8], // 7 Saptami — Cancer, Sagittarius
  [2, 5], // 8 Ashtami — Gemini, Virgo
  [4, 7], // 9 Navami — Leo, Scorpio
  [4, 7], // 10 Dashami — Leo, Scorpio
  [8, 11], // 11 Ekadashi — Sagittarius, Pisces
  [6, 9], // 12 Dwadashi — Libra, Capricorn
  [1, 4], // 13 Trayodashi — Taurus, Leo
  [11, 2, 5, 8], // 14 Chaturdashi — Pisces, Gemini, Virgo, Sagittarius
  [], // 15 Purnima/Amavasya — none
];

export function getDagdhaRasis(tithiNumber: number): number[] {
  const dayInPaksha = ((tithiNumber - 1) % 15) + 1;
  return DAGDHA_RASI_BY_TITHI[dayInPaksha - 1];
}

// Muntha - sign-only progression of the natal Ascendant, one rasi per
// elapsed year (age=0 at birth = the natal Lagna's own sign). Confirmed
// directly against PyJHora's tajaka.py (muntha_house), this project's
// existing reference standard for classical formulas. Relocated here from
// pages/tajik/tajik-chart.util.ts since the root app component's chart
// display is now a 2nd consumer.
export function calculateMuntha(natalAscendantRasi: number, age: number): number {
  return (((natalAscendantRasi + age) % 12) + 12) % 12;
}

// Varshapravesh (Tajik annual return) chart, `age` years after birth.
export async function buildAnnualChart(
  ephemeris: EphemerisService,
  natalSunLongitude: number,
  natalAscendantRasi: number,
  birthDatetime: Date,
  age: number,
  lat: number,
  lng: number,
  ayanamsa: Ayanamsa,
): Promise<AnnualChart> {
  const instant = await ephemeris.findSolarReturn(natalSunLongitude, birthDatetime, age, ayanamsa);
  const chart = await ephemeris.calculateD1Chart(instant, lat, lng, ayanamsa);
  const munthaRasi = calculateMuntha(natalAscendantRasi, age);

  return { chart, munthaRasi, instant, age };
}

// Completed years since birth, as of `now` (0 = not yet had a birthday).
export function currentAge(birthDatetime: Date, now: Date): number {
  let age = now.getUTCFullYear() - birthDatetime.getUTCFullYear();
  const birthdayThisYear = new Date(
    Date.UTC(now.getUTCFullYear(), birthDatetime.getUTCMonth(), birthDatetime.getUTCDate()),
  );
  if (now < birthdayThisYear) {
    age -= 1;
  }
  return Math.max(0, age);
}
