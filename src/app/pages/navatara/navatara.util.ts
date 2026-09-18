import { ChartBody } from '../../shared/services';
import { calculateNakshatraDistance, getNakshatraLord, NAKSHATRA_NAMES } from '../../shared/utils';
import { NAVA_TARA } from './navatara.data';
import { NavaTaraBodyRow, NavaTaraCard } from './navatara.model';

export function calculateTaraRemainder(referenceNakshatraIndex: number, targetNakshatraIndex: number): number {
  const remainder = calculateNakshatraDistance(referenceNakshatraIndex, targetNakshatraIndex) % 9;
  return remainder === 0 ? 9 : remainder;
}

// Each Tara group's 3 nakshatras are always 9 apart, so they share the same
// (fixed, absolute) nakshatra lord - the classical "Tara lord" badge per the
// user's own worked example ("Jupiter in Hasta" -> shown on the Moon card,
// since Hasta's nakshatra lord is Moon).
export function buildNavaTaraCards(anchorNakshatraIndex: number, bodies: ChartBody[]): NavaTaraCard[] {
  return Array.from({ length: 9 }, (_, i) => {
    const position = i + 1;
    const { tara, animal, description, inauspicious } = NAVA_TARA[position];

    const nakshatraIndices = NAKSHATRA_NAMES.map((_, index) => index).filter(
      (index) => calculateTaraRemainder(anchorNakshatraIndex, index) === position,
    );
    const nakshatras = nakshatraIndices.map((index) => NAKSHATRA_NAMES[index]);
    const lordGraha = getNakshatraLord(nakshatraIndices[0]);
    const bodyBadges = bodies.filter((body) => nakshatraIndices.includes(body.nakshatraIndex));

    return { position, tara, animal, description, inauspicious, nakshatras, lordGraha, bodyBadges };
  });
}

export function buildNavaTaraBodyRows(anchorNakshatraIndex: number, bodies: ChartBody[]): NavaTaraBodyRow[] {
  return bodies.map((body) => {
    const position = calculateNakshatraDistance(anchorNakshatraIndex, body.nakshatraIndex);
    const { tara, animal } = NAVA_TARA[calculateTaraRemainder(anchorNakshatraIndex, body.nakshatraIndex)];

    return {
      body: body.label,
      nakshatra: NAKSHATRA_NAMES[body.nakshatraIndex],
      pada: body.pada,
      position,
      tara,
      animal,
    };
  });
}
