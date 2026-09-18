import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { BirthChartService } from '../../shared/services';
import { ButtonComponent, CardComponent } from '../../shared/ui';
import { findGraha, wallTimeToUtc } from '../../shared/utils';
import { DASHA_LEVEL_LABELS, DASHA_VARIATIONS } from './dasha.data';
import { DashaNode, DashaVariationKey } from './dasha.model';
import {
  buildChildNodes,
  buildMahaDashaNodes,
  calculateDashaBalance,
  formatDuration,
  periodDurationYears,
} from './dasha.util';

@Component({
  selector: 'app-dasha',
  imports: [ButtonComponent, CardComponent, DatePipe],
  templateUrl: './dasha.component.html',
  styleUrl: './dasha.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashaComponent {
  private birthChart = inject(BirthChartService);
  private now = new Date();

  #selectedVariation = signal<DashaVariationKey>('Janma');
  #expandedIds = signal<Set<string>>(new Set());

  protected variations = DASHA_VARIATIONS;
  protected levelLabels = DASHA_LEVEL_LABELS;
  protected selectedVariation = this.#selectedVariation.asReadonly();

  protected displayTimezone = computed(() => this.birthChart.birthDetails()?.timezone ?? 'UTC');

  private selectedOffset = computed(
    () => this.variations.find((option) => option.key === this.selectedVariation())?.nakshatraOffset ?? 0,
  );

  protected balance = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) {
      return null;
    }
    const moon = findGraha(d1Chart.grahas, 'Moon');
    return calculateDashaBalance(moon.longitude, this.selectedOffset());
  });

  private mahaNodes = computed<DashaNode[]>(() => {
    const d1Chart = this.birthChart.d1Chart();
    const details = this.birthChart.birthDetails();
    if (!d1Chart || !details) {
      return [];
    }
    const moon = findGraha(d1Chart.grahas, 'Moon');
    const birthDate = wallTimeToUtc(details.dob, details.tob, details.timezone);
    return buildMahaDashaNodes(moon.longitude, birthDate, this.selectedOffset());
  });

  protected visibleRows = computed<DashaNode[]>(() => this.flatten(this.mahaNodes(), this.#expandedIds()));

  constructor() {
    effect(() => {
      this.#expandedIds.set(this.buildCurrentPathIds(this.mahaNodes()));
    });
  }

  private buildCurrentPathIds(nodes: DashaNode[]): Set<string> {
    const expanded = new Set<string>();
    let siblings = nodes;

    while (siblings.length > 0) {
      const current = siblings.find((node) => this.now >= node.start && this.now < node.end);
      if (!current) {
        break;
      }

      expanded.add(current.id);
      if (current.level >= 3) {
        break;
      }

      if (!current.children) {
        current.children = buildChildNodes(current);
      }
      siblings = current.children;
    }

    return expanded;
  }

  private flatten(nodes: DashaNode[], expanded: Set<string>): DashaNode[] {
    const rows: DashaNode[] = [];

    for (const node of nodes) {
      rows.push(node);
      if (expanded.has(node.id)) {
        if (!node.children) {
          node.children = buildChildNodes(node);
        }
        rows.push(...this.flatten(node.children, expanded));
      }
    }

    return rows;
  }

  protected selectVariation(key: DashaVariationKey): void {
    this.#selectedVariation.set(key);
  }

  protected isExpanded(node: DashaNode): boolean {
    return this.#expandedIds().has(node.id);
  }

  protected isCurrentPeriod(node: DashaNode): boolean {
    return this.now >= node.start && this.now < node.end;
  }

  protected toggleNode(node: DashaNode): void {
    if (node.level >= 3) {
      return;
    }

    const expanded = new Set(this.#expandedIds());
    if (expanded.has(node.id)) {
      expanded.delete(node.id);
    } else {
      expanded.add(node.id);
    }
    this.#expandedIds.set(expanded);
  }

  protected formatYears(years: number): string {
    return formatDuration(years);
  }

  protected periodYears(node: DashaNode): number {
    return periodDurationYears(node);
  }
}
