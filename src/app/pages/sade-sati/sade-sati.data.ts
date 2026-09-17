import { SaturnTransitEntry } from './sade-sati.model';

// All dates/times in SATURN_SIGN_ENTRIES, and every date derived from them
// (occurrence Period lines, body-part timeline From/To), are displayed in
// this timezone, not the birth location's — the CSV's timestamps are
// natively IST, and the reference screenshots this feature was built
// against display in IST regardless of birth place.
export const SATURN_DATA_TIMEZONE = 'Asia/Kolkata';

// Saturn's first (non-retrograde-repeated) entry into each sign, IST,
// Lahiri ayanamsa, from the user-provided
// Saturn_First_Sign_Entries_1920_2100_Lahiri.csv (1920-11-17 through
// 2099-12-26). Saturn's own Nakshatra/Pada columns from that CSV are
// dropped here since the animal calculation below uses the transiting
// Moon's nakshatra, never Saturn's. Verified: all 74 dates strictly
// increasing, and `rasi` cycles forward with zero gaps/repeats
// (rasi[i+1] === (rasi[i] + 1) % 12 for every row).
export const SATURN_SIGN_ENTRIES: SaturnTransitEntry[] = [
  { date: '1920-11-17', time: '05:21', rasi: 5 }, // Virgo
  { date: '1923-10-15', time: '13:34', rasi: 6 }, // Libra
  { date: '1926-01-01', time: '09:06', rasi: 7 }, // Scorpio
  { date: '1928-12-25', time: '00:07', rasi: 8 }, // Sagittarius
  { date: '1931-04-12', time: '03:06', rasi: 9 }, // Capricorn
  { date: '1934-03-15', time: '22:49', rasi: 10 }, // Aquarius
  { date: '1937-02-26', time: '03:31', rasi: 11 }, // Pisces
  { date: '1939-04-27', time: '22:26', rasi: 0 }, // Aries
  { date: '1941-06-18', time: '18:11', rasi: 1 }, // Taurus
  { date: '1943-08-05', time: '18:40', rasi: 2 }, // Gemini
  { date: '1945-09-22', time: '18:18', rasi: 3 }, // Cancer
  { date: '1948-07-26', time: '13:31', rasi: 4 }, // Leo
  { date: '1950-09-20', time: '06:01', rasi: 5 }, // Virgo
  { date: '1952-11-25', time: '19:41', rasi: 6 }, // Libra
  { date: '1955-11-12', time: '12:08', rasi: 7 }, // Scorpio
  { date: '1958-02-08', time: '11:56', rasi: 8 }, // Sagittarius
  { date: '1961-02-02', time: '00:02', rasi: 9 }, // Capricorn
  { date: '1964-01-27', time: '19:38', rasi: 10 }, // Aquarius
  { date: '1966-04-09', time: '04:50', rasi: 11 }, // Pisces
  { date: '1968-06-17', time: '07:15', rasi: 0 }, // Aries
  { date: '1971-04-28', time: '10:22', rasi: 1 }, // Taurus
  { date: '1973-06-10', time: '19:19', rasi: 2 }, // Gemini
  { date: '1975-07-23', time: '16:41', rasi: 3 }, // Cancer
  { date: '1977-09-07', time: '11:15', rasi: 4 }, // Leo
  { date: '1979-11-04', time: '01:17', rasi: 5 }, // Virgo
  { date: '1982-10-06', time: '06:30', rasi: 6 }, // Libra
  { date: '1984-12-21', time: '08:48', rasi: 7 }, // Scorpio
  { date: '1987-12-17', time: '02:52', rasi: 8 }, // Sagittarius
  { date: '1990-03-21', time: '02:04', rasi: 9 }, // Capricorn
  { date: '1993-03-05', time: '18:31', rasi: 10 }, // Aquarius
  { date: '1995-06-02', time: '10:29', rasi: 11 }, // Pisces
  { date: '1998-04-17', time: '13:06', rasi: 0 }, // Aries
  { date: '2000-06-07', time: '00:58', rasi: 1 }, // Taurus
  { date: '2002-07-23', time: '08:11', rasi: 2 }, // Gemini
  { date: '2004-09-06', time: '04:34', rasi: 3 }, // Cancer
  { date: '2006-11-01', time: '07:13', rasi: 4 }, // Leo
  { date: '2009-09-10', time: '00:01', rasi: 5 }, // Virgo
  { date: '2011-11-15', time: '10:12', rasi: 6 }, // Libra
  { date: '2014-11-02', time: '20:54', rasi: 7 }, // Scorpio
  { date: '2017-01-26', time: '19:31', rasi: 8 }, // Sagittarius
  { date: '2020-01-24', time: '09:56', rasi: 9 }, // Capricorn
  { date: '2022-04-29', time: '07:53', rasi: 10 }, // Aquarius
  { date: '2025-03-29', time: '21:44', rasi: 11 }, // Pisces
  { date: '2027-06-03', time: '05:28', rasi: 0 }, // Aries
  { date: '2029-08-08', time: '12:34', rasi: 1 }, // Taurus
  { date: '2032-05-31', time: '03:01', rasi: 2 }, // Gemini
  { date: '2034-07-13', time: '04:23', rasi: 3 }, // Cancer
  { date: '2036-08-27', time: '20:36', rasi: 4 }, // Leo
  { date: '2038-10-22', time: '16:56', rasi: 5 }, // Virgo
  { date: '2041-01-28', time: '03:12', rasi: 6 }, // Libra
  { date: '2043-12-11', time: '23:24', rasi: 7 }, // Scorpio
  { date: '2046-12-08', time: '00:15', rasi: 8 }, // Sagittarius
  { date: '2049-03-06', time: '16:35', rasi: 9 }, // Capricorn
  { date: '2052-02-25', time: '04:02', rasi: 10 }, // Aquarius
  { date: '2054-05-14', time: '20:09', rasi: 11 }, // Pisces
  { date: '2057-04-07', time: '07:56', rasi: 0 }, // Aries
  { date: '2059-05-27', time: '23:49', rasi: 1 }, // Taurus
  { date: '2061-07-11', time: '04:46', rasi: 2 }, // Gemini
  { date: '2063-08-24', time: '11:57', rasi: 3 }, // Cancer
  { date: '2065-10-13', time: '04:04', rasi: 4 }, // Leo
  { date: '2068-08-30', time: '07:37', rasi: 5 }, // Virgo
  { date: '2070-11-04', time: '15:35', rasi: 6 }, // Libra
  { date: '2073-02-05', time: '18:59', rasi: 7 }, // Scorpio
  { date: '2076-01-16', time: '16:58', rasi: 8 }, // Sagittarius
  { date: '2079-01-15', time: '01:15', rasi: 9 }, // Capricorn
  { date: '2081-04-12', time: '03:24', rasi: 10 }, // Aquarius
  { date: '2084-03-20', time: '02:57', rasi: 11 }, // Pisces
  { date: '2086-05-21', time: '20:18', rasi: 0 }, // Aries
  { date: '2088-07-18', time: '06:50', rasi: 1 }, // Taurus
  { date: '2090-09-19', time: '05:14', rasi: 2 }, // Gemini
  { date: '2093-07-02', time: '17:42', rasi: 3 }, // Cancer
  { date: '2095-08-18', time: '15:20', rasi: 4 }, // Leo
  { date: '2097-10-11', time: '16:08', rasi: 5 }, // Virgo
  { date: '2099-12-26', time: '04:48', rasi: 6 }, // Libra
];

