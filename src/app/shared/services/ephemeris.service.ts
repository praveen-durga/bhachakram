import { Injectable } from '@angular/core';
import type SwissEph from 'swisseph-wasm';
import { calculateD9Rasi } from '../utils';
import { Ayanamsa, D1Chart, Graha, GrahaPosition } from './ephemeris.model';

const SWISSEPH_CDN_URL = 'https://cdn.jsdelivr.net/npm/swisseph-wasm@0.1.0/src/swisseph.js';

const GRAHA_PLANET_IDS: Record<Exclude<Graha, 'Ketu'>, number> = {
  Sun: 0,
  Moon: 1,
  Mercury: 2,
  Venus: 3,
  Mars: 4,
  Jupiter: 5,
  Saturn: 6,
  Rahu: 11,
};

const SEFLG_SWIEPH = 2;
const SEFLG_SIDEREAL = 65536;
const SE_CALC_RISE = 1;
const SE_CALC_SET = 2;

const SIDM_BY_AYANAMSA: Record<Ayanamsa, number> = {
  lahiri: 1,
  raman: 3,
  kp: 5,
  yukteshwar: 7,
  'fagan-bradley': 0,
};

type RawPositions = {
  grahaLongitudes: Record<Graha, number>;
  ascendantLongitude: number;
};

@Injectable({ providedIn: 'root' })
export class EphemerisService {
  #swe: SwissEph | null = null;
  #initPromise: Promise<SwissEph> | null = null;

  preload(): void {
    void this.#getSwe();
  }

  async calculateD1Chart(datetime: Date, latitude: number, longitude: number, ayanamsa: Ayanamsa): Promise<D1Chart> {
    const { grahaLongitudes, ascendantLongitude } = await this.#calculateRawPositions(
      datetime,
      latitude,
      longitude,
      ayanamsa,
    );

    const grahas = this.#toGrahaPositions(grahaLongitudes, this.#toRasi);
    return { ascendantRasi: this.#toRasi(ascendantLongitude), ascendantLongitude, grahas };
  }

  async calculateD9Chart(datetime: Date, latitude: number, longitude: number, ayanamsa: Ayanamsa): Promise<D1Chart> {
    const { grahaLongitudes, ascendantLongitude } = await this.#calculateRawPositions(
      datetime,
      latitude,
      longitude,
      ayanamsa,
    );

