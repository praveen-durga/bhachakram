import { D1Chart } from '../../shared/services';
import { findGraha } from '../../shared/utils';
import { WESTERN_ASPECT_GRAHA_ORDER, WESTERN_ASPECT_HIGHLIGHT_RANGES } from './western-aspects.data';
import { WesternAspectRow } from './western-aspects.model';

// Row longitude minus column longitude, with the sign dropped if negative -
// per the user's own formula (not folded/mirrored to the shorter arc, and
// not wrapped by +360).
export function calculateAngularDifference(longitudeA: number, longitudeB: number): number {
  return Math.abs(longitudeA - longitudeB);
}

export function isWesternAspectHighlighted(value: number): boolean {
  return WESTERN_ASPECT_HIGHLIGHT_RANGES.some(([min, max]) => value >= min && value <= max);
}

export function buildWesternAspectRows(d1Chart: D1Chart): WesternAspectRow[] {
  const longitudes = WESTERN_ASPECT_GRAHA_ORDER.map((graha) => findGraha(d1Chart.grahas, graha).longitude);

  return WESTERN_ASPECT_GRAHA_ORDER.map((graha, rowIndex) => ({
    graha,
    cells: longitudes.map((longitude, columnIndex) => {
      const value = calculateAngularDifference(longitudes[rowIndex], longitude);
      const isSelf = columnIndex === rowIndex;
      return { value, isHighlighted: !isSelf && isWesternAspectHighlighted(value), isSelf };
    }),
  }));
}
