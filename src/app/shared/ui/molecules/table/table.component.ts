import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TableColumn } from './table.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T extends Record<string, unknown>> {
  columns = input.required<TableColumn<T>[]>();
  rows = input.required<T[]>();
}
