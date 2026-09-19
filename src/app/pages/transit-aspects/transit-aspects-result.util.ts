import { calculateD9Rasi, EXALTATION_LONGITUDE, RASI_LORD } from '../../shared/utils';
import { TransitAspectBody } from './transit-aspects.model';

// Per-body data needed at the exact aspect instant, per the user's own
// market-astrology notes (.claude/todo-plans/22-transit-aspects-result-column.md).
export type AspectBodySnapshot = {
  body: TransitAspectBody;
  longitude: number; // 0-360, normalized
  eclipticLatitude: number;
  declination: number;
  isDeclinationIncreasing: boolean;
  isRetrograde: boolean;
  isCombust: boolean;
};

type Group = 'A' | 'B';
type Sign = '+' | '-';

// §2 - "Same group means friends, different groups means enemies."
const GROUP_A = new Set<TransitAspectBody>(['Sun', 'Moon', 'Mars', 'Jupiter', 'Neptune', 'Pluto']);
const NATURAL_MALEFICS = new Set<TransitAspectBody>(['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu', 'Uranus', 'Pluto']);
const NATURAL_BENEFICS = new Set<TransitAspectBody>(['Jupiter', 'Venus', 'Neptune', 'Moon', 'Mercury']);

// §7's "Time" column (minutes), the only column this feature uses - not the
// orb/ardh-bhag arc-degree values, since the Result window only nudges the
// already-exact crossing instant rather than doing orb-window detection. Each
// angle's mirror (e.g. 210° for 150°) shares the same minutes, since §3's
// table describes one aspect per row, not two. §3 only gives a Time value for
// 30/45/60/90/120/135/150/180/0(360) - every other angle (72/144/22.5 and the
// minor 6-40deg set) borrows its nearest neighbor's minutes among that set
// (by plain degree distance, e.g. 72 -> 60's 70min, 144 -> 150's 145min), on
// the reasoning that a closely-spaced aspect's effect window is more likely
// to resemble its nearest documented neighbor than to have no window at all.
// 15/345 sit exactly between two documented angles (0 and 30, 330 and 360) -
// broken toward 30/330 to keep the 15-24deg cluster grouped together.
const ARDH_BHAG_MINUTES_BY_ANGLE: Partial<Record<number, number>> = {
  6: 210, // nearest: 0/360
  9: 210, // nearest: 0/360
  12: 210, // nearest: 0/360
  15: 35, // tie (0/360 vs 30) broken toward 30
  18: 35, // nearest: 30
  20: 35, // nearest: 30
  22.5: 35, // nearest: 30
  24: 35, // nearest: 30
  30: 35,
  36: 35, // nearest: 30
  40: 52.5, // nearest: 45
  45: 52.5,
  60: 70,
  72: 70, // nearest: 60
  90: 210,
  120: 140,
  135: 157.5,
  144: 145, // nearest: 150
  150: 145,
  180: 210,
  210: 145,
  216: 145, // nearest: 210 (mirror of 144 -> 150)
  225: 157.5,
  240: 140,
  270: 210,
  288: 70, // nearest: 300 (mirror of 72 -> 60)
  300: 70,
  315: 52.5,
  320: 52.5, // nearest: 315 (mirror of 40 -> 45)
  324: 35, // nearest: 330 (mirror of 36 -> 30)
  330: 35,
  336: 35, // nearest: 330 (mirror of 24 -> 30)
  337.5: 35, // nearest: 330 (mirror of 22.5 -> 30)
  340: 35, // nearest: 330 (mirror of 20 -> 30)
  342: 35, // nearest: 330 (mirror of 18 -> 30)
  345: 35, // tie (330 vs 360) broken toward 330 (mirror of 15)
  348: 210, // nearest: 360 (mirror of 12 -> 0/360)
  351: 210, // nearest: 360 (mirror of 9 -> 0/360)
  354: 210, // nearest: 360 (mirror of 6 -> 0/360)
  360: 210,
};

function degnorm(value: number): number {
  return ((value % 360) + 360) % 360;
}

function circularDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function signOf(longitude: number): number {
  return Math.floor(degnorm(longitude) / 30) % 12;
}

// The body's own §2 classification - fixed, independent of what sign it's
// currently transiting. Used only by §4.6's modifier override.
function ownGroup(body: TransitAspectBody): Group {
  return GROUP_A.has(body) ? 'A' : 'B';
}

// The group of the planet that RULES the sign a body occupies (its
// dispositor) - used by §4.1's 2/12 and 6/8 rules. RASI_LORD already covers
// all 12 signs with a classical ruler, and works for any occupant (Rahu/Ketu/
// outer planets included) since dispositor is a property of the sign
// occupied, not of the occupying planet.
function dispositorGroup(sign: number): Group {
  return ownGroup(RASI_LORD[sign]);
}

// §4.5's navamsha trikon condition (D9 signs mutually in trine - 1st/5th/9th
// from each other), reused by §4.1's "good navamsha" gate for 150°/210° and
// by 135°/225°'s "trine" condition.
function isNavamshaTrikon(navamshaA: number, navamshaB: number): boolean {
  return ((navamshaB - navamshaA + 12) % 12) % 4 === 0;
}

// Fixed Makar (Capricorn) lagna, per §6 - Capricorn (sign index 9) is house 1.
function houseFromMakarLagna(sign: number): number {
  return ((sign - 9 + 12) % 12) + 1;
}

function isDebilitated(body: AspectBodySnapshot): boolean {
  const exaltation = (EXALTATION_LONGITUDE as Partial<Record<TransitAspectBody, number>>)[body.body];
  if (exaltation === undefined) {
    return false; // Uranus/Neptune/Pluto: no classical exaltation/debilitation degree exists.
  }
  const debilitationLongitude = (exaltation + 180) % 360;
  return Math.floor(degnorm(body.longitude) / 30) === Math.floor(debilitationLongitude / 30);
}

// §2 - Moon is malefic within 72° of the Sun; Mercury is malefic when paired
// with a malefic in the SAME aspect being evaluated. Every other body's
// nature is fixed.
function isNaturalBenefic(subject: AspectBodySnapshot, other: AspectBodySnapshot, sunLongitude: number): boolean {
  if (subject.body === 'Moon') {
    return circularDistance(subject.longitude, sunLongitude) > 72;
  }
  if (subject.body === 'Mercury') {
    return !NATURAL_MALEFICS.has(other.body);
  }
  return NATURAL_BENEFICS.has(subject.body);
}

// §4.1 - 2/12 (and the 20 minor angles that resolve the same way): dispositors
// in the same group -> benefic, different groups -> malefic.
function resolveDispositorPair(a: AspectBodySnapshot, b: AspectBodySnapshot): Sign {
  return dispositorGroup(signOf(a.longitude)) === dispositorGroup(signOf(b.longitude)) ? '+' : '-';
}

// §4.3 - 3/11 (60°/300°) and Trikadasha (72°/288°, sharing this resolver -
// its stated default (+) matches 3/11's pattern, not Kendra's): always +,
// except Saturn's own 3rd aspect (-) / 11th aspect (+).
function resolve3Or11(a: AspectBodySnapshot, b: AspectBodySnapshot): Sign {
  if (a.body === 'Saturn' || b.body === 'Saturn') {
    const [saturn, other] = a.body === 'Saturn' ? [a, b] : [b, a];
    const forwardOffset = degnorm(other.longitude - saturn.longitude);
    if (circularDistance(forwardOffset, 60) < 5) {
      return '-'; // Saturn's 3rd aspect
    }
    if (circularDistance(forwardOffset, 300) < 5) {
      return '+'; // Saturn's 11th aspect
    }
  }
  return '+';
}

