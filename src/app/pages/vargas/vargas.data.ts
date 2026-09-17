import {
  calculateD3JagannathRasi,
  calculateD3Rasi,
  calculateD3SomanathRasi,
  calculateD4Rasi,
  calculateD5Rasi,
  calculateD6Rasi,
  calculateD7Rasi,
  calculateD8Rasi,
  calculateD9Rasi,
  calculateD10Rasi,
  calculateD11Rasi,
  calculateD12Rasi,
  calculateD16Rasi,
  calculateD24Rasi,
  calculateD27Rasi,
  calculateD30Rasi,
  calculateD45Rasi,
  calculateD60Rasi,
  RasiModality,
} from '../../shared/utils';
import { ModalityGrade, VargaOption } from './vargas.model';

export const VARGA_OPTIONS: VargaOption[] = [
  { key: 'D3', label: 'D3 - Drekkana', calculateRasi: calculateD3Rasi },
  { key: 'D3J', label: 'D3J - Jagannatha Drekkana', calculateRasi: calculateD3JagannathRasi },
  { key: 'D3S', label: 'D3S - Somanatha Drekkana', calculateRasi: calculateD3SomanathRasi },
  { key: 'D4', label: 'D4 - Chaturthamsa', calculateRasi: calculateD4Rasi },
  { key: 'D5', label: 'D5 - Panchamsa', calculateRasi: calculateD5Rasi },
  { key: 'D6', label: 'D6 - Shashthamsa', calculateRasi: calculateD6Rasi },
  { key: 'D7', label: 'D7 - Saptamsa', calculateRasi: calculateD7Rasi },
  { key: 'D8', label: 'D8 - Ashtamsa', calculateRasi: calculateD8Rasi },
  { key: 'D9', label: 'D9 - Navamsa', calculateRasi: calculateD9Rasi },
  { key: 'D10', label: 'D10 - Dasamsa', calculateRasi: calculateD10Rasi },
  { key: 'D11', label: 'D11 - Rudramsa', calculateRasi: calculateD11Rasi },
  { key: 'D12', label: 'D12 - Dwadasamsa', calculateRasi: calculateD12Rasi },
  { key: 'D16', label: 'D16 - Shodasamsa', calculateRasi: calculateD16Rasi },
  { key: 'D24', label: 'D24 - Chaturvimsamsa', calculateRasi: calculateD24Rasi },
  { key: 'D27', label: 'D27 - Saptavimsamsa', calculateRasi: calculateD27Rasi },
  { key: 'D30', label: 'D30 - Trimsamsa', calculateRasi: calculateD30Rasi },
  { key: 'D45', label: 'D45 - Akshavedamsa', calculateRasi: calculateD45Rasi },
  { key: 'D60', label: 'D60 - Shashtiamsa', calculateRasi: calculateD60Rasi },
];

// Not BPHS-verified (best-effort from secondary sources - see varga.util.ts
// for the confidence notes per formula); shown with a caution badge in the UI.
export const UNVERIFIED_VARGA_KEYS = ['D3J', 'D3S', 'D5', 'D6', 'D8', 'D11', 'D27'];

// Grade for a D1 sign's modality compared against a varga sign's modality,
// as specified by the user: M+M=E, M+F=A, M+D=B, F+F=B, F+D=E, D+D=A
// (symmetric - order between the two signs doesn't matter).
export const MODALITY_GRADE_MATRIX: Record<RasiModality, Record<RasiModality, ModalityGrade>> = {
  Movable: { Movable: 'E', Fixed: 'A', Dual: 'B' },
  Fixed: { Movable: 'A', Fixed: 'B', Dual: 'E' },
  Dual: { Movable: 'B', Fixed: 'E', Dual: 'A' },
};
