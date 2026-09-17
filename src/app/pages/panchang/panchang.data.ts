import { Graha } from '../../shared/services';

// Tithi 1-14 in each paksha shares the same Graha Devata sequence; index 0 = tithi 1.
// Index 14 (tithi 15) is Purnima/Amavasya, set per-paksha in TITHI_GRAHA_DEVATA below.
const PAKSHA_GRAHA_DEVATA_SEQUENCE: Graha[] = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
];

// Keyed by tithi number 1-30 (1-15 = Shukla Paksha ending in Purnima, 16-30 = Krishna
// Paksha ending in Amavasya).
export const TITHI_GRAHA_DEVATA: Record<number, Graha> = {
  ...Object.fromEntries(PAKSHA_GRAHA_DEVATA_SEQUENCE.map((graha, i) => [i + 1, graha])),
  15: 'Saturn', // Purnima
  ...Object.fromEntries(PAKSHA_GRAHA_DEVATA_SEQUENCE.map((graha, i) => [i + 16, graha])),
  30: 'Rahu', // Amavasya
};

// Vainashika is a fixed positional offset on the (nakshatra, pada) pair: treating
// combinedIndex = nakshatraIndex * 4 + (pada - 1) (0-107), the result is
// (combinedIndex + VAINASHIKA_OFFSET) % 108 — verified against the reference
// 27x4 table (Ashwini through Revati).
export const VAINASHIKA_OFFSET = 87;

// Mudakku rasi/nakshatra are each a fixed-sum reflection of the Sun's position:
// mudakkuRasi = (MUDAKKU_RASI_SUM - sunRasi) mod 12, mudakkuNakshatra =
// (MUDAKKU_NAKSHATRA_SUM - sunNakshatra) mod 27 — verified against every row of
// the reference 12-sign and 27-nakshatra tables (all matched exactly).
export const MUDAKKU_RASI_SUM = 4;
export const MUDAKKU_NAKSHATRA_SUM = 10;

// Yogi Point = normalize360(Sun + Moon + 93°20'); Avayogi = normalize360(Sun +
// Moon + 3 * 93°20', i.e. 280°) — NOT Yogi Point + 93°20' again (that earlier
// assumption was wrong; re-verified against a real reported chart where the
// app's own placeholder values (27°17' Sco Yogi, 3°57' Gem Avayogi) turned out
// to be that exact chart's expected output, and only the x3 multiplier
// reproduces the Avayogi side).
export const YOGI_OFFSET_DEG = 93 + 20 / 60;

// Tithi names 1-14 in each paksha, index 0 = tithi 1 (Pratipada).
export const TITHI_NAMES: string[] = [
  'Pratipada',
  'Dwitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
];

export const SANTAN_TITHI_FAVOURABLE = new Set([5, 10, 11, 13]);
export const SANTAN_TITHI_DIFFICULT = new Set([8, 9, 14]);

export const SANTAN_TITHI_NOTES: Record<number, string> = {
  5: 'Panchami: strong emotional bond with children; affectionate offspring; prosperity through children.',
  10: 'Dashami: money, career growth, and positive karmic support through children.',
  11: 'Ekadashi: strong emotional bond with children; affectionate offspring; prosperity through children.',
  13: 'Trayodashi: strong emotional bond with children; affectionate offspring; prosperity through children.',
  8: 'Ashtami: possible health issues after childbirth.',
  9: 'Navami: possible conflicts or disagreements with children.',
  14: 'Chaturdashi: possible emotional emptiness after childbirth.',
};

// Ava Yogi remedy/discipline, keyed by the Ava Yogi point's ruling planet.
export const AVA_YOGI_REMEDIES: Record<Graha, string> = {
  Sun: 'Be extremely punctual; avoid being late.',
  Moon: 'Never waste food.',
  Mars: 'Keep the body physically fit.',
  Mercury: 'Donate books/diaries.',
  Jupiter: 'Be loyal/sincere to your Guru.',
  Venus: 'Donate clothes.',
  Saturn: 'Avoid overnight/refrigerated food.',
  Rahu: 'Strictly avoid tea and coffee.',
  Ketu: 'Avoid fast food such as noodles/fried rice; donate to crows.',
};

// Static per-combination interpretation notes for Tithi Sphuta, keyed by
// `${rasiIndex}-${nakshatraIndex}`. Only the combinations explicitly supplied are
// present; everything else shows no note until more are provided.
export const TITHI_SPHUTA_NOTES: Record<string, string> = {
  '0-1': 'Health concerns; self-focus.', // Aries / Bharani
  '2-5': 'Anxiety about destruction/loss; concerns regarding children, studies, or market.', // Gemini / Ardra
  '5-13': 'Profit-oriented creativity.', // Virgo / Chitra
};

