import { ChangeDetectionStrategy, Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  title = input<string>();
  open = input(false);

  closed = output<void>();

  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open()) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    });
  }

  protected onClose(): void {
    this.closed.emit();
  }
}
