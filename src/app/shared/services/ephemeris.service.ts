import { Injectable } from '@angular/core';
import type SwissEph from 'swisseph-wasm';
import { D1Chart, Graha, GrahaPosition } from './ephemeris.model';

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
const SE_SIDM_LAHIRI = 1;

@Injectable({ providedIn: 'root' })
export class EphemerisService {
  #swe: SwissEph | null = null;
  #initPromise: Promise<SwissEph> | null = null;

  async calculateD1Chart(datetime: Date, latitude: number, longitude: number): Promise<D1Chart> {
    const swe = await this.#getSwe();

    const jd = swe.julday(
      datetime.getUTCFullYear(),
      datetime.getUTCMonth() + 1,
      datetime.getUTCDate(),
      datetime.getUTCHours() + datetime.getUTCMinutes() / 60,
    );

    const grahas: GrahaPosition[] = Object.entries(GRAHA_PLANET_IDS).map(([graha, planetId]) => {
      const [longitude] = swe.calc_ut(jd, planetId, SEFLG_SWIEPH | SEFLG_SIDEREAL);
      return { graha: graha as Graha, longitude, rasi: this.#toRasi(longitude) };
    });

    const rahu = grahas.find((g) => g.graha === 'Rahu')!;
    const ketuLongitude = swe.degnorm(rahu.longitude + 180);
    grahas.push({ graha: 'Ketu', longitude: ketuLongitude, rasi: this.#toRasi(ketuLongitude) });

    const houses = swe.houses_ex(jd, SEFLG_SIDEREAL, latitude, longitude, 'W');
    const ascendantLongitude = houses.ascmc[0];

    return { ascendantRasi: this.#toRasi(ascendantLongitude), grahas };
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
    swe.set_sid_mode(SE_SIDM_LAHIRI, 0, 0);
    this.#swe = swe;
    return swe;
  }
}