    const grahas = this.#toGrahaPositions(grahaLongitudes, calculateD9Rasi);
    return { ascendantRasi: calculateD9Rasi(ascendantLongitude), grahas };
  }

  async calculateBhavaChalitChart(
    datetime: Date,
    latitude: number,
    longitude: number,
    ayanamsa: Ayanamsa,
  ): Promise<D1Chart> {
    const swe = await this.#getSwe();
    swe.set_sid_mode(SIDM_BY_AYANAMSA[ayanamsa], 0, 0);
    const jd = this.#toJulianDay(swe, datetime);

    const grahaLongitudes = this.#calculateGrahaLongitudes(swe, jd);
    const houses = swe.houses_ex(jd, SEFLG_SIDEREAL, latitude, longitude, 'S');
    const toBhavaIndex = (lon: number) => this.#houseForLongitude(lon, houses.cusps) - 1;

    const grahas = this.#toGrahaPositions(grahaLongitudes, toBhavaIndex);
    return { ascendantRasi: toBhavaIndex(houses.ascmc[0]), ascendantLongitude: houses.ascmc[0], grahas };
  }

  async calculateAscendant(datetime: Date, latitude: number, longitude: number, ayanamsa: Ayanamsa): Promise<number> {
    const swe = await this.#getSwe();
    swe.set_sid_mode(SIDM_BY_AYANAMSA[ayanamsa], 0, 0);
    const jd = this.#toJulianDay(swe, datetime);
    const houses = swe.houses_ex(jd, SEFLG_SIDEREAL, latitude, longitude, 'W');

    return houses.ascmc[0];
  }

  async calculateSunriseSunset(
    datetime: Date,
    latitude: number,
    longitude: number,
  ): Promise<{ sunrise: Date; sunset: Date }> {
    const swe = await this.#getSwe();
    // Search from UTC midnight of this calendar day, not the given instant —
    // rise_trans searches forward, so searching from the birth time itself
    // would miss that day's sunrise/sunset if the birth occurred after them.
    const midnightUtc = new Date(Date.UTC(datetime.getUTCFullYear(), datetime.getUTCMonth(), datetime.getUTCDate()));
    const jd = this.#toJulianDay(swe, midnightUtc);
    const geopos = [longitude, latitude, 0];

    const riseJd = swe.rise_trans(jd, swe.SE_SUN, '', SEFLG_SWIEPH, SE_CALC_RISE, geopos, 0, 0);
    const setJd = swe.rise_trans(jd, swe.SE_SUN, '', SEFLG_SWIEPH, SE_CALC_SET, geopos, 0, 0);

    if (!riseJd || !setJd) {
      throw new Error('Unable to calculate sunrise/sunset for the given date and location');
    }

    return { sunrise: this.#jdToUtcDate(swe, riseJd[0]), sunset: this.#jdToUtcDate(swe, setJd[0]) };
  }

  #jdToUtcDate(swe: SwissEph, jd: number): Date {
    const utc = swe.jdut1_to_utc(jd, swe.SE_GREG_CAL);
    return new Date(Date.UTC(utc.year, utc.month - 1, utc.day, utc.hour, utc.minute, utc.second));
  }

  #houseForLongitude(longitude: number, cusps: Float64Array): number {
    for (let house = 1; house <= 12; house++) {
      const start = cusps[house];
      const end = cusps[(house % 12) + 1];
      if (start < end ? start <= longitude && longitude < end : longitude >= start || longitude < end) {
        return house;
      }
    }
    return 1;
  }

  #toGrahaPositions(grahaLongitudes: Record<Graha, number>, toRasi: (longitude: number) => number): GrahaPosition[] {
    return Object.entries(grahaLongitudes).map(([graha, longitude]) => ({
      graha: graha as Graha,
      longitude,
      rasi: toRasi(longitude),
    }));
  }

  async #calculateRawPositions(
    datetime: Date,
    latitude: number,
    longitude: number,
    ayanamsa: Ayanamsa,
  ): Promise<RawPositions> {
    const swe = await this.#getSwe();
    swe.set_sid_mode(SIDM_BY_AYANAMSA[ayanamsa], 0, 0);
    const jd = this.#toJulianDay(swe, datetime);

    const grahaLongitudes = this.#calculateGrahaLongitudes(swe, jd);
    const houses = swe.houses_ex(jd, SEFLG_SIDEREAL, latitude, longitude, 'W');

    return { grahaLongitudes, ascendantLongitude: houses.ascmc[0] };
  }

  #calculateGrahaLongitudes(swe: SwissEph, jd: number): Record<Graha, number> {
    const grahaLongitudes = {} as Record<Graha, number>;
    for (const [graha, planetId] of Object.entries(GRAHA_PLANET_IDS)) {
      const [grahaLongitude] = swe.calc_ut(jd, planetId, SEFLG_SWIEPH | SEFLG_SIDEREAL);
      grahaLongitudes[graha as Graha] = grahaLongitude;
    }
    grahaLongitudes.Ketu = swe.degnorm(grahaLongitudes.Rahu + 180);
    return grahaLongitudes;
  }

  #toJulianDay(swe: SwissEph, datetime: Date): number {
    return swe.julday(
      datetime.getUTCFullYear(),
      datetime.getUTCMonth() + 1,
      datetime.getUTCDate(),
      datetime.getUTCHours() + datetime.getUTCMinutes() / 60,
    );
  }

  #toRasi(longitude: number): number {
    return Math.floor(longitude / 30);
  }

  async #getSwe(): Promise<SwissEph> {
    if (this.#swe) {
      return this.#swe;
    }
    this.#initPromise ??= this.#init();
    return this.#initPromise;
  }

  async #init(): Promise<SwissEph> {
    const { default: SwissEphCtor } = await import(/* @vite-ignore */ SWISSEPH_CDN_URL);
    const swe: SwissEph = new SwissEphCtor();
    await swe.initSwissEph();
    this.#swe = swe;
    return swe;
  }
}
