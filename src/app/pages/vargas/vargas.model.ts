export type VargaOption = {
  key: string;
  label: string;
  calculateRasi: (longitude: number) => number;
};

export type RasiDistanceCell = {
  vargaKey: string;
  label: string;
  isVargottam: boolean;
};

export type RasiDistanceRow = {
  body: string;
  d1SignLabel: string;
  cells: RasiDistanceCell[];
};

export type ModalityGrade = 'E' | 'A' | 'B';

export type ModalityGradeCell = {
  vargaKey: string;
  grade: ModalityGrade;
};

export type ModalityGradeRow = {
  body: string;
  d1SignLabel: string;
  d1ModalityLabel: string;
  cells: ModalityGradeCell[];
};

export type GrahaArudhaValue = {
  position: number; // 1-12, distance from the planet's sign in that varga to its Graha Arudha sign
  background: string;
};

export type GrahaArudhaCell = {
  vargaKey: string;
  values: GrahaArudhaValue[]; // 1 per owned sign - most planets have 1, a few have 2
};

export type GrahaArudhaRow = {
  body: string;
  d1SignLabel: string;
  finalGaLabel: string;
  houseFromLagnaLabel: string;
  cells: GrahaArudhaCell[];
};
