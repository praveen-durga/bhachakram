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

// Yogi Point = normalize360(Sun + Moon + 93°20'); Avayogi = normalize360(Sun +
// Moon + 3 * 93°20', i.e. 280°) — NOT Yogi Point + 93°20' again (that earlier
// assumption was wrong; re-verified against a real reported chart where the
// app's own placeholder values (27°17' Sco Yogi, 3°57' Gem Avayogi) turned out
// to be that exact chart's expected output, and only the x3 multiplier
// reproduces the Avayogi side).
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
export const MOVABLE_KARNAM_NAMES: string[] = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti'];

// Weekday index 0 = Sunday, matching JS Date#getDay().
export const WEEKDAY_NAMES: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const WEEKDAY_LORD: Graha[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// Chaldean order (slowest to fastest orbit), used for Hora lords. The first
// hora of each weekday is that day's own WEEKDAY_LORD; the cycle then
// continues uninterrupted through all 24 day+night horas per BPHS.
export const CHALDEAN_ORDER: Graha[] = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];

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
