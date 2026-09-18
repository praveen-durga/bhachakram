import { Ayanamsa, EphemerisService } from '../../shared/services';
import { AnnualChart, DecadeKey } from './tajik.model';

// Muntha - sign-only progression of the natal Ascendant, one rasi per
// elapsed year (age=0 at birth = the natal Lagna's own sign). Confirmed
// directly against PyJHora's tajaka.py (muntha_house), this project's
// existing reference standard for classical formulas.
export function calculateMuntha(natalAscendantRasi: number, age: number): number {
  return (((natalAscendantRasi + age) % 12) + 12) % 12;
}

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

export const DECADE_KEYS: DecadeKey[] = [
  '1-10',
  '10-20',
  '20-30',
  '30-40',
  '40-50',
  '50-60',
  '60-70',
  '70-80',
  '80-90',
];

// "1 to 10" is the first decade of life (ages 0-9, i.e. the 1st-10th
// birthday), labeled starting at "1" per the user's own wording rather than
// "0 to 10" - every other decade tab's label matches its age range exactly
// (e.g. "10 to 20" = ages 10-19), so this is the only special case needed to
// keep the 9 tabs' age ranges non-overlapping.
export function decadeAges(decade: DecadeKey): number[] {
  const start = decade === '1-10' ? 0 : Number(decade.split('-')[0]);
  return Array.from({ length: 10 }, (_, i) => start + i);
}
