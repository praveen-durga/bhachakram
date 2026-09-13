import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  // Using Angular Signals for reactive state
  title = signal('Bhachakram');
  isNavCollapsed = signal(true);

  toggleNav(): void {
    this.isNavCollapsed.update(value => !value);
  }
}