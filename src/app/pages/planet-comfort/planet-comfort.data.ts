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

// Nakshatra Gana (Deva/Manushya/Rakshasa), indexed exactly as NAKSHATRA_NAMES
// - the nakshatra's own classification, not the Tri-Guna of its ruling lord
// (e.g. Swati is Deva/Sathvik despite being Rahu-ruled).
export const NAKSHATRA_GUNA: Guna[] = [
  'Sathvik', // Ashwini
  'Rajasik', // Bharani
  'Tamasik', // Krittika
  'Rajasik', // Rohini
  'Sathvik', // Mrigashira
  'Rajasik', // Ardra
  'Sathvik', // Punarvasu
  'Sathvik', // Pushya
  'Tamasik', // Ashlesha
  'Tamasik', // Magha
  'Rajasik', // Purva Phalguni
  'Rajasik', // Uttara Phalguni
  'Sathvik', // Hasta
  'Tamasik', // Chitra
  'Sathvik', // Swati
  'Tamasik', // Vishakha
  'Sathvik', // Anuradha
  'Tamasik', // Jyeshta
  'Tamasik', // Moola
  'Rajasik', // Purva Ashadha
  'Rajasik', // Uttara Ashadha
  'Sathvik', // Sravana
  'Tamasik', // Dhanishta
  'Tamasik', // Satabhisha
  'Rajasik', // Purva Bhadra
  'Rajasik', // Uttara Bhadra
  'Sathvik', // Revati
];

// Ordinal position of each Guna, used to measure Tier 1's Same/Other/Opposite
// distance (0 apart = Same, 1 apart = Other, 2 apart = Opposite).
export const GUNA_ORDER: Guna[] = ['Sathvik', 'Rajasik', 'Tamasik'];

// Tier 1 base score by Guna distance: 0 (Same) -> 30, 1 (Other) -> 15,
// 2 (Opposite) -> 5. Section 4.
export const TIER1_BY_GUNA_DISTANCE: Record<number, number> = { 0: 30, 1: 15, 2: 5 };

export const TIER2_ENEMY_PENALTY = 6;
export const TIER3_YK_UPLIFT = 10;
export const TIER3_SK_UPLIFT = 6;

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

// House offsets (0-indexed, i.e. house N = offset N-1) for Kendra (1/4/7/10)
// and Kona/Trikona (1/5/9), used for Tier 3's Yogakaraka (owns both) /
// Subhakaraka (owns Kona only) determination.
export const KENDRA_HOUSE_OFFSETS = [0, 3, 6, 9];
export const KONA_HOUSE_OFFSETS = [0, 4, 8];

// Result Analysis score bands.
export const COMFORT_BAND_THRESHOLDS: {
  min: number;
  band: 'Exceptional Comfort' | 'Moderate Comfort' | 'Friction Strain' | 'Severe Distress';
}[] = [
  { min: 32, band: 'Exceptional Comfort' },
  { min: 22, band: 'Moderate Comfort' },
  { min: 10, band: 'Friction Strain' },
  { min: 0, band: 'Severe Distress' },
];
