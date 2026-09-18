import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  contentChildren,
  effect,
  input,
  model,
  viewChildren,
} from '@angular/core';
import { TabComponent } from './tab.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent {
  defaultTab = input<string>();
  activeTab = model<string>();

  protected tabs = contentChildren(TabComponent);
  private tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  constructor() {
    effect(() => {
      if (this.activeTab() || this.tabs().length === 0) {
        return;
      }
      const wanted = this.defaultTab();
      const match = wanted && this.tabs().some((tab) => tab.title() === wanted) ? wanted : this.tabs()[0].title();
      this.activeTab.set(match);
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    const tabs = this.tabs();
    const currentIndex = tabs.findIndex((tab) => tab.title() === this.activeTab());
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
    this.activeTab.set(tabs[nextIndex].title());
    this.tabButtons()[nextIndex].nativeElement.focus();
  }
}
