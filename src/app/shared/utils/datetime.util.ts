export const DATE_ISO = 'yyyy-MM-dd'; // ISO 8601 standard format with hyphen separators (e.g., 2026-07-29)
export const DATE_SHORT_MONTH = 'd MMM yyyy'; // Single-digit day with abbreviated month name (e.g., 3 Jul 2026)
export const DATE_FULL_MONTH = 'd MMMM yyyy'; // Single-digit day with full month name and year (e.g., 3 July 2026)

export const TIME_24H = 'HH:mm'; // 24-hour clock, zero-padded (e.g., 17:30)
export const TIME_12H = 'h:mm a'; // 12-hour clock with AM/PM (e.g., 5:30 PM)

export function wallTimeToUtc(dateStr: string, timeStr: string, timeZone: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const asUtc = Date.UTC(year, month - 1, day, hour, minute);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = Object.fromEntries(formatter.formatToParts(new Date(asUtc)).map((part) => [part.type, part.value]));
  const asIfUtc = Date.UTC(
    Number(parts['year']),
    Number(parts['month']) - 1,
    Number(parts['day']),
    Number(parts['hour']),
    Number(parts['minute']),
    Number(parts['second']),
  );

  return new Date(asUtc - (asIfUtc - asUtc));
}
