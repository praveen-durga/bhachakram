import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { BirthDetails } from '../../../shared/models';
import { AtlasSearchService, Ayanamsa, Place } from '../../../shared/services';
import { InputComponent, SelectComponent, SelectOption } from '../../../shared/ui';

const AYANAMSA_OPTIONS: SelectOption[] = [
  { value: 'lahiri', label: 'Lahiri' },
  { value: 'raman', label: 'B.V. Raman' },
  { value: 'kp', label: 'KP (Krishnamurti)' },
  { value: 'yukteshwar', label: 'Sri Yukteshwar' },
  { value: 'fagan-bradley', label: 'Fagan–Bradley' },
];

@Component({
  selector: 'app-birth-details-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, SelectComponent],
  templateUrl: './birth-details-form.component.html',
  styleUrl: './birth-details-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BirthDetailsFormComponent {
  private atlasService = inject(AtlasSearchService);

  submitted = output<BirthDetails>();

  // Stores the selected place object once chosen from suggestions
  protected selectedPlace = signal<Place | null>(null);

  protected isAtlasReady = toSignal(this.atlasService.isReady$, { initialValue: false });

  protected form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    dob: new FormControl('', { nonNullable: true, validators: Validators.required }),
    tob: new FormControl('', { nonNullable: true, validators: Validators.required }),
    cityLabel: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    ayanamsa: new FormControl<Ayanamsa>('lahiri', { nonNullable: true }),
  });

  protected ayanamsaOptions = AYANAMSA_OPTIONS;

  // Track field events for reactive error signals
  private nameEvents = toSignal(this.form.controls.name.events);
  private dobEvents = toSignal(this.form.controls.dob.events);
  private tobEvents = toSignal(this.form.controls.tob.events);
  private cityLabelEvents = toSignal(this.form.controls.cityLabel.events);

  // Convert city input control changes into a signal to trigger async worker search
  private cityInputText = toSignal(this.form.controls.cityLabel.valueChanges, { initialValue: '' });

  // Stream suggestions from SQLite WASM Web Worker
  protected citySuggestions = toSignal(
    toObservable(this.cityInputText).pipe(
      debounceTime(150),
      distinctUntilChanged(),
      switchMap((query) => {
        // Only clear the selection if the input no longer matches it - avoids
        // wiping out a just-made selection when this fires after onOptionSelect
        const place = this.selectedPlace();
        if (place && query !== `${place.name}, ${place.admin1 ? place.admin1 + ', ' : ''}${place.country}`) {
          this.selectedPlace.set(null);
        }
        return query && query.length >= 2 ? this.atlasService.search(query) : of([]);
      }),
    ),
    { initialValue: [] },
  );

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
    if (!this.selectedPlace()) {
      return 'Select a place from the suggestions list';
    }
    return undefined;
  });

  protected onOptionSelect(event: Event): void {
    const inputVal = (event.target as HTMLInputElement).value;
    const match = this.citySuggestions().find(
      (place) => `${place.name}, ${place.admin1 ? place.admin1 + ', ' : ''}${place.country}` === inputVal,
    );

    if (match) {
      this.selectedPlace.set(match);
    }
  }

  protected onSubmit(): void {
    const place = this.selectedPlace();

    if (this.form.invalid || !place) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, dob, tob, cityLabel, ayanamsa } = this.form.getRawValue();

    this.submitted.emit({
      name,
      dob,
      tob,
      cityLabel,
      lat: place.lat,
      lng: place.lng,
      timezone: place.timezone,
      ayanamsa,
    });
  }
}
