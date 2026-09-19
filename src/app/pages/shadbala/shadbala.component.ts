import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import {
  BirthChartService,
  D1Chart,
  EphemerisService,
  Graha,
  GrahaEphemerisData,
  SunTimes,
} from '../../shared/services';
import {
  calculateD9Rasi,
  findGraha,
  formatDegreeInRasi,
  getRasiDistances,
  RASI_LORD,
  wallTimeToUtc,
} from '../../shared/utils';
import {
  CHESTA_BALA_MINIMUM,
  DIG_BALA_DIRECTION,
  DIG_BALA_MINIMUM,
  DIG_BALA_WEAKEST_HOUSE,
  DISC_DIAMETER_ARCSEC,
  EXALTATION_LONGITUDE,
  GRAHA_NATURE,
  KAALA_BALA_MINIMUM,
  NAISARGIKA_BALA,
  SHADBALA_GRAHA_ORDER,
  SHADBALA_MINIMUM_REQUIREMENT,
  STHANA_BALA_MINIMUM,
  STHANA_BALA_STRENGTH_SIGNIFICANCE,
  YUDDHA_GRAHAS,
} from './shadbala.data';
import {
  BhavaBalaColumn,
  ChestaBalaStrengthRow,
  DigBalaStrengthRow,
  FinalAssessmentRow,
  KaalaBala,
  KaalaBalaStrengthRow,
  ShadbalaRow,
  SthanaBala,
  SthanaBalaStrengthRow,
} from './shadbala.model';
import {
  areGrahasAtWar,
  calculateAyanaBala,
  calculateBenefics,
  calculateBhavaDigBala,
  calculateBhavaDrishtiBala,
  calculateChestaBalaSeeghraKendra,
  calculateClosenessToNoon,
  calculateDigBala,
  calculateDrekkanaBala,
  calculateDrigBala,
  calculateHoraBala,
  calculateIshtaPhala,
  calculateIsMoonWaxing,
  calculateKashtaPhala,
  calculateKendradiBala,
  calculateMaasaBala,
  calculateMoonChestaBalaForPhala,
  calculateNataUnnataBala,
  calculateOjhayugmaBala,
  calculatePakshaBala,
  calculateSaptavargajaBala,
  calculateSunChestaBalaForPhala,
  calculateTribhagaBala,
  calculateUcchaBala,
  calculateVaaraBala,
  calculateVarshaBala,
  calculateYuddhaBalaMagnitude,
  determineYuddhaVictor,
  isBhavaDrishtiBenefic,
} from './shadbala.util';

type BaseGrahaBala = {
  graha: Graha;
  sthanaBala: SthanaBala;
  digBala: number;
  kaalaBala: KaalaBala;
  chestaBala: number;
  drigBala: number;
  // Combined strength up through Hora Bala (Sthana + Dig + Nata-Unnata +
  // Paksha + Tribhaga + Hora Bala — excluding Varsha/Maasa/Vaara, Ayana, and
  // Yuddha themselves) — Yuddha Bala's magnitude formula needs this before
  // Kaala Bala's own total is finalized.
  strengthUpToHora: number;
};

