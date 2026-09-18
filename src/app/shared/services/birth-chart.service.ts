import { Injectable, inject, signal } from '@angular/core';
import { BirthChartProfile, BirthDetails } from '../models';
import { wallTimeToUtc } from '../utils';
import { D1Chart, SunTimes } from './ephemeris.model';
import { EphemerisService } from './ephemeris.service';
import { STORE_KEYS } from './store.keys';
import { StoreService } from './store.service';

type StoredCharts = BirthChartProfile['charts'];

function profileKey(details: BirthDetails): string {
  return [details.name, details.dob, details.tob, details.cityLabel, details.ayanamsa].join('|');
}

@Injectable({ providedIn: 'root' })
export class BirthChartService {
  private ephemeris = inject(EphemerisService);
  private storage = inject(StoreService);

  #birthDetails = signal<BirthDetails | null>(null);
  #d1Chart = signal<D1Chart | null>(null);
  #d9Chart = signal<D1Chart | null>(null);
  #bhavaChalitChart = signal<D1Chart | null>(null);
  #sunTimes = signal<SunTimes | null>(null);
  #profiles = signal<BirthChartProfile[]>([]);

  birthDetails = this.#birthDetails.asReadonly();
  d1Chart = this.#d1Chart.asReadonly();
  d9Chart = this.#d9Chart.asReadonly();
  bhavaChalitChart = this.#bhavaChalitChart.asReadonly();
  sunTimes = this.#sunTimes.asReadonly();
  profiles = this.#profiles.asReadonly();

  constructor() {
    // Always warm up the ephemeris CDN module so it's ready if a recalculation
    // is ever needed, even when a cached chart lets us skip calculating now.
    this.ephemeris.preload();

    // Birth details and charts are persisted independently: details alone are
    // enough to recompute charts if the chart cache didn't make it to storage
    // (e.g. unload happened before the calculation finished).
    const storedDetails = this.storage.get<BirthDetails>(STORE_KEYS.BIRTH_DETAILS);
    const storedCharts = this.storage.get<StoredCharts>(STORE_KEYS.CHARTS);
    const storedProfiles = this.storage.get<BirthChartProfile[]>(STORE_KEYS.PROFILES);
    this.#profiles.set(storedProfiles ?? []);

    // Charts cached before isRetrograde/isCombust existed on GrahaPosition are
    // missing those fields - detect and recompute rather than silently
    // showing stale data forever (storedCharts has no version/migration
    // system, so this is the lightweight equivalent).
    const hasCurrentShape = storedCharts?.d1Chart.grahas[0]?.isRetrograde !== undefined;

    if (storedDetails && storedCharts && hasCurrentShape) {
      this.#birthDetails.set(storedDetails);
      this.#d1Chart.set(storedCharts.d1Chart);
      this.#d9Chart.set(storedCharts.d9Chart);
      this.#bhavaChalitChart.set(storedCharts.bhavaChalitChart);
      this.#loadSunTimes(storedDetails);
      this.#saveProfile(storedDetails, storedCharts);
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

    this.storage.persistOnUnload<BirthChartProfile[]>(STORE_KEYS.PROFILES, () => this.#profiles());
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
      this.#saveProfile(details, { d1Chart, d9Chart, bhavaChalitChart });
    });

    this.#loadSunTimes(details);
  }

  selectProfile(id: string): void {
    const profile = this.#profiles().find((p) => p.id === id);
    if (!profile) {
      return;
    }

    this.#birthDetails.set(profile.details);
    this.#d1Chart.set(profile.charts.d1Chart);
    this.#d9Chart.set(profile.charts.d9Chart);
    this.#bhavaChalitChart.set(profile.charts.bhavaChalitChart);
    this.#loadSunTimes(profile.details);
  }

  deleteProfile(id: string): void {
    const activeDetails = this.#birthDetails();
    const deletedProfile = this.#profiles().find((p) => p.id === id);
    const wasActive =
      !!deletedProfile && !!activeDetails && profileKey(deletedProfile.details) === profileKey(activeDetails);
    this.#profiles.update((profiles) => profiles.filter((p) => p.id !== id));

    if (wasActive) {
      this.#birthDetails.set(null);
      this.#d1Chart.set(null);
      this.#d9Chart.set(null);
      this.#bhavaChalitChart.set(null);
      this.#sunTimes.set(null);
    }
  }

  #saveProfile(details: BirthDetails, charts: StoredCharts): void {
    const key = profileKey(details);
    const existing = this.#profiles().find((p) => profileKey(p.details) === key);

    if (existing) {
      this.#profiles.update((profiles) => profiles.map((p) => (p.id === existing.id ? { ...p, details, charts } : p)));
    } else {
      this.#profiles.update((profiles) => [...profiles, { id: crypto.randomUUID(), details, charts }]);
    }
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
