import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BirthChartService, D1Chart, EphemerisService } from '../../shared/services';
import { ButtonComponent, CardComponent, RasiChartComponent, SelectComponent, SelectOption } from '../../shared/ui';
import {
  calculateD4Rasi,
  calculateD9Rasi,
  calculateD10Rasi,
  findGraha,
  getRasiDistances,
  wallTimeToUtc,
} from '../../shared/utils';
import { buildAnnualChart, currentAge, DECADE_KEYS, decadeAges } from './tajik-chart.util';
import {
  buildMuddaChildNodes,
  buildMuddaDashaNodes,
  buildPatyayiniChildNodes,
  buildPatyayiniDashaNodes,
} from './tajik-dasha.util';
import { buildAllPlanetBala, buildPanchadhikariCandidates, selectYearLord } from './tajik-lords.util';
import { calculateYogiAvayogi } from './tajik-yogi.util';
import { buildVargaChart } from '../vargas/vargas.util';
import { AnnualChart, PanchadhikariCandidate, PlanetBala, TajikDashaNode, TajikTab, YogiAvayogi } from './tajik.model';

type CurrentAtpData = {
  annualChart: AnnualChart;
  annualD4Chart: D1Chart;
  annualD9Chart: D1Chart;
  annualD10Chart: D1Chart;
  candidates: PanchadhikariCandidate[];
  yearLord: PanchadhikariCandidate;
  planetBala: PlanetBala[];
  yogiAvayogi: YogiAvayogi;
  muddaNodes: TajikDashaNode[];
  patyayiniNodes: TajikDashaNode[];
  yearLordHouse: number;
  munthaHouse: number;
};

const AGE_OPTIONS: SelectOption[] = Array.from({ length: 100 }, (_, age) => ({
  value: String(age),
  label: `Age ${age}`,
}));

