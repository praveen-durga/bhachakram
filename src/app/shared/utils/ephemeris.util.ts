import { Graha, GrahaPosition, HoraResult, SunTimes } from '../services';

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

const NAKSHATRA_SPAN = 360 / 27;

export const GRAHA_ORDER: Graha[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

export const MATRIX_PLANETS = ['As', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

export function formatDegreeInRasi(longitude: number): string {
  const degreeInRasi = longitude % 30;
  const degrees = Math.floor(degreeInRasi);
  const minutes = Math.floor((degreeInRasi - degrees) * 60);
  return `${degrees}°${minutes.toString().padStart(2, '0')}'`;
}

export function calculateNakshatra(longitude: number): number {
  return Math.floor(longitude / NAKSHATRA_SPAN);
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
