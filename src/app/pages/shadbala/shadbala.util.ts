import { Graha, GrahaPosition, SunTimes } from '../../shared/services';
import {
  calculateD2Rasi,
  calculateD3Rasi,
  calculateD7Rasi,
  calculateD9Rasi,
  calculateD12Rasi,
  calculateD30Rasi,
  calculateHora,
  getHoraLord,
  getRasiDistances,
  RASI_LORD,
  WEEKDAY_LORD,
} from '../../shared/utils';
import {
  ABDAHIPATHI_WEEKDAYS,
  AYANA_NORTHERN_ADD_GRAHAS,
  AYANA_SOUTHERN_ADD_GRAHAS,
  DIG_BALA_WEAKEST_HOUSE,
  DIGNITY_POINTS,
  MOOLATRIKONA,
  NATA_UNNATA_DIURNAL_GRAHAS,
  NATA_UNNATA_NOCTURNAL_GRAHAS,
  NATURAL_RELATION,
  OJHAYUGMA_ODD_SIGN_GRAHAS,
  Relation,
  DREKKANA_FEMALE_GRAHAS,
  DREKKANA_MALE_GRAHAS,
  DREKKANA_NEUTRAL_GRAHAS,
  BHAVA_DIG_BALA_GROUPS,
  BHAVA_DRISHTI_BENEFIC_GRAHAS,
  DUAL_SIGNS,
  FIXED_SIGNS,
  GRAHA_DRISHTI_HOUSES,
  MOVABLE_SIGNS,
  BENEFIC_SEED_GRAHAS,
  TEMPORARY_FRIEND_HOUSES,
  TRIBHAGA_DAY_LORDS,
  TRIBHAGA_NIGHT_LORDS,
  VAARA_EPOCH,
  VARSHA_MAASA_EPOCH,
} from './shadbala.data';

type DignityRelation = 'own' | Relation;

function naturalRelation(graha: Graha, occupiedRasiLord: Graha): Relation {
  const relations = NATURAL_RELATION[graha as Exclude<Graha, 'Rahu' | 'Ketu'>];
  return relations?.[occupiedRasiLord] ?? 'neutral';
}

// Temporal (Tatkalika) friendship: whether occupiedRasiLord currently sits in
// a house counted as friendly or hostile from graha's own house.
function temporalRelation(graha: Graha, occupiedRasiLord: Graha, grahaPositions: GrahaPosition[]): 'friend' | 'enemy' {
  const grahaHouse = grahaPositions.find((position) => position.graha === graha)!.rasi;
  const lordHouse = grahaPositions.find((position) => position.graha === occupiedRasiLord)!.rasi;
  const houseDistance = getRasiDistances(grahaHouse, lordHouse).forward;
  return TEMPORARY_FRIEND_HOUSES.includes(houseDistance) ? 'friend' : 'enemy';
}

// Panchadha Maitri (5-fold relationship): natural + temporal friendship
// combined — Great Friend/Great Enemy only arise from this combination, never
// from natural relationship alone.
function compoundRelation(natural: Relation, temporal: 'friend' | 'enemy'): Relation {
  if (natural === 'friend') {
    return temporal === 'friend' ? 'greatFriend' : 'neutral';
  }
  if (natural === 'enemy') {
    return temporal === 'friend' ? 'neutral' : 'greatEnemy';
  }
  return temporal === 'friend' ? 'friend' : 'enemy';
}

export function calculateCompoundRelation(
  graha: Graha,
  occupiedRasiLord: Graha,
  grahaPositions: GrahaPosition[],
): DignityRelation {
  if (graha === occupiedRasiLord) {
    return 'own';
  }
  const natural = naturalRelation(graha, occupiedRasiLord);
  const temporal = temporalRelation(graha, occupiedRasiLord, grahaPositions);
  return compoundRelation(natural, temporal);
}

