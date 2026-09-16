import { TemplateRef } from '@angular/core';

export type TableCellContext<T> = {
  $implicit: T;
};

export type TableColumn<T> = {
  key: keyof T;
  label: string;
  cellTemplate?: TemplateRef<TableCellContext<T>>;
};
