import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import {
  BirthChartService,
  D1Chart,
  EphemerisService,
  Graha,
  GrahaEphemerisData,
  SunTimes,
} from '../../shared/services';
import { calculateD9Rasi, findGraha, formatDegreeInRasi, getRasiDistances, wallTimeToUtc } from '../../shared/utils';
import {
  BHAVA_OCCUPANT_BALA,
  CHESTA_BALA_MINIMUM,
  DIG_BALA_MINIMUM,
  DISC_DIAMETER_ARCSEC,
  EXALTATION_LONGITUDE,
  KAALA_BALA_MINIMUM,
  NAISARGIKA_BALA,
  RASI_LORD,
  SHADBALA_GRAHA_ORDER,
  SHADBALA_MINIMUM_REQUIREMENT,
  STHANA_BALA_MINIMUM,
  YUDDHA_GRAHAS,
} from './shadbala.data';
import { BhavaBalaColumn, KaalaBala, ShadbalaRow, SthanaBala } from './shadbala.model';
import {
  areGrahasAtWar,
  calculateAyanaBala,
  calculateBhavaDayNightBala,
  calculateBhavaDigBala,
  calculateBhavaDrishtiBala,
  calculateChestaBalaForMoon,
  calculateChestaBalaFromSeeghraKendra,
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
  calculateNataUnnataBala,
  calculateOjhayugmaBala,
  calculatePakshaBala,
  calculateSaptavargajaBala,
  calculateTribhagaBala,
  calculateUcchaBala,
  calculateVaaraBala,
  calculateVarshaBala,
  calculateVisesheDrishtiBonus,
  calculateYuddhaBalaMagnitude,
  determineYuddhaVictor,
  isDrishtiBenefic,
} from './shadbala.util';

type BaseGrahaBala = {
  graha: Graha;
  sthanaBala: SthanaBala;
  digBala: number;
  kaalaBala: KaalaBala;
  chestaBala: number;
  drigBala: number;
  // Combined strength up through Hora Bala (Sthana + Dig + every Kaala Bala
  // sub-row except Ayana and Yuddha themselves) — Yuddha Bala's magnitude
  // formula needs this before Kaala Bala's own total is finalized.
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
      const isDayBirth = birthTime >= sunTimes.sunrise && birthTime < sunTimes.sunset;

      Promise.all([
        this.ephemeris.calculateGrahaEphemerisData(birthTime, details.ayanamsa),
        this.ephemeris.findMostRecentSankranti(birthTime, details.ayanamsa, 360),
        this.ephemeris.findMostRecentSankranti(birthTime, details.ayanamsa, 30),
      ]).then(([{ grahas: ephemerisData, obliquity }, varshaSankranti, maasaSankranti]) => {
        const sun = findGraha(d1Chart.grahas, 'Sun');
        const moon = findGraha(d1Chart.grahas, 'Moon');
        const moonSunElongation = (moon.longitude - sun.longitude + 360) % 360;
        const isMoonWaxing = calculateIsMoonWaxing(moonSunElongation);

        const rows = buildShadbalaRows(
          d1Chart,
          sunTimes,
          birthTime,
          weekday,
          ephemerisData,
          obliquity,
          varshaSankranti.getUTCDay(),
          maasaSankranti.getUTCDay(),
        );
        this.#rows.set(rows);
        this.#bhavaBala.set(buildBhavaBalaColumns(d1Chart, bhavaChalitChart.cusps!, rows, isDayBirth, isMoonWaxing));
      });
    });
  }
}