@Component({
  selector: 'app-shadbala',
  imports: [DecimalPipe],
  templateUrl: './shadbala.component.html',
  styleUrl: './shadbala.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShadbalaComponent {
  private birthChart = inject(BirthChartService);
  private ephemeris = inject(EphemerisService);

  #rows = signal<ShadbalaRow[] | null>(null);
  #bhavaBala = signal<BhavaBalaColumn[] | null>(null);

  protected rows = this.#rows.asReadonly();
  protected bhavaBala = this.#bhavaBala.asReadonly();

  protected sthanaBalaStrength = computed<SthanaBalaStrengthRow[] | null>(() => {
    const rows = this.rows();
    return rows ? buildSthanaBalaStrengthRows(rows) : null;
  });

  protected kaalaBalaStrength = computed<KaalaBalaStrengthRow[] | null>(() => {
    const rows = this.rows();
    return rows ? buildKaalaBalaStrengthRows(rows) : null;
  });

  protected digBalaStrength = computed<DigBalaStrengthRow[] | null>(() => {
    const rows = this.rows();
    return rows ? buildDigBalaStrengthRows(rows) : null;
  });

  protected chestaBalaStrength = computed<ChestaBalaStrengthRow[] | null>(() => {
    const rows = this.rows();
    return rows ? buildChestaBalaStrengthRows(rows) : null;
  });

  protected finalAssessment = computed<FinalAssessmentRow[] | null>(() => {
    const rows = this.rows();
    return rows ? buildFinalAssessmentRows(rows) : null;
  });

  constructor() {
    effect(() => {
      const d1Chart = this.birthChart.d1Chart();
      const bhavaChalitChart = this.birthChart.bhavaChalitChart();
      const sunTimes = this.birthChart.sunTimes();
      const details = this.birthChart.birthDetails();

      if (!d1Chart || !bhavaChalitChart?.cusps || !sunTimes || !details) {
        this.#rows.set(null);
        this.#bhavaBala.set(null);
        return;
      }

      const birthTime = wallTimeToUtc(details.dob, details.tob, details.timezone);
      const weekday = new Date(details.dob).getUTCDay();

      Promise.all([
        this.ephemeris.calculateGrahaEphemerisData(birthTime, details.ayanamsa),
        this.ephemeris.calculatePlacidusCusps(birthTime, details.lat, details.lng, details.ayanamsa),
      ]).then(([{ grahas: ephemerisData, obliquity, ayanamsaDeg }, placidusCusps]) => {
        const rows = buildShadbalaRows(
          d1Chart,
          placidusCusps,
          sunTimes,
          birthTime,
          weekday,
          ephemerisData,
          obliquity,
          ayanamsaDeg,
          details.lng,
        );
        this.#rows.set(rows);
        this.#bhavaBala.set(buildBhavaBalaColumns(d1Chart, bhavaChalitChart.cusps!, rows));
      });
    });
  }
}

function buildBaseGrahaBala(
  graha: Graha,
  d1Chart: D1Chart,
  placidusCusps: number[],
  sunTimes: SunTimes,
  birthTime: Date,
  weekday: number,
  ephemerisData: Record<Graha, GrahaEphemerisData>,
  obliquity: number,
  closenessToNoon: number,
  isMoonWaxing: boolean,
  geoLongitudeDeg: number,
): BaseGrahaBala {
  const position = findGraha(d1Chart.grahas, graha);
  const houseFromAscendant = getRasiDistances(d1Chart.ascendantRasi, position.rasi).forward;
  const d9Rasi = calculateD9Rasi(position.longitude);

  const sthanaBala: SthanaBala = {
    ucchaBala: calculateUcchaBala(graha, position.longitude, EXALTATION_LONGITUDE[graha]),
    saptavargajaBala: calculateSaptavargajaBala(graha, position.longitude, d1Chart.grahas),
    ojhayugmaBala: calculateOjhayugmaBala(graha, position.rasi, d9Rasi),
    kendradiBala: calculateKendradiBala(houseFromAscendant),
    drekkanaBala: calculateDrekkanaBala(graha, position.longitude),
    total: 0,
  };
  sthanaBala.total =
    sthanaBala.ucchaBala +
    sthanaBala.saptavargajaBala +
    sthanaBala.ojhayugmaBala +
    sthanaBala.kendradiBala +
    sthanaBala.drekkanaBala;

  const weakestHouseCuspLongitude = placidusCusps[DIG_BALA_WEAKEST_HOUSE[graha] - 1];
  const digBala = calculateDigBala(position.longitude, weakestHouseCuspLongitude);

  const sun = findGraha(d1Chart.grahas, 'Sun');
  const moon = findGraha(d1Chart.grahas, 'Moon');
  const benefics = calculateBenefics(isMoonWaxing);

  const kaalaBala: KaalaBala = {
    nataUnnataBala: calculateNataUnnataBala(graha, closenessToNoon),
    pakshaBala: calculatePakshaBala(graha, sun.longitude, moon.longitude, benefics),
    tribhagaBala: calculateTribhagaBala(graha, birthTime, sunTimes),
    varshaBala: calculateVarshaBala(graha, birthTime),
    maasaBala: calculateMaasaBala(graha, birthTime),
    vaaraBala: calculateVaaraBala(graha, birthTime, sunTimes.sunrise),
    horaBala: calculateHoraBala(graha, birthTime, sunTimes, weekday),
    ayanaBala: calculateAyanaBala(graha, ephemerisData[graha].declination, obliquity),
    yuddhaBala: 0,
    total: 0,
  };

  const strengthUpToHora =
    sthanaBala.total +
    digBala +
    kaalaBala.nataUnnataBala +
    kaalaBala.pakshaBala +
    kaalaBala.tribhagaBala +
    kaalaBala.horaBala;

  // Sun/Moon placeholder - buildShadbalaRows overrides this with their own
  // Chesta Bala formula (needs sayanaSunLongitude, not available here).
  const chestaBala =
    graha === 'Sun' || graha === 'Moon'
      ? 0
      : calculateChestaBalaSeeghraKendra(graha, birthTime, geoLongitudeDeg, position.longitude, sun.longitude);

  const drigBalaSum = SHADBALA_GRAHA_ORDER.filter((other) => other !== graha).reduce((sum, other) => {
    const otherPosition = findGraha(d1Chart.grahas, other);
    // Drishti Kendra = aspected graha's longitude - aspecting graha's longitude.
    const angularDistance = (position.longitude - otherPosition.longitude + 360) % 360;
    const strength = calculateDrigBala(angularDistance, other);
    return sum + (benefics.has(other) ? strength : -strength);
  }, 0);
  const drigBala = drigBalaSum / 4;

  return { graha, sthanaBala, digBala, kaalaBala, chestaBala, drigBala, strengthUpToHora };
}

function applyYuddhaBala(
  baseByGraha: Map<Graha, BaseGrahaBala>,
  ephemerisData: Record<Graha, GrahaEphemerisData>,
): void {
  for (let i = 0; i < YUDDHA_GRAHAS.length; i++) {
    for (let j = i + 1; j < YUDDHA_GRAHAS.length; j++) {
      const grahaA = YUDDHA_GRAHAS[i];
      const grahaB = YUDDHA_GRAHAS[j];
      if (!areGrahasAtWar(ephemerisData[grahaA].longitude, ephemerisData[grahaB].longitude)) {
        continue;
      }

      const victor = determineYuddhaVictor(
        grahaA,
        ephemerisData[grahaA].longitude,
        grahaB,
        ephemerisData[grahaB].longitude,
      );
      const loser = victor === grahaA ? grahaB : grahaA;

      const magnitude = calculateYuddhaBalaMagnitude(
        baseByGraha.get(grahaA)!.strengthUpToHora,
        baseByGraha.get(grahaB)!.strengthUpToHora,
        DISC_DIAMETER_ARCSEC[grahaA] ?? 0,
        DISC_DIAMETER_ARCSEC[grahaB] ?? 0,
      );

      baseByGraha.get(victor)!.kaalaBala.yuddhaBala += magnitude;
      baseByGraha.get(loser)!.kaalaBala.yuddhaBala -= magnitude;
    }
  }
}

function buildShadbalaRows(
  d1Chart: D1Chart,
  placidusCusps: number[],
  sunTimes: SunTimes,
  birthTime: Date,
  weekday: number,
  ephemerisData: Record<Graha, GrahaEphemerisData>,
  obliquity: number,
  ayanamsaDeg: number,
  geoLongitudeDeg: number,
): ShadbalaRow[] {
  const sun = findGraha(d1Chart.grahas, 'Sun');
  const moon = findGraha(d1Chart.grahas, 'Moon');
  const moonSunElongation = (moon.longitude - sun.longitude + 360) % 360;
  const closenessToNoon = calculateClosenessToNoon(birthTime, sunTimes.sunrise, sunTimes.sunset, sunTimes.nextSunrise);
  const isMoonWaxing = calculateIsMoonWaxing(moonSunElongation);
  const sayanaSunLongitude = sun.longitude + ayanamsaDeg;

  const baseByGraha = new Map(
    SHADBALA_GRAHA_ORDER.map((graha) => [
      graha,
      buildBaseGrahaBala(
        graha,
        d1Chart,
        placidusCusps,
        sunTimes,
        birthTime,
        weekday,
        ephemerisData,
        obliquity,
        closenessToNoon,
        isMoonWaxing,
        geoLongitudeDeg,
      ),
    ]),
  );

  applyYuddhaBala(baseByGraha, ephemerisData);

  const rows = SHADBALA_GRAHA_ORDER.map((graha) => {
    const { sthanaBala, digBala, kaalaBala, chestaBala: baseChestaBala, drigBala } = baseByGraha.get(graha)!;
    // Sun/Moon have no Seeghra-Kendra-based Chesta Bala (they never go
    // retrograde), but classical texts still prescribe a value for them -
    // verified against a real JHora chart (Moon matches exactly, Sun within
    // ~0.1) - so the base 0 placeholder is overridden here rather than in
    // buildBaseGrahaBala, reusing the same formula as Ishta/Kashta Phala.
    const chestaBala =
      graha === 'Sun'
        ? calculateSunChestaBalaForPhala(sayanaSunLongitude)
        : graha === 'Moon'
          ? calculateMoonChestaBalaForPhala(sun.longitude, moon.longitude)
          : baseChestaBala;

    kaalaBala.total =
      kaalaBala.nataUnnataBala +
      kaalaBala.pakshaBala +
      kaalaBala.tribhagaBala +
      kaalaBala.varshaBala +
      kaalaBala.maasaBala +
      kaalaBala.vaaraBala +
      kaalaBala.horaBala +
      kaalaBala.ayanaBala +
      kaalaBala.yuddhaBala;

    const naisargikaBala = NAISARGIKA_BALA[graha];
    const totalShadbala = sthanaBala.total + digBala + kaalaBala.total + chestaBala + naisargikaBala + drigBala;
    const shadbalaInRupas = totalShadbala / 60;
    const minimumRequirement = SHADBALA_MINIMUM_REQUIREMENT[graha];

    return {
      graha,
      sthanaBala,
      digBala,
      kaalaBala,
      chestaBala,
      naisargikaBala,
      drigBala,
      totalShadbala,
      shadbalaInRupas,
      minimumRequirement,
      percentOfRequired: (shadbalaInRupas / minimumRequirement) * 100,
      relativeRank: 0,
      ishtaPhala: calculateIshtaPhala(sthanaBala.ucchaBala, chestaBala),
      kashtaPhala: calculateKashtaPhala(sthanaBala.ucchaBala, chestaBala),
    };
  });

  const rankByGraha = new Map(
    [...rows].sort((a, b) => b.percentOfRequired - a.percentOfRequired).map((row, index) => [row.graha, index + 1]),
  );

  return rows.map((row) => ({ ...row, relativeRank: rankByGraha.get(row.graha)! }));
}

function buildBhavaBalaColumns(d1Chart: D1Chart, cusps: number[], rows: ShadbalaRow[]): BhavaBalaColumn[] {
  const rowByGraha = new Map(rows.map((row) => [row.graha, row]));

  return cusps.map((cuspLongitude, index) => {
    const house = index + 1;
    const rasi = Math.floor(cuspLongitude / 30);
    const houseLord = RASI_LORD[rasi];
    const fromLordBala = rowByGraha.get(houseLord)?.totalShadbala ?? 0;

    const digBala = calculateBhavaDigBala(cuspLongitude, house);

    const drishtiBala = calculateBhavaDrishtiBala(
      d1Chart.grahas.map((graha) => ({
        graha: graha.graha,
        grahaRasi: graha.rasi,
        grahaHouse: getRasiDistances(d1Chart.ascendantRasi, graha.rasi).forward,
        targetRasi: rasi,
        targetHouse: house,
        // Drishti Kendra = aspected cusp's longitude - aspecting graha's longitude.
        angularDistanceToCuspDeg: (cuspLongitude - graha.longitude + 360) % 360,
      })),
    );

    const total = fromLordBala + digBala + drishtiBala;

    return {
      house,
      rasi,
      degreeInRasi: formatDegreeInRasi(cuspLongitude),
      fromLordBala,
      digBala,
      drishtiBala,
      total,
    };
  });
}

// Sthana Bala - Positional Strength, per the user's own table: Sthana Bala
// and Drig Bala (both already computed in the main Shadbala table) are
// added together and measured against Sthana Bala's own per-planet minimum,
// then ranked descending by that ratio. Significance text is keyed by rank
// (1st/2nd/3rd strongest), not by which planet lands there.
function buildSthanaBalaStrengthRows(rows: ShadbalaRow[]): SthanaBalaStrengthRow[] {
  const withStrength = rows.map((row) => {
    const sthanaBala = row.sthanaBala.total;
    const computedSthanaBala = sthanaBala + row.drigBala;
    const minimum = STHANA_BALA_MINIMUM[row.graha];

    return {
      graha: row.graha,
      sthanaBala,
      drigBala: row.drigBala,
      computedSthanaBala,
      minimum,
      strength: computedSthanaBala / minimum,
    };
  });

  return [...withStrength]
    .sort((a, b) => b.strength - a.strength)
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      isBelowMinimum: row.strength < 1,
      significance: STHANA_BALA_STRENGTH_SIGNIFICANCE[index] ?? '',
    }));
}

