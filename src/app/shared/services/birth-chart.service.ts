import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { BirthDetails } from '../models';
import { wallTimeToUtc } from '../utils';
import { EphemerisService } from './ephemeris.service';

const STORAGE_KEY = 'bhachakram:birth-details';

function loadStoredBirthDetails(): BirthDetails | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BirthDetails) : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class BirthChartService {
  private ephemeris = inject(EphemerisService);

  #birthDetails = signal<BirthDetails | null>(loadStoredBirthDetails());

  birthDetails = this.#birthDetails.asReadonly();

  #d1ChartResource = resource({
    params: () => this.#birthDetails(),
    loader: ({ params: details }) => {
      if (!details) {
        return Promise.resolve(null);
      }
      const datetime = wallTimeToUtc(details.dob, details.tob, details.timezone);
      return this.ephemeris.calculateD1Chart(datetime, details.lat, details.lng, details.ayanamsa);
    },
  });

  #d9ChartResource = resource({
    params: () => this.#birthDetails(),
    loader: ({ params: details }) => {
      if (!details) {
        return Promise.resolve(null);
      }
      const datetime = wallTimeToUtc(details.dob, details.tob, details.timezone);
      return this.ephemeris.calculateD9Chart(datetime, details.lat, details.lng, details.ayanamsa);
    },
  });

  #bhavaChalitChartResource = resource({
    params: () => this.#birthDetails(),
    loader: ({ params: details }) => {
      if (!details) {
        return Promise.resolve(null);
      }
      const datetime = wallTimeToUtc(details.dob, details.tob, details.timezone);
      return this.ephemeris.calculateBhavaChalitChart(datetime, details.lat, details.lng, details.ayanamsa);
    },
  });

  d1Chart = computed(() => this.#d1ChartResource.value() ?? null);
  d9Chart = computed(() => this.#d9ChartResource.value() ?? null);
  bhavaChalitChart = computed(() => this.#bhavaChalitChartResource.value() ?? null);

  setBirthDetails(details: BirthDetails): void {
    this.#birthDetails.set(details);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    } catch {
      // localStorage unavailable (e.g. private browsing) — in-memory state still works
    }
  }
}
