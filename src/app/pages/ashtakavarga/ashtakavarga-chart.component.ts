import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NORTH_RASI_LABEL_POSITIONS, NORTH_REGION_POLYGONS } from '../../shared/ui';

// [x, y] — visual centroid of each region, for centering a single bold
// bindu digit (unlike app-rasi-chart's graha-label positions, which are
// tuned as top-anchor start points for stacking multiple lines of text).
const NORTH_HOUSE_CENTERS: [number, number][] = [
  [200, 100],
  [300, 33],
  [367, 100],
  [300, 200],
  [367, 300],
  [300, 367],
  [200, 300],
  [100, 367],
  [33, 300],
  [100, 200],
  [33, 100],
  [100, 33],
];

type AshtakavargaHouseRegion = {
  rasi: number;
  rasiLabelX: number;
  rasiLabelY: number;
  bindusX: number;
  bindusY: number;
  bindus: number;
};

@Component({
  selector: 'app-ashtakavarga-chart',
  templateUrl: './ashtakavarga-chart.component.html',
  styleUrl: './ashtakavarga-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AshtakavargaChartComponent {
  ascendantRasi = input.required<number>();
  bindusByRasi = input.required<number[]>();

  protected regions = computed<AshtakavargaHouseRegion[]>(() => {
    const ascendantRasi = this.ascendantRasi();
    const bindusByRasi = this.bindusByRasi();

    return NORTH_REGION_POLYGONS.map((_, position) => {
      const rasi = (((ascendantRasi - position) % 12) + 12) % 12;
      const [rasiX, rasiY] = NORTH_RASI_LABEL_POSITIONS[position];
      const [bindusX, bindusY] = NORTH_HOUSE_CENTERS[position];

      return { rasi: rasi + 1, rasiLabelX: rasiX, rasiLabelY: rasiY, bindusX, bindusY, bindus: bindusByRasi[rasi] };
    });
  });
}
