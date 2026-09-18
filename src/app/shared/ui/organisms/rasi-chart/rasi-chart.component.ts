import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ChartStyle } from '../../../models';
import { ChartStyleService, D1Chart, Graha, GrahaPosition } from '../../../services';
import { formatDegreeInRasi } from '../../../utils';
import {
  GRAHA_LABEL_POSITIONS_BY_STYLE,
  RASI_LABEL_POSITIONS_BY_STYLE,
  REGION_POLYGONS_BY_STYLE,
} from './rasi-chart-coordinates';
import { GrahaLabelPosition, RasiHouseRegion } from './rasi-chart.model';

// Re-exported here (rather than from a barrel entry of its own) since
// ashtakavarga-chart.component.ts is the one external consumer of the north
// coordinates, importing them via shared/ui's existing re-export of this file.
export * from './rasi-chart-coordinates';

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

// North Indian rotates rasi positions around the Ascendant; South Indian's
// rasi cells are fixed regardless of Ascendant, per the classical convention.
const IS_FIXED_RASI_STYLE: Record<ChartStyle, boolean> = {
  north: false,
  south: true,
  east: false,
};

type PendingLabel = { baseText: string; isCombust: boolean; degreeSuffix: string };

@Component({
  selector: 'app-rasi-chart',
  templateUrl: './rasi-chart.component.html',
  styleUrl: './rasi-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RasiChartComponent {
  private chartStyleService = inject(ChartStyleService);

  chartData = input.required<D1Chart>();
  dagdhaRasis = input<number[]>([]);
  munthaRasi = input<number | null>(null);
  showDegrees = input<boolean>(true);

  protected chartStyle = this.chartStyleService.style;

  protected regions = computed<RasiHouseRegion[]>(() => {
    const { ascendantRasi, ascendantLongitude, grahas } = this.chartData();
    const dagdhaRasis = this.dagdhaRasis();
    const munthaRasi = this.munthaRasi();
    const showDegrees = this.showDegrees();
    const chartStyle = this.chartStyle();
    const isFixedRasi = IS_FIXED_RASI_STYLE[chartStyle];
    const regionPolygons = REGION_POLYGONS_BY_STYLE[chartStyle];
    const rasiLabelPositions = RASI_LABEL_POSITIONS_BY_STYLE[chartStyle];
    const grahaLabelPositions = GRAHA_LABEL_POSITIONS_BY_STYLE[chartStyle];

    return regionPolygons.map((_, position) => {
      // North Indian rotates: array position 0 is always the Ascendant's
      // house, and rasi walks backward from it. South Indian is fixed: array
      // position IS the rasi directly (position 0 = Aries), never rotated.
      const rasi = isFixedRasi ? position : (((ascendantRasi - position) % 12) + 12) % 12;
      const [rasiX, rasiY] = rasiLabelPositions[position];
      const [grahaX, grahaY, stackDirection, grahaTextAnchor] = grahaLabelPositions[position];

      const labels: PendingLabel[] = grahas
        .filter((g) => g.rasi === rasi)
        .map((g) => this.buildGrahaLabel(g, showDegrees));

      if (dagdhaRasis.includes(rasi)) {
        labels.unshift({ baseText: '🔥', isCombust: false, degreeSuffix: '' });
      }

      if (munthaRasi === rasi) {
        labels.unshift({ baseText: 'Mu', isCombust: false, degreeSuffix: '' });
      }

      // North: the Ascendant's house is always array position 0 (by
      // construction of the rotation above). South: rasi cells are fixed, so
      // the Ascendant marker goes wherever its own rasi's cell is.
      const isAscendantHouse = isFixedRasi ? rasi === ascendantRasi : position === 0;
      if (isAscendantHouse) {
        const degreeSuffix =
          showDegrees && ascendantLongitude !== undefined ? ` ${formatDegreeInRasi(ascendantLongitude)}` : '';
        labels.unshift({ baseText: 'Asc', isCombust: false, degreeSuffix });
      }

      const grahaLabels: GrahaLabelPosition[] = labels.map((label, i) => ({
        ...label,
        x: grahaX,
        y: grahaY + stackDirection * i * 15,
      }));

      return { rasi: rasi + 1, rasiLabelX: rasiX, rasiLabelY: rasiY, grahaTextAnchor, grahaLabels };
    });
  });

  private buildGrahaLabel(graha: GrahaPosition, showDegrees: boolean): PendingLabel {
    const abbreviation = GRAHA_ABBREVIATIONS[graha.graha];
    const baseText = graha.isRetrograde ? `(${abbreviation})` : abbreviation;
    const degreeSuffix = showDegrees ? ` ${formatDegreeInRasi(graha.longitude)}` : '';

    return { baseText, isCombust: graha.isCombust, degreeSuffix };
  }
}