@Component({
  selector: 'app-tajik',
  imports: [ButtonComponent, CardComponent, RasiChartComponent, SelectComponent, FormsModule, DatePipe],
  templateUrl: './tajik.component.html',
  styleUrl: './tajik.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TajikComponent {
  private birthChart = inject(BirthChartService);
  private ephemeris = inject(EphemerisService);

  #selectedTab = signal<TajikTab>('current');
  #selectedAge = signal<number | null>(null);
  #atpDataByAge = signal<Partial<Record<number, CurrentAtpData>>>({});
  #decadeCharts = signal<Partial<Record<string, AnnualChart[]>>>({});
  #muddaExpandedIds = signal<Set<string>>(new Set());
  #patyayiniExpandedIds = signal<Set<string>>(new Set());
  private lastD1Chart: D1Chart | null = null;

  protected decadeKeys = DECADE_KEYS;
  protected ageOptions = AGE_OPTIONS;
  protected selectedTab = this.#selectedTab.asReadonly();

  protected displayTimezone = computed(() => this.birthChart.birthDetails()?.timezone ?? 'UTC');

  protected selectedAgeValue = computed(() => {
    const age = this.#selectedAge();
    return age === null ? '' : String(age);
  });

  protected currentAtp = computed<CurrentAtpData | null>(() => {
    const age = this.#selectedAge();
    return age === null ? null : (this.#atpDataByAge()[age] ?? null);
  });

  protected decadeChart = computed<AnnualChart[] | null>(() => {
    const tab = this.#selectedTab();
    if (tab === 'current') {
      return null;
    }
    return this.#decadeCharts()[tab] ?? null;
  });

  protected muddaRows = computed<TajikDashaNode[]>(() => {
    const data = this.currentAtp();
    return data ? this.flattenMudda(data.muddaNodes, this.#muddaExpandedIds()) : [];
  });

  protected patyayiniRows = computed<TajikDashaNode[]>(() => {
    const data = this.currentAtp();
    return data ? this.flattenPatyayini(data.muddaNodes, data.patyayiniNodes, this.#patyayiniExpandedIds()) : [];
  });

  constructor() {
    effect(() => {
      const tab = this.#selectedTab();
      const d1Chart = this.birthChart.d1Chart();
      const details = this.birthChart.birthDetails();
      if (!d1Chart || !details) {
        return;
      }

      const birthDatetime = wallTimeToUtc(details.dob, details.tob, details.timezone);

      // Invalidate every cache when a new chart is generated (the header's
      // "Generate Chart" persists across route navigation, so this can
      // happen without TajikComponent ever being destroyed/recreated).
      if (d1Chart !== this.lastD1Chart) {
        this.lastD1Chart = d1Chart;
        this.#atpDataByAge.set({});
        this.#decadeCharts.set({});
        this.#muddaExpandedIds.set(new Set());
        this.#patyayiniExpandedIds.set(new Set());
        this.#selectedAge.set(currentAge(birthDatetime, new Date()));
      }

      const natalSun = findGraha(d1Chart.grahas, 'Sun');

      if (tab === 'current') {
        const age = this.#selectedAge();
        if (age === null || this.#atpDataByAge()[age]) {
          return;
        }
        buildAnnualChart(
          this.ephemeris,
          natalSun.longitude,
          d1Chart.ascendantRasi,
          birthDatetime,
          age,
          details.lat,
          details.lng,
          details.ayanamsa,
        ).then(async (annualChart) => {
          const candidates = await buildPanchadhikariCandidates(
            this.ephemeris,
            annualChart,
            d1Chart.ascendantRasi,
            details.lat,
            details.lng,
            details.timezone,
          );
          const yearLord = selectYearLord(candidates);
          const yogiAvayogi = calculateYogiAvayogi(annualChart.chart);

          this.#atpDataByAge.update((existing) => ({
            ...existing,
            [age]: {
              annualChart,
              annualD4Chart: buildVargaChart(annualChart.chart, calculateD4Rasi),
              annualD9Chart: buildVargaChart(annualChart.chart, calculateD9Rasi),
              annualD10Chart: buildVargaChart(annualChart.chart, calculateD10Rasi),
              candidates,
              yearLord,
              planetBala: buildAllPlanetBala(annualChart.chart),
              yogiAvayogi,
              muddaNodes: buildMuddaDashaNodes(annualChart),
              patyayiniNodes: buildPatyayiniDashaNodes(annualChart),
              yearLordHouse: getRasiDistances(
                annualChart.chart.ascendantRasi,
                findGraha(annualChart.chart.grahas, yearLord.lord).rasi,
              ).forward,
              munthaHouse: getRasiDistances(annualChart.chart.ascendantRasi, annualChart.munthaRasi).forward,
            },
          }));
        });
        return;
      }

      if (this.#decadeCharts()[tab]) {
        return;
      }
      Promise.all(
        decadeAges(tab).map((age) =>
          buildAnnualChart(
            this.ephemeris,
            natalSun.longitude,
            d1Chart.ascendantRasi,
            birthDatetime,
            age,
            details.lat,
            details.lng,
            details.ayanamsa,
          ),
        ),
      ).then((charts) => {
        this.#decadeCharts.update((existing) => ({ ...existing, [tab]: charts }));
      });
    });
  }

  private flattenMudda(nodes: TajikDashaNode[], expanded: Set<string>): TajikDashaNode[] {
    const rows: TajikDashaNode[] = [];
    for (const node of nodes) {
      rows.push(node);
      if (expanded.has(node.id)) {
        if (!node.children) {
          node.children = buildMuddaChildNodes(node);
        }
        rows.push(...node.children);
      }
    }
    return rows;
  }

  private flattenPatyayini(
    mahaNodes: TajikDashaNode[],
    nodes: TajikDashaNode[],
    expanded: Set<string>,
  ): TajikDashaNode[] {
    const rows: TajikDashaNode[] = [];
    for (const node of nodes) {
      rows.push(node);
      if (expanded.has(node.id)) {
        if (!node.children) {
          node.children = buildPatyayiniChildNodes(node, mahaNodes);
        }
        rows.push(...node.children);
      }
    }
    return rows;
  }

  protected selectTab(tab: TajikTab): void {
    this.#selectedTab.set(tab);
  }

  protected selectAge(value: string): void {
    this.#selectedAge.set(Number(value));
  }

  protected toggleMudda(node: TajikDashaNode): void {
    if (node.level >= 1) {
      return;
    }

    const expanded = new Set(this.#muddaExpandedIds());
    if (expanded.has(node.id)) {
      expanded.delete(node.id);
    } else {
      expanded.add(node.id);
    }
    this.#muddaExpandedIds.set(expanded);
  }

  protected togglePatyayini(node: TajikDashaNode): void {
    if (node.level >= 1) {
      return;
    }

    const expanded = new Set(this.#patyayiniExpandedIds());
    if (expanded.has(node.id)) {
      expanded.delete(node.id);
    } else {
      expanded.add(node.id);
    }
    this.#patyayiniExpandedIds.set(expanded);
  }

  protected isMuddaExpanded(node: TajikDashaNode): boolean {
    return this.#muddaExpandedIds().has(node.id);
  }

  protected isPatyayiniExpanded(node: TajikDashaNode): boolean {
    return this.#patyayiniExpandedIds().has(node.id);
  }
}
