import { Injectable, inject, signal } from '@angular/core';
import { BirthDetails } from '../models';
import { wallTimeToUtc } from '../utils';
import { D1Chart } from './ephemeris.model';
import { EphemerisService } from './ephemeris.service';
import { STORE_KEYS } from './store.keys';
import { StoreService } from './store.service';

type StoredCharts = {
  d1Chart: D1Chart;
  d9Chart: D1Chart;
  bhavaChalitChart: D1Chart;
};

export type SunTimes = {
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
};

@Injectable({ providedIn: 'root' })
export class BirthChartService {
  private ephemeris = inject(EphemerisService);
  private storage = inject(StoreService);

  #birthDetails = signal<BirthDetails | null>(null);
  #d1Chart = signal<D1Chart | null>(null);
  #d9Chart = signal<D1Chart | null>(null);
  #bhavaChalitChart = signal<D1Chart | null>(null);
  #sunTimes = signal<SunTimes | null>(null);

  birthDetails = this.#birthDetails.asReadonly();
  d1Chart = this.#d1Chart.asReadonly();
  d9Chart = this.#d9Chart.asReadonly();
  bhavaChalitChart = this.#bhavaChalitChart.asReadonly();
  sunTimes = this.#sunTimes.asReadonly();

  constructor() {
    // Always warm up the ephemeris CDN module so it's ready if a recalculation
    // is ever needed, even when a cached chart lets us skip calculating now.
    this.ephemeris.preload();

    // Birth details and charts are persisted independently: details alone are
    // enough to recompute charts if the chart cache didn't make it to storage
    // (e.g. unload happened before the calculation finished).
    const storedDetails = this.storage.get<BirthDetails>(STORE_KEYS.BIRTH_DETAILS);
    const storedCharts = this.storage.get<StoredCharts>(STORE_KEYS.CHARTS);

    if (storedDetails && storedCharts) {
      this.#birthDetails.set(storedDetails);
      this.#d1Chart.set(storedCharts.d1Chart);
      this.#d9Chart.set(storedCharts.d9Chart);
      this.#bhavaChalitChart.set(storedCharts.bhavaChalitChart);
      this.#loadSunTimes(storedDetails);
    } else if (storedDetails) {
      this.setBirthDetails(storedDetails);
    }

    this.storage.persistOnUnload<BirthDetails>(STORE_KEYS.BIRTH_DETAILS, () => this.#birthDetails());

    this.storage.persistOnUnload<StoredCharts>(STORE_KEYS.CHARTS, () => {
      const d1Chart = this.#d1Chart();
      const d9Chart = this.#d9Chart();
      const bhavaChalitChart = this.#bhavaChalitChart();
      return d1Chart && d9Chart && bhavaChalitChart ? { d1Chart, d9Chart, bhavaChalitChart } : null;
    });
  }

  setBirthDetails(details: BirthDetails): void {
    this.#birthDetails.set(details);

    const datetime = wallTimeToUtc(details.dob, details.tob, details.timezone);
    Promise.all([
      this.ephemeris.calculateD1Chart(datetime, details.lat, details.lng, details.ayanamsa),
      this.ephemeris.calculateD9Chart(datetime, details.lat, details.lng, details.ayanamsa),
      this.ephemeris.calculateBhavaChalitChart(datetime, details.lat, details.lng, details.ayanamsa),
    ]).then(([d1Chart, d9Chart, bhavaChalitChart]) => {
      this.#d1Chart.set(d1Chart);
      this.#d9Chart.set(d9Chart);
      this.#bhavaChalitChart.set(bhavaChalitChart);
    });

    this.#loadSunTimes(details);
  }

  #loadSunTimes(details: BirthDetails): void {
    const datetime = wallTimeToUtc(details.dob, details.tob, details.timezone);
    const nextDay = new Date(datetime.getTime() + 24 * 60 * 60 * 1000);

    Promise.all([
      this.ephemeris.calculateSunriseSunset(datetime, details.lat, details.lng, details.timezone),
      this.ephemeris.calculateSunriseSunset(nextDay, details.lat, details.lng, details.timezone),
    ]).then(([today, tomorrow]) => {
      this.#sunTimes.set({ sunrise: today.sunrise, sunset: today.sunset, nextSunrise: tomorrow.sunrise });
    });
  }
}
