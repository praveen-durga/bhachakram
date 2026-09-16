import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { BirthChartService, EphemerisService } from '../../shared/services';
import { CardComponent } from '../../shared/ui';
import {
  calculateNakshatra,
  calculatePada,
  formatDegreeInRasi,
  getRasiDistances,
  NAKSHATRA_NAMES,
  RASI_NAMES,
  wallTimeToUtc,
} from '../../shared/utils';
import { WEEKDAY_LORD, WEEKDAY_NAMES, YOGA_NAMES } from './panchang.data';
import {
  calculateAvayogiPoint,
  calculateHora,
  calculateKarnam,
  calculateMudakku,
  calculateNakshatraResult,
  calculateSantanTithi,
  calculateThithi,
  calculateTithiBeeja,
  calculateTithiSphuta,
  calculateVainashika,
  calculateYoga,
  calculateYogiPoint,
  getHoraLord,
  getKarnamName,
  getMandiInstant,
  getNakshatraLord,
  getPakshaTithi,
  getPlanetsInNakshatra,
  isSantanTithiDifficult,
} from './panchang.util';
import { MandiResult } from './panchang.model';

type MandiView = MandiResult & { nakshatraName: string; rasiName: string; degreeInRasi: string };

@Component({
  selector: 'app-panchang',
  imports: [CardComponent, DecimalPipe],
  templateUrl: './panchang.component.html',
  styleUrl: './panchang.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanchangComponent {
  private birthChart = inject(BirthChartService);
  private ephemeris = inject(EphemerisService);

  #mandi = signal<MandiView | null>(null);

  private birthTime = computed(() => {
    const details = this.birthChart.birthDetails();
    return details ? wallTimeToUtc(details.dob, details.tob, details.timezone) : null;
  });

  protected tithiSphuta = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) {
      return null;
    }

    const result = calculateTithiSphuta(d1Chart);
    return {
      ...result,
      rasiName: RASI_NAMES[result.rasi],
      nakshatraName: NAKSHATRA_NAMES[result.nakshatra],
      degreeInRasi: formatDegreeInRasi(result.longitude),
    };
  });

  protected santanTithi = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) {
      return null;
    }

    const result = calculateSantanTithi(d1Chart);
    const { paksha, tithiName } = getPakshaTithi(result.tithiNumber);
    return { ...result, paksha, tithiName, isDifficult: isSantanTithiDifficult(result.tithiNumber) };
  });

  protected tithiBeeja = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) {
      return null;
    }

    const result = calculateTithiBeeja(d1Chart);
    return {
      ...result,
      grahaDevataRasiName: RASI_NAMES[result.grahaDevataRasi],
      unresolvedDesireRasiName: RASI_NAMES[result.unresolvedDesireRasi],
      fulfillmentPathRasiName: RASI_NAMES[result.fulfillmentPathRasi],
    };
  });

  protected vainashikaLagna = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    const ascendantLongitude = d1Chart?.ascendantLongitude;
    if (!d1Chart || ascendantLongitude === undefined) {
      return null;
    }

    const result = calculateVainashika(calculateNakshatra(ascendantLongitude), calculatePada(ascendantLongitude));
    const lord = getNakshatraLord(result.nakshatra);
    return {
      ...result,
      nakshatraName: NAKSHATRA_NAMES[result.nakshatra],
      lord,
      planets: getPlanetsInNakshatra(d1Chart, result.nakshatra),
    };
  });

  protected vainashikaMoon = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    const moon = d1Chart?.grahas.find((g) => g.graha === 'Moon');
    if (!d1Chart || !moon) {
      return null;
    }

    const result = calculateVainashika(calculateNakshatra(moon.longitude), calculatePada(moon.longitude));
    const lord = getNakshatraLord(result.nakshatra);
    return {
      ...result,
      nakshatraName: NAKSHATRA_NAMES[result.nakshatra],
      lord,
      planets: getPlanetsInNakshatra(d1Chart, result.nakshatra),
    };
  });

  protected mudakku = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) {
      return null;
    }

    const result = calculateMudakku(d1Chart);
    return {
      ...result,
      rasiName: RASI_NAMES[result.rasi],
      nakshatraName: NAKSHATRA_NAMES[result.nakshatra],
      lord: getNakshatraLord(result.nakshatra),
      planets: getPlanetsInNakshatra(d1Chart, result.nakshatra),
    };
  });

  protected thithi = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) {
      return null;
    }

    return calculateThithi(d1Chart);
  });

  protected nakshatraResult = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) {
      return null;
    }

    const result = calculateNakshatraResult(d1Chart);
    return { ...result, nakshatraName: NAKSHATRA_NAMES[result.nakshatra], lord: getNakshatraLord(result.nakshatra) };
  });

  protected yoga = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) {
      return null;
    }

    const result = calculateYoga(d1Chart);
    return { ...result, yogaName: YOGA_NAMES[result.yoga] };
  });

  protected karnam = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) {
      return null;
    }

    const result = calculateKarnam(d1Chart);
    return { ...result, karnamName: getKarnamName(result.karnam) };
  });

  protected vedicDayLord = computed(() => {
    const dob = this.birthChart.birthDetails()?.dob;
    if (!dob) {
      return null;
    }

    const [year, month, day] = dob.split('-').map(Number);
    const weekday = new Date(year, month - 1, day).getDay();
    return { weekday, weekdayName: WEEKDAY_NAMES[weekday], lord: WEEKDAY_LORD[weekday] };
  });

  protected yogi = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) {
      return null;
    }

    const result = calculateYogiPoint(d1Chart);
    return {
      ...result,
      rasiName: RASI_NAMES[result.rasi],
      nakshatraName: NAKSHATRA_NAMES[result.nakshatra],
      degreeInRasi: formatDegreeInRasi(result.longitude),
      lord: getNakshatraLord(result.nakshatra),
      planetsInStar: getPlanetsInNakshatra(d1Chart, result.nakshatra),
    };
  });

  protected avaYogi = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) {
      return null;
    }

    const result = calculateAvayogiPoint(d1Chart);
    return {
      ...result,
      rasiName: RASI_NAMES[result.rasi],
      nakshatraName: NAKSHATRA_NAMES[result.nakshatra],
      degreeInRasi: formatDegreeInRasi(result.longitude),
      lord: getNakshatraLord(result.nakshatra),
      planetsInStar: getPlanetsInNakshatra(d1Chart, result.nakshatra),
    };
  });

  protected hora = computed(() => {
    const birthTime = this.birthTime();
    const sunTimes = this.birthChart.sunTimes();
    const weekday = this.vedicDayLord()?.weekday;
    if (!birthTime || !sunTimes || weekday === undefined) {
      return null;
    }

    const timezone = this.birthChart.birthDetails()?.timezone;
    const result = calculateHora(birthTime, sunTimes, weekday);
    return {
      ...result,
      lord: getHoraLord(weekday, result.horaIndex),
      sunriseLocal: this.formatLocalTime(sunTimes.sunrise, timezone),
      sunsetLocal: this.formatLocalTime(sunTimes.sunset, timezone),
    };
  });

  private formatLocalTime(date: Date, timezone: string | undefined): string {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hourCycle: 'h23',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  protected mandi = this.#mandi.asReadonly();

  constructor() {
    effect(() => {
      const d1Chart = this.birthChart.d1Chart();
      const birthTime = this.birthTime();
      const sunTimes = this.birthChart.sunTimes();
      const details = this.birthChart.birthDetails();
      const weekday = this.vedicDayLord()?.weekday;

      if (!d1Chart || !birthTime || !sunTimes || !details || weekday === undefined) {
        this.#mandi.set(null);
        return;
      }

      const mandiInstant = getMandiInstant(birthTime, sunTimes, weekday);
      this.ephemeris.calculateAscendant(mandiInstant, details.lat, details.lng, details.ayanamsa).then((longitude) => {
        const rasi = Math.floor(longitude / 30);
        const nakshatra = calculateNakshatra(longitude);
        this.#mandi.set({
          longitude,
          rasi,
          nakshatra,
          pada: calculatePada(longitude),
          house: getRasiDistances(d1Chart.ascendantRasi, rasi).forward,
          nakshatraName: NAKSHATRA_NAMES[nakshatra],
          rasiName: RASI_NAMES[rasi],
          degreeInRasi: formatDegreeInRasi(longitude),
        });
      });
    });
  }
}