// 27 Yogas, index 0 = Vishkambha, in the standard fixed order.
export const YOGA_NAMES: string[] = [
  'Vishkambha',
  'Priti',
  'Ayushman',
  'Saubhagya',
  'Shobhana',
  'Atiganda',
  'Sukarma',
  'Dhriti',
  'Shoola',
  'Ganda',
  'Vriddhi',
  'Dhruva',
  'Vyaghata',
  'Harshana',
  'Vajra',
  'Siddhi',
  'Vyatipata',
  'Variyana',
  'Parigha',
  'Shiva',
  'Siddha',
  'Sadhya',
  'Shubha',
  'Shukla',
  'Brahma',
  'Indra',
  'Vaidhriti',
];

// 11 Karnams: 4 "fixed" (each occurs once per lunar month, on specific tithis)
// and 7 "movable" (repeat in a cycle across the remaining half-tithis).
export const FIXED_KARNAM_NAMES: string[] = ['Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'];
export const MOVABLE_KARNAM_NAMES: string[] = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti'];

// Weekday index 0 = Sunday, matching JS Date#getDay().
export const WEEKDAY_NAMES: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// "Reverse-engineering" remedies for Mandi/Gulika by house (1-12): each house's
// significations plus a discipline that symbolically withdraws from/neglects
// that house's theme without actively harming it. Keyed by house number as
// returned by getRasiDistances(...).forward (1-12).
export const MANDI_HOUSE_REMEDIES: Record<number, string> = {
  1: '1st House – Identity: represents self, identity, personality, and personal presence. Remedy: create a dummy social-media identity — alternate profile/name, no personal photograph, no friends/interactions, and do not actively use it. The symbolic purpose is to reduce/withdraw identity.',
  2: '2nd House – Money: represents money, accumulated wealth, and family resources. Remedy: create a separate/dummy bank account, keep only the minimum amount, do not use it, do not withdraw the money — it remains there, untouched, so money exists but is not available for active use.',
  3: '3rd House – Communication/Contact: represents communication and contact. Remedy: keep another phone number active, do not use it, and do not give it to others — a controlled withdrawal from the 3rd-house principle. Avoid expanding this into unrelated social-media activity, as that could incorrectly activate another house.',
  4: '4th House – Home/Property/Vehicle: represents home, property, vehicles, and comforts. Stronger remedy: purchase an inexpensive/remote property or unused vehicle and keep it unused. Simpler remedy: buy an item such as a dress, wash it, and never use it. The principle is to possess the 4th-house object but not use it.',
  5: '5th House – Pleasure: represents pleasure, entertainment, recreation, cinema, arts, and enjoyment. Remedy: purchase a subscription/service (streaming, a yoga course, entertainment, or another inexpensive recurring subscription) but do not use it — continue paying a small amount while deliberately not using the service, creating 5th-house expenditure without 5th-house enjoyment.',
  6: '6th House – Debt: represents debt. Remedy: give a small amount of money to someone as a loan, not charity — ask for repayment, and even if repayment may be delayed, maintain the mental framework that it is a debt (small interest may be considered); do not convert it into a donation, since loan/debt belongs to the 6th house while donation/charity carries 9th-house symbolism, so the intention matters.',
  7: '7th House – Marriage/Relationship: represents marriage, partnerships, and one-to-one relationships. Remedy: if a close friend is getting married, attend the wedding and give a gift without expecting a reciprocal gift in return — comparable to giving something to a Guru and receiving blessings rather than material return. The principle is to give without receiving.',
  8: "8th House – Risk/Death/Surgery: represents risk, death, and surgery. Remedies include insurance, helping someone with surgery, or supporting funeral expenses — though donation to a funeral, while noble, is not necessarily the exact reverse-engineering remedy. Closer to the exact reverse principle is an unused toilet: a toilet you never personally use (inside the house, elsewhere, or a small unused/dummy structure where a real one isn't feasible) — the 8th-house karaka becomes an unused/neglected facility, a controlled activation without actual harm. If it becomes shared/public and someone else uses it, the reverse-remedy logic is lost.",
  9: '9th House – Guru/Dharma: represents Guru and dharma. Remedy: pay fees/dakshina to a Guru or pay for a course but deliberately do not attend — give/pay without receiving the corresponding benefit, creating controlled activation of the 9th-house theme.',
  10: '10th House – Profession/Name/Status: represents profession, career, name, title, and public status. Remedy: create a second, unused professional identity — a second visiting card or career title alongside your normal one — and never actually use it, symbolically activating the 10th-house name/title without using it.',
  11: "11th House – Gains/Wealth Accumulation: represents gains and wealth accumulation. Remedy: keep a piggy bank, put money into it regularly (even a small amount, such as ₹1–₹2 per day, is enough, and it need not be daily), and do not use or withdraw the money — let the accumulated amount remain untouched, creating gains/accumulation that are not consumed. Avoid using ordinary networking as the remedy for this house's gains/exchange-of-contacts theme, since it can let the benefit return to you, which violates the reverse-engineering principle — use a completely unused/dummy representation instead.",
  12: '12th House – Expenditure/Loss/Withdrawal: represents expenditure, loss, passive/secondary income, secondary business, and things existing but not actively used. Remedy: create a secondary business, investment, or income structure (for example, register a business) but do not actually operate or use it.',
};
