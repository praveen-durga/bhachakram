import { Injectable } from '@angular/core';
import type SwissEphemeris from 'swisseph-wasm';
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

const EPHEMERIS_FLAG_SWISS = 2;
const EPHEMERIS_FLAG_SIDEREAL = 65536;
const EPHEMERIS_FLAG_SPEED = 256;
const EPHEMERIS_FLAG_EQUATORIAL = 2048;
const RISE_TRANSIT_RISE = 1;
const RISE_TRANSIT_SET = 2;
const ECLIPTIC_OBLIQUITY_AND_NUTATION = -1;

// Sidereal year length (days), per PyJHora's const.sidereal_year - used only
// as a search seed for findSolarReturn, not as the final answer.
const SIDEREAL_YEAR_DAYS = 365.256364;

// Classical combustion (Asta) orbs in degrees from the Sun - Sun/Rahu/Ketu
// are not subject to combustion, so they're intentionally absent here.
const COMBUSTION_ORB_DEG: Partial<Record<Graha, number>> = {
  Moon: 12,
  Mars: 17,
  Mercury: 14,
  Jupiter: 11,
  Venus: 10,
  Saturn: 15,
};

const SIDEREAL_MODE_BY_AYANAMSA: Record<Ayanamsa, number> = {
  lahiri: 1,
  raman: 3,
  kp: 5,
  yukteshwar: 7,
  'fagan-bradley': 0,
};

type GrahaLongitudeSpeed = { longitude: number; longitudeSpeed: number };

type RawPositions = {
  grahaData: Record<Graha, GrahaLongitudeSpeed>;
  ascendantLongitude: number;
};

export type GrahaEphemerisData = {
  longitude: number;
  longitudeSpeed: number;
  declination: number;
  eclipticLatitude: number;
};

@Injectable({ providedIn: 'root' })
export class EphemerisService {
  #swissEphemeris: SwissEphemeris | null = null;
  #initPromise: Promise<SwissEphemeris> | null = null;

  preload(): void {
    void this.#getEphemeris();
  }

  async calculateD1Chart(datetime: Date, latitude: number, longitude: number, ayanamsa: Ayanamsa): Promise<D1Chart> {
    const { grahaData, ascendantLongitude } = await this.#calculateRawPositions(
      datetime,
      latitude,
      longitude,
      ayanamsa,
    );

    const grahas = this.#toGrahaPositions(grahaData, this.#toRasi);
    return { ascendantRasi: this.#toRasi(ascendantLongitude), ascendantLongitude, grahas };
  }

  async calculateD9Chart(datetime: Date, latitude: number, longitude: number, ayanamsa: Ayanamsa): Promise<D1Chart> {
    const { grahaData, ascendantLongitude } = await this.#calculateRawPositions(
      datetime,
      latitude,
      longitude,
      ayanamsa,
    );

