import { Graha } from '../../shared/services';

// Dataviz skill's validated 8-slot categorical palette (light mode, worst
// adjacent CVD deltaE 9.1, worst adjacent normal-vision deltaE 19.6),
// assigned in GRAHA_ORDER's fixed sequence. Rahu and Ketu share the last
// slot (they're always exact mirror images - Ketu's declination is always
// -Rahu's), differentiated by a dashed line instead of a 9th hue.
export const DECLINATION_COLOR_BY_GRAHA: Record<Graha, string> = {
  Sun: '#2a78d6',
  Moon: '#eb6834',
  Mars: '#1baf7a',
  Mercury: '#eda100',
  Jupiter: '#e87ba4',
  Venus: '#008300',
  Saturn: '#4a3aa7',
  Rahu: '#e34948',
  Ketu: '#e34948',
};

export const DECLINATION_DASHED_GRAHAS: Graha[] = ['Ketu'];

// Every 3rd day across the year - dense enough to resolve the Moon's ~27.3
// day declination cycle without needing a daily ephemeris call per sample.
export const DECLINATION_SAMPLE_STEP_DAYS = 3;
