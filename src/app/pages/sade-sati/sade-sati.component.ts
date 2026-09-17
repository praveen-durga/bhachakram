import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { BirthChartService, EphemerisService } from '../../shared/services';
import { CardComponent } from '../../shared/ui';
import { calculateNakshatra, findGraha, wallTimeToUtc } from '../../shared/utils';
import { SATURN_DATA_TIMEZONE } from './sade-sati.data';
import { Occurrence } from './sade-sati.model';
import { buildOccurrence, findOccurrenceWindows } from './sade-sati.util';

const OCCURRENCE_WINDOW_YEARS = 80;

@Component({
  selector: 'app-sade-sati',
  imports: [CardComponent, DatePipe, DecimalPipe],
  templateUrl: './sade-sati.component.html',
  styleUrl: './sade-sati.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SadeSatiComponent {
  private birthChart = inject(BirthChartService);
  private ephemeris = inject(EphemerisService);

  #occurrences = signal<Occurrence[] | null>(null);

  protected occurrences = this.#occurrences.asReadonly();
  protected displayTimezone = SATURN_DATA_TIMEZONE;

  constructor() {
    effect(() => {
      const d1Chart = this.birthChart.d1Chart();
      const details = this.birthChart.birthDetails();

      if (!d1Chart || !details) {
        this.#occurrences.set(null);
        return;
      }

      const moon = findGraha(d1Chart.grahas, 'Moon');
      const janmaNakshatraIndex = calculateNakshatra(moon.longitude);

      const windowStart = wallTimeToUtc(details.dob, details.tob, details.timezone);
      const windowEnd = new Date(windowStart);
      windowEnd.setUTCFullYear(windowEnd.getUTCFullYear() + OCCURRENCE_WINDOW_YEARS);

      const rawWindows = findOccurrenceWindows(moon.rasi, windowStart, windowEnd);
      const transitMoonRequests = rawWindows.map((window) =>
        this.ephemeris.calculateGrahaEphemerisData(window.start, details.ayanamsa),
      );

      Promise.all(transitMoonRequests).then((ephemerisResults) => {
        const occurrences = rawWindows.map((window, index) => {
          const transitNakshatraIndex = calculateNakshatra(ephemerisResults[index].grahas.Moon.longitude);
          return buildOccurrence(window, janmaNakshatraIndex, transitNakshatraIndex);
        });
        this.#occurrences.set(occurrences);
      });
    });
  }
}
