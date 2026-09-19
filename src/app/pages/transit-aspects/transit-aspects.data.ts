import { TransitAspectBody } from './transit-aspects.model';

// The 9 Vedic grahas plus the 3 modern outer planets, per the user's own
// scope for Transit Aspects.
export const TRANSIT_ASPECT_BODIES: TransitAspectBody[] = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
  'Uranus',
  'Neptune',
  'Pluto',
];

// Target aspect angles - the full major+minor aspect table from the user's
// market-astrology notes (see .claude/todo-plans/22-transit-aspects-result-column.md),
// both mirrors of each angle (theta and 360-theta), matching the same
// unfolded (0-360, not mirrored to the shorter arc) convention as the
// Western Aspects page's calculateAngularDifference. "0" is omitted since
// "360" already detects the same physical conjunction events via the
// periodic-crossing search in findAngleCrossings.
export const TRANSIT_ASPECT_ANGLES = [
  6, 9, 12, 15, 18, 20, 22.5, 24, 30, 36, 40, 45, 60, 72, 90, 120, 135, 144, 150, 180, 210, 216, 225, 240, 270, 288,
  300, 315, 320, 324, 330, 336, 337.5, 340, 342, 345, 348, 351, 354, 360,
];

export const TRANSIT_ASPECT_DEFAULT_RANGE_DAYS = 5;
