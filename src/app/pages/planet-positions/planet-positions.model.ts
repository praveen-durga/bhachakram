export type PlanetPositionRow = {
  body: string;
  longitude: string;
  nakshatra: string;
  pada: number;
  rasi: string;
  navamsa: string;
  rasiCombination: string;
  characteristics: string;
  careerPath: string;
  hasKarmicDosha: boolean;
  nakshatraIndex: number;
  rasiIndex: number;
  navamsaRasiIndex: number;
  karmicPlanet: string;
  karmicPlanetResults: string;
};

export type KarmicDoshaDetails = {
  rasi: string;
  nakshatra: string;
  indications: string;
  remedies: string;
};

export type CharaKarakaInfo = {
  abbreviation: string;
  isRetrograde: boolean;
};