function dignityPointsFor(
  graha: Graha,
  rasi: number,
  longitude: number,
  isD1: boolean,
  grahaPositions: GrahaPosition[],
): number {
  const moolatrikona = MOOLATRIKONA[graha];
  if (isD1 && moolatrikona && moolatrikona.rasi === rasi) {
    const degreeInRasi = longitude % 30;
    if (degreeInRasi >= moolatrikona.from && degreeInRasi < moolatrikona.to) {
      return DIGNITY_POINTS.moolatrikona;
    }
  }

  const relation = calculateCompoundRelation(graha, RASI_LORD[rasi], grahaPositions);
  return DIGNITY_POINTS[relation];
}

// Paksha Bala and Drig Bala's shared static benefic/malefic classification
// (see BENEFIC_SEED_GRAHAS) — Mercury is always benefic; Moon follows
// waxing/waning.
export function calculateBenefics(isMoonWaxing: boolean): Set<Graha> {
  const benefics = new Set<Graha>(BENEFIC_SEED_GRAHAS);
  if (isMoonWaxing) {
    benefics.add('Moon');
  }
  return benefics;
}

export function calculateUcchaBala(graha: Graha, longitude: number, exaltationLongitude: number): number {
  const debilitationLongitude = (exaltationLongitude + 180) % 360;
  const distanceFromDebilitation = Math.min(
    Math.abs(longitude - debilitationLongitude),
    360 - Math.abs(longitude - debilitationLongitude),
  );
  return distanceFromDebilitation / 3;
}

