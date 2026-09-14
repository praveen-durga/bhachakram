import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonComponent,
  CardComponent,
  InputComponent,
  ModalComponent,
  SelectComponent,
  SelectOption,
  TableColumn,
  TableComponent,
} from '../../shared/ui';

type Planet = {
  name: string;
  sign: string;
  degree: string;
};

@Component({
  selector: 'app-component-showcase',
  standalone: true,
  imports: [
    ButtonComponent,
    CardComponent,
    ModalComponent,
    TableComponent,
    InputComponent,
    SelectComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './component-showcase.component.html',
  styleUrl: './component-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentShowcaseComponent {
  protected modalOpen = signal(false);
  protected plainValue = signal('');

  protected form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    zodiacSign: new FormControl('', Validators.required),
  });

  protected zodiacOptions: SelectOption[] = [
    { value: 'aries', label: 'Aries' },
    { value: 'taurus', label: 'Taurus' },
    { value: 'gemini', label: 'Gemini' },
    { value: 'cancer', label: 'Cancer' },
    { value: 'leo', label: 'Leo' },
    { value: 'virgo', label: 'Virgo' },
  ];

  protected plainSign = signal('');

  private emailEvents = toSignal(this.form.controls.email.events);
  private zodiacSignEvents = toSignal(this.form.controls.zodiacSign.events);

  protected emailError = computed(() => {
    this.emailEvents();
    const control = this.form.controls.email;
    if (!control.touched || control.valid) {
      return undefined;
    }
    if (control.hasError('required')) {
      return 'Email is required';
    }
    if (control.hasError('email')) {
      return 'Enter a valid email address';
    }
    return undefined;
  });

  protected zodiacSignError = computed(() => {
    this.zodiacSignEvents();
    const control = this.form.controls.zodiacSign;
    if (!control.touched || control.valid) {
      return undefined;
    }
    return 'Please select your zodiac sign';
  });

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