// §4.4 - Kendra (90°/270°): flat default of -, except Sun-Jupiter (+) and the
// Mars/Saturn directional pair (Mars's 4th aspect on Saturn: +; the reverse,
// Saturn's 10th aspect on Mars: -).
function resolveKendra(a: AspectBodySnapshot, b: AspectBodySnapshot): Sign {
  const bodies = new Set([a.body, b.body]);
  if (bodies.has('Sun') && bodies.has('Jupiter')) {
    return '+';
  }
  if (bodies.has('Mars') && bodies.has('Saturn')) {
    const [mars, saturn] = a.body === 'Mars' ? [a, b] : [b, a];
    const forwardOffset = degnorm(saturn.longitude - mars.longitude);
    if (circularDistance(forwardOffset, 90) < 5) {
      return '+'; // Mars's 4th aspect on Saturn
    }
    if (circularDistance(forwardOffset, 270) < 5) {
      return '-'; // Saturn's 10th aspect on Mars (reverse)
    }
  }
  return '-';
}

// §4.1 - 6/8 (150°/210°): shubh 6/8 (same dispositor group) AND good navamsha
// (navamsha trikon) -> +, else -.
function resolve68(a: AspectBodySnapshot, b: AspectBodySnapshot): Sign {
  const shubh68 = dispositorGroup(signOf(a.longitude)) === dispositorGroup(signOf(b.longitude));
  const goodNavamsha = isNavamshaTrikon(calculateD9Rasi(a.longitude), calculateD9Rasi(b.longitude));
  return shubh68 && goodNavamsha ? '+' : '-';
}

// 135°/225° ("6/8 or trine"): trine (navamsha trikon) or shubh 6/8 (same
// dispositor group) -> +, else (ashubh 6/8) -.
function resolveTrineOr68(a: AspectBodySnapshot, b: AspectBodySnapshot): Sign {
  const navamshaTrikon = isNavamshaTrikon(calculateD9Rasi(a.longitude), calculateD9Rasi(b.longitude));
  const shubh68 = dispositorGroup(signOf(a.longitude)) === dispositorGroup(signOf(b.longitude));
  return navamshaTrikon || shubh68 ? '+' : '-';
}

// §6 - drashya/drashta (180° only): the planet in houses 7-12 (from a fixed
// Makar lagna) is the drashta (aspecting, winner); its own benefic/malefic
// nature decides the result.
function resolveDrashyaDrashta(a: AspectBodySnapshot, b: AspectBodySnapshot, sunLongitude: number): Sign {
  const houseA = houseFromMakarLagna(signOf(a.longitude));
  const [drashta, other] = houseA >= 7 ? [a, b] : [b, a];
  return isNaturalBenefic(drashta, other, sunLongitude) ? '+' : '-';
}

// §4.2 + §5 - conjunction (360°/0°): both benefic -> +, both malefic -> -.
// Mixed pairs use jay/parajay (§5): the planet further north (higher ecliptic
// latitude) wins, and the result takes the winner's own benefic/malefic
// character (no sector mapping exists in the notes to do otherwise).
function resolveConjunction(
  a: AspectBodySnapshot,
  b: AspectBodySnapshot,
  sunLongitude: number,
): { result: Sign; winner: AspectBodySnapshot | null } {
  const benefit = { a: isNaturalBenefic(a, b, sunLongitude), b: isNaturalBenefic(b, a, sunLongitude) };
  if (benefit.a && benefit.b) {
    return { result: '+', winner: null };
  }
  if (!benefit.a && !benefit.b) {
    return { result: '-', winner: null };
  }
  const winner = a.eclipticLatitude >= b.eclipticLatitude ? a : b;
  const winnerIsBenefic = winner === a ? benefit.a : benefit.b;
  return { result: winnerIsBenefic ? '+' : '-', winner };
}

