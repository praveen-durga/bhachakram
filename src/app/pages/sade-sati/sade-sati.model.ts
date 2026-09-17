export type SaturnTransitEntry = {
  date: string;
  time: string;
  rasi: number;
};

export type OccurrenceType = 'Sade Sati' | 'Ardhashtama Shani' | 'Ashtama Shani';

export type VehicleInfo = {
  animal: string;
  indication: string;
  janmaNakshatra: string;
  transitNakshatra: string;
  count: number;
  remainder: number;
};

export type BodyPartRow = {
  part: string;
  months: number;
  from: Date;
  to: Date;
  sensitive: boolean;
};

export type Occurrence = {
  type: OccurrenceType;
  fromMoonLabel: string;
  start: Date;
  end: Date;
  signs: string[];
  vehicle: VehicleInfo;
  bodyPartTimeline: BodyPartRow[];
};
