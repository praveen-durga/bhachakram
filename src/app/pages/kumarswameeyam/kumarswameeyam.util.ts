import { ChartBody } from '../../shared/services';
import { NAKSHATRA_NAMES } from '../../shared/utils';
import {
  ADI_DEVATA,
  KUMARA_SWAMEEYAM_INDICATIONS,
  NAKSHATRA_ABHISHEKAM,
  NAKSHATRA_GEMSTONE,
  NAKSHATRA_TEMPLE,
  NAKSHATRA_YANTRA,
  YOGINI,
} from './kumarswameeyam.data';
import { KumaraSwameeyamRow } from './kumarswameeyam.model';

// All 27 nakshatras, listed in order starting from natal Moon's own
// nakshatra (Janma Nakshatra) - unlike Nava Tara, Kumara Swameeyam has no
// selectable anchor and every nakshatra gets its own row/position (1-27).
export function buildKumaraSwameeyamRows(janmaNakshatraIndex: number, bodies: ChartBody[]): KumaraSwameeyamRow[] {
  return Array.from({ length: 27 }, (_, i) => {
    const position = i + 1;
    const nakshatraIndex = (janmaNakshatraIndex + i) % 27;
    const bodiesHere = bodies.filter((body) => body.nakshatraIndex === nakshatraIndex);

    return {
      position,
      nakshatra: NAKSHATRA_NAMES[nakshatraIndex],
      indication: KUMARA_SWAMEEYAM_INDICATIONS[position],
      adiDevata: ADI_DEVATA[nakshatraIndex],
      yogini: YOGINI[nakshatraIndex],
      temple: NAKSHATRA_TEMPLE[nakshatraIndex],
      gemstone: NAKSHATRA_GEMSTONE[nakshatraIndex],
      yantra: NAKSHATRA_YANTRA[nakshatraIndex],
      abhishekam: NAKSHATRA_ABHISHEKAM[nakshatraIndex],
      bodies: bodiesHere.map((body) => body.abbreviation).join(', '),
    };
  });
}
