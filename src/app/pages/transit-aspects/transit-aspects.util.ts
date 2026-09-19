import { TransitDeclinationData } from '../../shared/services';
import { RASI_NAMES } from '../../shared/utils';
import { TRANSIT_ASPECT_ANGLES, TRANSIT_ASPECT_BODIES } from './transit-aspects.data';
import { TransitAspectBody, TransitAspectEvent } from './transit-aspects.model';

// Daily UTC-midnight dates from start to end (inclusive).
export function buildDailySampleDates(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  for (let day = start.getTime(); day <= end.getTime(); day += 86400000) {
    dates.push(new Date(day));
  }
  return dates;
}

// Raw sidereal longitudes are always in [0, 360) - a fast-moving body (the
// Moon especially) wrapping from ~359deg back to ~0deg between two samples
// would otherwise look like a ~360deg jump instead of the few degrees it
// actually moved. Unwrapping turns each body's own longitude into a
// continuous (non-modulo) trajectory, assuming no body moves more than
// 180deg between consecutive samples (true for daily sampling of anything
// in the solar system, direct or retrograde).
function unwrapLongitudes(rawValues: number[]): number[] {
  const unwrapped: number[] = [rawValues[0]];
  for (let i = 1; i < rawValues.length; i++) {
    const previous = unwrapped[i - 1];
    let current = rawValues[i];
    while (current - previous > 180) {
      current -= 360;
    }
    while (current - previous < -180) {
      current += 360;
    }
    unwrapped.push(current);
  }
  return unwrapped;
}

function longitudeToSign(unwrappedLongitude: number): string {
  const normalized = ((unwrappedLongitude % 360) + 360) % 360;
  return RASI_NAMES[Math.floor(normalized / 30) % 12];
}

// Declination doesn't wrap (it stays within roughly +-30deg for any body in
// this list), so unlike longitude it needs no unwrapping before comparing two
// samples - a plain increase/decrease already tells direction. The value and
// the ecliptic latitude at the event are shown alongside the direction, per
// the user's own request.
function formatDeclination(before: number, atEvent: number, latitudeAtEvent: number): string {
  const direction = atEvent > before ? 'S to N' : 'N to S';
  return `${direction} (Decl ${atEvent.toFixed(2)}°, Lat ${latitudeAtEvent.toFixed(2)}°)`;
}

type AngleCrossing = { date: Date; signA: string; signB: string; declinationA: string; declinationB: string };

// Every date, across the sampled range, that a pair's unwrapped longitude
// difference crosses `angle` (or any of its 360deg-periodic repeats, since
// the difference keeps accumulating past 360 as the faster body laps the
// slower one) - linearly interpolated between the two bracketing daily
// samples for a sub-day estimate. Each body's own sign, declination and
// ecliptic latitude at that moment are derived the same way: interpolated
// from the bracketing daily samples, with declination also compared against
// the sample immediately before the event to determine the N/S trend.
function findAngleCrossings(
  dates: Date[],
  diffs: number[],
  unwrappedA: number[],
  unwrappedB: number[],
  declinationsA: TransitDeclinationData[],
  declinationsB: TransitDeclinationData[],
  angle: number,
): AngleCrossing[] {
  const crossings: AngleCrossing[] = [];

  for (let i = 1; i < diffs.length; i++) {
    const before = diffs[i - 1];
    const after = diffs[i];
    const nearestMultiple = Math.round((before - angle) / 360);
    const shiftedAngle = angle + 360 * nearestMultiple;
    const beforeOffset = before - shiftedAngle;
    const afterOffset = after - shiftedAngle;
    if (beforeOffset === 0 || afterOffset === 0 || beforeOffset > 0 === afterOffset > 0) {
      continue;
    }

    const fraction = Math.abs(beforeOffset) / (Math.abs(beforeOffset) + Math.abs(afterOffset));
    const time = dates[i - 1].getTime() + fraction * (dates[i].getTime() - dates[i - 1].getTime());
    const longitudeA = unwrappedA[i - 1] + fraction * (unwrappedA[i] - unwrappedA[i - 1]);
    const longitudeB = unwrappedB[i - 1] + fraction * (unwrappedB[i] - unwrappedB[i - 1]);
    const declinationAAtEvent =
      declinationsA[i - 1].declination + fraction * (declinationsA[i].declination - declinationsA[i - 1].declination);
    const declinationBAtEvent =
      declinationsB[i - 1].declination + fraction * (declinationsB[i].declination - declinationsB[i - 1].declination);
    const latitudeAAtEvent =
      declinationsA[i - 1].eclipticLatitude +
      fraction * (declinationsA[i].eclipticLatitude - declinationsA[i - 1].eclipticLatitude);
    const latitudeBAtEvent =
      declinationsB[i - 1].eclipticLatitude +
      fraction * (declinationsB[i].eclipticLatitude - declinationsB[i - 1].eclipticLatitude);

    crossings.push({
      date: new Date(time),
      signA: longitudeToSign(longitudeA),
      signB: longitudeToSign(longitudeB),
      declinationA: formatDeclination(declinationsA[i - 1].declination, declinationAAtEvent, latitudeAAtEvent),
      declinationB: formatDeclination(declinationsB[i - 1].declination, declinationBAtEvent, latitudeBAtEvent),
    });
  }

  return crossings;
}

export function findTransitAspectEvents(
  dates: Date[],
  longitudeSamples: Record<TransitAspectBody, number>[],
  declinationSamples: Record<TransitAspectBody, TransitDeclinationData>[],
): TransitAspectEvent[] {
  const unwrappedByBody = new Map<TransitAspectBody, number[]>(
    TRANSIT_ASPECT_BODIES.map((body) => [body, unwrapLongitudes(longitudeSamples.map((sample) => sample[body]))]),
  );
  const declinationsByBody = new Map<TransitAspectBody, TransitDeclinationData[]>(
    TRANSIT_ASPECT_BODIES.map((body) => [body, declinationSamples.map((sample) => sample[body])]),
  );

  const events: TransitAspectEvent[] = [];

  for (let a = 0; a < TRANSIT_ASPECT_BODIES.length; a++) {
    for (let b = a + 1; b < TRANSIT_ASPECT_BODIES.length; b++) {
      const bodyA = TRANSIT_ASPECT_BODIES[a];
      const bodyB = TRANSIT_ASPECT_BODIES[b];
      const unwrappedA = unwrappedByBody.get(bodyA)!;
      const unwrappedB = unwrappedByBody.get(bodyB)!;
      // abs() of the (continuous) signed difference makes a "V" at exact
      // conjunctions, not a jump - safe to scan with simple endpoint
      // comparison here since the lowest target angle is 30deg and even the
      // fastest pair (Moon vs anything) moves well under 30deg/day, so a
      // dip-below-30-and-back can never be missed entirely between samples.
      const diffs = unwrappedA.map((value, index) => Math.abs(value - unwrappedB[index]));

      for (const angle of TRANSIT_ASPECT_ANGLES) {
        for (const crossing of findAngleCrossings(
          dates,
          diffs,
          unwrappedA,
          unwrappedB,
          declinationsByBody.get(bodyA)!,
          declinationsByBody.get(bodyB)!,
          angle,
        )) {
          events.push({ bodyA, bodyB, angle, ...crossing });
        }
      }
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}
