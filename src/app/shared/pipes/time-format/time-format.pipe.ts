import { Pipe, PipeTransform } from '@angular/core';
import { format, parse } from 'date-fns';

@Pipe({
  name: 'appTimeFormat',
})
export class TimeFormatPipe implements PipeTransform {
  transform(value: string, timeFormat: string): string {
    const parseFormat = value.split(':').length === 3 ? 'HH:mm:ss' : 'HH:mm';
    return format(parse(value, parseFormat, new Date()), timeFormat);
  }
}
