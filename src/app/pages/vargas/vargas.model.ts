export type VargaOption = {
  key: string;
  label: string;
  calculateRasi: (longitude: number) => number;
};
