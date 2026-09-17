import { D1Chart, Graha } from '../../shared/services';
import {
  calculateBirthTithiNumber,
  calculateNakshatra,
  calculatePada,
  findGraha,
  getNakshatraLord,
  getRasiDistances,
  WEEKDAY_LORD,
} from '../../shared/utils';
import {
  FIXED_KARNAM_NAMES,
  MOVABLE_KARNAM_NAMES,
  MUDAKKU_NAKSHATRA_SUM,
  MUDAKKU_RASI_SUM,
  SANTAN_TITHI_DIFFICULT,
  SANTAN_TITHI_FAVOURABLE,
  SANTAN_TITHI_NOTES,
  TITHI_GRAHA_DEVATA,
  TITHI_NAMES,
  TITHI_SPHUTA_NOTES,
  VAINASHIKA_OFFSET,
  YOGI_OFFSET_DEG,
} from './panchang.data';
import {
  Karnam,
  MudakkuResult,
  NakshatraResult,
  PakshaTithi,
  SantanTithi,
  Thithi,
  TithiBeejaResult,
  TithiSphuta,
  VainashikaResult,
  Yoga,
  YogiPoint,
} from './panchang.model';

function normalize360(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

export function calculateTithiSphuta(d1Chart: D1Chart): TithiSphuta {
  const sun = findGraha(d1Chart.grahas, 'Sun');
  const moon = findGraha(d1Chart.grahas, 'Moon');

  const longitude = normalize360(moon.longitude - sun.longitude);
  const rasi = Math.floor(longitude / 30);
  const nakshatra = calculateNakshatra(longitude);
  const pada = calculatePada(longitude);
  const house = getRasiDistances(d1Chart.ascendantRasi, rasi).forward;
  const note = TITHI_SPHUTA_NOTES[`${rasi}-${nakshatra}`] ?? null;

  return { longitude, rasi, nakshatra, pada, house, note };
}

export function calculateSantanTithi(d1Chart: D1Chart): SantanTithi {
  const sun = findGraha(d1Chart.grahas, 'Sun');
  const moon = findGraha(d1Chart.grahas, 'Moon');

  const raw = normalize360(5 * (moon.longitude - sun.longitude));
  const tithiNumber = Math.floor(raw / 12) + 1;

  return {
    tithiNumber,
    isFavourable: SANTAN_TITHI_FAVOURABLE.has(tithiNumber),
    note: SANTAN_TITHI_NOTES[tithiNumber] ?? null,
  };
}

export function isSantanTithiDifficult(tithiNumber: number): boolean {
  return SANTAN_TITHI_DIFFICULT.has(tithiNumber);
}

export function calculateTithiBeeja(d1Chart: D1Chart): TithiBeejaResult {
  const sun = findGraha(d1Chart.grahas, 'Sun');
  const moon = findGraha(d1Chart.grahas, 'Moon');

  const birthTithiNumber = calculateBirthTithiNumber(sun.longitude, moon.longitude);
  const grahaDevata = TITHI_GRAHA_DEVATA[birthTithiNumber];
  const grahaDevataPosition = findGraha(d1Chart.grahas, grahaDevata);
  const grahaDevataRasi = grahaDevataPosition.rasi;
  const grahaDevataHouse = getRasiDistances(d1Chart.ascendantRasi, grahaDevataRasi).forward;

  const unresolvedDesireRasi = (grahaDevataRasi + 6) % 12;
  const moonRasi = moon.rasi;
  const seventhFromMoonRasi = (moonRasi + 6) % 12;

  const distance = getRasiDistances(unresolvedDesireRasi, moonRasi).forward;
  let fulfillmentPathRasi = (moonRasi + distance - 1) % 12;

  if (fulfillmentPathRasi === moonRasi || fulfillmentPathRasi === seventhFromMoonRasi) {
    fulfillmentPathRasi = (fulfillmentPathRasi + 10 - 1) % 12;
  }

  return {
    birthTithiNumber,
    grahaDevata,
    grahaDevataRasi,
    grahaDevataHouse,
    unresolvedDesireRasi,
    fulfillmentPathRasi,
  };
}

export function getPakshaTithi(tithiNumber: number): PakshaTithi {
  const paksha = tithiNumber <= 15 ? 'Shukla' : 'Krishna';
  const dayInPaksha = tithiNumber <= 15 ? tithiNumber : tithiNumber - 15;
  const tithiName = dayInPaksha === 15 ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya') : TITHI_NAMES[dayInPaksha - 1];

  return { paksha, tithiName };
}

export function calculateVainashika(nakshatra: number, pada: number): VainashikaResult {
  const combinedIndex = nakshatra * 4 + (pada - 1);
  const resultIndex = (combinedIndex + VAINASHIKA_OFFSET) % 108;

  return {
    nakshatra: Math.floor(resultIndex / 4),
    pada: (resultIndex % 4) + 1,
  };
}

export function calculateMudakku(d1Chart: D1Chart): MudakkuResult {
  const sun = findGraha(d1Chart.grahas, 'Sun');
  const sunNakshatra = calculateNakshatra(sun.longitude);

  return {
    rasi: (((MUDAKKU_RASI_SUM - sun.rasi) % 12) + 12) % 12,
    nakshatra: (((MUDAKKU_NAKSHATRA_SUM - sunNakshatra) % 27) + 27) % 27,
  };
}

export function calculateThithi(d1Chart: D1Chart): Thithi {
  const sun = findGraha(d1Chart.grahas, 'Sun');
  const moon = findGraha(d1Chart.grahas, 'Moon');

  const raw = normalize360(moon.longitude - sun.longitude);
  const tithiNumber = Math.floor(raw / 12) + 1;
  const { paksha, tithiName } = getPakshaTithi(tithiNumber);
  const percentElapsed = ((raw % 12) / 12) * 100;

  return { tithiNumber, paksha, tithiName, percentElapsed };
}

export function calculateNakshatraResult(d1Chart: D1Chart): NakshatraResult {
  const moon = findGraha(d1Chart.grahas, 'Moon');

  return { nakshatra: calculateNakshatra(moon.longitude), pada: calculatePada(moon.longitude) };
}

export function calculateYoga(d1Chart: D1Chart): Yoga {
  const sun = findGraha(d1Chart.grahas, 'Sun');
  const moon = findGraha(d1Chart.grahas, 'Moon');

  const nakshatraSpan = 360 / 27;
  const raw = normalize360(sun.longitude + moon.longitude);
  const yoga = Math.floor(raw / nakshatraSpan);
  const percentElapsed = ((raw % nakshatraSpan) / nakshatraSpan) * 100;

  return { yoga, percentElapsed };
}

export function calculateKarnam(d1Chart: D1Chart): Karnam {
  const sun = findGraha(d1Chart.grahas, 'Sun');
  const moon = findGraha(d1Chart.grahas, 'Moon');

  const raw = normalize360(moon.longitude - sun.longitude);
  const halfTithi = Math.floor(raw / 6) + 1;

  return { karnam: halfTithi };
}

export function getKarnamName(karnam: number): string {
  if (karnam === 1) {
    return FIXED_KARNAM_NAMES[3]; // Kimstughna
  }
  if (karnam >= 58) {
    return FIXED_KARNAM_NAMES[karnam - 58]; // Shakuni, Chatushpada, Naga
  }
  return MOVABLE_KARNAM_NAMES[(karnam - 2) % 7];
}

function toYogiPoint(longitude: number): YogiPoint {
  const rasi = Math.floor(longitude / 30);
  const nakshatra = calculateNakshatra(longitude);
  const pada = calculatePada(longitude);

  return { longitude, rasi, nakshatra, pada };
}

export function calculateYogiPoint(d1Chart: D1Chart): YogiPoint {
  const sun = findGraha(d1Chart.grahas, 'Sun');
  const moon = findGraha(d1Chart.grahas, 'Moon');

  return toYogiPoint(normalize360(sun.longitude + moon.longitude + YOGI_OFFSET_DEG));
}

export function calculateAvayogiPoint(d1Chart: D1Chart): YogiPoint {
  const sun = findGraha(d1Chart.grahas, 'Sun');
  const moon = findGraha(d1Chart.grahas, 'Moon');

  return toYogiPoint(normalize360(sun.longitude + moon.longitude + 3 * YOGI_OFFSET_DEG));
}

export function getPlanetsInNakshatra(d1Chart: D1Chart, nakshatra: number): Graha[] {
  return d1Chart.grahas
    .filter((graha) => calculateNakshatra(graha.longitude) === nakshatra)
    .map((graha) => graha.graha);
}
