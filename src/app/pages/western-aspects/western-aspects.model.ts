export type WesternAspectCell = {
  value: number;
  isHighlighted: boolean;
  isSelf: boolean;
};

export type WesternAspectRow = {
  graha: string;
  cells: WesternAspectCell[];
};
