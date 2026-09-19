import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BirthChartService, D1Chart, EphemerisService } from '../../shared/services';
import { ButtonComponent, InputComponent, RasiChartComponent } from '../../shared/ui';
import { calculateD10Rasi, calculateD9Rasi } from '../../shared/utils';
import { DeclinationChartComponent } from './declination-chart.component';
import { DeclinationChartData, DeclinationRow } from './declination.model';
import {
  buildDeclinationChartData,
  buildDeclinationRows,
  buildYearSampleDates,
  findDeclinationEvents,
} from './declination.util';
import { buildTransitD1Chart, buildTransitVargaChart } from './transit.util';

@Component({
  selector: 'app-transit',
  imports: [
    RasiChartComponent,
    DeclinationChartComponent,
    ButtonComponent,
    InputComponent,
    FormsModule,
    DatePipe,
    RouterLink,
  ],
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
  #declinationRows = signal<DeclinationRow[] | null>(null);
  #declinationChart = signal<DeclinationChartData | null>(null);
  #selectedYear = signal<number>(new Date().getFullYear());

  protected transitD1 = this.#transitD1.asReadonly();
  protected transitD9 = this.#transitD9.asReadonly();
  protected transitD10 = this.#transitD10.asReadonly();
  protected declinationRows = this.#declinationRows.asReadonly();
  protected declinationChart = this.#declinationChart.asReadonly();
  protected selectedYear = this.#selectedYear.asReadonly();

  protected selectedYearValue = computed(() => String(this.#selectedYear()));

  protected declinationEvents = computed(() => {
    const chart = this.declinationChart();
    return chart ? findDeclinationEvents(chart) : null;
  });

  constructor() {
    effect(() => {
      const d1Chart = this.birthChart.d1Chart();
      const d9Chart = this.birthChart.d9Chart();
      const details = this.birthChart.birthDetails();
      if (!d1Chart || !d9Chart || !details) {
        this.#transitD1.set(null);
        this.#transitD9.set(null);
        this.#transitD10.set(null);
        this.#declinationRows.set(null);
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

      this.ephemeris.calculateGrahaEphemerisData(new Date(), details.ayanamsa).then(({ grahas }) => {
        this.#declinationRows.set(buildDeclinationRows(grahas));
      });
    });

    effect(() => {
      const details = this.birthChart.birthDetails();
      const year = this.#selectedYear();
      if (!details) {
        this.#declinationChart.set(null);
        return;
      }

      Promise.all(
        buildYearSampleDates(year).map((date) =>
          this.ephemeris.calculateGrahaEphemerisData(date, details.ayanamsa).then(({ grahas }) => ({ date, grahas })),
        ),
      ).then((samples) => {
        // Bail out if the year changed again while these ~120 calls were in flight.
        if (this.#selectedYear() !== year) {
          return;
        }
        this.#declinationChart.set(buildDeclinationChartData(year, samples));
      });
    });
  }

  protected formatDeclination(value: number): string {
    return `${Math.abs(value).toFixed(2)}° ${value >= 0 ? 'N' : 'S'}`;
  }

  protected setYear(value: string): void {
    const year = Number(value);
    if (Number.isInteger(year)) {
      this.#selectedYear.set(year);
    }
  }

  protected previousYear(): void {
    this.#selectedYear.update((year) => year - 1);
  }

  protected nextYear(): void {
    this.#selectedYear.update((year) => year + 1);
  }
}
