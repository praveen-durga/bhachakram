import { Graha } from '../../shared/services';

// Relocated to shared/utils since Transit Aspects' Result column needs it too.
export { EXALTATION_LONGITUDE } from '../../shared/utils';

// Shadbala's fixed 7-planet order (no Rahu/Ketu — Shadbala is not classically
// computed for the lunar nodes), matching shadbala.pdf's column order.
export const SHADBALA_GRAHA_ORDER: Graha[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// Minimum Shadbala requirement in Rupas (not virupas), per the user's own
// table — "% of required" = Shadbala in Rupas * 100 / this value.
export const SHADBALA_MINIMUM_REQUIREMENT: Record<Graha, number> = {
  Sun: 5.0,
  Moon: 6.0,
  Mars: 5.0,
  Mercury: 7.0,
  Jupiter: 6.5,
  Venus: 5.5,
  Saturn: 5.0,
  Rahu: 0,
  Ketu: 0,
};

// Sthana Bala's own per-planet minimum (virupas), from BPHS 27.37, used by
// the standalone Sthana Bala - Positional Strength table (distinct from
// SHADBALA_MINIMUM_REQUIREMENT above, which is the overall Shadbala minimum
// in Rupas).
export const STHANA_BALA_MINIMUM: Record<Graha, number> = {
  Sun: 165,
  Jupiter: 165,
  Mercury: 165,
  Moon: 133,
  Venus: 133,
  Mars: 96,
  Saturn: 96,
  Rahu: 0,
  Ketu: 0,
};

// Sthana Bala - Positional Strength significance, per the user's own table -
// keyed by RANK (1st/2nd/3rd strongest, whichever planet that turns out to
// be for a given chart), not by planet identity. Ranks below 3rd have no
// significance text.
export const STHANA_BALA_STRENGTH_SIGNIFICANCE: string[] = [
  'Ego; greater success, name and fame',
  'Peace of mind and emotional happiness',
  'Matrimonial life and companionship',
];

// Kaala Bala's own per-planet minimum (virupas), used by the standalone
// Kaala Bala - Time Strength table.
export const KAALA_BALA_MINIMUM: Record<Graha, number> = {
  Sun: 50,
  Jupiter: 50,
  Mercury: 50,
  Moon: 30,
  Venus: 30,
  Mars: 40,
  Saturn: 40,
  Rahu: 0,
  Ketu: 0,
};

// Fixed benefic/malefic nature per planet, per the user's own table - Moon
// is shown as "Benefic/Malefic" (dual) unconditionally, not resolved by
// waxing/waning.
export const GRAHA_NATURE: Record<Graha, string> = {
  Sun: 'Malefic',
  Moon: 'Benefic/Malefic',
  Mars: 'Malefic',
  Mercury: 'Benefic',
  Jupiter: 'Benefic',
  Venus: 'Benefic',
  Saturn: 'Malefic',
  Rahu: '',
  Ketu: '',
};

// Dig Bala's own per-planet minimum (virupas), used by the standalone Dig
// Bala - Directional Strength table.
export const DIG_BALA_MINIMUM: Record<Graha, number> = {
  Sun: 35,
  Jupiter: 35,
  Mercury: 35,
  Moon: 50,
  Venus: 50,
  Mars: 30,
  Saturn: 30,
  Rahu: 0,
  Ketu: 0,
};

// Fixed strongest direction per planet, per the user's own table.
export const DIG_BALA_DIRECTION: Record<Graha, string> = {
  Sun: 'East',
  Moon: 'North West',
  Mars: 'South',
  Mercury: 'North',
  Jupiter: 'North-East',
  Venus: 'South-East',
  Saturn: 'West',
  Rahu: '',
  Ketu: '',
};

// Chesta Bala's own per-planet minimum (virupas), used by the standalone
// Chesta Bala - Motional Strength table. Note this is on a different scale
// than raw Chesta Bala (max 60) - the table's Ratio column rescales
// (Secured Chesta Bala * 60 / Minimum) to compensate, per the user's own
// worked example.
export const CHESTA_BALA_MINIMUM: Record<Graha, number> = {
  Sun: 112,
  Jupiter: 112,
  Mercury: 112,
  Moon: 100,
  Venus: 100,
  Mars: 67,
  Saturn: 67,
  Rahu: 0,
  Ketu: 0,
};

// Naisargika Bala is a universal constant, rank/7 * 60 virupas, in this fixed
// strength order (never varies by chart).
export const NAISARGIKA_BALA: Record<Graha, number> = {
  Saturn: (1 / 7) * 60,
  Mars: (2 / 7) * 60,
  Mercury: (3 / 7) * 60,
  Jupiter: (4 / 7) * 60,
  Venus: (5 / 7) * 60,
  Moon: (6 / 7) * 60,
  Sun: (7 / 7) * 60,
  Rahu: 0,
  Ketu: 0,
};

// Dig Bala's weakest/strongest house (from the Ascendant) per planet.
export const DIG_BALA_WEAKEST_HOUSE: Record<Graha, number> = {
  Jupiter: 7,
  Mercury: 7,
  Sun: 4,
  Mars: 4,
  Moon: 10,
  Venus: 10,
  Saturn: 1,
  Rahu: 0,
  Ketu: 0,
};

// Odd-sign placement scores Ojhayugma Bala for these; even-sign for the rest
// (Moon/Venus).
export const OJHAYUGMA_ODD_SIGN_GRAHAS: Graha[] = ['Sun', 'Mars', 'Jupiter', 'Mercury', 'Saturn'];

// Gender-drekkana grouping for Drekkana Bala: male scores in the 1st drekkana
// (0-10°), neutral in the 2nd (10-20°), female in the 3rd (20-30°).
export const DREKKANA_MALE_GRAHAS: Graha[] = ['Sun', 'Jupiter', 'Mars'];
export const DREKKANA_NEUTRAL_GRAHAS: Graha[] = ['Mercury', 'Saturn'];
export const DREKKANA_FEMALE_GRAHAS: Graha[] = ['Moon', 'Venus'];

// Nata-Unnata Bala: diurnal planets peak at noon, nocturnal at midnight;
// Mercury is constant regardless of time of day.
export const NATA_UNNATA_DIURNAL_GRAHAS: Graha[] = ['Sun', 'Jupiter', 'Venus'];
export const NATA_UNNATA_NOCTURNAL_GRAHAS: Graha[] = ['Moon', 'Mars', 'Saturn'];

// Bhava Drishti Bala's OWN static benefic/malefic classification (distinct
// from Paksha/Drig Bala's shared one below) — Moon is unconditionally
// benefic here.
export const BHAVA_DRISHTI_BENEFIC_GRAHAS: Graha[] = ['Moon', 'Mercury', 'Jupiter', 'Venus'];

// Paksha Bala and Drig Bala's shared static benefic seed list (everything
// else - Sun/Mars/Saturn, and Moon when waning - is malefic) — verified
// against a real JHora chart (20-03-1981, Chittoor): a dynamic Mars-sign-
// occupancy rule for Mercury (tried first) put it as malefic for that
// chart, but both JHora's Paksha Bala (Mercury = 58.21, the benefic-branch
// value) and Drig Bala (Sun/Moon/Mars/Venus exact, Jupiter/Saturn within
// ~0.5) only matched once Mercury was treated as a plain benefic instead.
// Moon still follows waxing/waning — see calculateBenefics in
// shadbala.util.ts.
export const BENEFIC_SEED_GRAHAS: Graha[] = ['Jupiter', 'Venus', 'Mercury'];

// Graha Drishti: house offsets (from the aspecting graha's own house) every
// graha aspects. All grahas aspect the 7th; Mars/Jupiter/Saturn additionally
// aspect their special houses.
export const GRAHA_DRISHTI_HOUSES: Record<Graha, number[]> = {
  Sun: [7],
  Moon: [7],
  Mars: [4, 7, 8],
  Mercury: [7],
  Jupiter: [5, 7, 9],
  Venus: [7],
  Saturn: [3, 7, 10],
  Rahu: [7],
  Ketu: [7],
};

// Rasi Drishti (sign-based aspect): movable and fixed signs mutually aspect
// each other except the immediately adjacent sign; dual signs aspect every
// other dual sign. Indexed by rasi (0-11).
export const MOVABLE_SIGNS = [0, 3, 6, 9];
export const FIXED_SIGNS = [1, 4, 7, 10];
export const DUAL_SIGNS = [2, 5, 8, 11];

// Ayana Bala's sign convention: these groups ADD when the planet's declination
// is northern (Sun/Mars/Jupiter/Venus) or southern (Moon/Saturn); Mercury
// always adds the absolute declination regardless of direction.
export const AYANA_NORTHERN_ADD_GRAHAS: Graha[] = ['Sun', 'Mars', 'Jupiter', 'Venus'];
export const AYANA_SOUTHERN_ADD_GRAHAS: Graha[] = ['Moon', 'Saturn'];

// Bhava Dig Bala: each sign-group's reference house (0-indexed from the
// Ascendant: 0=house1, 3=house4, 9=house10, 6=house7) paired with the
// absolute longitude ranges (degrees, 0-360, not sign-relative) that belong
// to that group.
export const BHAVA_DIG_BALA_GROUPS: { referenceHouse: number; longitudeRanges: [number, number][] }[] = [
  {
    referenceHouse: 0, // Nara (human signs)
    longitudeRanges: [
      [60, 90],
      [150, 180],
      [180, 210],
      [240, 255],
      [300, 330],
    ],
  },
  {
    referenceHouse: 3, // Jalachara (watery signs)
    longitudeRanges: [
      [90, 120],
      [285, 300],
      [330, 360],
    ],
  },
  {
    referenceHouse: 9, // Chatushpada (quadruped signs)
    longitudeRanges: [
      [0, 30],
      [30, 60],
      [120, 150],
      [255, 270],
      [270, 285],
    ],
  },
  {
    referenceHouse: 6, // Keeta (insect/reptile sign)
    longitudeRanges: [[210, 240]],
  },
];

// Tribhaga Bala's day/night-third-to-lord mapping: each day/night is split
// into 3 equal parts, ruled in this fixed order.
export const TRIBHAGA_DAY_LORDS: Graha[] = ['Mercury', 'Sun', 'Saturn'];
export const TRIBHAGA_NIGHT_LORDS: Graha[] = ['Moon', 'Venus', 'Mars'];

// Varsha/Maasa/Vaara Bala's ahargana epoch anchors (per JHora, sourced from
// "BV Raman's Bhava and Graha Bala Table - I") and the 0-6 remap table that
// converts an ahargana-derived index into a weekday index (0=Sunday).
export const VARSHA_MAASA_EPOCH = { baseYear: 1951, baseDays: 174 };
export const VAARA_EPOCH = { baseYear: 1827, baseDays: 244 };
export const ABDAHIPATHI_WEEKDAYS = [2, 3, 4, 5, 6, 0, 1];

// Graha Yuddha (planetary war) is restricted to these 5 "star planets" —
// Rahu/Ketu/Sun/Moon never participate.
export const YUDDHA_GRAHAS: Graha[] = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// Standard angular disc diameters (arcseconds), used as Yuddha Bala's divisor.
export const DISC_DIAMETER_ARCSEC: Partial<Record<Graha, number>> = {
  Mars: 9.4,
  Mercury: 6.6,
  Jupiter: 190.4,
  Venus: 16.6,
  Saturn: 158.0,
};

// Moolatrikona sign + degree range per planet (classical BPHS ranges); Rahu/Ketu
// have no Moolatrikona and are excluded from Shadbala entirely.
export const MOOLATRIKONA: Partial<Record<Graha, { rasi: number; from: number; to: number }>> = {
  Sun: { rasi: 4, from: 0, to: 20 }, // Leo 0-20°
  Moon: { rasi: 1, from: 3, to: 30 }, // Taurus 3-30°
  Mars: { rasi: 0, from: 0, to: 12 }, // Aries 0-12°
  Mercury: { rasi: 5, from: 15, to: 20 }, // Virgo 15-20°
  Jupiter: { rasi: 8, from: 0, to: 10 }, // Sagittarius 0-10°
  Venus: { rasi: 6, from: 0, to: 15 }, // Libra 0-15°
  Saturn: { rasi: 10, from: 0, to: 20 }, // Aquarius 0-20°
};

// Natural friendship table (Great Friend / Friend / Neutral / Enemy / Great
// Enemy), from BPHS — Rahu/Ketu excluded (not used by Shadbala).
export type Relation = 'greatFriend' | 'friend' | 'neutral' | 'enemy' | 'greatEnemy';

export const NATURAL_RELATION: Record<Exclude<Graha, 'Rahu' | 'Ketu'>, Partial<Record<Graha, Relation>>> = {
  Sun: { Moon: 'friend', Mars: 'friend', Jupiter: 'friend', Mercury: 'neutral', Venus: 'enemy', Saturn: 'enemy' },
  Moon: { Sun: 'friend', Mercury: 'friend', Mars: 'neutral', Jupiter: 'neutral', Venus: 'neutral', Saturn: 'neutral' },
  Mars: { Sun: 'friend', Moon: 'friend', Jupiter: 'friend', Venus: 'neutral', Saturn: 'neutral', Mercury: 'enemy' },
  Mercury: { Sun: 'friend', Venus: 'friend', Mars: 'neutral', Jupiter: 'neutral', Saturn: 'neutral', Moon: 'enemy' },
  Jupiter: { Sun: 'friend', Moon: 'friend', Mars: 'friend', Saturn: 'neutral', Mercury: 'enemy', Venus: 'enemy' },
  Venus: { Mercury: 'friend', Saturn: 'friend', Mars: 'neutral', Jupiter: 'neutral', Sun: 'enemy', Moon: 'enemy' },
  Saturn: { Mercury: 'friend', Venus: 'friend', Jupiter: 'neutral', Sun: 'enemy', Moon: 'enemy', Mars: 'enemy' },
};

// Temporal (Tatkalika) friendship: houses 2,3,4,10,11,12 from a planet's own
// house are temporary friends, the rest (1,5,6,7,8,9) temporary enemies.
export const TEMPORARY_FRIEND_HOUSES = [2, 3, 4, 10, 11, 12];

// Sapta-vargaja Bala's dignity-point ladder (the BPHS halving progression, not
// the rounded 45/30/20/15/10/4/2 variant some secondary sites use).
export const DIGNITY_POINTS: Record<'moolatrikona' | 'own' | Relation, number> = {
  moolatrikona: 45,
  own: 30,
  greatFriend: 22.5,
  friend: 15,
  neutral: 7.5,
  enemy: 3.75,
  greatEnemy: 1.875,
};
