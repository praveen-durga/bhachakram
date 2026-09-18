import { Graha } from '../../shared/services';
import {
  calculateNakshatra,
  findGraha,
  getNakshatraLord,
  NAKSHATRA_LORD_CYCLE,
  VIMSHOTTARI_DASHA_YEARS,
} from '../../shared/utils';
import { AnnualChart, TajikDashaNode } from './tajik.model';

const DAY_MS = 24 * 60 * 60 * 1000;
const SIDEREAL_YEAR_DAYS = 365.256363;

function periodDays(node: TajikDashaNode): number {
  return (node.end.getTime() - node.start.getTime()) / DAY_MS;
}

// Mudda Dasha - simpler than it first appears: just Vimshottari's fixed
// year-proportions compressed into a 360-day year (VIMSHOTTARI_DASHA_YEARS
// x 3), same 9-lord cyclic order, but starting from the ANNUAL chart's own
// Moon-nakshatra lord (not natal). Corroborated directly against classical
// day-counts (Sun 18, Moon 30, Mars 21, Rahu 54, Jupiter 48, Saturn 57,
// Mercury 51, Ketu 21, Venus 60 = 360).
function subdivideMuddaDays(lord: Graha, start: Date, totalDays: number): { lord: Graha; start: Date; end: Date }[] {
  const startIndex = NAKSHATRA_LORD_CYCLE.indexOf(lord);
  let cursor = start;

  return Array.from({ length: 9 }, (_, i) => {
    const periodLord = NAKSHATRA_LORD_CYCLE[(startIndex + i) % 9];
    const days = totalDays * (VIMSHOTTARI_DASHA_YEARS[periodLord] / 120);
    const periodStart = cursor;
    const periodEnd = new Date(cursor.getTime() + days * DAY_MS);
    cursor = periodEnd;
    return { lord: periodLord, start: periodStart, end: periodEnd };
  });
}

export function buildMuddaDashaNodes(annualChart: AnnualChart): TajikDashaNode[] {
  const moon = findGraha(annualChart.chart.grahas, 'Moon');
  const startLord = getNakshatraLord(calculateNakshatra(moon.longitude));

  return subdivideMuddaDays(startLord, annualChart.instant, 360).map((period, index) => ({
    ...period,
    id: `mudda-${period.lord}-${index}`,
    level: 0,
    children: null,
  }));
}

export function buildMuddaChildNodes(parent: TajikDashaNode): TajikDashaNode[] {
  return subdivideMuddaDays(parent.lord as Graha, parent.start, periodDays(parent)).map((period, index) => ({
    ...period,
    id: `${parent.id}>${period.lord}-${index}`,
    level: parent.level + 1,
    children: null,
  }));
}

// Patyayini Dasha - 7 planets (no nodes) + Lagna, ordered by ascending
// Krishamsha (degree-within-sign, 0-30°) in the annual chart. Patyamsha(1st/
// smallest) = its own Krishamsha; Patyamsha(n) = Krishamsha(n)-Krishamsha
// (n-1) for the rest. Duration(n) = Patyamsha(n) x 365.256363/maxKrishamsha
// - this telescopes so all 8 durations sum to exactly one sidereal year
// (verified algebraically and in Node). No "return"/relationship-based
// continuation rule found in any source despite a thorough search - strictly
// ascending, single pass.
const PATYAYINI_GRAHA_ORDER: Graha[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

function krishamsha(longitude: number): number {
  return ((longitude % 30) + 30) % 30;
}

export function buildPatyayiniDashaNodes(annualChart: AnnualChart): TajikDashaNode[] {
  const candidates = PATYAYINI_GRAHA_ORDER.map((graha) => ({
    lord: graha as string,
    krishamsha: krishamsha(findGraha(annualChart.chart.grahas, graha).longitude),
  }));
  const lagnaLongitude = annualChart.chart.ascendantLongitude ?? annualChart.chart.ascendantRasi * 30;
  candidates.push({ lord: 'Lagna', krishamsha: krishamsha(lagnaLongitude) });

  candidates.sort((a, b) => a.krishamsha - b.krishamsha);
  const maxKrishamsha = candidates[candidates.length - 1].krishamsha;

  let cursor = annualChart.instant;
  let previousKrishamsha = 0;

  return candidates.map((candidate, index) => {
    const patyamsha = candidate.krishamsha - previousKrishamsha;
    previousKrishamsha = candidate.krishamsha;
    const days = (patyamsha / maxKrishamsha) * SIDEREAL_YEAR_DAYS;
    const start = cursor;
    const end = new Date(cursor.getTime() + days * DAY_MS);
    cursor = end;
    return { id: `patyayini-${candidate.lord}-${index}`, lord: candidate.lord, level: 0, start, end, children: null };
  });
}

// Antardasha(i,j) = MD(i) x MD(j) / 365.256363 - cycling through the SAME
// sorted 8-candidate order, starting from the parent's own lord and
// wrapping around (mirrors Vimshottari's "first Antardasha = same lord as
// Mahadasha" convention; the worked source example is exactly this case:
// AD of Sun within Sun's own MD = 64.29 x 64.29 / 365 = 11d 8h). Sums to
// exactly the parent's own duration since the 8 MD durations sum to one
// sidereal year.
export function buildPatyayiniChildNodes(parent: TajikDashaNode, mahaDashaNodes: TajikDashaNode[]): TajikDashaNode[] {
  const startIndex = mahaDashaNodes.findIndex((node) => node.id === parent.id);
  const parentDays = periodDays(parent);
  let cursor = parent.start;

  return mahaDashaNodes.map((_, i) => {
    const candidate = mahaDashaNodes[(startIndex + i) % mahaDashaNodes.length];
    const days = (parentDays * periodDays(candidate)) / SIDEREAL_YEAR_DAYS;
    const start = cursor;
    const end = new Date(cursor.getTime() + days * DAY_MS);
    cursor = end;
    return {
      id: `${parent.id}>${candidate.lord}-${i}`,
      lord: candidate.lord,
      level: parent.level + 1,
      start,
      end,
      children: null,
    };
  });
}
