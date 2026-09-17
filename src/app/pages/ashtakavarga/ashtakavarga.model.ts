export type AshtakavargaTarget = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Lagna';

export type AshtakavargaContributor = AshtakavargaTarget;

export type BhinnashtakavargaChart = {
  target: AshtakavargaTarget;
  bindusByRasi: number[];
  total: number;
};

export type SarvashtakavargaChart = {
  bindusByRasi: number[];
  total: number;
};
