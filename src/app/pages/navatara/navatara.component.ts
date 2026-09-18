import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BirthChartService } from '../../shared/services';
import { CardComponent, SelectComponent, TableColumn, TableComponent } from '../../shared/ui';
import { buildChartBodies, NAKSHATRA_NAMES } from '../../shared/utils';
import { NAVA_TARA_ANCHOR_OPTIONS } from './navatara.data';
import { NavaTaraBodyRow } from './navatara.model';
import { buildNavaTaraBodyRows, buildNavaTaraCards } from './navatara.util';

@Component({
  selector: 'app-navatara',
  imports: [CardComponent, FormsModule, SelectComponent, TableComponent],
  templateUrl: './navatara.component.html',
  styleUrl: './navatara.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavataraComponent {
  private birthChart = inject(BirthChartService);

  #anchor = signal('Moon');

  protected anchorOptions = NAVA_TARA_ANCHOR_OPTIONS;
  protected bodyRowColumns: TableColumn<NavaTaraBodyRow>[] = [
    { key: 'body', label: 'Body' },
    { key: 'nakshatra', label: 'Nakshatra' },
    { key: 'pada', label: 'Pada' },
    { key: 'position', label: 'Position' },
    { key: 'tara', label: 'Tara' },
    { key: 'animal', label: 'Animal' },
  ];
  protected anchor = this.#anchor.asReadonly();

  protected d1Chart = this.birthChart.d1Chart;

  protected bodies = computed(() => {
    const d1Chart = this.d1Chart();
    return d1Chart ? buildChartBodies(d1Chart) : [];
  });

  protected anchorNakshatraIndex = computed(() => {
    const anchorKey = this.anchor();
    return this.bodies().find((body) => body.key === anchorKey)?.nakshatraIndex ?? null;
  });

  protected anchorNakshatraName = computed(() => {
    const index = this.anchorNakshatraIndex();
    return index === null ? '' : NAKSHATRA_NAMES[index];
  });

  protected anchorLabel = computed(
    () => this.anchorOptions.find((option) => option.value === this.anchor())?.label ?? '',
  );

  protected cards = computed(() => {
    const anchorIndex = this.anchorNakshatraIndex();
    return anchorIndex === null ? [] : buildNavaTaraCards(anchorIndex, this.bodies());
  });

  protected bodyRows = computed<NavaTaraBodyRow[]>(() => {
    const anchorIndex = this.anchorNakshatraIndex();
    return anchorIndex === null ? [] : buildNavaTaraBodyRows(anchorIndex, this.bodies());
  });

  protected selectAnchor(value: string): void {
    this.#anchor.set(value);
  }
}
