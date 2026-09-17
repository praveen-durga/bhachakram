import { DeityNature } from './deities.model';

// Deity lists per BPHS (R. Santhanam translation), Ch.6 "Shodasavarga",
// verses 7-41. Each list is for an odd Rasi (and, where noted, is used
// as-is for every sign); even-Rasi lists are the reverse of these.

// D3 (Drekkana), v.7-8: same 3 deities for every sign, no odd/even split.
export const D3_DEITIES = ['Narada', 'Agastya', 'Durvasa'];

// D4 (Chaturthamsa), v.9: same 4 deities for every sign, no odd/even split.
export const D4_DEITIES = ['Sanaka', 'Sanandana', 'Kumara', 'Sanatana'];

// D9 (Navamsa), v.12: no named deities in BPHS, only this 3-fold
// designation cycling through the 9 divisions; same cycle for every sign.
export const D9_DEITIES = ['Deva', 'Manushya', 'Rakshasa'];

// D10 (Dasamsa), v.13-14: odd Rasi order shown; reversed for even Rasi.
export const D10_DEITIES_ODD = [
  'Indra',
  'Agni',
  'Yama',
  'Rakshasa',
  'Varuna',
  'Vayu',
  'Kubera',
  'Isha',
  'Brahma',
  'Ananta',
];

// D12 (Dwadasamsa), v.15: same 4 deities for every sign, no odd/even split.
export const D12_DEITIES = ['Ganesha', 'Ashwini Kumara', 'Yama', 'Sarpa'];

// D16 (Shodasamsa), v.16: odd Rasi order shown; reversed for even Rasi.
export const D16_DEITIES_ODD = ['Brahma', 'Vishnu', 'Shiva', 'Surya'];

// D24 (Chaturvimsamsa), v.22-23: odd Rasi order shown; reversed for even Rasi.
export const D24_DEITIES_ODD = [
  'Skanda',
  'Parashurama',
  'Agni',
  'Vishwakarma',
  'Bhaga',
  'Mitra',
  'Maya',
  'Yama',
  'Shiva',
  'Vishnu',
  'Kama',
  'Bhima',
];

// D30 (Trimsamsa), v.27-28: same 5 unequal degree-spans as the Trimsamsa
// lord (Mars/Saturn/Jupiter/Mercury/Venus), mapped instead to their ruling
// deities. Boundary degrees mirror shadbala.util.ts's calculateD30Rasi
// (kept as a local copy here since this file only needs the deity, not the
// resulting rasi).
export const D30_BOUNDARIES_ODD = [5, 10, 18, 25, 30];
export const D30_DEITIES_ODD = ['Agni', 'Vayu', 'Indra', 'Kubera', 'Varuna'];
export const D30_BOUNDARIES_EVEN = [5, 12, 20, 25, 30];
export const D30_DEITIES_EVEN = ['Varuna', 'Kubera', 'Indra', 'Vayu', 'Agni'];

// D45 (Akshavedamsa), v.31-32: which 3-deity rotation applies depends on the
// sign's modality (movable/fixed/dual), not odd/even.
export const D45_DEITIES_MOVABLE = ['Brahma', 'Shiva', 'Vishnu'];
export const D45_DEITIES_FIXED = ['Shiva', 'Vishnu', 'Brahma'];
export const D45_DEITIES_DUAL = ['Vishnu', 'Brahma', 'Shiva'];

