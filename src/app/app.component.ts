import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BirthChartService } from './shared/services';
import { HeaderComponent, RasiChartComponent } from './shared/ui';
import { calculateBirthTithiNumber, findGraha, getDagdhaRasis } from './shared/utils';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, HeaderComponent, RasiChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected birthChart = inject(BirthChartService);

  protected dagdhaRasis = computed(() => {
    const d1Chart = this.birthChart.d1Chart();
    if (!d1Chart) return [];

    const sun = findGraha(d1Chart.grahas, 'Sun');
    const moon = findGraha(d1Chart.grahas, 'Moon');
    return getDagdhaRasis(calculateBirthTithiNumber(sun.longitude, moon.longitude));
  });
}
