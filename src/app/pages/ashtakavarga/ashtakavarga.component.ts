import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BirthChartService } from '../../shared/services';
import { AshtakavargaChartComponent } from './ashtakavarga-chart.component';
import { UNVERIFIED_ASHTAKAVARGA_TARGETS } from './ashtakavarga.data';
import { buildBhinnashtakavargaCharts, buildSarvashtakavargaChart } from './ashtakavarga.util';

@Component({
  selector: 'app-ashtakavarga',
  imports: [AshtakavargaChartComponent],
  templateUrl: './ashtakavarga.component.html',
  styleUrl: './ashtakavarga.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AshtakavargaComponent {
  private birthChart = inject(BirthChartService);

  protected unverifiedTargets = UNVERIFIED_ASHTAKAVARGA_TARGETS;
  protected d1Chart = this.birthChart.d1Chart;
  protected ascendantRasi = computed(() => this.d1Chart()?.ascendantRasi ?? 0);

  protected bavCharts = computed(() => {
    const d1Chart = this.d1Chart();
    return d1Chart ? buildBhinnashtakavargaCharts(d1Chart) : [];
  });

  protected savChart = computed(() => {
    const bavCharts = this.bavCharts();
    return bavCharts.length > 0 ? buildSarvashtakavargaChart(bavCharts) : null;
  });
}
