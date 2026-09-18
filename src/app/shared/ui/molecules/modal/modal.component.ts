import { ChangeDetectionStrategy, Component, ElementRef, effect, input, output, viewChild } from '@angular/core';
import { IconComponent } from '../../atoms';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
})
export class ModalComponent {
  title = input<string>();
  open = input(false);
  dialogClass = input<string>();

  closed = output<void>();

  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open()) {
        dialog.classList.remove('closing');
        dialog.showModal();
      } else if (dialog.open) {
        dialog.classList.add('closing');
        dialog.addEventListener('transitionend', () => dialog.close(), { once: true });
      }
    });
  }

  protected onClose(): void {
    this.closed.emit();
  }

  protected onCancel(event: Event): void {
    event.preventDefault();
    this.closed.emit();
  }
}
