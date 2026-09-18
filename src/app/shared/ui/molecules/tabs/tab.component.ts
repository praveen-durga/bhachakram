import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TabsComponent } from './tabs.component';

let nextTabId = 0;

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  title = input.required<string>();

  readonly id = `app-tab-${nextTabId++}`;

  #tabs = inject(TabsComponent);
  protected active = computed(() => this.#tabs.activeTab() === this.title());
}
