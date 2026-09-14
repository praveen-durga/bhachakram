import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, CardComponent, ModalComponent, TableColumn, TableComponent } from '../../shared/ui';

type Planet = {
  name: string;
  sign: string;
  degree: string;
};

@Component({
  selector: 'app-component-showcase',
  standalone: true,
  imports: [ButtonComponent, CardComponent, ModalComponent, TableComponent],
  templateUrl: './component-showcase.component.html',
  styleUrl: './component-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentShowcaseComponent {
  protected modalOpen = signal(false);

  protected columns: TableColumn<Planet>[] = [
    { key: 'name', label: 'Planet' },
    { key: 'sign', label: 'Sign' },
    { key: 'degree', label: 'Degree' },
  ];

  protected rows: Planet[] = [
    { name: 'Sun', sign: 'Leo', degree: '12°' },
    { name: 'Moon', sign: 'Cancer', degree: '5°' },
    { name: 'Mars', sign: 'Aries', degree: '20°' },
  ];
}
