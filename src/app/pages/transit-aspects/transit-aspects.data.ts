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

// Target aspect angles, per the user's own list - matches the same
// unfolded (0-360, not mirrored to the shorter arc) convention as the
// Western Aspects page's calculateAngularDifference.
export const TRANSIT_ASPECT_ANGLES = [30, 45, 60, 90, 120, 150, 180, 210, 240, 270, 300, 360];

export const TRANSIT_ASPECT_DEFAULT_RANGE_DAYS = 5;