// D60 (Shashtiamsa), sourced from https://www.sarvatobhadra.com/amsha-rulers-shashtiamsha-d60/
// (per user request), not the BPHS Ch.6 v.33-41 list used elsewhere in this
// file - that page's 60 names, in order, come with their own benefic/malefic
// and meaning data (see D60_DEITY_DETAILS below). The page doesn't say
// whether the order changes for odd vs even Rasi, so the same odd/even
// reversal convention used for every other varga in this file is applied
// here too (see getD60Deity in deities.util.ts).
export const D60_DEITIES_ODD = [
  'Ghora',
  'Rakshasa',
  'Deva',
  'Kuber',
  'Yaksha',
  'Kinnar',
  'Bhrashta',
  'Kulaghna',
  'Garala',
  'Agni',
  'Maya',
  'Purishaka',
  'Apampati',
  'Marut',
  'Kaal',
  'Sarpa',
  'Amrita',
  'Indu',
  'Mridu',
  'Komala',
  'Heramba',
  'Brahma',
  'Vishnu',
  'Maheshwara',
  'Ardra',
  'Kalinasha',
  'Kshitish',
  'Kamalakara',
  'Gulika',
  'Mrityu',
  'Daavagni',
  'Yama',
  'Kantaka',
  'Sudha',
  'Poornachandra',
  'Vishadagdha',
  'Kulanasha',
  'Vanshakshya',
  'Utpata',
  'Saumya',
  'Sheetala',
  'Karal-danstra',
  'Chandramukhi',
  'Praveena',
  'Kalagni',
  'Dandayuda',
  'Nirmala',
  'Kroora',
  'Atisheetala',
  'Payodhi',
  'Bhramana',
  'Chandrarekha',
  'Dhwajavahana',
  'Vishwadeva',
  'Pitr',
  'Shakini',
  'Dakini',
  'Roga',
  'Vyadhi',
  'Bhaya',
];

// D3/D9/D12 display colors, as specified by the user (not from BPHS).
// D9's Deva/Manushya/Rakshasa are colored the same as D3's Narada/Agastya/
// Durvasa, matching their shared 3-item position order.
export const D3_DEITY_COLORS: Record<string, string> = {
  Narada: 'blue',
  Agastya: 'orange',
  Durvasa: 'lightcoral',
};

export const D9_DEITY_COLORS: Record<string, string> = {
  Deva: 'blue',
  Manushya: 'orange',
  Rakshasa: 'lightcoral',
};

export const D12_DEITY_COLORS: Record<string, string> = {
  Sarpa: 'darkred',
  Ganesha: 'lightcoral',
  Yama: 'orange',
  'Ashwini Kumara': 'green',
};

export type D60DeityDetail = {
  nature: DeityNature;
  meaning: string;
};

