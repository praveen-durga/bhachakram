import { Graha } from '../../shared/services';

// Shadbala's fixed 7-planet order (no Rahu/Ketu — Shadbala is not classically
// computed for the lunar nodes), matching shadbala.pdf's column order.
export const SHADBALA_GRAHA_ORDER: Graha[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// Exaltation longitude per planet (debilitation is the opposite point, +180°).
export const EXALTATION_LONGITUDE: Record<Graha, number> = {
  Sun: 10, // 10° Aries
  Moon: 33, // 3° Taurus
  Mars: 298, // 28° Capricorn
  Mercury: 165, // 15° Virgo
  Jupiter: 95, // 5° Cancer
  Venus: 357, // 27° Pisces
  Saturn: 200, // 20° Libra
  Rahu: 50, // 20° Taurus (not used by Shadbala; kept for Graha-keyed completeness)
  Ketu: 230, // 20° Scorpio (not used by Shadbala; kept for Graha-keyed completeness)
};

// Per-bala-type minimum requirements (virupas), from BPHS 27.37-38, grouped by
// planet. No classical minimum exists for Drig Bala (it is a +/- modifier, not
// a pass/fail category) — its "% req." row is intentionally left unimplemented.
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

export const SHADBALA_MINIMUM_REQUIREMENT: Record<Graha, number> = {
  Sun: 390,
  Moon: 360,
  Mars: 300,
  Mercury: 420,
  Jupiter: 390,
  Venus: 330,
  Saturn: 300,
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

// Paksha Bala: benefics score elongation/3 (peak at full moon), malefics score
// the complement; Moon itself doubles the benefic formula (capped at 60).
export const PAKSHA_BENEFIC_GRAHAS: Graha[] = ['Jupiter', 'Venus', 'Mercury'];

// Drig/Bhava Drishti Bala's benefic/malefic classification for aspecting
// grahas. Jupiter/Venus/Mercury always benefic; Sun/Mars/Saturn/Rahu/Ketu
// always malefic; Moon is conditional (waxing = benefic, waning = malefic —
// see calculateIsMoonWaxing in shadbala.util.ts).
export const DRISHTI_ALWAYS_BENEFIC_GRAHAS: Graha[] = ['Jupiter', 'Venus', 'Mercury'];

// Ayana Bala's sign convention: these groups ADD when the planet's declination
// is northern (Sun/Mars/Jupiter/Venus) or southern (Moon/Saturn); Mercury
// always adds the absolute declination regardless of direction.
export const AYANA_NORTHERN_ADD_GRAHAS: Graha[] = ['Sun', 'Mars', 'Jupiter', 'Venus'];
export const AYANA_SOUTHERN_ADD_GRAHAS: Graha[] = ['Moon', 'Saturn'];

// Bhava Dig Bala's sign-group classification, each group strongest at one
// kendra (house, 1-indexed) and weakest at the opposite kendra.
export const SIGN_GROUP_STRONGEST_HOUSE: Record<string, number> = {
  Nara: 1, // human signs: Gemini, Virgo, Libra, part Sagittarius, Aquarius
  Jalachara: 4, // watery signs: Cancer, part Capricorn, Pisces
  Chatushpada: 10, // quadruped signs: Aries, Taurus, Leo, part Sagittarius, Capricorn
  Keeta: 7, // insect/reptile sign: Scorpio
};

export const SIGN_GROUP: Record<number, keyof typeof SIGN_GROUP_STRONGEST_HOUSE> = {
  0: 'Chatushpada', // Aries
  1: 'Chatushpada', // Taurus
  2: 'Nara', // Gemini
  3: 'Jalachara', // Cancer
  4: 'Chatushpada', // Leo
  5: 'Nara', // Virgo
  6: 'Nara', // Libra
  7: 'Keeta', // Scorpio
  8: 'Nara', // Sagittarius (classically half-human, treated as Nara here)
  9: 'Chatushpada', // Capricorn (classically half-aquatic, treated as Chatushpada here)
  10: 'Nara', // Aquarius
  11: 'Jalachara', // Pisces
};

// Tribhaga Bala's day/night-third-to-lord mapping: each day/night is split
// into 3 equal parts, ruled in this fixed order.
export const TRIBHAGA_DAY_LORDS: Graha[] = ['Mercury', 'Sun', 'Saturn'];
export const TRIBHAGA_NIGHT_LORDS: Graha[] = ['Moon', 'Venus', 'Mars'];

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

// Bhava Bala occupant ("Planets in") contribution per occupying graha.
export const BHAVA_OCCUPANT_BALA: Record<Graha, number> = {
  Jupiter: 60,
  Mercury: 60,
  Saturn: -60,
  Mars: -60,
  Sun: -60,
  Moon: 0,
  Venus: 0,
  Rahu: 0,
  Ketu: 0,
};

// Own-sign rulership, index = rasi (0-11), used for Sapta-vargaja Bala's "Own"
// dignity and to derive Moolatrikona/friendship below.
export const RASI_LORD: Graha[] = [
  'Mars', // Aries
  'Venus', // Taurus
  'Mercury', // Gemini
  'Moon', // Cancer
  'Sun', // Leo
  'Mercury', // Virgo
  'Venus', // Libra
  'Mars', // Scorpio
  'Jupiter', // Sagittarius
  'Saturn', // Capricorn
  'Saturn', // Aquarius
  'Jupiter', // Pisces
];

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
type Relation = 'greatFriend' | 'friend' | 'neutral' | 'enemy' | 'greatEnemy';

export const NATURAL_RELATION: Record<Exclude<Graha, 'Rahu' | 'Ketu'>, Partial<Record<Graha, Relation>>> = {
  Sun: { Moon: 'friend', Mars: 'friend', Jupiter: 'friend', Mercury: 'neutral', Venus: 'enemy', Saturn: 'enemy' },
  Moon: { Sun: 'friend', Mercury: 'friend', Mars: 'neutral', Jupiter: 'neutral', Venus: 'neutral', Saturn: 'neutral' },
  Mars: { Sun: 'friend', Moon: 'friend', Jupiter: 'friend', Venus: 'neutral', Saturn: 'neutral', Mercury: 'enemy' },
  Mercury: { Sun: 'friend', Venus: 'friend', Mars: 'neutral', Jupiter: 'neutral', Saturn: 'neutral', Moon: 'enemy' },
  Jupiter: { Sun: 'friend', Moon: 'friend', Mars: 'friend', Saturn: 'neutral', Mercury: 'enemy', Venus: 'enemy' },
  Venus: { Mercury: 'friend', Saturn: 'friend', Mars: 'neutral', Jupiter: 'neutral', Sun: 'enemy', Moon: 'enemy' },
  Saturn: { Mercury: 'friend', Venus: 'friend', Jupiter: 'neutral', Sun: 'enemy', Moon: 'enemy', Mars: 'enemy' },
};

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
