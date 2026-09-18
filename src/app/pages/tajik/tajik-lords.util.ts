import { EGYPTIAN_TERMS, HADDA_BALA_MAX, KSHETRA_BALA_MAX, TRI_RASHI_PATI, UCHCHA_BALA_MAX } from './tajik.data';
import { EXALTATION_LONGITUDE, NATURAL_RELATION, Relation } from '../shadbala/shadbala.data';
import { AnnualChart, D1Chart, EphemerisService, Graha } from '../../shared/services';
import { calculateD3Rasi, calculateD9Rasi, findGraha, RASI_LORD } from '../../shared/utils';
import { PanchadhikariCandidate, PanchadhikariRole, PlanetBala } from './tajik.model';

// Panchadhikari candidates are always sign lords, so RASI_LORD never yields
// Rahu/Ketu here - narrowed so NATURAL_RELATION/EXALTATION_LONGITUDE (which
// exclude the nodes) can be indexed safely.
type ClassicalGraha = Exclude<Graha, 'Rahu' | 'Ketu'>;

// Panchavargiya Bala is only classically defined for the 7 non-nodal
// planets (Hadda/Moolatrikona-style dignity tables don't cover Rahu/Ketu).
const CLASSICAL_GRAHA_ORDER: ClassicalGraha[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

function angularDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

// own/friend/enemy follow a 4:2:1 point ratio in every Panchavargiya Bala
// component (per vedastro.org's Varshaphala series). Neutral isn't covered
// by the sourced 3-tier table - treated the same as friend here, a
// reasonable fill rather than a sourced value.
function dignityBala(maxPoints: number, relation: 'own' | Relation): number {
  if (relation === 'own') {
    return maxPoints;
  }
  if (relation === 'enemy' || relation === 'greatEnemy') {
    return maxPoints * 0.25;
  }
  return maxPoints * 0.5;
}

function relationToLord(graha: ClassicalGraha, lord: ClassicalGraha): 'own' | Relation {
  return graha === lord ? 'own' : (NATURAL_RELATION[graha][lord] ?? 'neutral');
}

function calculateKshetraBala(graha: ClassicalGraha, rasi: number): number {
  return dignityBala(KSHETRA_BALA_MAX, relationToLord(graha, RASI_LORD[rasi] as ClassicalGraha));
}

function calculateUcchaBala(graha: ClassicalGraha, longitude: number): number {
  const debilitationLongitude = (EXALTATION_LONGITUDE[graha] + 180) % 360;
  const distanceFromDebilitation = angularDistance(longitude, debilitationLongitude);
  return (distanceFromDebilitation / 180) * UCHCHA_BALA_MAX;
}

function calculateHaddaBala(graha: ClassicalGraha, rasi: number, degreeInSign: number): number {
  const terms = EGYPTIAN_TERMS[rasi];
  const termLord = (terms.find((term) => degreeInSign < term.to) ?? terms[terms.length - 1]).lord;
  return dignityBala(HADDA_BALA_MAX, relationToLord(graha, termLord as ClassicalGraha));
}

function calculateDrekkanaBala(graha: ClassicalGraha, longitude: number): number {
  return dignityBala(10, relationToLord(graha, RASI_LORD[calculateD3Rasi(longitude)] as ClassicalGraha));
}

function calculateNavamsaBala(graha: ClassicalGraha, longitude: number): number {
  return dignityBala(5, relationToLord(graha, RASI_LORD[calculateD9Rasi(longitude)] as ClassicalGraha));
}

// Panchavargiya Bala (5-component strength, max 80) for a planet, scored
// from its OWN position in the annual (Varshapravesh) chart.
function calculatePlanetBala(graha: ClassicalGraha, chart: D1Chart): PlanetBala {
  const position = findGraha(chart.grahas, graha);
  const degreeInSign = position.longitude % 30;

  const kshetra = calculateKshetraBala(graha, position.rasi);
  const uchcha = calculateUcchaBala(graha, position.longitude);
  const hadda = calculateHaddaBala(graha, position.rasi, degreeInSign);
  const drekkana = calculateDrekkanaBala(graha, position.longitude);
  const navamsa = calculateNavamsaBala(graha, position.longitude);

  return { graha, kshetra, uchcha, hadda, drekkana, navamsa, total: kshetra + uchcha + hadda + drekkana + navamsa };
}

// Panchavargiya Bala breakdown for all 7 classical planets, not just the 5
// Panchadhikari role-candidates (which often repeat the same lord).
export function buildAllPlanetBala(chart: D1Chart): PlanetBala[] {
  return CLASSICAL_GRAHA_ORDER.map((graha) => calculatePlanetBala(graha, chart));
}

// The 5 Panchadhikari candidates for Varsheshwar (Year Lord), per the
// classical list (Janma Lagna lord, Varsha Lagna lord, Muntha lord,
// Dina-Ratri Pati, Tri-Rashi Pati) - corroborated by 3 independent sources.
// Winner = highest Panchavargiya Bala. Simplification: classical practice
// also lets a valid Tajika aspect to the Varsha Lagna override raw strength
// - that needs its own Deeptamsa orb table which hasn't been sourced, so
// this uses pure highest-bala-wins, flagged in the UI.
export async function buildPanchadhikariCandidates(
  ephemeris: EphemerisService,
  annualChart: AnnualChart,
  natalAscendantRasi: number,
  lat: number,
  lng: number,
  timezone: string,
): Promise<PanchadhikariCandidate[]> {
  const { sunrise, sunset } = await ephemeris.calculateSunriseSunset(annualChart.instant, lat, lng, timezone);
  const isDayReturn = annualChart.instant >= sunrise && annualChart.instant < sunset;

  const sun = findGraha(annualChart.chart.grahas, 'Sun');
  const moon = findGraha(annualChart.chart.grahas, 'Moon');
  const triRashiPati = TRI_RASHI_PATI[annualChart.chart.ascendantRasi];

  const roleLords: { role: PanchadhikariRole; lord: ClassicalGraha }[] = [
    { role: 'Janma Lagna', lord: RASI_LORD[natalAscendantRasi] as ClassicalGraha },
    { role: 'Varsha Lagna', lord: RASI_LORD[annualChart.chart.ascendantRasi] as ClassicalGraha },
    { role: 'Muntha', lord: RASI_LORD[annualChart.munthaRasi] as ClassicalGraha },
    { role: 'Dina-Ratri', lord: (isDayReturn ? RASI_LORD[sun.rasi] : RASI_LORD[moon.rasi]) as ClassicalGraha },
    { role: 'Tri-Rashi', lord: (isDayReturn ? triRashiPati.day : triRashiPati.night) as ClassicalGraha },
  ];

  return roleLords.map(({ role, lord }) => ({ role, lord, bala: calculatePlanetBala(lord, annualChart.chart).total }));
}

export function selectYearLord(candidates: PanchadhikariCandidate[]): PanchadhikariCandidate {
  return candidates.reduce((best, candidate) => (candidate.bala > best.bala ? candidate : best));
}