export function calculateSaptavargajaBala(graha: Graha, d1Longitude: number, grahaPositions: GrahaPosition[]): number {
  const vargaRasis = [
    { rasi: Math.floor(d1Longitude / 30), isD1: true },
    { rasi: calculateD2Rasi(d1Longitude), isD1: false },
    { rasi: calculateD3Rasi(d1Longitude), isD1: false },
    { rasi: calculateD7Rasi(d1Longitude), isD1: false },
    { rasi: calculateD9Rasi(d1Longitude), isD1: false },
    { rasi: calculateD12Rasi(d1Longitude), isD1: false },
    { rasi: calculateD30Rasi(d1Longitude), isD1: false },
  ];

  return vargaRasis.reduce(
    (sum, { rasi, isD1 }) => sum + dignityPointsFor(graha, rasi, d1Longitude, isD1, grahaPositions),
    0,
  );
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

export function calculateDigBala(planetLongitude: number, weakestHouseCuspLongitude: number): number {
  const angle = Math.abs(planetLongitude - weakestHouseCuspLongitude);
  const mirroredAngle = Math.min(angle, 360 - angle);
  return mirroredAngle / 3;
}

// Bhava Dig Bala: classify the house's cusp longitude into one of the 4
// sign-groups (Nara/Jalachara/Chatushpada/Keeta) by which group's fixed
// longitude ranges it falls in, then score by house-offset from that group's
// reference house (0-indexed: house 1/4/10/7) — 60 at the reference house
// itself, falling by 10 per step, mirrored so it never goes below 0.
export function calculateBhavaDigBala(cuspLongitude: number, house: number): number {
  const houseIndex = house - 1;
  const group = BHAVA_DIG_BALA_GROUPS.find(({ longitudeRanges }) =>
    longitudeRanges.some(([from, to]) => cuspLongitude >= from && cuspLongitude < to),
  )!;
  const offset = ((houseIndex - group.referenceHouse + 6 + 12) % 12) - 6;
  return Math.abs(60 - Math.abs(offset) * 10);
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

// Paksha Bala: pb = (Moon - Sun longitude, mirrored back from 360° if it
// exceeds 180°) / 3 — per B.V. Raman's Graha and Bhava Balas Ch. V Art. 55.
// Benefics score pb, malefics score 60-pb, then Moon's own score is
// unconditionally doubled (uncapped) regardless of which side it landed on.
export function calculatePakshaBala(
  graha: Graha,
  sunLongitude: number,
  moonLongitude: number,
  benefics: Set<Graha>,
): number {
  const elongation = (moonLongitude - sunLongitude + 360) % 360;
  const mirrored = elongation > 180 ? 360 - elongation : elongation;
  const pb = mirrored / 3;
  const score = benefics.has(graha) ? pb : 60 - pb;
  return graha === 'Moon' ? score * 2 : score;
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
  const ayanaBala = 30 * (1 + (sign * Math.abs(declinationDeg)) / obliquityDeg);
  // Sun's Ayana Bala is doubled per BPHS.
  return graha === 'Sun' ? ayanaBala * 2 : ayanaBala;
}

// Seeghra Kendra (planet-Sun elongation, 0-360) reduces to a 0-180 "reduced
// kendra": 0-180 stays as-is, 180-360 mirrors back down (360-x) — this puts the
// max (180, near-opposition/retrograde) at the peak Chesta Bala score, and the
// min (0, conjunction) at the trough, per BPHS.
export function calculateChestaBalaFromSeeghraKendra(seeghraKendraDeg: number): number {
  const reducedKendra = seeghraKendraDeg <= 180 ? seeghraKendraDeg : 360 - seeghraKendraDeg;
  return reducedKendra / 3;
}

// Kali Yuga epoch (Feb 18, 3102 BCE) as a standard astronomical Julian Day —
// the anchor for Surya Siddhanta's mean-longitude (Ahargana) calculations.
const KALI_YUGA_EPOCH_JULIAN_DAY = 588465.0;
const CIVIL_DAYS_IN_MAHAYUGA = 1577917828;
const UJJAIN_LONGITUDE = 75.7885;

// Mean revolutions per Mahayuga (Surya Siddhanta), used to derive each
// planet's mean daily motion for its Seeghra Kendra below.
const PLANET_MEAN_REVOLUTIONS_AT_KALI: Partial<Record<Graha, number>> = {
  Sun: 4320000,
  Mars: 2296832,
  Mercury: 17937060,
  Jupiter: 364220,
  Venus: 7022376,
  Saturn: 146568,
};

// Approximate daily mean motion (deg/day), used only for the small Desantara
// (observer-longitude-vs-Ujjain) correction below.
const PLANET_DAILY_MEAN_MOTION: Partial<Record<Graha, number>> = {
  Sun: 0.9855609323563241,
  Mars: 0.5240193,
  Mercury: 4.0923181,
  Jupiter: 0.0830963,
  Venus: 1.6021464,
  Saturn: 0.0334393,
};

function toJulianDay(utcDate: Date): number {
  return utcDate.getTime() / 86400000 + 2440587.5;
}

// Surya Siddhanta mean longitude via Kali Ahargana (days elapsed since the
// Kali Yuga epoch times the planet's mean daily motion), plus a Desantara
// correction for the birthplace's longitude relative to Ujjain. This is a
// classical MEAN (not true/geocentric) longitude in the Surya Siddhanta's own
// reference frame — used only as an input to Chesta Bala's Seeghra Kendra
// below, never displayed directly.
function calculateSuryaSiddhantaMeanLongitude(graha: Graha, birthTime: Date, geoLongitudeDeg: number): number {
  const meanRevolutions = PLANET_MEAN_REVOLUTIONS_AT_KALI[graha]!;
  const dailyMeanMotion = Math.round((meanRevolutions / CIVIL_DAYS_IN_MAHAYUGA) * 360 * 1e7) / 1e7;
  const kaliAhargana = Math.trunc(toJulianDay(birthTime) - KALI_YUGA_EPOCH_JULIAN_DAY);
  const meanLongitude = ((kaliAhargana * dailyMeanMotion) % 360) + 360;

  const desantaraCorrection = ((UJJAIN_LONGITUDE - geoLongitudeDeg) / 360) * PLANET_DAILY_MEAN_MOTION[graha]!;
  return (meanLongitude + desantaraCorrection + 360) % 360;
}

// Chesta Bala's Seeghra Kendra for Mars/Mercury/Jupiter/Venus/Saturn (Sun and
// Moon are handled separately — Sun's main Chesta Bala is always 0, Moon has
// no Chesta Bala at all). Per BPHS/PyJHora's _cheshta_bala: the Seeghrochcha
// (governing longitude) is the Sun's mean longitude for the three superior
// planets, but the PLANET's OWN mean longitude for the two inferior planets
// (Mercury/Venus) — reflecting that their "quick apogee" is heliocentric, not
// solar. Kendra = |seeghrochcha - average(true longitude, the other mean
// longitude)|, mirrored back from 360 if >180, /3.
//
// Surya Siddhanta mean longitudes drift from Lahiri sidereal true longitudes
// over time (different zero-point epochs), so the Sun's own mean-vs-true gap
// is used as a one-off alignment offset applied to every planet's mean
// longitude before comparing — verified against B.V. Raman's Graha and Bhava
// Balas' worked example and a real JHora chart (Mars/Jupiter/Saturn Ishta
// Phala now match JHora within ~0.3; Mercury/Venus remain a known gap, likely
// because a single Sun-derived offset doesn't fully capture their own
// mean-longitude epoch drift — see .claude/todo-plans for the open item).
export function calculateChestaBalaSeeghraKendra(
  graha: Graha,
  birthTime: Date,
  geoLongitudeDeg: number,
  trueLongitudeSidereal: number,
  sunTrueLongitudeSidereal: number,
): number {
  const sunMeanLongitude = calculateSuryaSiddhantaMeanLongitude('Sun', birthTime, geoLongitudeDeg);
  const alignmentOffset = (sunMeanLongitude - sunTrueLongitudeSidereal + 360) % 360;

  const planetMeanLongitude =
    (calculateSuryaSiddhantaMeanLongitude(graha, birthTime, geoLongitudeDeg) - alignmentOffset + 360) % 360;

  const isInferior = graha === 'Mercury' || graha === 'Venus';
  const seeghrochcha = isInferior ? planetMeanLongitude : sunTrueLongitudeSidereal;
  const otherMeanLongitude = isInferior ? sunTrueLongitudeSidereal : planetMeanLongitude;

  const averageLongitude = 0.5 * (trueLongitudeSidereal + otherMeanLongitude);
  const rawKendra = Math.abs(seeghrochcha - averageLongitude);
  const kendra = rawKendra <= 180 ? rawKendra : 360 - rawKendra;
  return kendra / 3;
}

// Sun's Chesta Kendra for Ishta/Kashta Phala (distinct from the main Shadbala
// Chesta Bala, where Sun scores 0): Sayana (tropical) longitude + 90°,
// mirrored back from 360° if it exceeds 180°, /3. B.V. Raman's Graha and
// Bhava Balas Ch. X Art. 136 — "the Sun has no Chesta kendra or Chesta bala
// as he never gets into retrogression, but still a method is prescribed to
// find his Chesta Bala which is necessary to ascertain the Ishta and Kashta
// Phalas."
export function calculateSunChestaBalaForPhala(sayanaSunLongitude: number): number {
  const kendra = (sayanaSunLongitude + 90) % 360;
  const mirrored = kendra > 180 ? 360 - kendra : kendra;
  return mirrored / 3;
}

// Moon's Chesta Kendra for Ishta/Kashta Phala: same mirrored Moon-Sun
// elongation formula as Paksha Bala. B.V. Raman's Graha and Bhava Balas Ch.
// X Art. 137.
export function calculateMoonChestaBalaForPhala(sunLongitude: number, moonLongitude: number): number {
  const elongation = (moonLongitude - sunLongitude + 360) % 360;
  const mirrored = elongation > 180 ? 360 - elongation : elongation;
  return mirrored / 3;
}

// Ishta Phala = sqrt(Uccha Bala x Chesta Bala); Kashta Phala =
// sqrt((60-Uccha Bala) x (60-Chesta Bala)) — B.V. Raman's Graha and Bhava
// Balas Ch. X Art. 138-139. For Sun/Moon, chestaBala here must be their own
// Ishta/Kashta-specific value (calculateSunChestaBalaForPhala /
// calculateMoonChestaBalaForPhala), not the main Shadbala Chesta Bala row.
export function calculateIshtaPhala(ucchaBala: number, chestaBala: number): number {
  return Math.sqrt(ucchaBala * chestaBala);
}

export function calculateKashtaPhala(ucchaBala: number, chestaBala: number): number {
  return Math.sqrt((60 - ucchaBala) * (60 - chestaBala));
}

// Moon waxes (benefic for Paksha Bala's tithi split) from new moon to full
// moon, i.e. while its elongation from the Sun is under 180°.
export function calculateIsMoonWaxing(moonSunElongation: number): boolean {
  return moonSunElongation < 180;
}

// Bhava Drishti Bala's own static benefic/malefic list — distinct from
// Paksha/Drig Bala's shared calculateBenefics; Moon is unconditionally
// benefic here.
export function isBhavaDrishtiBenefic(graha: Graha): boolean {
  return BHAVA_DRISHTI_BENEFIC_GRAHAS.includes(graha);
}

// Drig Bala's aspect curve: an asymmetric piecewise function of the directional
// angle (aspecting -> aspected, 0-360, not mirrored/folded), with Visesha
// (special full-strength) bonuses embedded as extra angle windows rather than
// fixed house-distances — Saturn gains +45 at 60-90°/270-300°, Mars +15 at
// 90-120°/210-240°, Jupiter +30 at 120-150°/240-270°.
export function calculateDrigBala(angularDistanceFromAspectedDeg: number, aspectingGraha: Graha): number {
  const angle = ((angularDistanceFromAspectedDeg % 360) + 360) % 360;

  if (angle < 30) {
    return 0;
  }
  if (angle < 60) {
    return 0.5 * (angle - 30);
  }
  if (angle < 90) {
    return angle - 60 + 15 + (aspectingGraha === 'Saturn' ? 45 : 0);
  }
  if (angle < 120) {
    return 0.5 * (120 - angle) + 30 + (aspectingGraha === 'Mars' ? 15 : 0);
  }
  if (angle < 150) {
    return 150 - angle + (aspectingGraha === 'Jupiter' ? 30 : 0);
  }
  if (angle < 180) {
    return 2 * (angle - 150);
  }
  if (angle < 210) {
    return 0.5 * (300 - angle);
  }
  if (angle < 240) {
    return 0.5 * (300 - angle) + (aspectingGraha === 'Mars' ? 15 : 0);
  }
  if (angle < 270) {
    return 0.5 * (300 - angle) + (aspectingGraha === 'Jupiter' ? 30 : 0);
  }
  if (angle < 300) {
    return 0.5 * (300 - angle) + (aspectingGraha === 'Saturn' ? 45 : 0);
  }
  return 0;
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

// Elapsed civil days from Jan 1 of (baseYear+1) through Dec 31 of `year`,
// plus the epoch table's fixed day offset — the ahargana base JHora anchors
// Varsha/Maasa/Vaara Bala's weekday-lord selection to.
function daysElapsedSinceBase(year: number, baseYear: number, baseDays: number): number {
  const start = Date.UTC(baseYear + 1, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const days = Math.round((end - start) / 86400000);
  return baseDays + days;
}

function aharganaDays(birthTime: Date, baseYear: number, baseDays: number): number {
  const year = birthTime.getUTCFullYear();
  const startOfYear = Date.UTC(year, 0, 1);
  const elapsedDaysInYear = Math.floor((birthTime.getTime() - startOfYear) / 86400000) + 1;
  return daysElapsedSinceBase(year - 1, baseYear, baseDays) + elapsedDaysInYear;
}

// Varsha Bala: 15 virupas to the weekday-lord an ahargana (elapsed-days-since-
// epoch) calculation resolves to for the birth year.
export function calculateVarshaBala(graha: Graha, birthTime: Date): number {
  const days = aharganaDays(birthTime, VARSHA_MAASA_EPOCH.baseYear, VARSHA_MAASA_EPOCH.baseDays);
  const weekday = ABDAHIPATHI_WEEKDAYS[(Math.floor(days / 360) * 3 + 1) % 7];
  return graha === WEEKDAY_LORD[weekday] ? 15 : 0;
}

// Maasa Bala: 30 virupas to the weekday-lord an ahargana calculation resolves
// to for the birth month (same epoch as Varsha Bala, finer-grained divisor).
export function calculateMaasaBala(graha: Graha, birthTime: Date): number {
  const days = aharganaDays(birthTime, VARSHA_MAASA_EPOCH.baseYear, VARSHA_MAASA_EPOCH.baseDays);
  const weekday = ABDAHIPATHI_WEEKDAYS[(Math.floor(days / 30) * 2 + 1) % 7];
  return graha === WEEKDAY_LORD[weekday] ? 30 : 0;
}

// Vaara Bala: 45 virupas to the weekday-lord an ahargana calculation (its own,
// later epoch) resolves to for the birth day — rolled back a day if birth
// falls before that day's sunrise.
export function calculateVaaraBala(graha: Graha, birthTime: Date, sunrise: Date): number {
  let days = aharganaDays(birthTime, VAARA_EPOCH.baseYear, VAARA_EPOCH.baseDays);
  if (birthTime < sunrise) {
    days -= 1;
  }
  const weekday = ABDAHIPATHI_WEEKDAYS[((days % 7) + 7) % 7];
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
// 1°. Victor = the planet at the lower degree (earlier in the zodiac); the
// higher-degree planet loses. Kept separate from calculateYuddhaBalaMagnitude
// per BPHS — the two are logically distinct steps (who wins vs. by how much).
export function areGrahasAtWar(grahaALongitude: number, grahaBLongitude: number): boolean {
  const diff = Math.abs(grahaALongitude - grahaBLongitude);
  return Math.min(diff, 360 - diff) < 1;
}

export function determineYuddhaVictor(
  grahaA: Graha,
  grahaALongitude: number,
  grahaB: Graha,
  grahaBLongitude: number,
): Graha {
  return grahaALongitude <= grahaBLongitude ? grahaA : grahaB;
}

// Yuddha Bala's magnitude: A = |difference in combined strength up to Hora
// Bala| (Sthana + Dig + Nata-Unnata + Paksha + Tribhaga + Hora Bala —
// excluding Varsha/Maasa/Vaara Bala, Ayana Bala, and Yuddha Bala itself), B =
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

function hasGrahaDrishti(graha: Graha, grahaHouse: number, targetHouse: number): boolean {
  const houseDistance = getRasiDistances(grahaHouse, targetHouse).forward;
  return GRAHA_DRISHTI_HOUSES[graha].includes(houseDistance);
}

function hasRasiDrishti(grahaRasi: number, targetRasi: number): boolean {
  if (MOVABLE_SIGNS.includes(grahaRasi)) {
    return (
      FIXED_SIGNS.includes(targetRasi) && targetRasi !== (grahaRasi + 1) % 12 && targetRasi !== (grahaRasi + 11) % 12
    );
  }
  if (FIXED_SIGNS.includes(grahaRasi)) {
    return (
      MOVABLE_SIGNS.includes(targetRasi) && targetRasi !== (grahaRasi + 1) % 12 && targetRasi !== (grahaRasi + 11) % 12
    );
  }
  return DUAL_SIGNS.includes(targetRasi) && targetRasi !== grahaRasi;
}

// Bhava Drishti Bala: only grahas that actually aspect the house (via graha
// drishti OR rasi drishti) contribute at all — everyone else scores 0
// regardless of angular distance. Contributing grahas run through the same
// Drig Bala curve, scaled 0.25x unless the aspecting graha is Mercury or
// Jupiter, summed benefic-positive/malefic-negative, then divided by 4.
export function calculateBhavaDrishtiBala(
  aspects: {
    graha: Graha;
    grahaRasi: number;
    grahaHouse: number;
    targetRasi: number;
    targetHouse: number;
    angularDistanceToCuspDeg: number;
  }[],
): number {
  const sum = aspects.reduce(
    (sum, { graha, grahaRasi, grahaHouse, targetRasi, targetHouse, angularDistanceToCuspDeg }) => {
      const hasAspect = hasGrahaDrishti(graha, grahaHouse, targetHouse) || hasRasiDrishti(grahaRasi, targetRasi);
      if (!hasAspect) {
        return sum;
      }
      const curve = calculateDrigBala(angularDistanceToCuspDeg, graha);
      const strength = graha === 'Mercury' || graha === 'Jupiter' ? curve : curve * 0.25;
      const isBenefic = isBhavaDrishtiBenefic(graha);
      return sum + (isBenefic ? strength : -strength);
    },
    0,
  );
  return sum / 4;
}
