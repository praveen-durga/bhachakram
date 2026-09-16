import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '../../shared/ui';

@Component({
  selector: 'app-panchang',
  imports: [CardComponent],
  templateUrl: './panchang.component.html',
  styleUrl: './panchang.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanchangComponent {}
