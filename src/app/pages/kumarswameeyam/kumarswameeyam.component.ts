import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BirthChartService } from '../../shared/services';
import { TableColumn, TableComponent } from '../../shared/ui';
import { buildChartBodies, calculateNakshatra, findGraha, NAKSHATRA_NAMES } from '../../shared/utils';
import { KumaraSwameeyamRow } from './kumarswameeyam.model';
import { buildKumaraSwameeyamRows } from './kumarswameeyam.util';

@Component({
  selector: 'app-kumarswameeyam',
  imports: [TableComponent],
  templateUrl: './kumarswameeyam.component.html',
  styleUrl: './kumarswameeyam.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KumarswameeyamComponent {
  private birthChart = inject(BirthChartService);

  protected columns: TableColumn<KumaraSwameeyamRow>[] = [
    { key: 'position', label: 'Moon Nakshatra Position' },
    { key: 'nakshatra', label: 'Nakshatra' },
    { key: 'indication', label: 'Indication / Result' },
    { key: 'adiDevata', label: 'Adi Devata' },
    { key: 'yogini', label: 'Yogini' },
    { key: 'temple', label: 'Temple' },
    { key: 'gemstone', label: 'Gemstone' },
    { key: 'yantra', label: 'Yantra' },
    { key: 'abhishekam', label: 'Abhishekam' },
    { key: 'bodies', label: 'Bodies here' },
  ];

  protected d1Chart = this.birthChart.d1Chart;

  protected janmaNakshatraIndex = computed(() => {
    const d1Chart = this.d1Chart();
    if (!d1Chart) {
      return null;
    }
    return calculateNakshatra(findGraha(d1Chart.grahas, 'Moon').longitude);
  });

  protected janmaNakshatraName = computed(() => {
    const index = this.janmaNakshatraIndex();
    return index === null ? '' : NAKSHATRA_NAMES[index];
  });

  protected rows = computed<KumaraSwameeyamRow[]>(() => {
    const d1Chart = this.d1Chart();
    const janmaIndex = this.janmaNakshatraIndex();
    if (!d1Chart || janmaIndex === null) {
      return [];
    }
    return buildKumaraSwameeyamRows(janmaIndex, buildChartBodies(d1Chart));
  });
}
