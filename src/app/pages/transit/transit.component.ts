import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { BirthChartService, D1Chart, EphemerisService } from '../../shared/services';
import { RasiChartComponent } from '../../shared/ui';
import { calculateD10Rasi, calculateD9Rasi } from '../../shared/utils';
import { buildTransitD1Chart, buildTransitVargaChart } from './transit.util';

@Component({
  selector: 'app-transit',
  imports: [RasiChartComponent],
  templateUrl: './transit.component.html',
  styleUrl: './transit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransitComponent {
  private birthChart = inject(BirthChartService);
  private ephemeris = inject(EphemerisService);

  #transitD1 = signal<D1Chart | null>(null);
  #transitD9 = signal<D1Chart | null>(null);
  #transitD10 = signal<D1Chart | null>(null);

  protected transitD1 = this.#transitD1.asReadonly();
  protected transitD9 = this.#transitD9.asReadonly();
  protected transitD10 = this.#transitD10.asReadonly();

  constructor() {
    effect(() => {
      const d1Chart = this.birthChart.d1Chart();
      const d9Chart = this.birthChart.d9Chart();
      const details = this.birthChart.birthDetails();
      if (!d1Chart || !d9Chart || !details) {
        this.#transitD1.set(null);
        this.#transitD9.set(null);
        this.#transitD10.set(null);
        return;
      }

      this.ephemeris
        .calculateD1Chart(new Date(), details.lat, details.lng, details.ayanamsa)
        .then((currentPositions) => {
          const natalD10AscendantRasi = calculateD10Rasi(d1Chart.ascendantLongitude ?? d1Chart.ascendantRasi * 30);

          this.#transitD1.set(buildTransitD1Chart(currentPositions, d1Chart.ascendantRasi));
          this.#transitD9.set(buildTransitVargaChart(currentPositions, d9Chart.ascendantRasi, calculateD9Rasi));
          this.#transitD10.set(buildTransitVargaChart(currentPositions, natalD10AscendantRasi, calculateD10Rasi));
        });
    });
  }
}
