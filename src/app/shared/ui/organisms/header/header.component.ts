import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BirthDetailsFormComponent } from '../../../../features/birth-chart';
import { BirthDetails, ChartStyle } from '../../../models';
import { DateFormatPipe, TimeFormatPipe } from '../../../pipes';
import { BirthChartService, ChartStyleService } from '../../../services';
import { DATE_SHORT_MONTH, getAge, TIME_12H_WITH_SECONDS } from '../../../utils';
import { ButtonComponent, IconComponent, SelectComponent, SelectOption } from '../../atoms';
import { ModalComponent, TabComponent, TabsComponent } from '../../molecules';

const CHART_STYLE_OPTIONS: SelectOption[] = [
  { value: 'north', label: 'North Indian' },
  { value: 'south', label: 'South Indian' },
];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    IconComponent,
    ButtonComponent,
    SelectComponent,
    ModalComponent,
    TabsComponent,
    TabComponent,
    BirthDetailsFormComponent,
    FormsModule,
    DateFormatPipe,
    TimeFormatPipe,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  protected birthChart = inject(BirthChartService);
  protected chartStyle = inject(ChartStyleService);
  protected modalOpen = signal(false);
  protected activeTab = signal<string | undefined>(undefined);

  protected readonly DATE_SHORT_MONTH = DATE_SHORT_MONTH;
  protected readonly TIME_12H_WITH_SECONDS = TIME_12H_WITH_SECONDS;
  protected readonly chartStyleOptions = CHART_STYLE_OPTIONS;

  protected readonly age = computed(() => {
    const details = this.birthChart.birthDetails();
    return details ? getAge(details.dob) : undefined;
  });

  protected onEdit(): void {
    this.modalOpen.set(true);
  }

  protected onSubmitted(details: BirthDetails): void {
    this.birthChart.setBirthDetails(details);
    this.modalOpen.set(false);
  }

  protected onSelectProfile(id: string): void {
    this.birthChart.selectProfile(id);
    this.modalOpen.set(false);
  }

  protected onDeleteProfile(id: string, event: Event): void {
    event.stopPropagation();
    this.birthChart.deleteProfile(id);
  }

  protected onChartStyleChange(value: string): void {
    this.chartStyle.setStyle(value as ChartStyle);
  }
}
