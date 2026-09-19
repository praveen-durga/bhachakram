import { Graha, GrahaEphemerisData } from '../../shared/services';
import { GRAHA_ORDER } from '../../shared/utils';
import {
  DECLINATION_COLOR_BY_GRAHA,
  DECLINATION_DASHED_GRAHAS,
  DECLINATION_SAMPLE_STEP_DAYS,
} from './declination.data';
import {
  DeclinationChartData,
  DeclinationEvent,
  DeclinationPoint,
  DeclinationRow,
  DeclinationSeries,
} from './declination.model';

export function buildDeclinationRows(grahas: Record<Graha, GrahaEphemerisData>): DeclinationRow[] {
  return GRAHA_ORDER.map((graha) => ({ graha, declination: grahas[graha].declination }));
}

// Jan 1 - Dec 31 (UTC midnight) of the given year, every
// DECLINATION_SAMPLE_STEP_DAYS days, plus Dec 31 itself so the line reaches
// the end of the year.
export function buildYearSampleDates(year: number): Date[] {
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year, 11, 31);
  const dates: Date[] = [];

  for (let day = start; day < end; day += DECLINATION_SAMPLE_STEP_DAYS * 86400000) {
    dates.push(new Date(day));
  }
  dates.push(new Date(end));

  return dates;
}

function dayOfYear(date: Date, year: number): number {
  return Math.round((date.getTime() - Date.UTC(year, 0, 1)) / 86400000);
}

export function buildDeclinationChartData(
  year: number,
  samples: { date: Date; grahas: Record<Graha, GrahaEphemerisData> }[],
): DeclinationChartData {
  const series: DeclinationSeries[] = GRAHA_ORDER.map((graha) => ({
    graha,
    color: DECLINATION_COLOR_BY_GRAHA[graha],
    dashed: DECLINATION_DASHED_GRAHAS.includes(graha),
    points: samples.map(({ date, grahas }) => ({
      date,
      dayOfYear: dayOfYear(date, year),
      value: grahas[graha].declination,
    })),
  }));

  const allValues = series.flatMap((s) => s.points.map((p) => p.value));

  return { year, series, minValue: Math.min(...allValues), maxValue: Math.max(...allValues) };
}

// Linear interpolation between two consecutive samples that straddle 0deg -
// the sample step is only 3 days, so this stays close to the true crossing
// instant without needing extra ephemeris calls to root-find it exactly.
function interpolateCrossingDate(before: DeclinationPoint, after: DeclinationPoint): Date {
  const fraction = Math.abs(before.value) / (Math.abs(before.value) + Math.abs(after.value));
  return new Date(before.date.getTime() + fraction * (after.date.getTime() - before.date.getTime()));
}

// Every date a planet's declination crosses 0deg (the celestial equator),
// across all planets. North-to-South = value goes positive -> negative;
// South-to-North = negative -> positive.
function findEquatorCrossings(series: DeclinationSeries): DeclinationEvent[] {
  const events: DeclinationEvent[] = [];

  for (let i = 1; i < series.points.length; i++) {
    const before = series.points[i - 1];
    const after = series.points[i];
    if (before.value === 0 || after.value === 0 || before.value > 0 === after.value > 0) {
      continue;
    }

    events.push({
      graha: series.graha,
      date: interpolateCrossingDate(before, after),
      type: 'Equator Crossing',
      direction: before.value > 0 ? 'N to S' : 'S to N',
    });
  }

  return events;
}

// Fits a parabola through 3 equally-spaced samples (t = -1, 0, 1) and returns
// the vertex's offset from the middle sample, in sample-step units - clamped
// to +/-1 since the fit is only meaningful within the 3-point window.
function parabolaVertexOffset(before: number, middle: number, after: number): number {
  const curvature = (before + after) / 2 - middle;
  if (curvature === 0) {
    return 0;
  }
  const offset = (before - after) / (4 * curvature);
  return Math.max(-1, Math.min(1, offset));
}

// Every date a planet's declination stops increasing and starts decreasing
// (a maximum - "N to S", it starts moving toward the South) or stops
// decreasing and starts increasing (a minimum - "S to N") - a genuine
// reversal of motion, independent of whether it also happens to cross 0deg
// (e.g. the Sun's solstices, ~+-23.4deg, are turning points but not
// crossings; its equinoxes are crossings but not turning points).
function findTurningPoints(series: DeclinationSeries): DeclinationEvent[] {
  const events: DeclinationEvent[] = [];

  for (let i = 1; i < series.points.length - 1; i++) {
    const before = series.points[i - 1];
    const middle = series.points[i];
    const after = series.points[i + 1];
    const trendBefore = middle.value - before.value;
    const trendAfter = after.value - middle.value;
    if (trendBefore === 0 || trendAfter === 0 || trendBefore > 0 === trendAfter > 0) {
      continue;
    }

    const offsetDays = parabolaVertexOffset(before.value, middle.value, after.value) * DECLINATION_SAMPLE_STEP_DAYS;
    events.push({
      graha: series.graha,
      date: new Date(middle.date.getTime() + offsetDays * 86400000),
      type: 'Turning Point',
      direction: trendAfter > 0 ? 'S to N' : 'N to S',
    });
  }

  return events;
}

// All declination direction-change events (equator crossings and turning
// points) across every planet, sorted ascending by date.
export function findDeclinationEvents(chart: DeclinationChartData): DeclinationEvent[] {
  const events = chart.series.flatMap((series) => [...findEquatorCrossings(series), ...findTurningPoints(series)]);
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}