// Nature (benefic/malefic) and meaning per D60 deity, from
// https://www.sarvatobhadra.com/amsha-rulers-shashtiamsha-d60/ (same source
// as the deity names above), trimmed to a short phrase per entry.
export const D60_DEITY_DETAILS: Record<string, D60DeityDetail> = {
  Ghora: { nature: 'Malefic', meaning: 'Scary, violent, ruthless' },
  Rakshasa: { nature: 'Malefic', meaning: 'Powerful demon' },
  Deva: { nature: 'Benefic', meaning: 'Divine being of light' },
  Kuber: { nature: 'Benefic', meaning: 'God of wealth' },
  Yaksha: { nature: 'Benefic', meaning: 'Semi-divine nature spirit' },
  Kinnar: { nature: 'Benefic', meaning: 'Celestial musician' },
  Bhrashta: { nature: 'Malefic', meaning: 'Morally fallen, corrupt' },
  Kulaghna: { nature: 'Malefic', meaning: 'Destroys family reputation' },
  Garala: { nature: 'Malefic', meaning: 'Poison, contamination' },
  Agni: { nature: 'Benefic', meaning: 'Sacred fire, purifier' },
  Maya: { nature: 'Malefic', meaning: 'Illusion, deceit' },
  Purishaka: { nature: 'Malefic', meaning: 'Dirtiness, filth' },
  Apampati: { nature: 'Benefic', meaning: 'Varuna, god of water' },
  Marut: { nature: 'Benefic', meaning: 'Wind god, strength' },
  Kaal: { nature: 'Malefic', meaning: 'Time as destroyer' },
  Sarpa: { nature: 'Malefic', meaning: 'Snake, danger, cunning' },
  Amrita: { nature: 'Benefic', meaning: 'Nectar of immortality' },
  Indu: { nature: 'Benefic', meaning: 'The Moon, calmness' },
  Mridu: { nature: 'Benefic', meaning: 'Gentle and soft' },
  Komala: { nature: 'Benefic', meaning: 'Tender, delicate' },
  Heramba: { nature: 'Benefic', meaning: 'Protective form of Ganesha' },
  Brahma: { nature: 'Benefic', meaning: 'The creator' },
  Vishnu: { nature: 'Benefic', meaning: 'The preserver' },
  Maheshwara: { nature: 'Benefic', meaning: 'Shiva, destroyer of ignorance' },
  Ardra: { nature: 'Benefic', meaning: 'Freshness, moisture, renewal' },
  Kalinasha: { nature: 'Benefic', meaning: 'Dispeller of conflict' },
  Kshitish: { nature: 'Benefic', meaning: 'Lord of earth' },
  Kamalakara: { nature: 'Benefic', meaning: 'Lotus, beauty and purity' },
  Gulika: { nature: 'Malefic', meaning: 'Shadow planet, Saturn-like' },
  Mrityu: { nature: 'Malefic', meaning: 'Death and transformation' },
  Daavagni: { nature: 'Malefic', meaning: 'Forest fire' },
  Yama: { nature: 'Malefic', meaning: 'God of death' },
  Kantaka: { nature: 'Malefic', meaning: 'Thorn, obstacles' },
  Sudha: { nature: 'Benefic', meaning: 'Nectar, purity, healing' },
  Poornachandra: { nature: 'Benefic', meaning: 'Full Moon, fulfillment' },
  Vishadagdha: { nature: 'Malefic', meaning: 'Affliction through poison' },
  Kulanasha: { nature: 'Malefic', meaning: 'Family ruin' },
  Vanshakshya: { nature: 'Malefic', meaning: 'Destruction of lineage' },
  Utpata: { nature: 'Malefic', meaning: 'Turbulence, chaos' },
  Saumya: { nature: 'Benefic', meaning: 'Gentle, peaceful' },
  Sheetala: { nature: 'Benefic', meaning: 'Cooling, soothing' },
  'Karal-danstra': { nature: 'Malefic', meaning: 'Fierce-toothed, terrifying' },
  Chandramukhi: { nature: 'Benefic', meaning: 'Moon-faced, beauty' },
  Praveena: { nature: 'Benefic', meaning: 'Expertise, skill' },
  Kalagni: { nature: 'Malefic', meaning: 'Cosmic fire of destruction' },
  Dandayuda: { nature: 'Malefic', meaning: 'Punishment, severity' },
  Nirmala: { nature: 'Benefic', meaning: 'Purity, clarity' },
  Kroora: { nature: 'Malefic', meaning: 'Cruel, harsh' },
  Atisheetala: { nature: 'Benefic', meaning: 'Extremely calm, cooling' },
  Payodhi: { nature: 'Benefic', meaning: 'Ocean of milk, abundance' },
  Bhramana: { nature: 'Malefic', meaning: 'Wandering, instability' },
  Chandrarekha: { nature: 'Benefic', meaning: 'Moonbeam, hope' },
  Dhwajavahana: { nature: 'Benefic', meaning: 'Victory, leadership' },
  Vishwadeva: { nature: 'Benefic', meaning: 'Universal harmony' },
  Pitr: { nature: 'Benefic', meaning: 'Ancestral spirits, legacy' },
  Shakini: { nature: 'Malefic', meaning: 'Mischievous female spirit' },
  Dakini: { nature: 'Malefic', meaning: 'Wild, disruptive entity' },
  Roga: { nature: 'Malefic', meaning: 'Disease and affliction' },
  Vyadhi: { nature: 'Malefic', meaning: 'Sickness, chronic suffering' },
  Bhaya: { nature: 'Malefic', meaning: 'Fear, anxiety, dread' },
};
