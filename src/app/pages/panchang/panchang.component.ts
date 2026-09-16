import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BirthChartService } from '../../shared/services';
import { CardComponent } from '../../shared/ui';
import { calculateNakshatra, calculatePada, formatDegreeInRasi, NAKSHATRA_NAMES, RASI_NAMES } from '../../shared/utils';
import {
  calculateMudakku,
  calculateSantanTithi,
  calculateTithiBeeja,
  calculateTithiSphuta,
  calculateVainashika,
  getNakshatraLord,
  getPakshaTithi,
  getPlanetsWithSameNakshatraLord,
  isSantanTithiDifficult,
} from './panchang.util';

@Component({
  selector: 'app-panchang',
  imports: [CardComponent],
  templateUrl: './panchang.component.html',
  styleUrl: './panchang.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanchangComponent {
  private birthChart = inject(BirthChartService);

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
      planets: getPlanetsWithSameNakshatraLord(d1Chart, lord),
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
      planets: getPlanetsWithSameNakshatraLord(d1Chart, lord),
    };
  });

  protected mudakku = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) {
      return null;
    }

    const result = calculateMudakku(d1Chart);
    const lord = getNakshatraLord(result.nakshatra);
    return {
      ...result,
      rasiName: RASI_NAMES[result.rasi],
      nakshatraName: NAKSHATRA_NAMES[result.nakshatra],
      lord,
      planets: getPlanetsWithSameNakshatraLord(d1Chart, lord),
    };
  });
}
