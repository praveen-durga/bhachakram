import { D1Chart } from '../../shared/services';
import { getNakshatraLord, NAKSHATRA_NAMES } from '../../shared/utils';
import { calculateAvayogiPoint, calculateYogiPoint } from '../panchang/panchang.util';
import { YogiAvayogi } from './tajik.model';

// Reuses Panchang's own Yogi/Avayogi formulas (Yogi Point = Sun + Moon +
// 93°20', Avayogi = Sun + Moon + 3 x 93°20' - NOT Yogi + 93°20' again, which
// was tried and found wrong against a real reported chart, see
// panchang.data.ts's YOGI_OFFSET_DEG comment) rather than re-deriving them,
// so both pages stay consistent. Takes the chart to compute from directly -
// for Tajik this is the annual (Varshapravesh) chart's own Sun/Moon, not the
// natal chart, per the user's explicit correction.
export function calculateYogiAvayogi(chart: D1Chart): YogiAvayogi {
  const yogiPoint = calculateYogiPoint(chart);
  const avayogiPoint = calculateAvayogiPoint(chart);

  return {
    yogiPlanet: getNakshatraLord(yogiPoint.nakshatra),
    yogiNakshatra: NAKSHATRA_NAMES[yogiPoint.nakshatra],
    avayogiPlanet: getNakshatraLord(avayogiPoint.nakshatra),
    avayogiNakshatra: NAKSHATRA_NAMES[avayogiPoint.nakshatra],
  };
}
