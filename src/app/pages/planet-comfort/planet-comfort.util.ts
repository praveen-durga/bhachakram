import { Graha } from '../../shared/services';
import {
  calculateNakshatra,
  calculatePada,
  getNakshatraLord,
  GRAHA_OWNED_RASIS,
  NAKSHATRA_NAMES,
} from '../../shared/utils';
import {
  COMFORT_BAND_THRESHOLDS,
  GUNA_ORDER,
  KONA_HOUSE_OFFSETS,
  PLANET_GUNA,
  SPECIFIC_ENEMY,
  TIER1_BY_GUNA_DISTANCE,
  TIER2_ENEMY_PENALTY,
  TIER3_GROUP_UPLIFT,
  TIER3_SK_UPLIFT,
  TIER3_YK_UPLIFT,
  TRIKA_HOUSE_OFFSETS,
} from './planet-comfort.data';
import { ComfortBand, Guna, PlanetComfortRow } from './planet-comfort.model';

// Tier 1: Guna compatibility base score, Section 4. Star Guna is derived as
// the Guna of the star's own ruling lord (Star Devata) rather than a
// separately-transcribed 27-nakshatra table - verified this reproduces the
// user's reference image's Star Guna column exactly for all 9 rows (and the
// spec's own note explicitly allows computing Star Guna directly rather
// than using the categorized table).
function calculateTier1(planetGuna: Guna, starGuna: Guna): number {
  const distance = Math.abs(GUNA_ORDER.indexOf(planetGuna) - GUNA_ORDER.indexOf(starGuna));
  return TIER1_BY_GUNA_DISTANCE[distance];
}

// Tier 2: -6 if the Star Devata is a specific enemy of the planet (asymmetric
// per SPECIFIC_ENEMY), else 0.
function calculateTier2Penalty(planet: Graha, starDevata: Graha): number {
  return SPECIFIC_ENEMY[planet].includes(starDevata) ? TIER2_ENEMY_PENALTY : 0;
}

// Tier 3: highest applicable uplift among Yogakaraka (Kona lord, no Trika
// lordship, +10), Subhakaraka (Kona lord AND Trika lord, +6), or the Same-
// Guna "Functional and Natural Group" uplift (+5) - house lordship uses
// GRAHA_OWNED_RASIS (same modern Rahu/Ketu co-rulership convention already
// verified for Graha Arudha) relative to the chart's own Ascendant, not a
// fixed table. Verified this reproduces all 9 rows of the user's reference
// image exactly (4 YK rows, 5 zero rows) once the reference chart's
// Ascendant was reverse-solved to Pisces from that same pattern.
function calculateTier3(planet: Graha, ascendantRasi: number, planetGuna: Guna, starGuna: Guna): [number, string] {
  // 0-indexed house offset (0 = house 1/the Ascendant's own sign, 4 = house
  // 5, 8 = house 9, etc.), matching KONA_HOUSE_OFFSETS/TRIKA_HOUSE_OFFSETS.
  const ownedHouseOffsets = GRAHA_OWNED_RASIS[planet].map((rasi) => (rasi - ascendantRasi + 12) % 12);

  const ownsKona = ownedHouseOffsets.some((offset) => KONA_HOUSE_OFFSETS.includes(offset));
  const ownsTrika = ownedHouseOffsets.some((offset) => TRIKA_HOUSE_OFFSETS.includes(offset));

  if (ownsKona && !ownsTrika) {
    return [TIER3_YK_UPLIFT, 'YK'];
  }
  if (ownsKona && ownsTrika) {
    return [TIER3_SK_UPLIFT, 'SK'];
  }
  if (planetGuna === starGuna) {
    return [TIER3_GROUP_UPLIFT, 'Group'];
  }
  return [0, ''];
}

function getBand(total: number): ComfortBand {
  return COMFORT_BAND_THRESHOLDS.find((entry) => total >= entry.min)?.band ?? 'Shatru';
}

export function buildPlanetComfortRow(planet: Graha, longitude: number, ascendantRasi: number): PlanetComfortRow {
  const nakshatraIndex = calculateNakshatra(longitude);
  const pada = calculatePada(longitude);
  const starDevata = getNakshatraLord(nakshatraIndex);

  const planetGuna = PLANET_GUNA[planet];
  const starGuna = PLANET_GUNA[starDevata];

  const tier1 = calculateTier1(planetGuna, starGuna);
  const tier2Penalty = calculateTier2Penalty(planet, starDevata);
  const subTotal = Math.max(0, tier1 - tier2Penalty);
  const [tier3, tier3Label] = calculateTier3(planet, ascendantRasi, planetGuna, starGuna);
  const total = subTotal + tier3;

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
    band: getBand(total),
  };
}
