import { Graha } from '../../shared/services';

// Sun-based Upagrahas, BPHS Ch.3 v.61-64 ("Add 4 Rasis 13°20' to Surya's
// longitude to get Dhuma... Reduce Dhoom from 12 Rasis to arrive at
// Vyatipat... Add six Rasis to Vyatipat to know Parivesh... Deduct Parivesh
// from 12 Rasis to arrive at Chap... Add 16°40' to Chap to get Upaketu"),
// each computed from the previous per the verse's own chain, not
// pre-simplified, so each step stays individually traceable to the text.
export const DHUMA_OFFSET_DEG = 4 * 30 + 13 + 20 / 60; // 4 rasis 13°20'
export const UPAKETU_OFFSET_DEG = 16 + 40 / 60; // 16°40'

// Kalanadi table for Indu Lagna - not in BPHS, best-effort per the user's
// explicit request (see planet-positions.util.ts's calculateInduLagna for
// the counting rule). Rahu/Ketu have no entry since they own no sign and
// can't be a 9th-lord in this scheme.
export const INDU_LAGNA_KALANADI: Partial<Record<Graha, number>> = {
  Sun: 30,
  Moon: 16,
  Mars: 6,
  Mercury: 8,
  Jupiter: 10,
  Venus: 12,
  Saturn: 1,
};
