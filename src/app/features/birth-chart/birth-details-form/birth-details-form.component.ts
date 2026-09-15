import { ChangeDetectionStrategy, Component, computed, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { InputComponent } from '../../../shared/ui';
import { CITY_LABELS, findCityByLabel } from '../../../shared/utils';
import { BirthDetails } from '../birth-details.model';

function cityValidator(control: AbstractControl<string>): ValidationErrors | null {
  return findCityByLabel(control.value) ? null : { unknownCity: true };
}

@Component({
  selector: 'app-birth-details-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent],
  templateUrl: './birth-details-form.component.html',
  styleUrl: './birth-details-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BirthDetailsFormComponent {
  submitted = output<BirthDetails>();

  protected form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    dob: new FormControl('', { nonNullable: true, validators: Validators.required }),
    tob: new FormControl('', { nonNullable: true, validators: Validators.required }),
    cityLabel: new FormControl('', { nonNullable: true, validators: [Validators.required, cityValidator] }),
  });

  protected cityOptions = CITY_LABELS;

  private nameEvents = toSignal(this.form.controls.name.events);
  private dobEvents = toSignal(this.form.controls.dob.events);
  private tobEvents = toSignal(this.form.controls.tob.events);
  private cityLabelEvents = toSignal(this.form.controls.cityLabel.events);

  protected nameError = computed(() => {
    this.nameEvents();
    const control = this.form.controls.name;
    return control.touched && control.hasError('required') ? 'Name is required' : undefined;
  });

  protected dobError = computed(() => {
    this.dobEvents();
    const control = this.form.controls.dob;
    return control.touched && control.hasError('required') ? 'Date of birth is required' : undefined;
  });

  protected tobError = computed(() => {
    this.tobEvents();
    const control = this.form.controls.tob;
    return control.touched && control.hasError('required') ? 'Time of birth is required' : undefined;
  });

  protected cityLabelError = computed(() => {
    this.cityLabelEvents();
    const control = this.form.controls.cityLabel;
    if (!control.touched) {
      return undefined;
    }
    if (control.hasError('required')) {
      return 'Place of birth is required';
    }
    if (control.hasError('unknownCity')) {
      return 'Select a place from the suggestions';
    }
    return undefined;
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, dob, tob, cityLabel } = this.form.getRawValue();
    const city = findCityByLabel(cityLabel)!;

    this.submitted.emit({ name, dob, tob, cityLabel, lat: city.lat, lng: city.lng, timezone: city.timezone });
  }
}
