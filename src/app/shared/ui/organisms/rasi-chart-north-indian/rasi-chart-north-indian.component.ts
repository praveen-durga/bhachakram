import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { D1Chart, Graha } from '../../../services';
import { RasiHouseRegion } from './rasi-chart-north-indian.model';

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

const REGION_POLYGONS = [
  '200,0 300,100 200,200 100,100',
  '400,0 200,0 300,100',
  '400,0 400,200 300,100',
  '400,200 300,100 200,200 300,300',
  '400,200 400,400 300,300',
  '400,400 200,400 300,300',
  '200,400 300,300 200,200 100,300',
  '0,400 200,400 100,300',
  '0,200 0,400 100,300',
  '0,200 100,100 200,200 100,300',
  '0,0 0,200 100,100',
  '0,0 200,0 100,100',
];

const REGION_LABEL_POSITIONS: [number, number][] = [
  [200, 85],
  [300, 45],
  [355, 100],
  [300, 185],
  [355, 300],
  [300, 355],
  [200, 285],
  [100, 355],
  [45, 300],
  [100, 185],
  [45, 100],
  [100, 45],
];

@Component({
  selector: 'app-rasi-chart-north-indian',
  templateUrl: './rasi-chart-north-indian.component.html',
  styleUrl: './rasi-chart-north-indian.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RasiChartNorthIndianComponent {
  chart = input.required<D1Chart>();

  protected regions = computed<RasiHouseRegion[]>(() => {
    const { ascendantRasi, grahas } = this.chart();

    return REGION_POLYGONS.map((_, position) => {
      const rasi = (((ascendantRasi - position) % 12) + 12) % 12;
      const grahaLabel = grahas
        .filter((g) => g.rasi === rasi)
        .map((g) => GRAHA_ABBREVIATIONS[g.graha])
        .join(', ');
      const [labelX, labelY] = REGION_LABEL_POSITIONS[position];
      return { rasi: rasi + 1, grahaLabel, labelX, labelY };
    });
  });
}
