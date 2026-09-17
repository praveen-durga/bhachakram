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
