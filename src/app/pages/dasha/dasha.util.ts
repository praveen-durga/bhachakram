import { Graha } from '../../shared/services';
import {
  calculateNakshatra,
  getNakshatraLord,
  NAKSHATRA_LORD_CYCLE,
  NAKSHATRA_SPAN,
  VIMSHOTTARI_DASHA_YEARS,
  VIMSHOTTARI_TOTAL_YEARS,
} from '../../shared/utils';
import { DashaBalance, DashaNode, DashaPeriod } from './dasha.model';

// Mirrors sade-sati.util.ts's addFractionalMonths: the whole-year part steps
// the year field directly (so leap years are handled naturally), and the
// fractional remainder is converted to days using a 365.25-day average year.
export function addFractionalYears(date: Date, years: number): Date {
  const wholeYears = Math.trunc(years);
  const fractionalYears = years - wholeYears;

  const stepped = new Date(date.getTime());
  stepped.setUTCFullYear(stepped.getUTCFullYear() + wholeYears);

  if (fractionalYears === 0) {
    return stepped;
  }

  return new Date(stepped.getTime() + fractionalYears * 365.25 * 24 * 60 * 60 * 1000);
}

export function calculateDashaBalance(moonLongitude: number, nakshatraOffset: number): DashaBalance {
  const janmaNakshatra = calculateNakshatra(moonLongitude);
  const referenceNakshatra = (janmaNakshatra + nakshatraOffset) % 27;
  const lord = getNakshatraLord(referenceNakshatra);

  const fractionElapsed = (moonLongitude % NAKSHATRA_SPAN) / NAKSHATRA_SPAN;
  const years = VIMSHOTTARI_DASHA_YEARS[lord] * (1 - fractionElapsed);

  return { lord, years };
}

// Subdivides a period into its 9 children: walk the standard 9-lord cycle
// starting at `lord`, each child's share of `totalYears` proportional to its
// own full dasha length (child years = totalYears * childFullYears/120).
// Serves both the Maha level (totalYears=120) and every deeper level's
// children (totalYears=the parent lord's own full years) - same formula.
function subdivide(lord: Graha, start: Date, totalYears: number): DashaPeriod[] {
  const startIndex = NAKSHATRA_LORD_CYCLE.indexOf(lord);
  let cursor = start;

  return Array.from({ length: 9 }, (_, i) => {
    const periodLord = NAKSHATRA_LORD_CYCLE[(startIndex + i) % 9];
    const periodYears = totalYears * (VIMSHOTTARI_DASHA_YEARS[periodLord] / 120);
    const periodStart = cursor;
    const periodEnd = addFractionalYears(cursor, periodYears);
    cursor = periodEnd;
    return { lord: periodLord, start: periodStart, end: periodEnd };
  });
}

export function buildMahaDashaNodes(moonLongitude: number, birthDate: Date, nakshatraOffset: number): DashaNode[] {
  const balance = calculateDashaBalance(moonLongitude, nakshatraOffset);
  const elapsedYears = VIMSHOTTARI_DASHA_YEARS[balance.lord] - balance.years;
  const cycleStart = addFractionalYears(birthDate, -elapsedYears);

  return subdivide(balance.lord, cycleStart, VIMSHOTTARI_TOTAL_YEARS).map((period, index) => ({
    ...period,
    id: `${period.lord}-${index}-${period.start.getTime()}`,
    level: 0,
    children: null,
  }));
}

export function periodDurationYears(period: DashaPeriod): number {
  return (period.end.getTime() - period.start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

// Subdivides using the parent's own ACTUAL elapsed duration, not
// VIMSHOTTARI_DASHA_YEARS[parent.lord] (its lord's fixed 120-year-cycle
// length) - those only coincide for a Mahadasha (which always spans exactly
// its lord's catalog years); every deeper level's parent spans a
// proportionally scaled-down fraction of that, so subdividing by the fixed
// catalog value would silently overshoot Pratyantar/Sookshma durations.
export function buildChildNodes(parent: DashaNode): DashaNode[] {
  return subdivide(parent.lord, parent.start, periodDurationYears(parent)).map((period, index) => ({
    ...period,
    id: `${parent.id}>${period.lord}-${index}`,
    level: parent.level + 1,
    children: null,
  }));
}

export function formatDuration(years: number): string {
  const totalDays = Math.round(years * 365.25);
  const y = Math.floor(totalDays / 365.25);
  const remainingAfterYears = totalDays - Math.floor(y * 365.25);
  const m = Math.floor(remainingAfterYears / 30.44);
  const d = Math.round(remainingAfterYears - m * 30.44);

  return `${y}y ${m}m ${d}d`;
}