// From the user's Sade Sati.pdf, §12: remainder-to-animal table
// (count = Tarabala-style nakshatra count from Janma Nakshatra to the
// transiting Moon's nakshatra on the occurrence's start date).
export const VEHICLE_ANIMALS: Record<number, { animal: string; indication: string }> = {
  1: { animal: 'Donkey', indication: 'Bad / difficulties' },
  2: { animal: 'Horse', indication: 'Success' },
  3: { animal: 'Elephant', indication: 'Comfort' },
  4: { animal: 'Buffalo', indication: 'Neutral' },
  5: { animal: 'Lion', indication: 'Satru Samharam / destruction of enemy' },
  6: { animal: 'Jackal', indication: 'Sadness / possible death of someone close' },
  7: { animal: 'Crow', indication: 'Fight / conflict' },
  8: { animal: 'Peacock', indication: 'Profit' },
  9: { animal: 'Swan / Amsapakshi', indication: 'Comfort' },
};

// From the user's Sade Sati.pdf, §17-18: the 90-month body-part division
// for a full Sade Sati, with Head/Eyes/Navel/Anus flagged sensitive
// (matching §18's caution list and both reference screenshots). For
// Ardhashtama/Ashtama (single-sign, ~30-month periods) every month value
// here is divided by 3 before use - see buildBodyPartTimeline.
export const BODY_PART_TABLE: { part: string; months: number; sensitive: boolean }[] = [
  { part: 'Head', months: 7, sensitive: true },
  { part: 'Eyes', months: 9, sensitive: true },
  { part: 'Face', months: 8, sensitive: false },
  { part: 'Neck', months: 6, sensitive: false },
  { part: 'Heart', months: 10, sensitive: false },
  { part: 'Stomach', months: 11, sensitive: false },
  { part: 'Navel', months: 5, sensitive: true },
  { part: 'Anus', months: 4, sensitive: true },
  { part: 'Knees', months: 13, sensitive: false },
  { part: 'Thighs', months: 12, sensitive: false },
  { part: 'Feet', months: 5, sensitive: false },
];
