import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BirthChartService } from '../../shared/services';
import { RasiChartNorthIndianComponent } from '../../shared/ui';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [RasiChartNorthIndianComponent],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent {
  protected birthChart = inject(BirthChartService);
}
