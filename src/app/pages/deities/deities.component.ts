import { ChangeDetectionStrategy, Component, computed, inject, TemplateRef, viewChild } from '@angular/core';
import { BirthChartService } from '../../shared/services';
import { TableCellContext, TableColumn, TableComponent } from '../../shared/ui';
import { findGraha, GRAHA_ORDER } from '../../shared/utils';
import { D3_DEITY_COLORS, D9_DEITY_COLORS, D12_DEITY_COLORS } from './deities.data';
import { DeityRow } from './deities.model';
import { buildDeityRow } from './deities.util';

@Component({
  selector: 'app-deities',
  imports: [TableComponent],
  templateUrl: './deities.component.html',
  styleUrl: './deities.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeitiesComponent {
  private birthChart = inject(BirthChartService);

  protected d3Cell = viewChild.required<TemplateRef<TableCellContext<DeityRow>>>('d3Cell');
  protected d9Cell = viewChild.required<TemplateRef<TableCellContext<DeityRow>>>('d9Cell');
  protected d12Cell = viewChild.required<TemplateRef<TableCellContext<DeityRow>>>('d12Cell');
  protected d60Cell = viewChild.required<TemplateRef<TableCellContext<DeityRow>>>('d60Cell');

  protected d3Colors = D3_DEITY_COLORS;
  protected d9Colors = D9_DEITY_COLORS;
  protected d12Colors = D12_DEITY_COLORS;

  protected columns = computed<TableColumn<DeityRow>[]>(() => [
    { key: 'body', label: 'Body' },
    { key: 'd3', label: 'D3', cellTemplate: this.d3Cell() },
    { key: 'd4', label: 'D4' },
    { key: 'd9', label: 'D9', cellTemplate: this.d9Cell() },
    { key: 'd10', label: 'D10' },
    { key: 'd12', label: 'D12', cellTemplate: this.d12Cell() },
    { key: 'd16', label: 'D16' },
    { key: 'd24', label: 'D24' },
    { key: 'd30', label: 'D30' },
    { key: 'd45', label: 'D45' },
    { key: 'd60', label: 'D60', cellTemplate: this.d60Cell() },
  ]);

  protected rows = computed<DeityRow[]>(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) {
      return [];
    }

    const ascendantRow = buildDeityRow('Ascendant', d1Chart.ascendantLongitude ?? 0);
    const grahaRows = GRAHA_ORDER.map((graha) => buildDeityRow(graha, findGraha(d1Chart.grahas, graha).longitude));

    return [ascendantRow, ...grahaRows];
  });
}
