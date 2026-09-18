import { Graha } from '../../shared/services';

// Tri-Rashi Pati (triplicity lord), day/night ruler per rasi (0=Aries..11=
// Pisces), per Tejahsimha's system in Balabhadra's Hayanaratna (classical
// Tajik text, via wisdomlib.org translation). One of the 5 Panchadhikari
// candidates for Varsheshwar.
export const TRI_RASHI_PATI: { day: Graha; night: Graha }[] = [
  { day: 'Sun', night: 'Jupiter' }, // Aries
  { day: 'Venus', night: 'Moon' }, // Taurus
  { day: 'Saturn', night: 'Mercury' }, // Gemini
  { day: 'Venus', night: 'Mars' }, // Cancer
  { day: 'Jupiter', night: 'Sun' }, // Leo
  { day: 'Moon', night: 'Venus' }, // Virgo
  { day: 'Mercury', night: 'Saturn' }, // Libra
  { day: 'Mars', night: 'Venus' }, // Scorpio
  { day: 'Saturn', night: 'Saturn' }, // Sagittarius
  { day: 'Mars', night: 'Mars' }, // Capricorn
  { day: 'Jupiter', night: 'Jupiter' }, // Aquarius
  { day: 'Moon', night: 'Moon' }, // Pisces
];

// Egyptian Terms (Hadda) - each rasi split into 5 unequal degree ranges,
// each ruled by one of the 5 non-luminary planets (Sun/Moon never rule a
// term), summing to exactly 30° per sign. Standard Ptolemaic/Egyptian terms
// table, adopted into Tajik astrology as "Hadda" (per kerykeion.net) - cross-
// summed every sign to 30° across exactly these 5 planets before trusting it.
export const EGYPTIAN_TERMS: { to: number; lord: Graha }[][] = [
  [
    { to: 6, lord: 'Jupiter' },
    { to: 12, lord: 'Venus' },
    { to: 20, lord: 'Mercury' },
    { to: 25, lord: 'Mars' },
    { to: 30, lord: 'Saturn' },
  ], // Aries
  [
    { to: 8, lord: 'Venus' },
    { to: 14, lord: 'Mercury' },
    { to: 22, lord: 'Jupiter' },
    { to: 27, lord: 'Saturn' },
    { to: 30, lord: 'Mars' },
  ], // Taurus
  [
    { to: 6, lord: 'Mercury' },
    { to: 12, lord: 'Jupiter' },
    { to: 17, lord: 'Venus' },
    { to: 24, lord: 'Mars' },
    { to: 30, lord: 'Saturn' },
  ], // Gemini
  [
    { to: 7, lord: 'Mars' },
    { to: 13, lord: 'Venus' },
    { to: 19, lord: 'Mercury' },
    { to: 26, lord: 'Jupiter' },
    { to: 30, lord: 'Saturn' },
  ], // Cancer
  [
    { to: 6, lord: 'Jupiter' },
    { to: 11, lord: 'Venus' },
    { to: 18, lord: 'Saturn' },
    { to: 24, lord: 'Mercury' },
    { to: 30, lord: 'Mars' },
  ], // Leo
  [
    { to: 7, lord: 'Mercury' },
    { to: 17, lord: 'Venus' },
    { to: 21, lord: 'Jupiter' },
    { to: 28, lord: 'Mars' },
    { to: 30, lord: 'Saturn' },
  ], // Virgo
  [
    { to: 6, lord: 'Saturn' },
    { to: 14, lord: 'Mercury' },
    { to: 21, lord: 'Jupiter' },
    { to: 28, lord: 'Venus' },
    { to: 30, lord: 'Mars' },
  ], // Libra
  [
    { to: 7, lord: 'Mars' },
    { to: 11, lord: 'Venus' },
    { to: 19, lord: 'Mercury' },
    { to: 24, lord: 'Jupiter' },
    { to: 30, lord: 'Saturn' },
  ], // Scorpio
  [
    { to: 12, lord: 'Jupiter' },
    { to: 17, lord: 'Venus' },
    { to: 21, lord: 'Mercury' },
    { to: 26, lord: 'Saturn' },
    { to: 30, lord: 'Mars' },
  ], // Sagittarius
  [
    { to: 7, lord: 'Mercury' },
    { to: 14, lord: 'Jupiter' },
    { to: 22, lord: 'Venus' },
    { to: 26, lord: 'Saturn' },
    { to: 30, lord: 'Mars' },
  ], // Capricorn
  [
    { to: 7, lord: 'Mercury' },
    { to: 13, lord: 'Venus' },
    { to: 20, lord: 'Jupiter' },
    { to: 25, lord: 'Mars' },
    { to: 30, lord: 'Saturn' },
  ], // Aquarius
  [
    { to: 12, lord: 'Venus' },
    { to: 16, lord: 'Jupiter' },
    { to: 19, lord: 'Mercury' },
    { to: 28, lord: 'Mars' },
    { to: 30, lord: 'Saturn' },
  ], // Pisces
];

// Panchavargiya Bala component maxima (per vedastro.org's Varshaphala
// series) - own/friend/enemy follow the same 4:2:1 ratio in every component
// except Uchcha (continuous, exaltation-distance based). Neutral relation is
// not covered by the sourced 3-tier table; treated the same as friend here
// (a reasonable fill, not a sourced value - flagged in the UI).
export const KSHETRA_BALA_MAX = 30;
export const HADDA_BALA_MAX = 15;
export const DREKKANA_BALA_MAX = 10;
export const NAVAMSA_BALA_MAX = 5;
export const UCHCHA_BALA_MAX = 20;
