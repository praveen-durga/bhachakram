import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AnnualChart, BirthChartService, EphemerisService } from './shared/services';
import { HeaderComponent, RasiChartComponent } from './shared/ui';
import {
  buildAnnualChart,
  calculateBirthTithiNumber,
  currentAge,
  findGraha,
  getDagdhaRasis,
  wallTimeToUtc,
} from './shared/utils';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, HeaderComponent, RasiChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected birthChart = inject(BirthChartService);
  private ephemeris = inject(EphemerisService);

  #tajikChart = signal<AnnualChart | null>(null);

  protected dagdhaRasis = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) return [];

    const sun = findGraha(d1Chart.grahas, 'Sun');
    const moon = findGraha(d1Chart.grahas, 'Moon');
    return getDagdhaRasis(calculateBirthTithiNumber(sun.longitude, moon.longitude));
  });

  protected tajikChart = this.#tajikChart.asReadonly();

  constructor() {
    effect(() => {
      const d1Chart = this.birthChart.d1Chart();
      const details = this.birthChart.birthDetails();
      if (!d1Chart || !details) {
        this.#tajikChart.set(null);
        return;
      }

      const natalSun = findGraha(d1Chart.grahas, 'Sun');
      const birthDatetime = wallTimeToUtc(details.dob, details.tob, details.timezone);
      const age = currentAge(birthDatetime, new Date());

      buildAnnualChart(
        this.ephemeris,
        natalSun.longitude,
        d1Chart.ascendantRasi,
        birthDatetime,
        age,
        details.lat,
        details.lng,
        details.ayanamsa,
      ).then((chart) => this.#tajikChart.set(chart));
    });
  }
}
