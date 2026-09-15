import { Pipe, PipeTransform } from '@angular/core';
import { format, parse } from 'date-fns';

@Pipe({
  name: 'appTimeFormat',
})
export class TimeFormatPipe implements PipeTransform {
  transform(value: string, timeFormat: string): string {
    return format(parse(value, 'HH:mm', new Date()), timeFormat);
  }
}
