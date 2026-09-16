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
