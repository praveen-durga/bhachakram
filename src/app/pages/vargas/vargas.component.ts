import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { BirthChartService } from '../../shared/services';
import { ButtonComponent, RasiChartComponent } from '../../shared/ui';
import { UNVERIFIED_VARGA_KEYS, VARGA_OPTIONS } from './vargas.data';
import { buildModalityGradeRows, buildRasiDistanceRows, buildVargaChart } from './vargas.util';

@Component({
  selector: 'app-vargas',
  imports: [ButtonComponent, RasiChartComponent],
  templateUrl: './vargas.component.html',
  styleUrl: './vargas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VargasComponent {
  private birthChart = inject(BirthChartService);

  #selectedKey = signal(VARGA_OPTIONS[0].key);

  protected vargaOptions = VARGA_OPTIONS;
  protected unverifiedVargaKeys = UNVERIFIED_VARGA_KEYS;
  protected selectedKey = this.#selectedKey.asReadonly();
  protected d1Chart = this.birthChart.d1Chart;

  protected selectedOption = computed(
    () => this.vargaOptions.find((option) => option.key === this.selectedKey()) ?? this.vargaOptions[0],
  );

  protected selectedVargaChart = computed(() => {
    const d1Chart = this.d1Chart();
    return d1Chart ? buildVargaChart(d1Chart, this.selectedOption().calculateRasi) : null;
  });

  protected rasiDistanceRows = computed(() => {
    const d1Chart = this.d1Chart();
    return d1Chart ? buildRasiDistanceRows(d1Chart, this.vargaOptions) : [];
  });

  protected modalityGradeRows = computed(() => {
    const d1Chart = this.d1Chart();
    return d1Chart ? buildModalityGradeRows(d1Chart, this.vargaOptions) : [];
  });

  protected selectVarga(key: string): void {
    this.#selectedKey.set(key);
  }
}