// Kaala Bala - Time Strength, same pattern as Sthana Bala above (Kaala Bala
// + Drig Bala, measured against Kaala Bala's own per-planet minimum), with a
// fixed benefic/malefic Nature label per planet instead of significance text.
function buildKaalaBalaStrengthRows(rows: ShadbalaRow[]): KaalaBalaStrengthRow[] {
  const withStrength = rows.map((row) => {
    const kaalaBala = row.kaalaBala.total;
    const computedKaalaBala = kaalaBala + row.drigBala;
    const minimum = KAALA_BALA_MINIMUM[row.graha];

    return {
      graha: row.graha,
      kaalaBala,
      drigBala: row.drigBala,
      computedKaalaBala,
      minimum,
      strength: computedKaalaBala / minimum,
      nature: GRAHA_NATURE[row.graha],
    };
  });

  return [...withStrength]
    .sort((a, b) => b.strength - a.strength)
    .map((row, index) => ({ ...row, rank: index + 1, isBelowMinimum: row.strength < 1 }));
}

// Dig Bala - Directional Strength, per the user's own table: unlike Sthana/
// Kaala Bala, this does NOT add Drig Bala - Secured Dig Bala is the main
// table's Dig Bala value as-is, ranked by Secured/Minimum.
function buildDigBalaStrengthRows(rows: ShadbalaRow[]): DigBalaStrengthRow[] {
  const withRatio = rows.map((row) => {
    const minimum = DIG_BALA_MINIMUM[row.graha];

    return {
      graha: row.graha,
      direction: DIG_BALA_DIRECTION[row.graha],
      securedDigBala: row.digBala,
      minimum,
      ratio: row.digBala / minimum,
    };
  });

  return [...withRatio]
    .sort((a, b) => b.ratio - a.ratio)
    .map((row, index) => ({ ...row, rank: index + 1, isBelowMinimum: row.ratio < 1 }));
}

