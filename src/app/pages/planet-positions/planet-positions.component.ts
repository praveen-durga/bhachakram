import { ChangeDetectionStrategy, Component, computed, inject, signal, TemplateRef, viewChild } from '@angular/core';
import {
  KARMIC_DOSHAS,
  KARMIC_NAKSHATRAS,
  KARMIC_PLANETS,
  NAKSHATRA_PADA_DATA,
  NAVAMSA_COMBINATION,
} from '../../shared/data';
import { BirthChartService, Graha, GrahaPosition } from '../../shared/services';
import { ButtonComponent, ModalComponent, TableCellContext, TableColumn, TableComponent } from '../../shared/ui';
import {
  calculateNakshatra,
  calculatePada,
  formatDegreeInRasi,
  getRasiDistances,
  GRAHA_ORDER,
  MATRIX_PLANETS,
  NAKSHATRA_NAMES,
  RASI_NAMES,
} from '../../shared/utils';
import { KarmicDoshaDetails, PlanetPositionRow } from './planet-positions.model';

function buildRow(body: string, longitude: number, rasiIndex: number, navamsaRasiIndex: number): PlanetPositionRow {
  const nakshatraIndex = calculateNakshatra(longitude);
  const pada = calculatePada(longitude);
  const { forward, backward, isVargottam } = getRasiDistances(rasiIndex, navamsaRasiIndex);
  const padaInfo = NAKSHATRA_PADA_DATA[nakshatraIndex][pada as 1 | 2 | 3 | 4];
  const hasKarmicDosha = KARMIC_NAKSHATRAS[rasiIndex].includes(nakshatraIndex);

  let karmicPlanet = '';
  let karmicPlanetResults = '';
  for (const [planet, data] of Object.entries(KARMIC_PLANETS)) {
    if (data.stars.includes(nakshatraIndex)) {
      karmicPlanet = planet;
      karmicPlanetResults = data.result;
    }
  }

  return {
    body,
    longitude: `${RASI_NAMES[rasiIndex]} ${formatDegreeInRasi(longitude)}`,
    nakshatra: NAKSHATRA_NAMES[nakshatraIndex],
    pada,
    rasi: RASI_NAMES[rasiIndex],
    navamsa: RASI_NAMES[navamsaRasiIndex],
    rasiCombination: `${forward},${backward}${isVargottam ? ' (Vargottam)' : ''}`,
    characteristics: padaInfo.characteristics,
    careerPath: padaInfo.careerPath,
    hasKarmicDosha,
    nakshatraIndex,
    rasiIndex,
    navamsaRasiIndex,
    karmicPlanet,
    karmicPlanetResults,
  };
}

function findGraha(grahas: GrahaPosition[], graha: Graha): GrahaPosition {
  const found = grahas.find((g) => g.graha === graha);
  if (!found) {
    throw new Error(`Missing graha position for ${graha}`);
  }
  return found;
}

@Component({
  selector: 'app-planet-positions',
  imports: [ButtonComponent, ModalComponent, TableComponent],
  templateUrl: './planet-positions.component.html',
  styleUrl: './planet-positions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetPositionsComponent {
  private birthChart = inject(BirthChartService);

  protected karmicDoshaCell = viewChild.required<TemplateRef<TableCellContext<PlanetPositionRow>>>('karmicDoshaCell');
  protected karmicPlanetCell = viewChild.required<TemplateRef<TableCellContext<PlanetPositionRow>>>('karmicPlanetCell');

  #selectedDosha = signal<KarmicDoshaDetails | null>(null);
  #selectedKarmicPlanetResults = signal<string | null>(null);

  protected selectedDosha = this.#selectedDosha.asReadonly();
  protected selectedKarmicPlanetResults = this.#selectedKarmicPlanetResults.asReadonly();

  protected columns = computed<TableColumn<PlanetPositionRow>[]>(() => [
    { key: 'body', label: 'Body' },
    { key: 'longitude', label: 'Longitude' },
    { key: 'nakshatra', label: 'Nakshatra' },
    { key: 'pada', label: 'Pada' },
    { key: 'rasi', label: 'Rasi (D1)' },
    { key: 'navamsa', label: 'Navamsa (D9)' },
    { key: 'rasiCombination', label: 'Rasi Combination' },
    { key: 'characteristics', label: 'Characteristics' },
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

    const ascendantRow = buildRow(
      'Ascendant',
      d1Chart.ascendantLongitude ?? 0,
      d1Chart.ascendantRasi,
      d9Chart.ascendantRasi,
    );

    const grahaRows = GRAHA_ORDER.map((graha) => {
      const d1Graha = findGraha(d1Chart.grahas, graha);
      const d9Graha = findGraha(d9Chart.grahas, graha);
      return buildRow(graha, d1Graha.longitude, d1Graha.rasi, d9Graha.rasi);
    });

    return [ascendantRow, ...grahaRows];
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
