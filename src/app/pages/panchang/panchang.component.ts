import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-panchang',
  templateUrl: './panchang.component.html',
  styleUrl: './panchang.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanchangComponent {}
