import { Graha } from '../../shared/services';

// Tithi 1-14 in each paksha shares the same Graha Devata sequence; index 0 = tithi 1.
// Index 14 (tithi 15) is Purnima/Amavasya, set per-paksha in TITHI_GRAHA_DEVATA below.
const PAKSHA_GRAHA_DEVATA_SEQUENCE: Graha[] = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
];

// Keyed by tithi number 1-30 (1-15 = Shukla Paksha ending in Purnima, 16-30 = Krishna
// Paksha ending in Amavasya).
export const TITHI_GRAHA_DEVATA: Record<number, Graha> = {
  ...Object.fromEntries(PAKSHA_GRAHA_DEVATA_SEQUENCE.map((graha, i) => [i + 1, graha])),
  15: 'Saturn', // Purnima
  ...Object.fromEntries(PAKSHA_GRAHA_DEVATA_SEQUENCE.map((graha, i) => [i + 16, graha])),
  30: 'Rahu', // Amavasya
};

// Vainashika is a fixed positional offset on the (nakshatra, pada) pair: treating
// combinedIndex = nakshatraIndex * 4 + (pada - 1) (0-107), the result is
// (combinedIndex + VAINASHIKA_OFFSET) % 108 — verified against the reference
// 27x4 table (Ashwini through Revati).
export const VAINASHIKA_OFFSET = 87;

// Mudakku rasi/nakshatra are each a fixed-sum reflection of the Sun's position:
// mudakkuRasi = (MUDAKKU_RASI_SUM - sunRasi) mod 12, mudakkuNakshatra =
// (MUDAKKU_NAKSHATRA_SUM - sunNakshatra) mod 27 — verified against every row of
// the reference 12-sign and 27-nakshatra tables (all matched exactly).
export const MUDAKKU_RASI_SUM = 4;
export const MUDAKKU_NAKSHATRA_SUM = 10;

// Standard Vimshottari nakshatra-lord cycle, repeating every 9 nakshatras
// (index 0 = Ashwini). Verified against 3 reference examples (Shatabhisha →
// Rahu, Purva Ashadha → Venus, Moola → Ketu) — all matched exactly.
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

// Tithi names 1-14 in each paksha, index 0 = tithi 1 (Pratipada).
export const TITHI_NAMES: string[] = [
  'Pratipada',
  'Dwitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
];

export const SANTAN_TITHI_FAVOURABLE = new Set([5, 10, 11, 13]);
export const SANTAN_TITHI_DIFFICULT = new Set([8, 9, 14]);

export const SANTAN_TITHI_NOTES: Record<number, string> = {
  5: 'Panchami: strong emotional bond with children; affectionate offspring; prosperity through children.',
  10: 'Dashami: money, career growth, and positive karmic support through children.',
  11: 'Ekadashi: strong emotional bond with children; affectionate offspring; prosperity through children.',
  13: 'Trayodashi: strong emotional bond with children; affectionate offspring; prosperity through children.',
  8: 'Ashtami: possible health issues after childbirth.',
  9: 'Navami: possible conflicts or disagreements with children.',
  14: 'Chaturdashi: possible emotional emptiness after childbirth.',
};

// Static per-combination interpretation notes for Tithi Sphuta, keyed by
// `${rasiIndex}-${nakshatraIndex}`. Only the combinations explicitly supplied are
// present; everything else shows no note until more are provided.
export const TITHI_SPHUTA_NOTES: Record<string, string> = {
  '0-1': 'Health concerns; self-focus.', // Aries / Bharani
  '2-5': 'Anxiety about destruction/loss; concerns regarding children, studies, or market.', // Gemini / Ardra
  '5-13': 'Profit-oriented creativity.', // Virgo / Chitra
};