// Chesta Bala - Motional Strength, per the user's own table: Secured Chesta
// Bala is the main table's Chesta Bala value as-is (no Drig Bala added).
// CHESTA_BALA_MINIMUM is on a different scale than raw Chesta Bala (max 60),
// so the Ratio rescales by *60 to compensate - verified against the user's
// own worked example (e.g. Saturn 57.5 * 60 / 67 = 51.49).
function buildChestaBalaStrengthRows(rows: ShadbalaRow[]): ChestaBalaStrengthRow[] {
  const withRatio = rows.map((row) => {
    const minimum = CHESTA_BALA_MINIMUM[row.graha];

    return {
      graha: row.graha,
      securedChestaBala: row.chestaBala,
      minimum,
      ratio: (row.chestaBala * 60) / minimum,
    };
  });

  return [...withRatio]
    .sort((a, b) => b.ratio - a.ratio)
    .map((row, index) => ({ ...row, rank: index + 1, isBelowMinimum: row.ratio < 1 }));
}

// Final Assessment - each Bala type's raw per-planet values (not the
// Drig-Bala-augmented "Computed"/"Secured" versions above) summed across all
// 7 planets, measured against that Bala type's own summed minimum. Naisargika
// Bala is a universal constant, so its own total doubles as its own minimum
// (ratio always 1.000).
function buildFinalAssessmentRows(rows: ShadbalaRow[]): FinalAssessmentRow[] {
  const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
  const minimumSum = (minimums: Record<Graha, number>) => sum(rows.map((row) => minimums[row.graha]));
  const naisargikaBalaTotal = sum(rows.map((row) => row.naisargikaBala));

  const balas = [
    {
      bala: 'Kala Bala',
      totalBala: sum(rows.map((row) => row.kaalaBala.total)),
      minimumBala: minimumSum(KAALA_BALA_MINIMUM),
    },
    {
      bala: 'Sthana Bala',
      totalBala: sum(rows.map((row) => row.sthanaBala.total)),
      minimumBala: minimumSum(STHANA_BALA_MINIMUM),
    },
    { bala: 'Naisargika Bala', totalBala: naisargikaBalaTotal, minimumBala: naisargikaBalaTotal },
    { bala: 'Dig Bala', totalBala: sum(rows.map((row) => row.digBala)), minimumBala: minimumSum(DIG_BALA_MINIMUM) },
    {
      bala: 'Chesta Bala',
      totalBala: sum(rows.map((row) => row.chestaBala)),
      minimumBala: minimumSum(CHESTA_BALA_MINIMUM),
    },
  ];

  return balas
    .map((row) => ({ ...row, ratio: row.totalBala / row.minimumBala }))
    .sort((a, b) => b.ratio - a.ratio)
    .map((row, index) => ({ ...row, rank: index + 1, isBelowMinimum: row.ratio < 1 }));
}
