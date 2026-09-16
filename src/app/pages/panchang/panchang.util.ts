import { SunTimes } from '../../shared/services/birth-chart.service';
import { D1Chart, Graha, GrahaPosition } from '../../shared/services';
import { calculateNakshatra, calculatePada, getRasiDistances } from '../../shared/utils';
import {
  CHALDEAN_ORDER,
  FIXED_KARNAM_NAMES,
  MANDI_DAY_MUHURTA_COUNT,
  MANDI_NIGHT_MUHURTA_COUNT,
  MOVABLE_KARNAM_NAMES,
  MUDAKKU_NAKSHATRA_SUM,
  MUDAKKU_RASI_SUM,
  NAKSHATRA_LORD_CYCLE,
  SANTAN_TITHI_DIFFICULT,
  SANTAN_TITHI_FAVOURABLE,
  SANTAN_TITHI_NOTES,
  TITHI_GRAHA_DEVATA,
  TITHI_NAMES,
  TITHI_SPHUTA_NOTES,
  VAINASHIKA_OFFSET,
  WEEKDAY_LORD,
  YOGI_OFFSET_DEG,
} from './panchang.data';
import {
  HoraResult,
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

function findGraha(grahas: GrahaPosition[], graha: string): GrahaPosition {
  const found = grahas.find((g) => g.graha === graha);
  if (!found) {
    throw new Error(`Missing graha position for ${graha}`);
  }
  return found;
}

export function getNakshatraLord(nakshatra: number): Graha {
  return NAKSHATRA_LORD_CYCLE[nakshatra % 9];
}

export function calculateBirthTithiNumber(sunLongitude: number, moonLongitude: number): number {
  const raw = normalize360(moonLongitude - sunLongitude);
  return Math.floor(raw / 12) + 1;
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

export function calculateHora(birthTime: Date, sunTimes: SunTimes, weekday: number): HoraResult {
  const { sunrise, sunset, nextSunrise } = sunTimes;
  const isDayHora = birthTime >= sunrise && birthTime < sunset;

  const segmentStart = isDayHora ? sunrise : sunset;
  const segmentEnd = isDayHora ? sunset : nextSunrise;
  const horaLength = (segmentEnd.getTime() - segmentStart.getTime()) / 12;
  const indexWithinSegment = Math.min(11, Math.floor((birthTime.getTime() - segmentStart.getTime()) / horaLength));
  const horaIndex = (isDayHora ? 0 : 12) + indexWithinSegment + 1;

  return { horaIndex, isDayHora };
}

export function getHoraLord(weekday: number, horaIndex: number): Graha {
  const weekdayLordIndex = CHALDEAN_ORDER.indexOf(WEEKDAY_LORD[weekday]);
  return CHALDEAN_ORDER[(weekdayLordIndex + horaIndex - 1) % 7];
}

// Returns the instant at which the Ascendant must be computed to get Mandi's
// longitude: sunrise + (dayLength / 15) * muhurtaCount for a daytime birth,
// or sunset + (nightLength / 15) * muhurtaCount for a nighttime birth (the
// classical 15-muhurta division). Day formula/table verified to sub-second
// precision against a real reference chart's reported Mandi position — an
// earlier 8-part-day-portion implementation ("Gulika Kalam" — a different,
// unrelated concept: an auspicious/inauspicious TIME WINDOW, not Mandi's
// chart position) was off by up to a full rasi, do not reintroduce it.
// The NIGHT table is only logically derived/cross-checked against secondary
// sources, NOT yet verified against a real night-birth reference chart —
// see .claude/todo-plans/11-panchang-ui.md for the open verification task.
// Also unresolved: for a birth between midnight and that day's own sunrise,
// the "weekday" for the preceding night technically belongs to the previous
// calendar day's sunset — not handled here, `weekday` is always the birth's
// own calendar-day weekday.
export function getMandiInstant(birthTime: Date, sunTimes: SunTimes, weekday: number): Date {
  const { sunrise, sunset, nextSunrise } = sunTimes;
  const isDay = birthTime >= sunrise && birthTime < sunset;

  if (isDay) {
    const dayLength = sunset.getTime() - sunrise.getTime();
    const muhurtaLength = dayLength / 15;
    return new Date(sunrise.getTime() + MANDI_DAY_MUHURTA_COUNT[weekday] * muhurtaLength);
  }

  const nightLength = nextSunrise.getTime() - sunset.getTime();
  const muhurtaLength = nightLength / 15;
  return new Date(sunset.getTime() + MANDI_NIGHT_MUHURTA_COUNT[weekday] * muhurtaLength);
}
