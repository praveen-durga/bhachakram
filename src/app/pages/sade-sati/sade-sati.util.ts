import { NAKSHATRA_NAMES, RASI_NAMES, wallTimeToUtc } from '../../shared/utils';
import { BODY_PART_TABLE, SATURN_DATA_TIMEZONE, SATURN_SIGN_ENTRIES, VEHICLE_ANIMALS } from './sade-sati.data';
import { BodyPartRow, Occurrence, OccurrenceType, VehicleInfo } from './sade-sati.model';

const OCCURRENCE_SPANS: { type: OccurrenceType; fromMoonOffset: number; fromMoonLabel: string; signSpan: number }[] = [
  { type: 'Sade Sati', fromMoonOffset: 11, fromMoonLabel: '12th from Moon', signSpan: 3 },
  { type: 'Ardhashtama Shani', fromMoonOffset: 3, fromMoonLabel: '4th from Moon', signSpan: 1 },
  { type: 'Ashtama Shani', fromMoonOffset: 7, fromMoonLabel: '8th from Moon', signSpan: 1 },
];

export type RawOccurrenceWindow = {
  type: OccurrenceType;
  fromMoonLabel: string;
  start: Date;
  end: Date;
  signs: string[];
};

function entryToUtc(index: number): Date {
  const entry = SATURN_SIGN_ENTRIES[index];
  return wallTimeToUtc(entry.date, entry.time, SATURN_DATA_TIMEZONE);
}

export function findOccurrenceWindows(moonRasi: number, windowStart: Date, windowEnd: Date): RawOccurrenceWindow[] {
  const windows: RawOccurrenceWindow[] = [];

  for (const { type, fromMoonOffset, fromMoonLabel, signSpan } of OCCURRENCE_SPANS) {
    const targetRasi = (moonRasi + fromMoonOffset) % 12;

    for (let i = 0; i < SATURN_SIGN_ENTRIES.length; i++) {
      if (SATURN_SIGN_ENTRIES[i].rasi !== targetRasi) {
        continue;
      }

      const endIndex = i + signSpan;
      if (endIndex >= SATURN_SIGN_ENTRIES.length) {
        continue; // no exit data available this close to the dataset's edge
      }

      const start = entryToUtc(i);
      if (start < windowStart || start > windowEnd) {
        continue;
      }

      const signs = Array.from({ length: signSpan }, (_, offset) => RASI_NAMES[SATURN_SIGN_ENTRIES[i + offset].rasi]);
      windows.push({ type, fromMoonLabel, start, end: entryToUtc(endIndex), signs });
    }
  }

  return windows.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function calculateVehicle(janmaNakshatraIndex: number, transitNakshatraIndex: number): VehicleInfo {
  const count = ((transitNakshatraIndex - janmaNakshatraIndex + 27) % 27) + 1;
  const remainderRaw = count % 9;
  const remainder = remainderRaw === 0 ? 9 : remainderRaw;

  return {
    ...VEHICLE_ANIMALS[remainder],
    janmaNakshatra: NAKSHATRA_NAMES[janmaNakshatraIndex],
    transitNakshatra: NAKSHATRA_NAMES[transitNakshatraIndex],
    count,
    remainder,
  };
}

// Adds a (possibly fractional) number of months using real calendar month
// lengths rather than a flat average (e.g. 365.25/12) — the whole-month part
// steps the month field directly (so it naturally respects each month's
// actual length and leap years), and the fractional remainder is converted
// to days using the number of days in the month it lands in.
function addFractionalMonths(date: Date, months: number): Date {
  const wholeMonths = Math.trunc(months);
  const fractionalMonths = months - wholeMonths;

  const stepped = new Date(date.getTime());
  stepped.setUTCMonth(stepped.getUTCMonth() + wholeMonths);

  if (fractionalMonths === 0) {
    return stepped;
  }

  const daysInLandingMonth = new Date(Date.UTC(stepped.getUTCFullYear(), stepped.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(stepped.getTime() + fractionalMonths * daysInLandingMonth * 24 * 60 * 60 * 1000);
}

export function buildBodyPartTimeline(start: Date, scale: number): BodyPartRow[] {
  let cursor = start;

  return BODY_PART_TABLE.map(({ part, months, sensitive }) => {
    const scaledMonths = months * scale;
    const from = cursor;
    const to = addFractionalMonths(cursor, scaledMonths);
    cursor = to;
    return { part, months: scaledMonths, from, to, sensitive };
  });
}

export function buildOccurrence(
  window: RawOccurrenceWindow,
  janmaNakshatraIndex: number,
  transitNakshatraIndex: number,
): Occurrence {
  const scale = window.type === 'Sade Sati' ? 1 : 1 / 3;

  return {
    type: window.type,
    fromMoonLabel: window.fromMoonLabel,
    start: window.start,
    end: window.end,
    signs: window.signs,
    vehicle: calculateVehicle(janmaNakshatraIndex, transitNakshatraIndex),
    bodyPartTimeline: buildBodyPartTimeline(window.start, scale),
  };
}