function buildBaseGrahaBala(
  graha: Graha,
  d1Chart: D1Chart,
  sunTimes: SunTimes,
  birthTime: Date,
  weekday: number,
  ephemerisData: Record<Graha, GrahaEphemerisData>,
  obliquity: number,
  varshaWeekday: number,
  maasaWeekday: number,
  moonSunElongation: number,
  closenessToNoon: number,
  isMoonWaxing: boolean,
): BaseGrahaBala {
  const position = findGraha(d1Chart.grahas, graha);
  const houseFromAscendant = getRasiDistances(d1Chart.ascendantRasi, position.rasi).forward;
  const d9Rasi = calculateD9Rasi(position.longitude);

  const sthanaBala: SthanaBala = {
    ucchaBala: calculateUcchaBala(graha, position.longitude, EXALTATION_LONGITUDE[graha]),
    saptavargajaBala: calculateSaptavargajaBala(graha, position.longitude),
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

  const digBala = calculateDigBala(graha, houseFromAscendant);

  const kaalaBala: KaalaBala = {
    nataUnnataBala: calculateNataUnnataBala(graha, closenessToNoon),
    pakshaBala: calculatePakshaBala(graha, moonSunElongation),
    tribhagaBala: calculateTribhagaBala(graha, birthTime, sunTimes),
    varshaBala: calculateVarshaBala(graha, varshaWeekday),
    maasaBala: calculateMaasaBala(graha, maasaWeekday),
    vaaraBala: calculateVaaraBala(graha, weekday),
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
    kaalaBala.varshaBala +
    kaalaBala.maasaBala +
    kaalaBala.vaaraBala +
    kaalaBala.horaBala;

  const sun = findGraha(d1Chart.grahas, 'Sun');
  const grahaSunElongation = (ephemerisData[graha].longitude - sun.longitude + 360) % 360;
  const chestaBala =
    graha === 'Moon'
      ? calculateChestaBalaForMoon(moonSunElongation)
      : calculateChestaBalaFromSeeghraKendra(grahaSunElongation);

  const drigBala = SHADBALA_GRAHA_ORDER.filter((other) => other !== graha).reduce((sum, other) => {
    const otherPosition = findGraha(d1Chart.grahas, other);
    const angularDistance = (otherPosition.longitude - position.longitude + 360) % 360;
    const houseDistance = getRasiDistances(position.rasi, otherPosition.rasi).forward;
    const strength = calculateDrigBala(angularDistance) + calculateVisesheDrishtiBonus(other, houseDistance);
    const isBenefic = isDrishtiBenefic(other, isMoonWaxing);
    return sum + (isBenefic ? strength : -strength);
  }, 0);

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
        ephemerisData[grahaA].eclipticLatitude,
        grahaB,
        ephemerisData[grahaB].eclipticLatitude,
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
  sunTimes: SunTimes,
  birthTime: Date,
  weekday: number,
  ephemerisData: Record<Graha, GrahaEphemerisData>,
  obliquity: number,
  varshaWeekday: number,
  maasaWeekday: number,
): ShadbalaRow[] {
  const sun = findGraha(d1Chart.grahas, 'Sun');
  const moon = findGraha(d1Chart.grahas, 'Moon');
  const moonSunElongation = (moon.longitude - sun.longitude + 360) % 360;
  const closenessToNoon = calculateClosenessToNoon(birthTime, sunTimes.sunrise, sunTimes.sunset, sunTimes.nextSunrise);
  const isMoonWaxing = calculateIsMoonWaxing(moonSunElongation);

  const baseByGraha = new Map(
    SHADBALA_GRAHA_ORDER.map((graha) => [
      graha,
      buildBaseGrahaBala(
        graha,
        d1Chart,
        sunTimes,
        birthTime,
        weekday,
        ephemerisData,
        obliquity,
        varshaWeekday,
        maasaWeekday,
        moonSunElongation,
        closenessToNoon,
        isMoonWaxing,
      ),
    ]),
  );

  applyYuddhaBala(baseByGraha, ephemerisData);

  const rows = SHADBALA_GRAHA_ORDER.map((graha) => {
    const { sthanaBala, digBala, kaalaBala, chestaBala, drigBala } = baseByGraha.get(graha)!;

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
      percentOfRequired: (totalShadbala / minimumRequirement) * 100,
      sthanaBalaPercentReq: (sthanaBala.total / STHANA_BALA_MINIMUM[graha]) * 100,
      digBalaPercentReq: (digBala / DIG_BALA_MINIMUM[graha]) * 100,
      kaalaBalaPercentReq: (kaalaBala.total / KAALA_BALA_MINIMUM[graha]) * 100,
      chestaBalaPercentReq: (chestaBala / CHESTA_BALA_MINIMUM[graha]) * 100,
      relativeRank: 0,
      ishtaPhala: calculateIshtaPhala(sthanaBala.ucchaBala, chestaBala),
      kashtaPhala: calculateKashtaPhala(sthanaBala.ucchaBala, chestaBala),
    };
  });

  const rankByGraha = new Map(
    [...rows].sort((a, b) => b.totalShadbala - a.totalShadbala).map((row, index) => [row.graha, index + 1]),
  );

  return rows.map((row) => ({ ...row, relativeRank: rankByGraha.get(row.graha)! }));
}

function buildBhavaBalaColumns(
  d1Chart: D1Chart,
  cusps: number[],
  rows: ShadbalaRow[],
  isDayBirth: boolean,
  isMoonWaxing: boolean,
): BhavaBalaColumn[] {
  const rowByGraha = new Map(rows.map((row) => [row.graha, row]));

  return cusps.map((cuspLongitude, index) => {
    const house = index + 1;
    const rasi = Math.floor(cuspLongitude / 30);
    const houseLord = RASI_LORD[rasi];
    const fromLordBala = rowByGraha.get(houseLord)?.totalShadbala ?? 0;

    const digBala = calculateBhavaDigBala(rasi, house);

    const drishtiBala = calculateBhavaDrishtiBala(
      d1Chart.grahas.map((graha) => ({
        graha: graha.graha,
        angularDistanceToCuspDeg: (graha.longitude - cuspLongitude + 360) % 360,
        isBenefic: isDrishtiBenefic(graha.graha, isMoonWaxing),
      })),
    );

    const planetsInBala = d1Chart.grahas
      .filter((graha) => Math.floor(graha.longitude / 30) === rasi)
      .reduce((sum, graha) => sum + (BHAVA_OCCUPANT_BALA[graha.graha] ?? 0), 0);

    const dayNightBala = calculateBhavaDayNightBala(houseLord, isDayBirth);

    const total = fromLordBala + digBala + drishtiBala + planetsInBala + dayNightBala;

    return {
      house,
      rasi,
      degreeInRasi: formatDegreeInRasi(cuspLongitude),
      fromLordBala,
      digBala,
      drishtiBala,
      planetsInBala,
      dayNightBala,
      total,
    };
  });
}
