import { Graha, SunTimes } from '../../shared/services';
import {
  calculateD2Rasi,
  calculateD3Rasi,
  calculateD7Rasi,
  calculateD9Rasi,
  calculateD12Rasi,
  calculateD30Rasi,
  calculateHora,
  getHoraLord,
  WEEKDAY_LORD,
} from '../../shared/utils';
import {
  AYANA_NORTHERN_ADD_GRAHAS,
  AYANA_SOUTHERN_ADD_GRAHAS,
  DIG_BALA_WEAKEST_HOUSE,
  DIGNITY_POINTS,
  MOOLATRIKONA,
  NATA_UNNATA_DIURNAL_GRAHAS,
  NATA_UNNATA_NOCTURNAL_GRAHAS,
  NATURAL_RELATION,
  OJHAYUGMA_ODD_SIGN_GRAHAS,
  PAKSHA_BENEFIC_GRAHAS,
  RASI_LORD,
  DREKKANA_FEMALE_GRAHAS,
  DREKKANA_MALE_GRAHAS,
  DREKKANA_NEUTRAL_GRAHAS,
  DRISHTI_ALWAYS_BENEFIC_GRAHAS,
  SIGN_GROUP,
  SIGN_GROUP_STRONGEST_HOUSE,
  TRIBHAGA_DAY_LORDS,
  TRIBHAGA_NIGHT_LORDS,
} from './shadbala.data';

type DignityRelation = 'own' | 'greatFriend' | 'friend' | 'neutral' | 'enemy' | 'greatEnemy';

function naturalRelation(graha: Graha, occupiedRasiLord: Graha): DignityRelation {
  if (graha === occupiedRasiLord) {
    return 'own';
  }
  const relations = NATURAL_RELATION[graha as Exclude<Graha, 'Rahu' | 'Ketu'>];
  return relations?.[occupiedRasiLord] ?? 'neutral';
}

function dignityPointsFor(graha: Graha, rasi: number, longitude: number, isD1: boolean): number {
  const moolatrikona = MOOLATRIKONA[graha];
  if (isD1 && moolatrikona && moolatrikona.rasi === rasi) {
    const degreeInRasi = longitude % 30;
    if (degreeInRasi >= moolatrikona.from && degreeInRasi < moolatrikona.to) {
      return DIGNITY_POINTS.moolatrikona;
    }
  }

  const relation = naturalRelation(graha, RASI_LORD[rasi]);
  return DIGNITY_POINTS[relation];
}

export function calculateUcchaBala(graha: Graha, longitude: number, exaltationLongitude: number): number {
  const debilitationLongitude = (exaltationLongitude + 180) % 360;
  const distanceFromDebilitation = Math.min(
    Math.abs(longitude - debilitationLongitude),
    360 - Math.abs(longitude - debilitationLongitude),
  );
  return distanceFromDebilitation / 3;
}

export function calculateSaptavargajaBala(graha: Graha, d1Longitude: number): number {
  const vargaRasis = [
    { rasi: Math.floor(d1Longitude / 30), isD1: true },
    { rasi: calculateD2Rasi(d1Longitude), isD1: false },
    { rasi: calculateD3Rasi(d1Longitude), isD1: false },
    { rasi: calculateD7Rasi(d1Longitude), isD1: false },
    { rasi: calculateD9Rasi(d1Longitude), isD1: false },
    { rasi: calculateD12Rasi(d1Longitude), isD1: false },
    { rasi: calculateD30Rasi(d1Longitude), isD1: false },
  ];

  return vargaRasis.reduce((sum, { rasi, isD1 }) => sum + dignityPointsFor(graha, rasi, d1Longitude, isD1), 0);
}

export function calculateOjhayugmaBala(graha: Graha, d1Rasi: number, d9Rasi: number): number {
  const wantsOdd = OJHAYUGMA_ODD_SIGN_GRAHAS.includes(graha);
  const isOdd = (rasi: number) => rasi % 2 === 0; // rasi 0 = Aries = 1st sign = odd

  let score = 0;
  if (isOdd(d1Rasi) === wantsOdd) {
    score += 15;
  }
  if (isOdd(d9Rasi) === wantsOdd) {
    score += 15;
  }
  return score;
}

export function calculateKendradiBala(houseFromAscendant: number): number {
  const kendra = [1, 4, 7, 10];
  const panapara = [2, 5, 8, 11];
  if (kendra.includes(houseFromAscendant)) {
    return 60;
  }
  if (panapara.includes(houseFromAscendant)) {
    return 30;
  }
  return 15;
}

