// Rasi-mapping (which sign a division falls into) for the divisional/varga
// charts used by the Vargas route, plus D3/D7/D12/D30 (relocated here from
// shadbala.util.ts since the Vargas route needs the exact same functions
// Shadbala's Saptavargaja Bala already used — avoiding a second copy).
//
// D3/D4/D7/D9(in ephemeris.util.ts)/D10/D12/D16/D24/D30/D45/D60 are sourced
// directly from BPHS Ch.6 ("Shodasavarga") verses 7-41 - the same primary
// source already used for the Deities route, now applied to rasi mapping
// instead of deity names.
//
// D5/D6/D8/D11/D27 are NOT part of BPHS's 16-fold Shodasavarga scheme at
// all. Their formulas below come from cross-checking 2+ independent
// secondary sources per varga (agreeing exactly, including one worked
// example for D11) rather than a primary classical text - best-effort per
// the user's explicit request, not BPHS-verified like the others.
//
// D3 Jagannatha and D3 Somanatha are alternate Drekkana (D3) schemes used
// by some software, on top of (not instead of) the standard Parashari D3
// above - also best-effort, see each function's own comment for its
// specific confidence level (Jagannatha's starting-sign rule is a quoted
// source; Somanatha's is a reconstruction from a vague description).

function toRasiAndDegree(longitude: number): { rasi: number; degreeInRasi: number } {
  return { rasi: Math.floor(longitude / 30), degreeInRasi: longitude % 30 };
}

function isOddRasi(rasi: number): boolean {
  return rasi % 2 === 0; // rasi 0 = Aries = 1st sign = odd
}

// 0 = movable (chara), 1 = fixed (sthira), 2 = dual (dwiswabhava).
function modality(rasi: number): number {
  return rasi % 3;
}

export type RasiModality = 'Movable' | 'Fixed' | 'Dual';

const MODALITY_LABELS: RasiModality[] = ['Movable', 'Fixed', 'Dual'];

export function getRasiModality(rasi: number): RasiModality {
  return MODALITY_LABELS[modality(rasi)];
}

// D3 (Drekkana), BPHS v.7-8: each 10° third of a sign maps to that sign, the
// 5th-from-it, or the 9th-from-it.
export function calculateD3Rasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const third = Math.floor(degreeInRasi / 10);
  return (rasi + third * 4) % 12;
}

// D3 Jagannatha Drekkana - not BPHS. A named alternate Drekkana used by some
// software, distinct from Parashari above. Best-effort: the starting sign is
// a directly-quoted rule ("movable sign starts from itself, fixed from the
// 9th, dual from the 5th"), confirmed to always resolve to the movable
// member of the rasi's own triplicity - verified across several
// modality/element combinations. The +4 trine step between the 3 divisions
// (same as Parashari's own stepping) is inferred by analogy, not directly
// confirmed, since no source gave the full division-by-division rule.
const TRIPLICITY_MOVABLE_SIGN = [0, 9, 6, 3]; // fire->Ar, earth->Cp, air->Li, water->Cn

export function calculateD3JagannathRasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const third = Math.floor(degreeInRasi / 10);
  const start = TRIPLICITY_MOVABLE_SIGN[rasi % 4];
  return (start + third * 4) % 12;
}

// D3 Somanatha Drekkana - not BPHS. The lowest-confidence formula in this
// file: sources describe it only as "similar to Parivritti Drekkana but
// with odd signs in normal order and even signs reversed," with no
// worked example found to verify against. Best-effort reading: odd Rasi
// steps forward to adjacent signs (rasi, rasi+1, rasi+2), even Rasi steps
// backward (rasi, rasi-1, rasi-2). Flag this one for review before relying
// on it - it's a reconstruction from a vague paraphrase, not a quoted rule.
export function calculateD3SomanathRasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const third = Math.floor(degreeInRasi / 10);
  return isOddRasi(rasi) ? (rasi + third) % 12 : (rasi - third + 12) % 12;
}

// D4 (Chaturthamsa), BPHS v.9: the 4 quarters of a sign map to its 4 kendras
// (1st/4th/7th/10th from it).
export function calculateD4Rasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const quarter = Math.floor(degreeInRasi / 7.5);
  return (rasi + quarter * 3) % 12;
}

// D5 (Panchamsa) - not in BPHS. Best-effort: a fixed, non-arithmetic
// odd/even lookup (confirmed identical across 2 independent secondary
// sources), not a formula.
const D5_ODD_RASIS = [0, 10, 8, 2, 6]; // Ar, Aq, Sg, Ge, Li
const D5_EVEN_RASIS = [1, 5, 11, 9, 7]; // Ta, Vi, Pi, Cp, Sc

export function calculateD5Rasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const part = Math.floor(degreeInRasi / 6);
  return isOddRasi(rasi) ? D5_ODD_RASIS[part] : D5_EVEN_RASIS[part];
}

// D6 (Shashthamsa) - not in BPHS. Best-effort (2 independent sources agree,
// matches a worked example): odd Rasi starts from Aries, even from Libra.
export function calculateD6Rasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const part = Math.floor(degreeInRasi / 5);
  const start = isOddRasi(rasi) ? 0 : 6;
  return (start + part) % 12;
}

