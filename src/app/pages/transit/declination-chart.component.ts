import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Graha } from '../../shared/services';
import { GRAHA_ABBREVIATIONS } from '../../shared/utils';
import { DeclinationChartData, DeclinationSeries } from './declination.model';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MARGIN = { top: 12, right: 44, bottom: 28, left: 36 };
const CHART_WIDTH = 900;
const CHART_HEIGHT = 360;
const PLOT_WIDTH = CHART_WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
const Y_AXIS_STEP_DEG = 5;

type PlottedPoint = { x: number; y: number; dayOfYear: number; value: number; date: Date };
type PlottedSeries = DeclinationSeries & { path: string; endLabel: PlottedPoint };
type MonthTick = { label: string; x: number };
type YTick = { value: number; y: number };
type HoverInfo = { x: number; date: Date; entries: { graha: Graha; color: string; dashed: boolean; value: number }[] };

@Component({
  selector: 'app-declination-chart',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './declination-chart.component.html',
  styleUrl: './declination-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeclinationChartComponent {
  data = input.required<DeclinationChartData>();

  #hiddenGrahas = signal<Set<Graha>>(new Set());
  #hoverDayIndex = signal<number | null>(null);

  protected grahaAbbreviations = GRAHA_ABBREVIATIONS;

  protected chartWidth = CHART_WIDTH;
  protected chartHeight = CHART_HEIGHT;
  protected plotLeft = MARGIN.left;
  protected plotTop = MARGIN.top;
  protected plotWidth = PLOT_WIDTH;
  protected plotHeight = PLOT_HEIGHT;

  protected yDomain = computed(() => {
    const { minValue, maxValue } = this.data();
    const lower = Math.floor((minValue - 2) / Y_AXIS_STEP_DEG) * Y_AXIS_STEP_DEG;
    const upper = Math.ceil((maxValue + 2) / Y_AXIS_STEP_DEG) * Y_AXIS_STEP_DEG;
    return { lower, upper };
  });

  protected yTicks = computed<YTick[]>(() => {
    const { lower, upper } = this.yDomain();
    const ticks: YTick[] = [];
    for (let value = lower; value <= upper; value += Y_AXIS_STEP_DEG) {
      ticks.push({ value, y: this.#yForValue(value) });
    }
    return ticks;
  });

  protected monthTicks = computed<MonthTick[]>(() => {
    const { year } = this.data();
    return MONTH_LABELS.map((label, monthIndex) => ({
      label,
      x: this.#xForDay(this.#dayOfYear(Date.UTC(year, monthIndex, 1), year)),
    }));
  });

  protected plottedSeries = computed<PlottedSeries[]>(() => {
    const hidden = this.#hiddenGrahas();
    return this.data()
      .series.filter((series) => !hidden.has(series.graha))
      .map((series) => {
        const plotted = series.points.map((point) => ({
          x: this.#xForDay(point.dayOfYear),
          y: this.#yForValue(point.value),
          dayOfYear: point.dayOfYear,
          value: point.value,
          date: point.date,
        }));
        const path = plotted
          .map((p, index) => `${index === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
          .join(' ');
        return { ...series, path, endLabel: plotted[plotted.length - 1] };
      });
  });

  protected hoverInfo = computed<HoverInfo | null>(() => {
    const dayIndex = this.#hoverDayIndex();
    const series = this.plottedSeries();
    if (dayIndex === null || series.length === 0) {
      return null;
    }

    const referencePoints = this.data().series[0].points;
    const clampedIndex = Math.max(0, Math.min(dayIndex, referencePoints.length - 1));
    const date = referencePoints[clampedIndex].date;

    return {
      x: this.#xForDay(referencePoints[clampedIndex].dayOfYear),
      date,
      entries: series.map((s) => ({
        graha: s.graha,
        color: s.color,
        dashed: s.dashed,
        value: s.points[clampedIndex].value,
      })),
    };
  });

  protected isHidden(graha: Graha): boolean {
    return this.#hiddenGrahas().has(graha);
  }

  protected toggleGraha(graha: Graha): void {
    const next = new Set(this.#hiddenGrahas());
    if (next.has(graha)) {
      next.delete(graha);
    } else {
      next.add(graha);
    }
    this.#hiddenGrahas.set(next);
  }

  protected onPointerMove(event: PointerEvent, svgElement: Element): void {
    const points = this.data().series[0]?.points ?? [];
    if (points.length === 0) {
      return;
    }

    const rect = svgElement.getBoundingClientRect();
    const offsetX = ((event.clientX - rect.left) / rect.width) * this.chartWidth;
    const fraction = (offsetX - this.plotLeft) / this.plotWidth;
    const dayIndex = Math.round(fraction * (points.length - 1));
    this.#hoverDayIndex.set(Math.max(0, Math.min(dayIndex, points.length - 1)));
  }

  protected onPointerLeave(): void {
    this.#hoverDayIndex.set(null);
  }

  #xForDay(dayOfYear: number): number {
    return this.plotLeft + (dayOfYear / 365) * this.plotWidth;
  }

  #yForValue(value: number): number {
    const { lower, upper } = this.yDomain();
    return this.plotTop + (1 - (value - lower) / (upper - lower)) * this.plotHeight;
  }

  #dayOfYear(timestamp: number, year: number): number {
    return Math.round((timestamp - Date.UTC(year, 0, 1)) / 86400000);
  }
}
