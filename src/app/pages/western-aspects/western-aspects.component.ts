import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BirthChartService } from '../../shared/services';
import { WESTERN_ASPECT_GRAHA_ORDER } from './western-aspects.data';
import { WesternAspectRow } from './western-aspects.model';
import { buildWesternAspectRows } from './western-aspects.util';

@Component({
  selector: 'app-western-aspects',
  imports: [DecimalPipe],
  templateUrl: './western-aspects.component.html',
  styleUrl: './western-aspects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WesternAspectsComponent {
  private birthChart = inject(BirthChartService);

  protected columns = WESTERN_ASPECT_GRAHA_ORDER;

  protected rows = computed<WesternAspectRow[] | null>(() => {
    const d1Chart = this.birthChart.d1Chart();
    return d1Chart ? buildWesternAspectRows(d1Chart) : null;
  });
}