// Dispatches each of the 40 detected angles to its resolver. The
// dispositor/group mixed-pair fallback the notes call for in §4.2 has no live
// call site here - every one of these 40 angles resolves via a more specific
// dedicated rule (§4.1/§4.3/§4.4/§4.5/§5/§6), so it's not written as dead
// code.
function resolveBase(
  angle: number,
  a: AspectBodySnapshot,
  b: AspectBodySnapshot,
  sunLongitude: number,
): { result: Sign; winner: AspectBodySnapshot | null } | null {
  switch (angle) {
    case 30:
    case 330:
    case 36:
    case 324:
    case 40:
    case 320:
    case 24:
    case 336:
    case 18:
    case 342:
    case 12:
    case 348:
    case 9:
    case 351:
    case 6:
    case 354:
    case 20:
    case 340:
    case 15:
    case 345:
      return { result: resolveDispositorPair(a, b), winner: null };
    case 45:
    case 315:
    case 22.5:
    case 337.5:
      return { result: '-', winner: null };
    case 60:
    case 300:
    case 72:
    case 288:
      return { result: resolve3Or11(a, b), winner: null };
    case 90:
    case 270:
      return { result: resolveKendra(a, b), winner: null };
    case 120:
    case 240:
      return { result: '+', winner: null };
    case 135:
    case 225:
      return { result: resolveTrineOr68(a, b), winner: null };
    case 150:
    case 210:
    case 144: // Sadashtak (6/8) - same rule as 150°, per the user's own linkage
    case 216:
      return { result: resolve68(a, b), winner: null };
    case 180:
      return { result: resolveDrashyaDrashta(a, b, sunLongitude), winner: null };
    case 360:
      return resolveConjunction(a, b, sunLongitude);
    default:
      return null;
  }
}

// §4.6 - combust/retro/debilitated on either planet overrides the base
// result: same-group pair (by the planets' own §2 group, not their
// dispositor's) -> always +, different-group pair -> always -.
function applyModifiers(base: Sign, a: AspectBodySnapshot, b: AspectBodySnapshot): { result: Sign; applied: boolean } {
  const applied =
    a.isCombust || a.isRetrograde || isDebilitated(a) || b.isCombust || b.isRetrograde || isDebilitated(b);
  if (!applied) {
    return { result: base, applied };
  }
  return { result: ownGroup(a.body) === ownGroup(b.body) ? '+' : '-', applied };
}

export function computeResult(
  angle: number,
  a: AspectBodySnapshot,
  b: AspectBodySnapshot,
  sunLongitude: number,
): string {
  const base = resolveBase(angle, a, b, sunLongitude);
  if (base === null) {
    return '—';
  }

  const { result: finalResult, applied: modifierApplied } = applyModifiers(base.result, a, b);
  const label = finalResult === '+' ? 'Bullish' : 'Bearish';

  return base.winner && !modifierApplied ? `${label} (${base.winner.body})` : label;
}

// §7 - the effect window around the exact aspect instant, one ardh bhag
// (§3's per-angle "Time" minutes) wide, on whichever side the decisive
// planet's declination trend points: rising -> effect comes after (window =
// [exact, exact + ardh bhag], matching the notes' "north and increasing"
// example); falling -> effect comes before (window = [exact - ardh bhag,
// exact], matching "south and decreasing"). The notes only worked out those
// two hemisphere+trend combinations, but the trend alone - not the
// hemisphere - is what points the window forward or back, so the other two
// combinations (north+decreasing, south+increasing) follow the same rule
// rather than falling back to no shift. ARDH_BHAG_MINUTES_BY_ANGLE covers
// every angle in TRANSIT_ASPECT_ANGLES, so the zero-width fallback below is
// only a defensive guard, not an expected case.
export function computeResultTimeRange(
  angle: number,
  eventDate: Date,
  a: AspectBodySnapshot,
  b: AspectBodySnapshot,
): { start: Date; end: Date } {
  const shiftMinutes = ARDH_BHAG_MINUTES_BY_ANGLE[angle];
  if (shiftMinutes === undefined) {
    return { start: eventDate, end: eventDate };
  }

  const decisive = a.declination >= b.declination ? a : b;
  const shiftMs = shiftMinutes * 60000;
  if (decisive.isDeclinationIncreasing) {
    return { start: eventDate, end: new Date(eventDate.getTime() + shiftMs) };
  }
  return { start: new Date(eventDate.getTime() - shiftMs), end: eventDate };
}
