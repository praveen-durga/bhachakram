export type PlanetPositionRow = {
  body: string;
  longitude: string;
  isPushkarBhaga: boolean;
  isMrityuBhaga: boolean;
  nakshatra: string;
  isGandanta: boolean;
  isTempGandanta: boolean;
  isPushkarNavamsa: boolean;
  isVishaNavamsa: boolean;
  pada: number;
  rasi: string;
  navamsa: string;
  rasiCombination: string;
  characteristics: string;
  characteristicsKeyPhrase: string;
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

export type BhavaPositionColumn = {
  house: number;
  houseLord: string;
  ntr: string;
  d1Dispositor: string;
  d9Dispositor: string;
  d1DispositorCombination: string;
  d9DispositorCombination: string;
};

export type DnaKarmaColumn = {
  house: number;
  degreeKarma: string;
  signKarma: string;
  lordKarma: string;
  finalKarma: string;
};
