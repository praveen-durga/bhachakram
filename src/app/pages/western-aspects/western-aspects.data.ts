import { Graha } from '../../shared/services';

// Row/column order for the Western Aspects matrix, matching the user's own
// reference table.
export const WESTERN_ASPECT_GRAHA_ORDER: Graha[] = [
  'Moon',
  'Sun',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
];

// Highlight ranges [min, max] (inclusive) for the aspect matrix, per the
// user's own table - centered on conjunction (0/~360), semi-square (45),
// sextile (60), square (90), trine (120), quincunx (150) and opposition
// (180), plus their mirrors past 180 (since the underlying difference isn't
// folded to the shorter arc - see calculateAngularDifference).
export const WESTERN_ASPECT_HIGHLIGHT_RANGES: [number, number][] = [
  [0, 8],
  [44, 46],
  [58, 62],
  [88, 92],
  [118, 122],
  [148, 152],
  [172, 188],
  [207, 213],
  [238, 242],
  [268, 272],
  [298, 302],
];
