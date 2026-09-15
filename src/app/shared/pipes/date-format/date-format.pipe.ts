import { Pipe, PipeTransform } from '@angular/core';
import { format, parseISO } from 'date-fns';

@Pipe({
  name: 'appDateFormat',
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string, dateFormat: string): string {
    return format(parseISO(value), dateFormat);
  }
}
