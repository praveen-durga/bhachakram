import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, TemplateRef, viewChild } from '@angular/core';
import { BirthChartService } from '../../shared/services';
import { TableCellContext, TableColumn, TableComponent } from '../../shared/ui';
import { findGraha, GRAHA_ORDER } from '../../shared/utils';
import { PlanetComfortRow } from './planet-comfort.model';
import { buildPlanetComfortRow } from './planet-comfort.util';

@Component({
  selector: 'app-planet-comfort',
  imports: [TableComponent, UpperCasePipe],
  templateUrl: './planet-comfort.component.html',
  styleUrl: './planet-comfort.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetComfortComponent {
  private birthChart = inject(BirthChartService);

  protected starDevataCell = viewChild.required<TemplateRef<TableCellContext<PlanetComfortRow>>>('starDevataCell');
  protected tier3Cell = viewChild.required<TemplateRef<TableCellContext<PlanetComfortRow>>>('tier3Cell');
  protected bandCell = viewChild.required<TemplateRef<TableCellContext<PlanetComfortRow>>>('bandCell');

  protected columns = computed<TableColumn<PlanetComfortRow>[]>(() => [
    { key: 'planet', label: 'Planet' },
    { key: 'starLabel', label: 'Star' },
    { key: 'starDevata', label: 'Star Devata', cellTemplate: this.starDevataCell() },
    { key: 'planetGuna', label: 'Planet Guna' },
    { key: 'starGuna', label: 'Star Guna' },
    { key: 'tier1', label: 'Tier 1' },
    { key: 'tier2', label: 'Tier 2' },
    { key: 'tier3', label: 'Tier 3', cellTemplate: this.tier3Cell() },
    { key: 'total', label: 'Total / 40' },
    { key: 'band', label: 'Band', cellTemplate: this.bandCell() },
  ]);

  protected rows = computed<PlanetComfortRow[]>(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) {
      return [];
    }

    return GRAHA_ORDER.map((graha) => {
      const position = findGraha(d1Chart.grahas, graha);
      return buildPlanetComfortRow(graha, position.longitude, d1Chart.ascendantRasi);
    });
  });
}
