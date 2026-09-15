import { Routes } from '@angular/router';
import { hasBirthDetailsGuard } from './shared/guards';

export const routes: Routes = [
  {
    path: 'planet-positions',
    canMatch: [hasBirthDetailsGuard],
    loadComponent: () =>
      import('./pages/planet-positions/planet-positions.component').then((m) => m.PlanetPositionsComponent),
  },
  {
    path: 'panchang',
    canMatch: [hasBirthDetailsGuard],
    loadComponent: () => import('./pages/panchang/panchang.component').then((m) => m.PanchangComponent),
  },
  {
    path: 'showcase',
    loadComponent: () =>
      import('./pages/component-showcase/component-showcase.component').then((m) => m.ComponentShowcaseComponent),
  },
];
