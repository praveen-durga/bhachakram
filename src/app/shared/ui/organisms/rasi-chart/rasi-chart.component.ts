import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { D1Chart, Graha } from '../../../services';
import { formatDegreeInRasi } from '../../../utils';
import { ChartStyle, GrahaLabelPosition, RasiHouseRegion, TextAnchor } from './rasi-chart.model';

const GRAHA_ABBREVIATIONS: Record<Graha, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

export const NORTH_REGION_POLYGONS = [
  '200,0 300,100 200,200 100,100',
  '400,0 200,0 300,100',
  '400,0 400,200 300,100',
  '400,200 300,100 200,200 300,300',
  '400,200 400,400 300,300',
  '400,400 200,400 300,300',
  '200,400 300,300 200,200 100,300',
  '0,400 200,400 100,300',
  '0,200 0,400 100,300',
  '0,200 100,100 200,200 100,300',
  '0,0 0,200 100,100',
  '0,0 200,0 100,100',
];

// [x, y] — where each region's rasi number is placed.
export const NORTH_RASI_LABEL_POSITIONS: [number, number][] = [
  [200, 18],
  [370, 18],
  [385, 35],
  [385, 205],
  [385, 375],
  [305, 320],
  [200, 380],
  [30, 392],
  [15, 365],
  [15, 205],
  [15, 40],
  [30, 20],
];

// [x, y, stackDirection, textAnchor] — graha labels for a region start stacking from
// (x, y) toward the region's roomier center-facing side (+1 = downward, -1 = upward),
// independent of where that region's own rasi number sits.
const NORTH_GRAHA_LABEL_POSITIONS: [number, number, number, TextAnchor][] = [
  [200, 55, 1, 'middle'],
  [320, 20, 1, 'end'],
  [390, 75, 1, 'end'],
  [320, 150, -1, 'end'],
  [395, 330, -1, 'end'],
  [325, 345, 1, 'end'],
  [200, 345, -1, 'middle'],
  [70, 390, -1, 'start'],
  [10, 335, -1, 'start'],
  [60, 165, -1, 'start'],
  [10, 75, 1, 'start'],
  [70, 20, 1, 'start'],
];

// south/east geometry is not designed yet (awaiting reference images) — they
// temporarily alias north's layout so the chartStyle input has something to
// render rather than being unusable.
const REGION_POLYGONS_BY_STYLE: Record<ChartStyle, string[]> = {
  north: NORTH_REGION_POLYGONS,
  south: NORTH_REGION_POLYGONS,
  east: NORTH_REGION_POLYGONS,
};

const RASI_LABEL_POSITIONS_BY_STYLE: Record<ChartStyle, [number, number][]> = {
  north: NORTH_RASI_LABEL_POSITIONS,
  south: NORTH_RASI_LABEL_POSITIONS,
  east: NORTH_RASI_LABEL_POSITIONS,
};

const GRAHA_LABEL_POSITIONS_BY_STYLE: Record<ChartStyle, [number, number, number, TextAnchor][]> = {
  north: NORTH_GRAHA_LABEL_POSITIONS,
  south: NORTH_GRAHA_LABEL_POSITIONS,
  east: NORTH_GRAHA_LABEL_POSITIONS,
};

@Component({
  selector: 'app-rasi-chart',
  templateUrl: './rasi-chart.component.html',
  styleUrl: './rasi-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RasiChartComponent {
  chartData = input.required<D1Chart>();
  chartStyle = input<ChartStyle>('north');
  dagdhaRasis = input<number[]>([]);

  protected regions = computed<RasiHouseRegion[]>(() => {
    const { ascendantRasi, ascendantLongitude, grahas } = this.chartData();
    const dagdhaRasis = this.dagdhaRasis();
    const regionPolygons = REGION_POLYGONS_BY_STYLE[this.chartStyle()];
    const rasiLabelPositions = RASI_LABEL_POSITIONS_BY_STYLE[this.chartStyle()];
    const grahaLabelPositions = GRAHA_LABEL_POSITIONS_BY_STYLE[this.chartStyle()];

    return regionPolygons.map((_, position) => {
      const rasi = (((ascendantRasi - position) % 12) + 12) % 12;
      const [rasiX, rasiY] = rasiLabelPositions[position];
      const [grahaX, grahaY, stackDirection, grahaTextAnchor] = grahaLabelPositions[position];

      const labelTexts = grahas
        .filter((g) => g.rasi === rasi)
        .map((g) => `${GRAHA_ABBREVIATIONS[g.graha]} ${formatDegreeInRasi(g.longitude)}`);

      if (dagdhaRasis.includes(rasi)) {
        labelTexts.unshift('🔥');
      }

      if (position === 0) {
        const ascText = ascendantLongitude === undefined ? 'Asc' : `Asc ${formatDegreeInRasi(ascendantLongitude)}`;
        labelTexts.unshift(ascText);
      }

      const grahaLabels: GrahaLabelPosition[] = labelTexts.map((text, i) => ({
        text,
        x: grahaX,
        y: grahaY + stackDirection * i * 15,
      }));

      return { rasi: rasi + 1, rasiLabelX: rasiX, rasiLabelY: rasiY, grahaTextAnchor, grahaLabels };
    });
  });
}
