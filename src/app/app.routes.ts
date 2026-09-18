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
    path: 'sade-sati',
    canMatch: [hasBirthDetailsGuard],
    loadComponent: () => import('./pages/sade-sati/sade-sati.component').then((m) => m.SadeSatiComponent),
  },
  {
    path: 'vargas',
    canMatch: [hasBirthDetailsGuard],
    loadComponent: () => import('./pages/vargas/vargas.component').then((m) => m.VargasComponent),
  },
  {
    path: 'planet-comfort',
    canMatch: [hasBirthDetailsGuard],
    loadComponent: () =>
      import('./pages/planet-comfort/planet-comfort.component').then((m) => m.PlanetComfortComponent),
  },
  {
    path: 'ashtakavarga',
    canMatch: [hasBirthDetailsGuard],
    loadComponent: () => import('./pages/ashtakavarga/ashtakavarga.component').then((m) => m.AshtakavargaComponent),
  },
  {
    path: 'dasha',
    canMatch: [hasBirthDetailsGuard],
    loadComponent: () => import('./pages/dasha/dasha.component').then((m) => m.DashaComponent),
  },
  {
    path: 'tajik',
    canMatch: [hasBirthDetailsGuard],
    loadComponent: () => import('./pages/tajik/tajik.component').then((m) => m.TajikComponent),
  },
  {
    path: 'showcase',
    loadComponent: () =>
      import('./pages/component-showcase/component-showcase.component').then((m) => m.ComponentShowcaseComponent),
  },
];
