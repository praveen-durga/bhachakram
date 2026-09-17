export type TithiSphuta = {
  longitude: number;
  rasi: number;
  nakshatra: number;
  pada: number;
  house: number;
  note: string | null;
};

export type PakshaTithi = {
  paksha: 'Shukla' | 'Krishna';
  tithiName: string;
};

export type SantanTithi = {
  tithiNumber: number;
  isFavourable: boolean;
  note: string | null;
};

export type TithiBeejaResult = {
  birthTithiNumber: number;
  grahaDevata: string;
  grahaDevataRasi: number;
  grahaDevataHouse: number;
  unresolvedDesireRasi: number;
  fulfillmentPathRasi: number;
};

export type VainashikaResult = {
  nakshatra: number;
  pada: number;
};

export type MudakkuResult = {
  rasi: number;
  nakshatra: number;
};

export type Thithi = {
  tithiNumber: number;
  paksha: 'Shukla' | 'Krishna';
  tithiName: string;
  percentElapsed: number;
};

export type NakshatraResult = {
  nakshatra: number;
  pada: number;
};

export type Yoga = {
  yoga: number;
  percentElapsed: number;
};

export type Karnam = {
  karnam: number;
};

export type VedicDayLord = {
  weekday: number;
};

export type YogiPoint = {
  longitude: number;
  rasi: number;
  nakshatra: number;
  pada: number;
};

export type MandiResult = {
  longitude: number;
  rasi: number;
  nakshatra: number;
  pada: number;
  house: number;
};