export function calculateDrekkanaBala(graha: Graha, d1Longitude: number): number {
  const degreeInRasi = d1Longitude % 30;
  const drekkanaIndex = Math.floor(degreeInRasi / 10); // 0, 1, 2

  if (drekkanaIndex === 0 && DREKKANA_MALE_GRAHAS.includes(graha)) {
    return 15;
  }
  if (drekkanaIndex === 1 && DREKKANA_NEUTRAL_GRAHAS.includes(graha)) {
    return 15;
  }
  if (drekkanaIndex === 2 && DREKKANA_FEMALE_GRAHAS.includes(graha)) {
    return 15;
  }
  return 0;
}

export function calculateDigBala(graha: Graha, houseFromAscendant: number): number {
  const weakestHouse = DIG_BALA_WEAKEST_HOUSE[graha];
  const distanceFromWeakest = Math.min(
    Math.abs(houseFromAscendant - weakestHouse),
    12 - Math.abs(houseFromAscendant - weakestHouse),
  );
  // distance 0 (at weakest) = 0 virupas; distance 6 (at the opposite, strongest, house) = 60 virupas.
  return (distanceFromWeakest / 6) * 60;
}

// Bhava Dig Bala: a house's sign-group (Nara/Jalachara/Chatushpada/Keeta) is
// strongest (60) at one kendra house and weakest (0) at the opposite kendra,
// linearly interpolated 10 virupas per house-step through the 6 steps between.
export function calculateBhavaDigBala(rasi: number, house: number): number {
  const signGroup = SIGN_GROUP[rasi];
  const strongestHouse = SIGN_GROUP_STRONGEST_HOUSE[signGroup];
  const distanceFromStrongest = Math.min(Math.abs(house - strongestHouse), 12 - Math.abs(house - strongestHouse));
  return 60 - distanceFromStrongest * 10;
}

// closenessToNoon: 0 at midnight, 1 at local noon (Sun's hour angle mapped to a
// 0-1 scale) — diurnal planets peak here, nocturnal planets peak at the
// opposite end (midnight), Mercury is constant regardless of time of day.
export function calculateNataUnnataBala(graha: Graha, closenessToNoon: number): number {
  if (graha === 'Mercury') {
    return 60;
  }
  const isDiurnal = NATA_UNNATA_DIURNAL_GRAHAS.includes(graha);
  const isNocturnal = NATA_UNNATA_NOCTURNAL_GRAHAS.includes(graha);
  if (!isDiurnal && !isNocturnal) {
    return 0;
  }
  return isDiurnal ? closenessToNoon * 60 : (1 - closenessToNoon) * 60;
}

// Derives closenessToNoon (0 at midnight, 1 at local noon) directly from the
// birth instant's position within its day/night segment, avoiding a separate
// sidereal-time ephemeris call. Local noon is the day segment's midpoint, and
// local midnight is the night segment's midpoint — each segment's midpoint
// scores at its own end of the 0-1 scale, and its two edges (sunrise/sunset)
// score at the middle (0.5), since a segment edge is equally far from both
// the preceding midnight and the following noon (or vice versa).
export function calculateClosenessToNoon(birthTime: Date, sunrise: Date, sunset: Date, nextSunrise: Date): number {
  const isDay = birthTime >= sunrise && birthTime < sunset;
  if (isDay) {
    const noon = (sunrise.getTime() + sunset.getTime()) / 2;
    const halfDayLength = (sunset.getTime() - sunrise.getTime()) / 2;
    return 1 - Math.abs(birthTime.getTime() - noon) / halfDayLength / 2;
  }

  const midnight = (sunset.getTime() + nextSunrise.getTime()) / 2;
  const halfNightLength = (nextSunrise.getTime() - sunset.getTime()) / 2;
  return Math.abs(birthTime.getTime() - midnight) / halfNightLength / 2;
}

export function calculatePakshaBala(graha: Graha, moonSunElongation: number): number {
  const beneficScore = moonSunElongation <= 180 ? moonSunElongation / 3 : (360 - moonSunElongation) / 3;
  if (graha === 'Moon') {
    return Math.min(60, beneficScore * 2);
  }
  const isBenefic = PAKSHA_BENEFIC_GRAHAS.includes(graha);
  return isBenefic ? beneficScore : 60 - beneficScore;
}

export function calculateAyanaBala(graha: Graha, declinationDeg: number, obliquityDeg: number): number {
  if (graha === 'Mercury') {
    return 30 * (1 + Math.abs(declinationDeg) / obliquityDeg);
  }
  const addsWhenNorthern = AYANA_NORTHERN_ADD_GRAHAS.includes(graha);
  const addsWhenSouthern = AYANA_SOUTHERN_ADD_GRAHAS.includes(graha);
  const isNorthern = declinationDeg >= 0;
  const shouldAdd = (isNorthern && addsWhenNorthern) || (!isNorthern && addsWhenSouthern);
  const sign = shouldAdd ? 1 : -1;
  return 30 * (1 + (sign * Math.abs(declinationDeg)) / obliquityDeg);
}

