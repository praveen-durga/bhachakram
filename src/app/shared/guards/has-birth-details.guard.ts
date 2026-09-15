import { inject } from '@angular/core';
import { CanMatchFn, RedirectCommand, Router } from '@angular/router';
import { BirthChartService } from '../services';

export const hasBirthDetailsGuard: CanMatchFn = () => {
  const birthChart = inject(BirthChartService);
  if (birthChart.birthDetails()) {
    return true;
  }

  const router = inject(Router);
  return new RedirectCommand(router.parseUrl('/'));
};

export const redirectIfHasBirthDetailsGuard: CanMatchFn = () => {
  const birthChart = inject(BirthChartService);
  if (!birthChart.birthDetails()) {
    return true;
  }

  const router = inject(Router);
  return new RedirectCommand(router.parseUrl('/planet-positions'));
};
