import { NakshatraCharacteristics } from './nakshatra-characteristics.model';
import nakshatraCharacteristicsJson from './nakshatra-characteristics.data.json';

// Keyed by nakshatra index (0 = Ashwini ... 26 = Revati), matching NAKSHATRA_NAMES order.
export const NAKSHATRA_CHARACTERISTICS_DATA: NakshatraCharacteristics[] = nakshatraCharacteristicsJson;
