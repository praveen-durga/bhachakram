import { Routes } from '@angular/router';
import { hasBirthDetailsGuard, redirectIfHasBirthDetailsGuard } from './shared/guards';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canMatch: [redirectIfHasBirthDetailsGuard],
    children: [],
  },
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
    path: 'shadbala',
    canMatch: [hasBirthDetailsGuard],
    loadComponent: () => import('./pages/shadbala/shadbala.component').then((m) => m.ShadbalaComponent),
  },
  {
    path: 'deities',
    canMatch: [hasBirthDetailsGuard],
    loadComponent: () => import('./pages/deities/deities.component').then((m) => m.DeitiesComponent),
  },
  {
    path: 'showcase',
    loadComponent: () =>
      import('./pages/component-showcase/component-showcase.component').then((m) => m.ComponentShowcaseComponent),
  },
];
