import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BirthChartService, EphemerisService } from '../../shared/services';
import { ButtonComponent, InputComponent } from '../../shared/ui';
import { TRANSIT_ASPECT_BODIES, TRANSIT_ASPECT_DEFAULT_RANGE_DAYS } from './transit-aspects.data';
import { TransitAspectBody, TransitAspectEvent } from './transit-aspects.model';
import { buildDailySampleDates, findTransitAspectEvents } from './transit-aspects.util';

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseDateInputValue(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

// Matches the DatePipe's default rendering, which uses the browser's local
// time zone - so "9 AM" here means what the table itself shows as 9 AM.
function isWithinNineToFour(date: Date): boolean {
  const minutesSinceMidnight = date.getHours() * 60 + date.getMinutes();
  return minutesSinceMidnight >= 9 * 60 && minutesSinceMidnight <= 16 * 60;
}

@Component({
  selector: 'app-transit-aspects',
  imports: [ButtonComponent, InputComponent, FormsModule, DatePipe],
  templateUrl: './transit-aspects.component.html',
  styleUrl: './transit-aspects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransitAspectsComponent {
  private birthChart = inject(BirthChartService);
  private ephemeris = inject(EphemerisService);

  #startDate = signal<string>(toDateInputValue(new Date()));
  #endDate = signal<string>(
    toDateInputValue(new Date(Date.now() + (TRANSIT_ASPECT_DEFAULT_RANGE_DAYS - 1) * 86400000)),
  );
  #isLoading = signal(false);
  #events = signal<TransitAspectEvent[] | null>(null);
  #resultRange = signal<{ start: string; end: string } | null>(null);
  #includedBodies = signal<Set<TransitAspectBody>>(new Set(TRANSIT_ASPECT_BODIES));
  #timeWindowOnly = signal(false);

  protected startDate = this.#startDate.asReadonly();
  protected endDate = this.#endDate.asReadonly();
  protected isLoading = this.#isLoading.asReadonly();
  protected events = this.#events.asReadonly();
  protected resultRange = this.#resultRange.asReadonly();
  protected allBodies = TRANSIT_ASPECT_BODIES;
  protected timeWindowOnly = this.#timeWindowOnly.asReadonly();

  protected filteredEvents = computed(() => {
    const included = this.#includedBodies();
    const timeWindowOnly = this.#timeWindowOnly();
    return (
      this.events()?.filter((event) => {
        if (!included.has(event.bodyA) || !included.has(event.bodyB)) {
          return false;
        }
        if (timeWindowOnly && !isWithinNineToFour(event.date)) {
          return false;
        }
        return true;
      }) ?? null
    );
  });

  constructor() {
    // Auto-run once with the default range as soon as birth details (needed
    // for the ayanamsa) are ready - subsequent range changes require the
    // explicit "Find Aspects" click, since a wide range can take a while.
    const autoRun = effect(() => {
      if (this.birthChart.birthDetails()) {
        this.findAspects();
        autoRun.destroy();
      }
    });
  }

  protected setStartDate(value: string): void {
    this.#startDate.set(value);
  }

  protected setEndDate(value: string): void {
    this.#endDate.set(value);
  }

  protected isBodyIncluded(body: TransitAspectBody): boolean {
    return this.#includedBodies().has(body);
  }

  protected toggleBody(body: TransitAspectBody): void {
    this.#includedBodies.update((included) => {
      const next = new Set(included);
      if (next.has(body)) {
        next.delete(body);
      } else {
        next.add(body);
      }
      return next;
    });
  }

  protected toggleTimeWindow(): void {
    this.#timeWindowOnly.update((value) => !value);
  }

  protected findAspects(): void {
    const details = this.birthChart.birthDetails();
    if (!details) {
      return;
    }

    const start = parseDateInputValue(this.#startDate());
    const end = parseDateInputValue(this.#endDate());
    if (end < start) {
      return;
    }

    this.#isLoading.set(true);
    const dates = buildDailySampleDates(start, end);

    Promise.all([
      Promise.all(dates.map((date) => this.ephemeris.calculateTransitLongitudes(date, details.ayanamsa))),
      Promise.all(dates.map((date) => this.ephemeris.calculateTransitDeclinations(date))),
    ]).then(([longitudeSamples, declinationSamples]) => {
      this.#events.set(findTransitAspectEvents(dates, longitudeSamples, declinationSamples));
      this.#resultRange.set({ start: this.#startDate(), end: this.#endDate() });
      this.#isLoading.set(false);
    });
  }
}