    const grahas = this.#toGrahaPositions(grahaData, calculateD9Rasi);
    return { ascendantRasi: calculateD9Rasi(ascendantLongitude), grahas };
  }

  async calculateBhavaChalitChart(
    datetime: Date,
    latitude: number,
    longitude: number,
    ayanamsa: Ayanamsa,
  ): Promise<D1Chart> {
    const ephemeris = await this.#getEphemeris();
    ephemeris.set_sid_mode(SIDEREAL_MODE_BY_AYANAMSA[ayanamsa], 0, 0);
    const julianDay = this.#toJulianDay(ephemeris, datetime);

    const grahaData = this.#calculateGrahaData(ephemeris, julianDay);
    const houses = ephemeris.houses_ex(julianDay, EPHEMERIS_FLAG_SIDEREAL, latitude, longitude, 'S');
    const toBhavaIndex = (longitude: number) => this.#houseForLongitude(longitude, houses.cusps) - 1;

    const grahas = this.#toGrahaPositions(grahaData, toBhavaIndex);
    return {
      ascendantRasi: toBhavaIndex(houses.ascmc[0]),
      ascendantLongitude: houses.ascmc[0],
      grahas,
      cusps: Array.from(houses.cusps).slice(1, 13),
    };
  }

  // Dig Bala measures a planet's distance from the weakest house's cusp using
  // Placidus cusps specifically (JHora's shad_bala() Dig Bala calls
  // bhaava_madhya with no method override, defaulting to Placidus/KP) — a
  // different house system from calculateBhavaChalitChart's Sripati cusps,
  // which serve the Bhava Chalit chart display and Bhava Bala instead.
  async calculatePlacidusCusps(
    datetime: Date,
    latitude: number,
    longitude: number,
    ayanamsa: Ayanamsa,
  ): Promise<number[]> {
    const ephemeris = await this.#getEphemeris();
    ephemeris.set_sid_mode(SIDEREAL_MODE_BY_AYANAMSA[ayanamsa], 0, 0);
    const julianDay = this.#toJulianDay(ephemeris, datetime);

    const houses = ephemeris.houses_ex(julianDay, EPHEMERIS_FLAG_SIDEREAL, latitude, longitude, 'P');
    return Array.from(houses.cusps).slice(1, 13);
  }

  async calculateAscendant(datetime: Date, latitude: number, longitude: number, ayanamsa: Ayanamsa): Promise<number> {
    const ephemeris = await this.#getEphemeris();
    ephemeris.set_sid_mode(SIDEREAL_MODE_BY_AYANAMSA[ayanamsa], 0, 0);
    const julianDay = this.#toJulianDay(ephemeris, datetime);
    const houses = ephemeris.houses_ex(julianDay, EPHEMERIS_FLAG_SIDEREAL, latitude, longitude, 'W');

    return houses.ascmc[0];
  }

  // Raw per-graha data needed by Shadbala's Chesta/Ayana/Drig Bala sub-components:
  // sidereal longitude + longitude speed (negative = retrograde), and tropical
  // declination (ayanamsa-independent, so always computed non-sidereal).
  // ayanamsaDeg (sidereal longitude + this = Sayana/tropical longitude) is
  // needed for Ishta/Kashta Phala's Sun-specific Chesta Kendra formula (B.V.
  // Raman's Graha and Bhava Balas Ch. X Art. 136), which is defined in terms
  // of the Sayana Sun, not the sidereal one.
  async calculateGrahaEphemerisData(
    datetime: Date,
    ayanamsa: Ayanamsa,
  ): Promise<{ grahas: Record<Graha, GrahaEphemerisData>; obliquity: number; ayanamsaDeg: number }> {
    const ephemeris = await this.#getEphemeris();
    ephemeris.set_sid_mode(SIDEREAL_MODE_BY_AYANAMSA[ayanamsa], 0, 0);
    const julianDay = this.#toJulianDay(ephemeris, datetime);

    const grahas = {} as Record<Graha, GrahaEphemerisData>;
    for (const [graha, planetId] of Object.entries(GRAHA_PLANET_IDS)) {
      const [longitude, eclipticLatitude, , longitudeSpeed] = ephemeris.calc_ut(
        julianDay,
        planetId,
        EPHEMERIS_FLAG_SWISS | EPHEMERIS_FLAG_SIDEREAL | EPHEMERIS_FLAG_SPEED,
      );
      const [, declination] = ephemeris.calc_ut(julianDay, planetId, EPHEMERIS_FLAG_SWISS | EPHEMERIS_FLAG_EQUATORIAL);
      grahas[graha as Graha] = { longitude, longitudeSpeed, declination, eclipticLatitude };
    }
    grahas.Ketu = {
      longitude: ephemeris.degnorm(grahas.Rahu.longitude + 180),
      longitudeSpeed: grahas.Rahu.longitudeSpeed,
      declination: -grahas.Rahu.declination,
      eclipticLatitude: -grahas.Rahu.eclipticLatitude,
    };

    const [, obliquity] = ephemeris.calc_ut(julianDay, ECLIPTIC_OBLIQUITY_AND_NUTATION, 0);
    const ayanamsaDeg = ephemeris.get_ayanamsa(julianDay);
    return { grahas, obliquity, ayanamsaDeg };
  }

  // Finds the most recent instant before `datetime` at which the Sun's sidereal
  // longitude crossed a multiple of `boundaryDeg` (30 for any sign/Maasa
  // boundary, 360 for specifically Aries 0°/Varsha) — needed for Shadbala's
  // Varsha/Maasa Bala (weekday of that crossing determines the year/month
  // lord). No dedicated sankranti-finder API exists, so this builds an
  // "unwrapped" cumulative longitude (never resets to 0 at 360°, since raw
  // calc_ut longitude does) by stepping backward a day at a time — the Sun
  // moves under 1.5°/day, so a backward step can only ever wrap once — then
  // binary-searches the day the boundary was crossed using that unwrapped
  // value, which a boundaryDeg of 360 (Aries-only) handles the same way as
  // any other boundary.
  async findMostRecentSankranti(datetime: Date, ayanamsa: Ayanamsa, boundaryDeg: number): Promise<Date> {
    const ephemeris = await this.#getEphemeris();
    ephemeris.set_sid_mode(SIDEREAL_MODE_BY_AYANAMSA[ayanamsa], 0, 0);

    const rawSunLongitude = (julianDay: number) =>
      ephemeris.calc_ut(julianDay, 0, EPHEMERIS_FLAG_SWISS | EPHEMERIS_FLAG_SIDEREAL)[0];

    let laterJulianDay = this.#toJulianDay(ephemeris, datetime);
    let unwrappedLongitude = rawSunLongitude(laterJulianDay);
    let laterCount = Math.floor(unwrappedLongitude / boundaryDeg);

    let earlierJulianDay = laterJulianDay - 1;
    let earlierRawLongitude = rawSunLongitude(earlierJulianDay);
    // Stepping 1 day BACKWARD, longitude normally DECREASES; if it instead
    // looks larger, the true earlier value wrapped past 360 going backward.
    unwrappedLongitude = earlierRawLongitude > unwrappedLongitude ? earlierRawLongitude - 360 : earlierRawLongitude;
    let earlierCount = Math.floor(unwrappedLongitude / boundaryDeg);

    while (earlierCount === laterCount) {
      laterJulianDay = earlierJulianDay;
      laterCount = earlierCount;
      earlierJulianDay -= 1;
      earlierRawLongitude = rawSunLongitude(earlierJulianDay);
      unwrappedLongitude = earlierRawLongitude > unwrappedLongitude ? unwrappedLongitude - 360 : earlierRawLongitude;
      earlierCount = Math.floor(unwrappedLongitude / boundaryDeg);
    }

    // The boundary was crossed between earlierJulianDay and laterJulianDay.
    // Binary-search using plain raw longitude compared against the known
    // target — since this span is at most 1 day, no further wraparound
    // bookkeeping is needed.
    const targetLongitude = laterCount * boundaryDeg;
    for (let i = 0; i < 40; i++) {
      const midJulianDay = (earlierJulianDay + laterJulianDay) / 2;
      const midRawLongitude = rawSunLongitude(midJulianDay);
      const hasReachedTarget = (midRawLongitude - targetLongitude + 360) % 360 < 180;
      if (hasReachedTarget) {
        laterJulianDay = midJulianDay;
      } else {
        earlierJulianDay = midJulianDay;
      }
    }

    return this.#julianDayToUtcDate(ephemeris, laterJulianDay);
  }

  // Varshapravesh (Tajik annual return): the exact instant, `elapsedYears`
  // after birth, at which the Sun's sidereal longitude returns to its natal
  // value (elapsedYears=0 is the birth instant itself, elapsedYears=1 the
  // first birthday, etc). Confirmed against PyJHora's tajaka.py/drik.py,
  // which matches sidereal longitude (not tropical) and uses the sidereal
  // year purely as a search seed, not as the actual answer (no manual leap/
  // precession bookkeeping needed once the ephemeris match converges).
  // Seeds from `birthDatetime` advanced by the sidereal year x
  // elapsedYears, then walks day-by-day to bracket the crossing within 1
  // day before the same 40-iteration binary search `findMostRecentSankranti`
  // uses.
  async findSolarReturn(
    natalSunLongitude: number,
    birthDatetime: Date,
    elapsedYears: number,
    ayanamsa: Ayanamsa,
  ): Promise<Date> {
    const ephemeris = await this.#getEphemeris();
    ephemeris.set_sid_mode(SIDEREAL_MODE_BY_AYANAMSA[ayanamsa], 0, 0);

    const rawSunLongitude = (julianDay: number) =>
      ephemeris.calc_ut(julianDay, 0, EPHEMERIS_FLAG_SWISS | EPHEMERIS_FLAG_SIDEREAL)[0];

    // Signed shortest-path offset of the Sun from the natal target, in
    // (-180, 180]: negative means the Sun hasn't reached the target yet
    // (crossing is later), positive means it's passed it (crossing was
    // earlier) - so a sign flip between two consecutive days brackets the
    // exact crossing.
    const signedOffset = (julianDay: number): number => {
      const diff = (((rawSunLongitude(julianDay) - natalSunLongitude) % 360) + 360) % 360;
      return diff > 180 ? diff - 360 : diff;
    };

    const seedJulianDay = this.#toJulianDay(ephemeris, birthDatetime) + elapsedYears * SIDEREAL_YEAR_DAYS;

    // The sidereal-year seed lands within a day or two of the true crossing
    // even after many decades, so a small ±10-day scan for a sign flip is
    // always enough - no directional guessing needed.
    let lowJulianDay = seedJulianDay - 10;
    let lowOffset = signedOffset(lowJulianDay);
    let highJulianDay = lowJulianDay;
    for (let day = -9; day <= 10; day++) {
      highJulianDay = seedJulianDay + day;
      const highOffset = signedOffset(highJulianDay);
      if (Math.sign(highOffset) !== Math.sign(lowOffset)) {
        break;
      }
      lowJulianDay = highJulianDay;
      lowOffset = highOffset;
    }

    for (let i = 0; i < 40; i++) {
      const midJulianDay = (lowJulianDay + highJulianDay) / 2;
      if (signedOffset(midJulianDay) < 0) {
        lowJulianDay = midJulianDay;
      } else {
        highJulianDay = midJulianDay;
      }
    }

    return this.#julianDayToUtcDate(ephemeris, highJulianDay);
  }

  async calculateSunriseSunset(
    datetime: Date,
    latitude: number,
    longitude: number,
    timeZone: string,
  ): Promise<{ sunrise: Date; sunset: Date }> {
    const ephemeris = await this.#getEphemeris();
    // Search from UTC midnight of this LOCAL calendar day (in the birth's own
    // timezone), not the given instant's UTC calendar day — rise_trans searches
    // forward, so searching from the birth time itself would miss that day's
    // sunrise/sunset if the birth occurred after them, and searching from the
    // UTC date can pick the wrong day entirely for births near local midnight
    // in timezones far from UTC.
    const midnightUtc = new Date(Date.UTC(...this.#localDateParts(datetime, timeZone)));
    const julianDay = this.#toJulianDay(ephemeris, midnightUtc);
    const geopos = [longitude, latitude, 0];

    const riseJulianDay = ephemeris.rise_trans(
      julianDay,
      ephemeris.SE_SUN,
      '',
      EPHEMERIS_FLAG_SWISS,
      RISE_TRANSIT_RISE,
      geopos,
      0,
      0,
    );
    const setJulianDay = ephemeris.rise_trans(
      julianDay,
      ephemeris.SE_SUN,
      '',
      EPHEMERIS_FLAG_SWISS,
      RISE_TRANSIT_SET,
      geopos,
      0,
      0,
    );

    if (!riseJulianDay || !setJulianDay) {
      throw new Error('Unable to calculate sunrise/sunset for the given date and location');
    }

    return {
      sunrise: this.#julianDayToUtcDate(ephemeris, riseJulianDay[0]),
      sunset: this.#julianDayToUtcDate(ephemeris, setJulianDay[0]),
    };
  }

  #localDateParts(datetime: Date, timeZone: string): [number, number, number] {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = Object.fromEntries(formatter.formatToParts(datetime).map((part) => [part.type, part.value]));
    return [Number(parts['year']), Number(parts['month']) - 1, Number(parts['day'])];
  }

  #julianDayToUtcDate(ephemeris: SwissEphemeris, julianDay: number): Date {
    const utc = ephemeris.jdut1_to_utc(julianDay, ephemeris.SE_GREG_CAL);
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

  #toGrahaPositions(
    grahaData: Record<Graha, GrahaLongitudeSpeed>,
    toRasi: (longitude: number) => number,
  ): GrahaPosition[] {
    const sunLongitude = grahaData.Sun.longitude;

    return Object.entries(grahaData).map(([graha, { longitude, longitudeSpeed }]) => {
      const combustionOrb = COMBUSTION_ORB_DEG[graha as Graha];
      return {
        graha: graha as Graha,
        longitude,
        rasi: toRasi(longitude),
        isRetrograde: longitudeSpeed < 0,
        isCombust: combustionOrb !== undefined && this.#angularDistance(longitude, sunLongitude) <= combustionOrb,
      };
    });
  }

  #angularDistance(a: number, b: number): number {
    const diff = Math.abs(a - b) % 360;
    return diff > 180 ? 360 - diff : diff;
  }

  async #calculateRawPositions(
    datetime: Date,
    latitude: number,
    longitude: number,
    ayanamsa: Ayanamsa,
  ): Promise<RawPositions> {
    const ephemeris = await this.#getEphemeris();
    ephemeris.set_sid_mode(SIDEREAL_MODE_BY_AYANAMSA[ayanamsa], 0, 0);
    const julianDay = this.#toJulianDay(ephemeris, datetime);

    const grahaData = this.#calculateGrahaData(ephemeris, julianDay);
    const houses = ephemeris.houses_ex(julianDay, EPHEMERIS_FLAG_SIDEREAL, latitude, longitude, 'W');

    return { grahaData, ascendantLongitude: houses.ascmc[0] };
  }

  #calculateGrahaData(ephemeris: SwissEphemeris, julianDay: number): Record<Graha, GrahaLongitudeSpeed> {
    const grahaData = {} as Record<Graha, GrahaLongitudeSpeed>;
    for (const [graha, planetId] of Object.entries(GRAHA_PLANET_IDS)) {
      const [longitude, , , longitudeSpeed] = ephemeris.calc_ut(
        julianDay,
        planetId,
        EPHEMERIS_FLAG_SWISS | EPHEMERIS_FLAG_SIDEREAL | EPHEMERIS_FLAG_SPEED,
      );
      grahaData[graha as Graha] = { longitude, longitudeSpeed };
    }
    grahaData.Ketu = {
      longitude: ephemeris.degnorm(grahaData.Rahu.longitude + 180),
      longitudeSpeed: grahaData.Rahu.longitudeSpeed,
    };
    return grahaData;
  }

  #toJulianDay(ephemeris: SwissEphemeris, datetime: Date): number {
    return ephemeris.julday(
      datetime.getUTCFullYear(),
      datetime.getUTCMonth() + 1,
      datetime.getUTCDate(),
      datetime.getUTCHours() + datetime.getUTCMinutes() / 60,
    );
  }

  #toRasi(longitude: number): number {
    return Math.floor(longitude / 30);
  }

  async #getEphemeris(): Promise<SwissEphemeris> {
    if (this.#swissEphemeris) {
      return this.#swissEphemeris;
    }
    this.#initPromise ??= this.#init();
    return this.#initPromise;
  }

  async #init(): Promise<SwissEphemeris> {
    const { default: SwissEphCtor } = await import(/* @vite-ignore */ SWISSEPH_CDN_URL);
    const ephemeris: SwissEphemeris = new SwissEphCtor();
    await ephemeris.initSwissEph();
    this.#swissEphemeris = ephemeris;
    return ephemeris;
  }
}
