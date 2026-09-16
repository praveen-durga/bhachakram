import { Graha } from '../services';

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
