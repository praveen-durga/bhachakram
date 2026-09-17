import { Graha } from '../../shared/services';
import { Guna } from './planet-comfort.model';

// Tri-Guna classification per the user's spec (Section 3).
export const PLANET_GUNA: Record<Graha, Guna> = {
  Jupiter: 'Sathvik',
  Mercury: 'Sathvik',
  Sun: 'Rajasik',
  Moon: 'Rajasik',
  Venus: 'Rajasik',
  Mars: 'Tamasik',
  Saturn: 'Tamasik',
  Rahu: 'Tamasik',
  Ketu: 'Tamasik',
};

// Ordinal position of each Guna, used to measure Tier 1's Same/Other/Opposite
// distance (0 apart = Same, 1 apart = Other, 2 apart = Opposite).
export const GUNA_ORDER: Guna[] = ['Sathvik', 'Rajasik', 'Tamasik'];

// Tier 1 base score by Guna distance: 0 (Same) -> 30, 1 (Other) -> 15,
// 2 (Opposite) -> 5. Section 4.
export const TIER1_BY_GUNA_DISTANCE: Record<number, number> = { 0: 30, 1: 15, 2: 5 };

export const TIER2_ENEMY_PENALTY = 6;
export const TIER3_YK_UPLIFT = 10;
export const TIER3_SK_UPLIFT = 6;
export const TIER3_GROUP_UPLIFT = 5;

// Specific enemy pairs, Section 4 - directional/asymmetric exactly as given
// (e.g. Mercury's specific enemy is Mars, but Mars's specific enemy is only
// Rahu, not Mercury). Verified this reproduces every "Enemy" badge in the
// user's reference image exactly (Sun-Rahu, Rahu-Sun, Ketu-Saturn shown;
// all other rows correctly show no badge).
export const SPECIFIC_ENEMY: Record<Graha, Graha[]> = {
  Sun: ['Saturn', 'Rahu'],
  Moon: ['Saturn', 'Ketu'],
  Mars: ['Rahu'],
  Mercury: ['Mars'],
  Jupiter: ['Rahu', 'Ketu'],
  Venus: ['Ketu'],
  Saturn: ['Ketu'],
  Rahu: ['Sun', 'Mars'],
  Ketu: ['Saturn', 'Venus'],
};

// House offsets (0-indexed, i.e. house N = offset N-1) for Kona (1/5/9) and
// Trika (6/8/12), used for Tier 3's Yogakaraka/Subhakaraka determination.
export const KONA_HOUSE_OFFSETS = [0, 4, 8];
export const TRIKA_HOUSE_OFFSETS = [5, 7, 11];

// Section 8 score bands.
export const COMFORT_BAND_THRESHOLDS: { min: number; band: 'Adhimitra' | 'Mitra' | 'Sama' | 'Shatru' }[] = [
  { min: 31, band: 'Adhimitra' },
  { min: 20, band: 'Mitra' },
  { min: 10, band: 'Sama' },
  { min: 0, band: 'Shatru' },
];
