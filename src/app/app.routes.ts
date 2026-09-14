import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/chart/chart.component').then((m) => m.ChartComponent),
  },
  {
    path: 'showcase',
    loadComponent: () =>
      import('./pages/component-showcase/component-showcase.component').then((m) => m.ComponentShowcaseComponent),
  },
];
