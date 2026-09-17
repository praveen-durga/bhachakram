import { AshtakavargaContributor, AshtakavargaTarget } from './ashtakavarga.model';

// The 7 classical planets — the only targets whose BAV feeds into the SAV
// total (which is defined as their sum, and is well-known to equal 337).
export const ASHTAKAVARGA_PLANETS: AshtakavargaTarget[] = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
];

// Display order for the 8 BAV mini-charts (7 planets + Lagna), 4 per row.
export const ASHTAKAVARGA_DISPLAY_TARGETS: AshtakavargaTarget[] = [...ASHTAKAVARGA_PLANETS, 'Lagna'];

// Lagna is never a target in the classical Parashara scheme (only a
// contributor) — its own BAV isn't independently verifiable the way the 7
// planets' tables are (no known reference total to check arithmetic
// against, no second corroborating primary/secondary source found).
export const UNVERIFIED_ASHTAKAVARGA_TARGETS: AshtakavargaTarget[] = ['Lagna'];

// Classical Parashara Bhinnashtakavarga: for each planet, the houses (1-12,
// counted from each of the 8 contributors) that receive a bindu. Verified
// against 2 independent sources and the well-known per-planet totals
// (48/49/39/54/56/52/39, summing to 337) — see
// .claude/todo-plans/18-ashtakavarga-route.md for the verification trail.
// Lagna's own row (best-effort, unverified — see UNVERIFIED_ASHTAKAVARGA_TARGETS
// above) is pieced together from secondary-source fragments, not a single
// cited table.
export const BAV_CONTRIBUTION_HOUSES: Record<AshtakavargaTarget, Record<AshtakavargaContributor, number[]>> = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11],
    Moon: [3, 6, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus: [6, 7, 12],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna: [3, 4, 6, 10, 11, 12],
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11],
    Moon: [1, 3, 6, 7, 10, 11],
    Mars: [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 4, 7, 8, 10, 11, 12],
    Venus: [3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 11],
    Lagna: [3, 6, 10, 11],
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11],
    Moon: [3, 6, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus: [6, 8, 11, 12],
    Saturn: [1, 4, 7, 8, 9, 10, 11],
    Lagna: [1, 3, 6, 10, 11],
  },
  Mercury: {
    Sun: [5, 6, 9, 11, 12],
    Moon: [2, 4, 6, 8, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter: [6, 8, 11, 12],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna: [1, 2, 4, 6, 8, 10, 11],
  },
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon: [2, 5, 7, 9, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12],
    Lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  Venus: {
    Sun: [8, 11, 12],
    Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars: [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11],
    Lagna: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11],
    Moon: [3, 6, 11],
    Mars: [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12],
    Jupiter: [5, 6, 11, 12],
    Venus: [6, 11, 12],
    Saturn: [3, 5, 6, 11],
    Lagna: [1, 3, 4, 6, 10, 11],
  },
  Lagna: {
    Sun: [3, 4, 6, 10, 11, 12],
    Moon: [3, 6, 10, 11, 12],
    Mars: [1, 3, 6, 10, 11],
    Mercury: [1, 2, 4, 6, 8, 10, 11],
    Jupiter: [1, 2, 4, 5, 6, 7, 9, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9],
    Saturn: [1, 3, 4, 6, 10, 11],
    Lagna: [1, 3, 4, 6, 10, 11],
  },
};
