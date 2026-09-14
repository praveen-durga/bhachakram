import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BirthDetails, BirthDetailsFormComponent } from '../../../../features/birth-chart';
import { DateFormatPipe, TimeFormatPipe } from '../../../pipes';
import { BirthChartService } from '../../../services';
import { DATE_SHORT_MONTH, TIME_12H } from '../../../utils';
import { ButtonComponent } from '../../atoms';
import { ModalComponent } from '../../molecules';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonComponent, ModalComponent, BirthDetailsFormComponent, DateFormatPipe, TimeFormatPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  protected birthChart = inject(BirthChartService);
  protected modalOpen = signal(false);

  protected readonly DATE_SHORT_MONTH = DATE_SHORT_MONTH;
  protected readonly TIME_12H = TIME_12H;

  protected onEdit(): void {
    this.modalOpen.set(true);
  }

  protected onSubmitted(details: BirthDetails): void {
    this.birthChart.setBirthDetails(details);
    this.modalOpen.set(false);
  }
}
