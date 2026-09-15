import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-planet-positions',
  templateUrl: './planet-positions.component.html',
  styleUrl: './planet-positions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetPositionsComponent {}
