import { Graha, OuterPlanet } from '../../shared/services';

export type TransitAspectBody = Graha | OuterPlanet;

export type TransitAspectEvent = {
  bodyA: TransitAspectBody;
  bodyB: TransitAspectBody;
  signA: string;
  signB: string;
  declinationA: string;
  declinationB: string;
  angle: number;
  date: Date;
  result: string;
  resultStartTime: Date;
  resultEndTime: Date;
};
