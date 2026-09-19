import { TransitBodySnapshot } from '../../shared/services';
import { RASI_NAMES } from '../../shared/utils';
import { AspectBodySnapshot, computeResult, computeResultTimeRange } from './transit-aspects-result.util';
import { TRANSIT_ASPECT_ANGLES, TRANSIT_ASPECT_BODIES } from './transit-aspects.data';
import { TransitAspectBody, TransitAspectEvent } from './transit-aspects.model';

// Sample dates from start to end (inclusive) every `intervalHours`. The
// minor aspect angles (down to 6°) need finer-than-daily sampling - see
// findAngleCrossings' safety comment below.
export function buildSampleDates(start: Date, end: Date, intervalHours: number): Date[] {
  const dates: Date[] = [];
  const intervalMs = intervalHours * 3600000;
  for (let time = start.getTime(); time <= end.getTime(); time += intervalMs) {
    dates.push(new Date(time));
  }
  return dates;
}

// Raw sidereal longitudes are always in [0, 360) - a fast-moving body (the
// Moon especially) wrapping from ~359deg back to ~0deg between two samples
// would otherwise look like a ~360deg jump instead of the few degrees it
// actually moved. Unwrapping turns each body's own longitude into a
// continuous (non-modulo) trajectory, assuming no body moves more than
// 180deg between consecutive samples (true for the 4-hour sampling grid used
// here, for any body in the solar system, direct or retrograde).
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

// Interpolates every field of a body's snapshot at `fraction` between the two
// bracketing samples, for the Result rule engine - isCombust is looked up
// from the nearer sample rather than interpolated (it changes far more slowly
// than a single sampling interval, so this is an adequate approximation
// without needing a second combustion-threshold table in the util layer).
function interpolateBodySnapshot(
  body: TransitAspectBody,
  unwrapped: number[],
  snapshots: TransitBodySnapshot[],
  i: number,
  fraction: number,
): AspectBodySnapshot {
  const before = snapshots[i - 1];
  const after = snapshots[i];
  const longitude = unwrapped[i - 1] + fraction * (unwrapped[i] - unwrapped[i - 1]);
  const declination = before.declination + fraction * (after.declination - before.declination);
  const eclipticLatitude = before.eclipticLatitude + fraction * (after.eclipticLatitude - before.eclipticLatitude);
  const speed = before.speed + fraction * (after.speed - before.speed);

  return {
    body,
    longitude,
    eclipticLatitude,
    declination,
    isDeclinationIncreasing: declination > before.declination,
    isRetrograde: speed < 0,
    isCombust: fraction < 0.5 ? before.isCombust : after.isCombust,
  };
}

type AngleCrossing = {
  date: Date;
  signA: string;
  signB: string;
  declinationA: string;
  declinationB: string;
  result: string;
  resultStartTime: Date;
  resultEndTime: Date;
};

// Every date, across the sampled range, that a pair's unwrapped longitude
// difference crosses `angle` (or any of its 360deg-periodic repeats, since
// the difference keeps accumulating past 360 as the faster body laps the
// slower one) - linearly interpolated between the two bracketing samples for
// a sub-interval estimate. Safe to scan with simple endpoint comparison here
// as long as no pair's relative motion can swing past the smallest target
// angle (6deg) and back within one sampling interval - at the 4-hour grid
// this page samples on, even the fastest pair (Moon vs anything, ~15deg/day
// worst case) moves under 3deg between samples, comfortably under that floor
// for ordinary (non-retrograde-station) motion.
function findAngleCrossings(
  dates: Date[],
  diffs: number[],
  unwrappedA: number[],
  unwrappedB: number[],
  unwrappedSun: number[],
  snapshotsA: TransitBodySnapshot[],
  snapshotsB: TransitBodySnapshot[],
  bodyA: TransitAspectBody,
  bodyB: TransitAspectBody,
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
    const date = new Date(time);

    const snapshotA = interpolateBodySnapshot(bodyA, unwrappedA, snapshotsA, i, fraction);
    const snapshotB = interpolateBodySnapshot(bodyB, unwrappedB, snapshotsB, i, fraction);
    const sunLongitude = unwrappedSun[i - 1] + fraction * (unwrappedSun[i] - unwrappedSun[i - 1]);
    const declinationBeforeA = snapshotsA[i - 1].declination;
    const declinationBeforeB = snapshotsB[i - 1].declination;

    const resultTimeRange = computeResultTimeRange(angle, date, snapshotA, snapshotB);

    crossings.push({
      date,
      signA: longitudeToSign(snapshotA.longitude),
      signB: longitudeToSign(snapshotB.longitude),
      declinationA: formatDeclination(declinationBeforeA, snapshotA.declination, snapshotA.eclipticLatitude),
      declinationB: formatDeclination(declinationBeforeB, snapshotB.declination, snapshotB.eclipticLatitude),
      result: computeResult(angle, snapshotA, snapshotB, sunLongitude),
      resultStartTime: resultTimeRange.start,
      resultEndTime: resultTimeRange.end,
    });
  }

  return crossings;
}

export function findTransitAspectEvents(
  dates: Date[],
  samples: Record<TransitAspectBody, TransitBodySnapshot>[],
): TransitAspectEvent[] {
  const unwrappedByBody = new Map<TransitAspectBody, number[]>(
    TRANSIT_ASPECT_BODIES.map((body) => [body, unwrapLongitudes(samples.map((sample) => sample[body].longitude))]),
  );
  const snapshotsByBody = new Map<TransitAspectBody, TransitBodySnapshot[]>(
    TRANSIT_ASPECT_BODIES.map((body) => [body, samples.map((sample) => sample[body])]),
  );
  const unwrappedSun = unwrappedByBody.get('Sun')!;

  const events: TransitAspectEvent[] = [];

  for (let a = 0; a < TRANSIT_ASPECT_BODIES.length; a++) {
    for (let b = a + 1; b < TRANSIT_ASPECT_BODIES.length; b++) {
      const bodyA = TRANSIT_ASPECT_BODIES[a];
      const bodyB = TRANSIT_ASPECT_BODIES[b];
      const unwrappedA = unwrappedByBody.get(bodyA)!;
      const unwrappedB = unwrappedByBody.get(bodyB)!;
      // abs() of the (continuous) signed difference makes a "V" at exact
      // conjunctions, not a jump.
      const diffs = unwrappedA.map((value, index) => Math.abs(value - unwrappedB[index]));

      for (const angle of TRANSIT_ASPECT_ANGLES) {
        for (const crossing of findAngleCrossings(
          dates,
          diffs,
          unwrappedA,
          unwrappedB,
          unwrappedSun,
          snapshotsByBody.get(bodyA)!,
          snapshotsByBody.get(bodyB)!,
          bodyA,
          bodyB,
          angle,
        )) {
          events.push({ bodyA, bodyB, angle, ...crossing });
        }
      }
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}