// Seeghra Kendra (planet-Sun elongation, 0-360) reduces to a 0-180 "reduced
// kendra": 0-180 stays as-is, 180-360 mirrors back down (360-x) — this puts the
// max (180, near-opposition/retrograde) at the peak Chesta Bala score, and the
// min (0, conjunction) at the trough, per BPHS.
export function calculateChestaBalaFromSeeghraKendra(seeghraKendraDeg: number): number {
  const reducedKendra = seeghraKendraDeg <= 180 ? seeghraKendraDeg : 360 - seeghraKendraDeg;
  return reducedKendra / 3;
}

export function calculateChestaBalaForMoon(moonSunElongation: number): number {
  return moonSunElongation <= 180 ? moonSunElongation / 3 : (360 - moonSunElongation) / 3;
}

export function calculateIshtaPhala(ucchaBala: number, chestaBala: number): number {
  return Math.sqrt(ucchaBala * chestaBala);
}

export function calculateKashtaPhala(ucchaBala: number, chestaBala: number): number {
  return Math.sqrt((60 - ucchaBala) * (60 - chestaBala));
}

// Moon waxes (benefic for Drig Bala) from new moon to full moon, i.e. while
// its elongation from the Sun is under 180°.
export function calculateIsMoonWaxing(moonSunElongation: number): boolean {
  return moonSunElongation < 180;
}

export function isDrishtiBenefic(graha: Graha, isMoonWaxing: boolean): boolean {
  if (graha === 'Moon') {
    return isMoonWaxing;
  }
  return DRISHTI_ALWAYS_BENEFIC_GRAHAS.includes(graha);
}

// Visesha (special) full-strength aspect bonuses, on top of the normal Sputa
// Drishti curve: Mars aspects its 4th/8th at full strength, Jupiter its
// 5th/9th, Saturn its 3rd/10th (house-distance counted from the aspecting
// graha's own house).
export function calculateVisesheDrishtiBonus(graha: Graha, houseDistance: number): number {
  if (graha === 'Mars' && (houseDistance === 4 || houseDistance === 8)) {
    return 15;
  }
  if (graha === 'Jupiter' && (houseDistance === 5 || houseDistance === 9)) {
    return 30;
  }
  if (graha === 'Saturn' && (houseDistance === 3 || houseDistance === 10)) {
    return 45;
  }
  return 0;
}

export function calculateDrigBala(angularDistanceFromAspectedDeg: number): number {
  // Sputa Drishti: 0 in the 0-30/300-360 dead zones, rising/peaking/falling
  // through 30-300, full 60 at exactly 180 (opposition).
  const angle = ((angularDistanceFromAspectedDeg % 360) + 360) % 360;
  if (angle <= 30 || angle >= 300) {
    return 0;
  }
  if (angle <= 60) {
    return ((angle - 30) / 30) * 15;
  }
  if (angle <= 90) {
    return 15 + ((angle - 60) / 30) * 15;
  }
  if (angle <= 120) {
    return 30 + ((angle - 90) / 30) * 15;
  }
  if (angle <= 150) {
    return 45 + ((angle - 120) / 30) * 15;
  }
  if (angle <= 180) {
    return 60;
  }
  if (angle <= 210) {
    return 60 - ((angle - 180) / 30) * 15;
  }
  if (angle <= 240) {
    return 45 - ((angle - 210) / 30) * 15;
  }
  if (angle <= 270) {
    return 30 - ((angle - 240) / 30) * 15;
  }
  return 15 - ((angle - 270) / 30) * 15;
}

// Tribhaga Bala: the day (sunrise-sunset) or night (sunset-next sunrise),
// whichever the birth falls in, is divided into 3 equal parts — the lord of
// the birth instant's part scores 60. Jupiter always scores 60 in addition,
// regardless of birth time.
export function calculateTribhagaBala(graha: Graha, birthTime: Date, sunTimes: SunTimes): number {
  if (graha === 'Jupiter') {
    return 60;
  }

  const { sunrise, sunset, nextSunrise } = sunTimes;
  const isDay = birthTime >= sunrise && birthTime < sunset;
  const segmentStart = isDay ? sunrise : sunset;
  const segmentEnd = isDay ? sunset : nextSunrise;
  const thirdLength = (segmentEnd.getTime() - segmentStart.getTime()) / 3;
  const third = Math.min(2, Math.floor((birthTime.getTime() - segmentStart.getTime()) / thirdLength));
  const lord = (isDay ? TRIBHAGA_DAY_LORDS : TRIBHAGA_NIGHT_LORDS)[third];

  return graha === lord ? 60 : 0;
}