// D7 (Saptamsa), BPHS v.10-11: odd Rasi starts from itself, even Rasi from
// the 7th thereof.
export function calculateD7Rasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const division = Math.floor(degreeInRasi / (30 / 7));
  const start = isOddRasi(rasi) ? rasi : (rasi + 6) % 12;
  return (start + division) % 12;
}

// D8 (Ashtamsa) - not in BPHS. Best-effort (2 independent sources agree on
// this exact, non-obvious triad - fixed uses Sagittarius and dual uses Leo,
// the reverse of D16/D45's fixed=Leo/dual=Sagittarius pattern).
export function calculateD8Rasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const division = Math.floor(degreeInRasi / 3.75);
  const mod = modality(rasi);
  const start = mod === 0 ? 0 : mod === 1 ? 8 : 4; // movable=Aries, fixed=Sagittarius, dual=Leo
  return (start + division) % 12;
}

// D10 (Dasamsa), BPHS v.13-14: odd Rasi starts from itself, even Rasi from
// the 9th thereof.
export function calculateD10Rasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const division = Math.floor(degreeInRasi / 3);
  const start = isOddRasi(rasi) ? rasi : (rasi + 8) % 12;
  return (start + division) % 12;
}

// D11 (Rudramsa/Ekadasamsa) - not in BPHS. Best-effort, but algorithmic and
// verified against a worked example: count the Rasi's position from Aries
// (zodiacally), then count that same number of signs from Aries going
// backward (anti-zodiacally) - that's the starting Rasi for the 11 parts.
// (e.g. Gemini is 3rd from Aries; 3rd from Aries counting backward is
// Aquarius - confirmed this reproduces that exact example.)
export function calculateD11Rasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const division = Math.floor(degreeInRasi / (30 / 11));
  const start = (12 - rasi) % 12;
  return (start + division) % 12;
}

// D12 (Dwadasamsa), BPHS v.15: 12 divisions of 2°30' each, starting from the
// sign itself.
export function calculateD12Rasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const division = Math.floor(degreeInRasi / 2.5);
  return (rasi + division) % 12;
}

// D16 (Shodasamsa), BPHS v.16: starting Rasi depends on modality - Aries for
// movable, Leo for fixed, Sagittarius for dual.
export function calculateD16Rasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const division = Math.floor(degreeInRasi / 1.875);
  const mod = modality(rasi);
  const start = mod === 0 ? 0 : mod === 1 ? 4 : 8;
  return (start + division) % 12;
}

// D24 (Chaturvimsamsa), BPHS v.22-23: odd Rasi starts from Leo, even Rasi
// from Cancer.
export function calculateD24Rasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const division = Math.floor(degreeInRasi / 1.25);
  const start = isOddRasi(rasi) ? 4 : 3;
  return (start + division) % 12;
}

// D27 (Saptavimsamsa/Bhamsa) - BPHS v.24-26 names this varga but its
// starting-Rasi rule reads ambiguously in translation. Best-effort instead,
// from 2 independent sources agreeing on a full element-based scheme: fire
// signs start from Aries, earthy from Cancer, airy from Libra, watery from
// Capricorn (earth/water are each other's anchor, not their own - unusual
// but consistently reported both times it was found).
const D27_ELEMENT_START = [0, 3, 6, 9]; // fire, earth, air, water

export function calculateD27Rasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const division = Math.floor(degreeInRasi / (30 / 27));
  const start = D27_ELEMENT_START[rasi % 4];
  return (start + division) % 12;
}

// D30 (Trimsamsa), BPHS v.27-28: unequal divisions ruled by
// Mars/Saturn/Jupiter/Mercury/Venus for odd signs, reversed order for even
// signs.
export function calculateD30Rasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);

  const oddBoundaries: [number, number][] = [
    [5, 0], // Mars 0-5 -> Aries
    [10, 10], // Saturn 5-10 -> Aquarius
    [18, 8], // Jupiter 10-18 -> Sagittarius
    [25, 2], // Mercury 18-25 -> Gemini
    [30, 6], // Venus 25-30 -> Libra
  ];
  const evenBoundaries: [number, number][] = [
    [5, 1], // Venus 0-5 -> Taurus
    [12, 5], // Mercury 5-12 -> Virgo
    [20, 9], // Jupiter 12-20 -> Capricorn
    [25, 10], // Saturn 20-25 -> Aquarius
    [30, 7], // Mars 25-30 -> Scorpio
  ];

  const boundaries = isOddRasi(rasi) ? oddBoundaries : evenBoundaries;
  for (const [upTo, targetRasi] of boundaries) {
    if (degreeInRasi < upTo) {
      return targetRasi;
    }
  }
  return boundaries[boundaries.length - 1][1];
}

// D45 (Akshavedamsa), BPHS v.31-32: starting Rasi depends on modality, same
// Aries/Leo/Sagittarius pattern as D16.
export function calculateD45Rasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const division = Math.floor(degreeInRasi / (2 / 3));
  const mod = modality(rasi);
  const start = mod === 0 ? 0 : mod === 1 ? 4 : 8;
  return (start + division) % 12;
}

// D60 (Shashtiamsa), BPHS v.33-41: the 60 divisions cycle continuously
// forward through all 12 signs starting from the sign itself.
export function calculateD60Rasi(longitude: number): number {
  const { rasi, degreeInRasi } = toRasiAndDegree(longitude);
  const division = Math.floor(degreeInRasi / 0.5);
  return (rasi + division) % 12;
}
