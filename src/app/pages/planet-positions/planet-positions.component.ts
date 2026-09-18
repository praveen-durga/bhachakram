import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { KARMIC_DOSHAS, NAVAMSA_COMBINATION } from '../../shared/data';
import { BirthChartService, EphemerisService, Graha } from '../../shared/services';
import { ButtonComponent, ModalComponent, TableCellContext, TableColumn, TableComponent } from '../../shared/ui';
import {
  calculateD9Rasi,
  findGraha,
  GRAHA_ORDER,
  getMandiInstant,
  MATRIX_PLANETS,
  wallTimeToUtc,
} from '../../shared/utils';
import {
  BhavaPositionColumn,
  CharaKarakaInfo,
  DnaKarmaColumn,
  KarmicDoshaDetails,
  PlanetPositionRow,
} from './planet-positions.model';
import {
  buildBhavaPositionColumns,
  buildDnaKarmaColumns,
  buildRow,
  calculateBhriguBindu,
  calculateChapa,
  calculateCharaKarakas,
  calculateDhuma,
  calculateInduLagna,
  calculateHoraLagna,
  calculateParivesha,
  calculateUpaketu,
  calculateVyatipata,
  formatGrahaBodyLabel,
} from './planet-positions.util';

@Component({
  selector: 'app-planet-positions',
  imports: [ButtonComponent, ModalComponent, TableComponent],
  templateUrl: './planet-positions.component.html',
  styleUrl: './planet-positions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetPositionsComponent {
  private birthChart = inject(BirthChartService);
  private ephemeris = inject(EphemerisService);

  protected bodyCell = viewChild.required<TemplateRef<TableCellContext<PlanetPositionRow>>>('bodyCell');
  protected longitudeCell = viewChild.required<TemplateRef<TableCellContext<PlanetPositionRow>>>('longitudeCell');
  protected nakshatraCell = viewChild.required<TemplateRef<TableCellContext<PlanetPositionRow>>>('nakshatraCell');
  protected characteristicsCell =
    viewChild.required<TemplateRef<TableCellContext<PlanetPositionRow>>>('characteristicsCell');
  protected karmicDoshaCell = viewChild.required<TemplateRef<TableCellContext<PlanetPositionRow>>>('karmicDoshaCell');
  protected karmicPlanetCell = viewChild.required<TemplateRef<TableCellContext<PlanetPositionRow>>>('karmicPlanetCell');

  #selectedDosha = signal<KarmicDoshaDetails | null>(null);
  #selectedKarmicPlanetResults = signal<string | null>(null);
  #specialPointRows = signal<PlanetPositionRow[]>([]);
  #grahaKarakas = signal<Partial<Record<Graha, CharaKarakaInfo>>>({});

  protected selectedDosha = this.#selectedDosha.asReadonly();
  protected selectedKarmicPlanetResults = this.#selectedKarmicPlanetResults.asReadonly();
  protected specialPointRows = this.#specialPointRows.asReadonly();
  protected grahaKarakas = this.#grahaKarakas.asReadonly();

  protected columns = computed<TableColumn<PlanetPositionRow>[]>(() => [
    { key: 'body', label: 'Body', cellTemplate: this.bodyCell() },
    { key: 'longitude', label: 'Longitude', cellTemplate: this.longitudeCell() },
    { key: 'nakshatra', label: 'Nakshatra', cellTemplate: this.nakshatraCell() },
    { key: 'pada', label: 'Pada' },
    { key: 'rasi', label: 'Rasi (D1)' },
    { key: 'navamsa', label: 'Navamsa (D9)' },
    { key: 'rasiCombination', label: 'Rasi Combination' },
    { key: 'characteristics', label: 'Characteristics', cellTemplate: this.characteristicsCell() },
    { key: 'careerPath', label: 'Career Path' },
    { key: 'hasKarmicDosha', label: 'Karmic Dosha', cellTemplate: this.karmicDoshaCell() },
    { key: 'karmicPlanet', label: 'Karmic Planet', cellTemplate: this.karmicPlanetCell() },
  ]);

  protected rows = computed<PlanetPositionRow[]>(() => {
    const d1Chart = this.birthChart.d1Chart();
    const d9Chart = this.birthChart.d9Chart();
    if (!d1Chart || !d9Chart) {
      return [];
    }

    const ascendantLongitude = d1Chart.ascendantLongitude ?? 0;

    const ascendantRow = buildRow(
      'Ascendant',
      ascendantLongitude,
      d1Chart.ascendantRasi,
      d9Chart.ascendantRasi,
      ascendantLongitude,
    );

    const grahaRows = GRAHA_ORDER.map((graha) => {
      const d1Graha = findGraha(d1Chart.grahas, graha);
      const d9Graha = findGraha(d9Chart.grahas, graha);
      return buildRow(graha, d1Graha.longitude, d1Graha.rasi, d9Graha.rasi, ascendantLongitude);
    });

    return [ascendantRow, ...grahaRows];
  });

  protected allRows = computed<PlanetPositionRow[]>(() => [...this.rows(), ...this.specialPointRows()]);

  protected bhavaPositionColumns = computed<BhavaPositionColumn[]>(() => {
    const d1Chart = this.birthChart.d1Chart();
    const d9Chart = this.birthChart.d9Chart();
    if (!d1Chart || !d9Chart) {
      return [];
    }

    return buildBhavaPositionColumns(d1Chart, d9Chart, this.rows());
  });

  protected dnaKarmaColumns = computed<DnaKarmaColumn[]>(() => {
    const d1Chart = this.birthChart.d1Chart();
    return d1Chart ? buildDnaKarmaColumns(d1Chart) : [];
  });

  protected matrixPlanets = MATRIX_PLANETS;

  protected planetMatrix = computed<Record<string, number>>(() => {
    const matrix: Record<string, number> = {};

    for (const row of this.rows()) {
      const name = row.body === 'Ascendant' ? 'As' : row.body;
      const navamsaIndex = NAVAMSA_COMBINATION[row.rasiIndex][row.navamsaRasiIndex];
      if (navamsaIndex) {
        matrix[name] = navamsaIndex;
      }
    }

    return matrix;
  });

  protected hoveredRow = signal<number | null>(null);
  protected hoveredCol = signal<number | null>(null);

  constructor() {
    effect(() => {
      const d1Chart = this.birthChart.d1Chart();
      const sunTimes = this.birthChart.sunTimes();
      const details = this.birthChart.birthDetails();

      if (!d1Chart || !sunTimes || !details) {
        this.#specialPointRows.set([]);
        this.#grahaKarakas.set({});
        return;
      }

      const moon = findGraha(d1Chart.grahas, 'Moon');
      const rahu = findGraha(d1Chart.grahas, 'Rahu');
      const sun = findGraha(d1Chart.grahas, 'Sun');
      const weekday = new Date(details.dob).getUTCDay();
      const birthTime = wallTimeToUtc(details.dob, details.tob, details.timezone);

      const bhriguBinduLongitude = calculateBhriguBindu(moon.longitude, rahu.longitude);
      const induLagnaRasi = calculateInduLagna(d1Chart.ascendantRasi, moon.rasi);
      const dhumaLongitude = calculateDhuma(sun.longitude);
      const vyatipataLongitude = calculateVyatipata(dhumaLongitude);
      const pariveshaLongitude = calculateParivesha(vyatipataLongitude);
      const chapaLongitude = calculateChapa(pariveshaLongitude);
      const upaketuLongitude = calculateUpaketu(chapaLongitude);

      const mandiInstant = getMandiInstant(birthTime, sunTimes, weekday);

      Promise.all([
        this.ephemeris.calculateAscendant(mandiInstant, details.lat, details.lng, details.ayanamsa),
        this.ephemeris.calculateGrahaEphemerisData(sunTimes.sunrise, details.ayanamsa),
        this.ephemeris.calculateGrahaEphemerisData(birthTime, details.ayanamsa),
      ]).then(([mandiLongitude, sunriseEphemeris, birthEphemeris]) => {
        const horaLagnaLongitude = calculateHoraLagna(
          sunriseEphemeris.grahas.Sun.longitude,
          birthTime,
          sunTimes.sunrise,
        );

        const points: [string, number][] = [
          ['Mandi', mandiLongitude],
          ['Hora Lagna', horaLagnaLongitude],
          ['Indu Lagna*', induLagnaRasi * 30],
          ['Bhrigu Bindu', bhriguBinduLongitude],
          ['Dhuma', dhumaLongitude],
          ['Vyatipata', vyatipataLongitude],
          ['Parivesha', pariveshaLongitude],
          ['Chapa', chapaLongitude],
          ['Upaketu', upaketuLongitude],
        ];

        const ascendantLongitude = d1Chart.ascendantLongitude ?? 0;

        this.#specialPointRows.set(
          points.map(([body, longitude]) =>
            buildRow(body, longitude, Math.floor(longitude / 30), calculateD9Rasi(longitude), ascendantLongitude),
          ),
        );

        this.#grahaKarakas.set(calculateCharaKarakas(d1Chart, birthEphemeris.grahas));
      });
    });
  }

  protected bodyLabel(body: string): string {
    return formatGrahaBodyLabel(body, this.grahaKarakas()[body as Graha]);
  }

  protected setHover(row: number | null, col: number | null): void {
    this.hoveredRow.set(row);
    this.hoveredCol.set(col);
  }

  protected getCellBg(rowIndex: number, colIndex: number): string {
    if (this.hoveredRow() === rowIndex && this.hoveredCol() === colIndex) {
      return '#ffeb3b';
    }
    if (this.hoveredRow() === rowIndex || this.hoveredCol() === colIndex) {
      return '#fff3cd';
    }
    return 'transparent';
  }

  protected matrixCell(rowPlanet: string, colPlanet: string): string {
    if (rowPlanet === colPlanet) {
      return 'X';
    }
    const matrix = this.planetMatrix();
    const rowVal = matrix[rowPlanet];
    const colVal = matrix[colPlanet];
    if (rowVal === undefined || colVal === undefined) {
      return '';
    }
    const diff = colVal - rowVal;
    return String((diff < 0 ? diff + 108 : diff) + 1);
  }

  protected openDosha(row: PlanetPositionRow): void {
    const dosha = KARMIC_DOSHAS[row.nakshatraIndex];
    this.#selectedDosha.set({ ...dosha, rasi: row.rasi });
  }

  protected closeDosha(): void {
    this.#selectedDosha.set(null);
  }

  protected openKarmicResults(html: string): void {
    this.#selectedKarmicPlanetResults.set(html);
  }

  protected closeKarmicResults(): void {
    this.#selectedKarmicPlanetResults.set(null);
  }
}
