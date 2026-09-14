import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { BirthDetails } from '../../features/birth-chart/birth-details.model';
import { wallTimeToUtc } from '../utils';
import { EphemerisService } from './ephemeris.service';

@Injectable({ providedIn: 'root' })
export class BirthChartService {
  private ephemeris = inject(EphemerisService);

  #birthDetails = signal<BirthDetails | null>(null);

  birthDetails = this.#birthDetails.asReadonly();

  #chartResource = resource({
    params: () => this.#birthDetails(),
    loader: ({ params: details }) => {
      if (!details) {
        return Promise.resolve(null);
      }
      const datetime = wallTimeToUtc(details.dob, details.tob, details.timezone);
      return this.ephemeris.calculateD1Chart(datetime, details.lat, details.lng);
    },
  });

  chart = computed(() => this.#chartResource.value() ?? null);

  setBirthDetails(details: BirthDetails): void {
    this.#birthDetails.set(details);
  }
}
