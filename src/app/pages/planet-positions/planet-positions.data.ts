import { Graha } from '../../shared/services';

// Sun-based Upagrahas, BPHS Ch.3 v.61-64 ("Add 4 Rasis 13°20' to Surya's
// longitude to get Dhuma... Reduce Dhoom from 12 Rasis to arrive at
// Vyatipat... Add six Rasis to Vyatipat to know Parivesh... Deduct Parivesh
// from 12 Rasis to arrive at Chap... Add 16°40' to Chap to get Upaketu"),
// each computed from the previous per the verse's own chain, not
// pre-simplified, so each step stays individually traceable to the text.
export const DHUMA_OFFSET_DEG = 4 * 30 + 13 + 20 / 60; // 4 rasis 13°20'
export const UPAKETU_OFFSET_DEG = 16 + 40 / 60; // 16°40'

// Kalanadi table for Indu Lagna - not in BPHS, best-effort per the user's
// explicit request (see planet-positions.util.ts's calculateInduLagna for
// the counting rule). Rahu/Ketu have no entry since they own no sign and
// can't be a 9th-lord in this scheme.
export const INDU_LAGNA_KALANADI: Partial<Record<Graha, number>> = {
  Sun: 30,
  Moon: 16,
  Mars: 6,
  Mercury: 8,
  Jupiter: 10,
  Venus: 12,
  Saturn: 1,
};

// Jaimini Chara Karakas, 7-planet scheme (Sun-Saturn, no Rahu/Ketu, per the
// user's explicit choice). Rank by degree-within-sign descending, highest
// gets AK. Retrograde planets use their degree as-is, no adjustment - the
// "30 minus degree" rule is specific to Rahu in the 8-planet scheme, not
// used here (confirmed via 2 independent sources).
export const KARAKA_GRAHAS: Graha[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export const KARAKA_ABBREVIATIONS = ['AK', 'AmK', 'BK', 'MK', 'PK', 'GK', 'DK']; // rank 1 (highest degree) -> 7 (lowest)

// DNA Karma - each nakshatra's owning graha, per the user's own table.
// Indexed by nakshatra (0 = Ashwini ... 26 = Revati), matching
// NAKSHATRA_NAMES order.
export const NAKSHATRA_KARMA = [
  'Sun', // Ashwini
  'Moon', // Bharani
  'Mars', // Krittika
  'Mercury', // Rohini
  'Jupiter', // Mrigashira
  'Venus', // Ardra
  'Saturn', // Punarvasu
  'Rahu', // Pushya
  'Sun', // Ashlesha
  'Moon', // Magha
  'Mars', // Purva Phalguni
  'Mercury', // Uttara Phalguni
  'Jupiter', // Hasta
  'Venus', // Chitra
  'Saturn', // Swati
  'Rahu', // Vishakha
  'Sun', // Anuradha
  'Moon', // Jyeshtha
  'Mars', // Moola
  'Mercury', // Purva Ashadha
  'Jupiter', // Uttara Ashadha
  'Venus', // Sravana
  'Saturn', // Dhanishta
  'Rahu', // Shatabhisha
  'Sun', // Purva Bhadrapada
  'Moon', // Uttara Bhadrapada
  'Mars', // Revati
];

// DNA Karma - each rashi's own karma, per the user's own table (with the
// "Karma" suffix dropped and "No Karma" shown as "-", per the user's
// explicit display preference). Indexed by rasi (0 = Aries ... 11 = Pisces),
// matching RASI_NAMES order.
export const RASHI_KARMA = [
  'Jupiter', // Aries
  'Jupiter', // Taurus
  '-', // Gemini
  '-', // Cancer
  'Jupiter', // Leo
  'Saturn and Moon', // Virgo
  'Moon', // Libra
  '-', // Scorpio
  'Rahu', // Sagittarius
  '-', // Capricorn
  'Mars', // Aquarius
  'Sun', // Pisces
];
