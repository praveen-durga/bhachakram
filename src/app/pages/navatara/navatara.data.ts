import { SelectOption } from '../../shared/ui';

// Nava Tara - the 9-fold nakshatra cycle counted from a reference (anchor)
// nakshatra, keyed by the 1-9 remainder (tara/animal per the user's own
// table). `description` is the standard literal meaning of each Tara's
// Sanskrit name (e.g. Vipat = danger/calamity, Sampat = wealth) - definitional
// across classical sources, not drawn from a disputed numeric table.
// `inauspicious` flags the 3 classically malefic Taras (Vipat, Pratyak,
// Vadha - danger/obstacles/grief) that the user wants highlighted in red.
export const NAVA_TARA: Record<number, { tara: string; animal: string; description: string; inauspicious: boolean }> = {
  1: {
    tara: 'Janma',
    animal: 'Peacock',
    description: 'Birth, body, vitality - a sensitive Tara.',
    inauspicious: false,
  },
  2: { tara: 'Sampat', animal: 'Horse', description: 'Wealth, prosperity, advantage.', inauspicious: false },
  3: { tara: 'Vipat', animal: 'Goat', description: 'Danger, accidents, obstruction.', inauspicious: true },
  4: { tara: 'Kshema', animal: 'Elephant', description: 'Welfare, security, domestic ease.', inauspicious: false },
  5: { tara: 'Pratyak', animal: 'Crow', description: 'Obstacles, loss of effort.', inauspicious: true },
  6: { tara: 'Sadhaka', animal: 'Fox', description: 'Achievement, accomplishment.', inauspicious: false },
  7: { tara: 'Vadha', animal: 'Lion', description: 'Grief, endings, setbacks.', inauspicious: true },
  8: { tara: 'Mitra', animal: 'Garuda', description: 'Friends, support, ease.', inauspicious: false },
  9: { tara: 'Paramamitra', animal: 'Swan', description: 'Great friends, strong support.', inauspicious: false },
};

export const NAVA_TARA_ANCHOR_OPTIONS: SelectOption[] = [
  { value: 'Ascendant', label: 'Lagna (Ascendant)' },
  { value: 'Sun', label: 'Sun' },
  { value: 'Moon', label: 'Moon' },
  { value: 'Mars', label: 'Mars' },
  { value: 'Mercury', label: 'Mercury' },
  { value: 'Jupiter', label: 'Jupiter' },
  { value: 'Venus', label: 'Venus' },
  { value: 'Saturn', label: 'Saturn' },
  { value: 'Rahu', label: 'Rahu' },
  { value: 'Ketu', label: 'Ketu' },
];
