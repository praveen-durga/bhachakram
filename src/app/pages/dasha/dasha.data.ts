import { DashaVariationOption } from './dasha.model';

// The 4 selectable variations, per Sanjay Rath's description (srath.com) of
// alternate Vimshottari starting points: the reference nakshatra is counted
// inclusively (the Nth star) from the Moon's own janma nakshatra, so offset
// = N-1. Janma is the standard/default; Kshema, Utpanna, and Adhana are
// traditionally used for longevity (Ayurdaya) analysis. The dasha balance
// fraction always comes from the Moon's own position within its own natal
// nakshatra regardless of variation - only the starting lord changes.
export const DASHA_VARIATIONS: DashaVariationOption[] = [
  { key: 'Janma', label: 'Janma', nakshatraOffset: 0 },
  { key: 'Kshema', label: 'Kshema (4th star)', nakshatraOffset: 3 },
  { key: 'Utpanna', label: 'Utpanna (5th star)', nakshatraOffset: 4 },
  { key: 'Adhana', label: 'Adhana (8th star)', nakshatraOffset: 7 },
];

export const DASHA_LEVEL_LABELS = ['Maha Dasha', 'Antar Dasha', 'Pratyantar Dasha', 'Sookshma Dasha'];
