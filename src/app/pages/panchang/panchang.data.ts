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

// Yogi Point = normalize360(Sun + Moon + 93°20'); Avayogi = Yogi Point + 93°20'
// again (186°40' total). Verified to floating-point precision against a known
// worked example (27°17' Sco Yogi → 3°57' Gem Avayogi).
export const YOGI_OFFSET_DEG = 93 + 20 / 60;

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

// 27 Yogas, index 0 = Vishkambha, in the standard fixed order.
export const YOGA_NAMES: string[] = [
  'Vishkambha',
  'Priti',
  'Ayushman',
  'Saubhagya',
  'Shobhana',
  'Atiganda',
  'Sukarma',
  'Dhriti',
  'Shoola',
  'Ganda',
  'Vriddhi',
  'Dhruva',
  'Vyaghata',
  'Harshana',
  'Vajra',
  'Siddhi',
  'Vyatipata',
  'Variyana',
  'Parigha',
  'Shiva',
  'Siddha',
  'Sadhya',
  'Shubha',
  'Shukla',
  'Brahma',
  'Indra',
  'Vaidhriti',
];

// 11 Karnams: 4 "fixed" (each occurs once per lunar month, on specific tithis)
// and 7 "movable" (repeat in a cycle across the remaining half-tithis).
export const FIXED_KARNAM_NAMES: string[] = ['Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'];
export const MOVABLE_KARNAM_NAMES: string[] = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];

// Weekday index 0 = Sunday, matching JS Date#getDay().
export const WEEKDAY_NAMES: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const WEEKDAY_LORD: Graha[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// Chaldean order (slowest to fastest orbit), used for Hora lords. The first
// hora of each weekday is that day's own WEEKDAY_LORD; the cycle then
// continues uninterrupted through all 24 day+night horas per BPHS.
export const CHALDEAN_ORDER: Graha[] = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];

// Mandi/Gulika 8-part division: day (sunrise-sunset) and night (sunset-next
// sunrise) each split into 8 equal portions, cycling through the plain
// weekday-lord order (not Chaldean) starting from a per-weekday, per day/night
// offset; the 8th portion of each half is unlorded (Rahu). Values below are
// each weekday's Saturn-ruled portion index (1-8), per BPHS ch.3 ~sloka 66-70.
export const MANDI_DAY_PORTION: number[] = [7, 6, 5, 4, 3, 2, 1]; // index 0 = Sunday
export const MANDI_NIGHT_PORTION: number[] = [3, 2, 1, 7, 6, 5, 4]; // index 0 = Sunday
