import { DecadeKey } from './tajik.model';

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