// Varsha Bala: 15 virupas to the weekday-lord of the most recent Mesha
// Sankranti (Sun entering Aries sidereal) before birth.
export function calculateVarshaBala(graha: Graha, sankrantiWeekday: number): number {
  return graha === WEEKDAY_LORD[sankrantiWeekday] ? 15 : 0;
}

// Maasa Bala: 30 virupas to the weekday-lord of the most recent solar-month
// Sankranti (Sun entering any sign, sidereal) before birth.
export function calculateMaasaBala(graha: Graha, sankrantiWeekday: number): number {
  return graha === WEEKDAY_LORD[sankrantiWeekday] ? 30 : 0;
}

// Vaara Bala: 45 virupas to the birth weekday's own lord.
export function calculateVaaraBala(graha: Graha, weekday: number): number {
  return graha === WEEKDAY_LORD[weekday] ? 45 : 0;
}

// Hora Bala: the current Hora's lord (per the same Chaldean-order sequencing
// used for Panchang's Hora card) scores 60, all other grahas score 0.
export function calculateHoraBala(graha: Graha, birthTime: Date, sunTimes: SunTimes, weekday: number): number {
  const { horaIndex } = calculateHora(birthTime, sunTimes, weekday);
  const lord = getHoraLord(weekday, horaIndex);
  return graha === lord ? 60 : 0;
}

// Graha Yuddha (planetary war): two of the 5 "star planets" (Mars/Mercury/
// Jupiter/Venus/Saturn) are at war when their sidereal longitudes are within
// 1°. Victor = the more northerly planet by ecliptic latitude (not inferred
// from longitude). Kept separate from calculateYuddhaBalaMagnitude per BPHS —
// the two are logically distinct steps (who wins vs. by how much).
export function areGrahasAtWar(grahaALongitude: number, grahaBLongitude: number): boolean {
  const diff = Math.abs(grahaALongitude - grahaBLongitude);
  return Math.min(diff, 360 - diff) < 1;
}

export function determineYuddhaVictor(
  grahaA: Graha,
  grahaAEclipticLatitude: number,
  grahaB: Graha,
  grahaBEclipticLatitude: number,
): Graha {
  return grahaAEclipticLatitude >= grahaBEclipticLatitude ? grahaA : grahaB;
}

// Yuddha Bala's magnitude: A = |difference in combined strength up to Hora
// Bala| (Sthana + Dig + Nata-Unnata + Paksha + Tribhaga + Varsha/Maasa/Vaara/
// Hora Bala — explicitly excluding Ayana Bala and Yuddha Bala itself), B =
// |difference in the two planets' standard angular disc diameters|. The
// result adds to the victor's total and subtracts from the loser's.
export function calculateYuddhaBalaMagnitude(
  strengthUpToHoraA: number,
  strengthUpToHoraB: number,
  discDiameterA: number,
  discDiameterB: number,
): number {
  const strengthDifference = Math.abs(strengthUpToHoraA - strengthUpToHoraB);
  const diameterDifference = Math.abs(discDiameterA - discDiameterB);
  return strengthDifference / diameterDifference;
}

// Bhava Drishti Bala: same Sputa Drishti engine as planet Drig Bala, summed
// across every aspecting graha's angular distance to the house cusp — benefic
// grahas contribute positively, malefic grahas negatively.
export function calculateBhavaDrishtiBala(
  aspects: { graha: Graha; angularDistanceToCuspDeg: number; isBenefic: boolean }[],
): number {
  return aspects.reduce((sum, { angularDistanceToCuspDeg, isBenefic }) => {
    const strength = calculateDrigBala(angularDistanceToCuspDeg);
    return sum + (isBenefic ? strength : -strength);
  }, 0);
}

// Bhava Day-Night Bala: a house scores 15 when its lord's diurnal/nocturnal
// nature matches the birth's actual day/night (diurnal lord + day birth, or
// nocturnal lord + night birth); Mercury (neither) and mismatches score 0.
export function calculateBhavaDayNightBala(houseLord: Graha, isDayBirth: boolean): number {
  const isDiurnalLord = NATA_UNNATA_DIURNAL_GRAHAS.includes(houseLord);
  const isNocturnalLord = NATA_UNNATA_NOCTURNAL_GRAHAS.includes(houseLord);
  const matches = (isDayBirth && isDiurnalLord) || (!isDayBirth && isNocturnalLord);
  return matches ? 15 : 0;
}
