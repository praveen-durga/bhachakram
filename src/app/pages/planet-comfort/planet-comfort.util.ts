import { Graha } from '../../shared/services';
import {
  calculateNakshatra,
  calculatePada,
  getNakshatraLord,
  GRAHA_OWNED_RASIS,
  isPushkarNavamsa,
  NAKSHATRA_NAMES,
} from '../../shared/utils';
import {
  COMFORT_BAND_THRESHOLDS,
  GUNA_ORDER,
  KENDRA_HOUSE_OFFSETS,
  KONA_HOUSE_OFFSETS,
  NAKSHATRA_GUNA,
  PLANET_GUNA,
  SPECIFIC_ENEMY,
  TIER1_BY_GUNA_DISTANCE,
  TIER2_ENEMY_PENALTY,
  TIER3_SK_UPLIFT,
  TIER3_YK_UPLIFT,
} from './planet-comfort.data';
import { ComfortBand, Guna, PlanetComfortRow } from './planet-comfort.model';

// Tier 1: Guna compatibility base score, Section 4 - Star Guna is the
// nakshatra's own Deva/Manushya/Rakshasa Gana (NAKSHATRA_GUNA), not the
// Tri-Guna of its ruling lord (e.g. Swati is Deva/Sathvik despite being
// Rahu-ruled).
function calculateTier1(planetGuna: Guna, starGuna: Guna): number {
  const distance = Math.abs(GUNA_ORDER.indexOf(planetGuna) - GUNA_ORDER.indexOf(starGuna));
  return TIER1_BY_GUNA_DISTANCE[distance];
}

// Tier 2: -6 if the Star Devata is a specific enemy of the planet (asymmetric
// per SPECIFIC_ENEMY), else 0.
function calculateTier2Penalty(planet: Graha, starDevata: Graha): number {
  return SPECIFIC_ENEMY[planet].includes(starDevata) ? TIER2_ENEMY_PENALTY : 0;
}

// Tier 3: Yogakaraka (planet owns a Kendra AND a Kona/Trikona house, +10),
// Subhakaraka (owns a Kona/Trikona house only, +6), else 0 - house lordship
// uses GRAHA_OWNED_RASIS (same modern Rahu/Ketu co-rulership convention
// already verified for Graha Arudha) relative to the chart's own Ascendant.
function calculateTier3(planet: Graha, ascendantRasi: number): [number, string] {
  // 0-indexed house offset (0 = house 1/the Ascendant's own sign, 3 = house
  // 4, etc.), matching KENDRA_HOUSE_OFFSETS/KONA_HOUSE_OFFSETS.
  const ownedHouseOffsets = GRAHA_OWNED_RASIS[planet].map((rasi) => (rasi - ascendantRasi + 12) % 12);

  const ownsKendra = ownedHouseOffsets.some((offset) => KENDRA_HOUSE_OFFSETS.includes(offset));
  const ownsKona = ownedHouseOffsets.some((offset) => KONA_HOUSE_OFFSETS.includes(offset));

  if (ownsKendra && ownsKona) {
    return [TIER3_YK_UPLIFT, 'YK'];
  }
  if (ownsKona) {
    return [TIER3_SK_UPLIFT, 'SK'];
  }
  return [0, ''];
}

function getBand(total: number): ComfortBand {
  return COMFORT_BAND_THRESHOLDS.find((entry) => total >= entry.min)?.band ?? 'Severe Distress';
}

export function buildPlanetComfortRow(planet: Graha, longitude: number, ascendantRasi: number): PlanetComfortRow {
  const nakshatraIndex = calculateNakshatra(longitude);
  const pada = calculatePada(longitude);
  const starDevata = getNakshatraLord(nakshatraIndex);

  const planetGuna = PLANET_GUNA[planet];
  const starGuna = NAKSHATRA_GUNA[nakshatraIndex];

  const tier1 = calculateTier1(planetGuna, starGuna);
  const tier2Penalty = calculateTier2Penalty(planet, starDevata);
  const subTotal = Math.max(0, tier1 - tier2Penalty);
  const [tier3, tier3Label] = calculateTier3(planet, ascendantRasi);
  const total = subTotal + tier3;

  const rawBand = getBand(total);
  const isPushkar = isPushkarNavamsa(longitude);
  const band =
    isPushkar && (rawBand === 'Friction Strain' || rawBand === 'Severe Distress') ? 'Exceptional Comfort' : rawBand;

  return {
    planet,
    starLabel: `${NAKSHATRA_NAMES[nakshatraIndex]} (p${pada})`,
    starDevata,
    isSpecificEnemy: tier2Penalty > 0,
    planetGuna,
    starGuna,
    tier1,
    tier2: -tier2Penalty,
    tier3,
    tier3Label,
    total,
    isPushkarNavamsa: isPushkar,
    band,
  };
}
