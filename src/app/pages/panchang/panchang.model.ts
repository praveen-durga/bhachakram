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
