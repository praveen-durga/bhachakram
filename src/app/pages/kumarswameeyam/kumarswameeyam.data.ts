// Kumara Swameeyam - 27 distinct indications, one per nakshatra position
// (1-27) counted from natal Moon (Janma Nakshatra), per the user's own
// table. Unlike Nava Tara this is not reduced mod 9 - each of the 27
// nakshatras maps to its own unique result.
export const KUMARA_SWAMEEYAM_INDICATIONS: Record<number, string> = {
  1: 'Stressful',
  2: 'Advantageous',
  3: 'Vipat',
  4: 'Domestic happiness',
  5: 'Loss of actions',
  6: 'Achievement',
  7: 'Depression',
  8: 'Friendly',
  9: 'Very friendly',
  10: 'Action / Karma',
  11: 'Communal enmity',
  12: 'Damage',
  13: 'Highly beneficial',
  14: 'Commonality',
  15: 'Social excellence',
  16: 'Fight',
  17: 'Good',
  18: 'Financial foe',
  19: 'Anxious',
  20: 'Auspicious',
  21: 'Unwanted achievements',
  22: 'Ill-health',
  23: 'Blocking the progress/actions of the native',
  24: 'Place',
  25: 'Challenge to self-esteem',
  26: 'Community',
  27: 'Homage',
};

// Adi Devata - the deity for worship per nakshatra, per the user's own
// table. Indexed by nakshatra (0 = Ashwini ... 26 = Revati), matching
// NAKSHATRA_NAMES order - distinct from the classical BPHS "ruling deity"
// per nakshatra used elsewhere in Jyotish (e.g. Bharani-Yama, Ashlesha-
// Sarpa), this is the worship deity the user supplied directly.
export const ADI_DEVATA = [
  'Ganesha / Saraswati', // Ashwini
  'Durga Devi', // Bharani
  'Agni Deva', // Krittika
  'Brahma', // Rohini
  'Chandra Deva', // Mrigashira
  'Rudra (Siva)', // Ardra
  'Rama', // Punarvasu
  'Guru Bhagavan', // Pushya
  'Adisheshan', // Ashlesha
  'Sukra Deva', // Magha
  'Parvati Amma', // Purva Phalguni
  'Surya Bhagavan', // Uttara Phalguni
  'Ayyappa', // Hasta
  'Kamakshi Amma', // Chitra
  'Narasimha / Vayu Bhagavan', // Swati
  'Subramanya', // Vishakha
  'Lakshmi', // Anuradha
  'Indra', // Jyeshta
  'Hanuman', // Moola
  'Varun Deva', // Purva Ashadha
  'Ganapati', // Uttara Ashadha
  'Vishnu / Trivikrama Deva', // Sravana
  'Indrani', // Dhanishta
  'Yama', // Satabhisha
  'Kubera', // Purva Bhadra
  'Kamadenu', // Uttara Bhadra
  'Shani Deva', // Revati
];

// Yogini (Devi/Shakti) per nakshatra, per the user's own table. Indexed by
// nakshatra (0 = Ashwini ... 26 = Revati), matching NAKSHATRA_NAMES order -
// an 8-name cycle (Bramhi, Kaumari, Varahi, Siddhi, Vaishnavi, Mahendri,
// Chamundi, Maheshwari) repeating across the 27 nakshatras.
export const YOGINI = [
  'Bramhi', // Ashwini
  'Kaumari', // Bharani
  'Varahi', // Krittika
  'Siddhi', // Rohini
  'Vaishnavi', // Mrigashira
  'Mahendri', // Ardra
  'Chamundi', // Punarvasu
  'Maheshwari', // Pushya
  'Bramhi', // Ashlesha
  'Kaumari', // Magha
  'Varahi', // Purva Phalguni
  'Siddhi', // Uttara Phalguni
  'Vaishnavi', // Hasta
  'Mahendri', // Chitra
  'Chamundi', // Swati
  'Maheshwari', // Vishakha
  'Bramhi', // Anuradha
  'Kaumari', // Jyeshta
  'Varahi', // Moola
  'Siddhi', // Purva Ashadha
  'Vaishnavi', // Uttara Ashadha
  'Mahendri', // Sravana
  'Chamundi', // Dhanishta
  'Maheshwari', // Satabhisha
  'Bramhi', // Purva Bhadra
  'Kaumari', // Uttara Bhadra
  'Varahi', // Revati
];

// Temple per nakshatra, per the user's own table. Indexed by nakshatra
// (0 = Ashwini ... 26 = Revati), matching NAKSHATRA_NAMES order.
export const NAKSHATRA_TEMPLE = [
  'Thiruvanlar', // Ashwini
  'Thiruvalangadu', // Bharani
  'Thirunaggai', // Krittika
  'Thirunageswaram / Naganagireeswaram', // Rohini
  'Kadiramangalam vadadai', // Mrigashira
  'ThiruKollikadi Thirukadaiyur', // Ardra
  'Alumgudi', // Punarvasu
  'Kuchanur (near madurai)', // Pushya
  'Kundrathur / Kundram', // Ashlesha
  'Chidambaram', // Magha
  'Thirumanancheri', // Purva Phalguni
  'Moolanur', // Uttara Phalguni
  'Thiruvarur', // Hasta
  'Thiruvarur', // Chitra
  'Thiruvannamalai', // Swati
  'Cholavandan', // Vishakha
  'Thiruvidaimaradu', // Anuradha
  'Palladam', // Jyeshta
  'Madhurai Meenakshi amman temple', // Moola
  'Tirunavalur', // Purva Ashadha
  'Dharmapuram', // Uttara Ashadha
  'Tethupattai', // Sravana
  'Kodumudi', // Dhanishta
  'Thirchangod Aradeshwara Temple', // Satabhisha
  'Kanchipuram', // Purva Bhadra
  'Thiruvaiyaru', // Uttara Bhadra
  'Omampuliyur', // Revati
];

// Gemstone per nakshatra, per the user's own table. Indexed by nakshatra
// (0 = Ashwini ... 26 = Revati), matching NAKSHATRA_NAMES order - a 9-stone
// cycle repeating across the 27 nakshatras.
export const NAKSHATRA_GEMSTONE = [
  "Cat's Eye", // Ashwini
  'Diamond', // Bharani
  'Ruby', // Krittika
  'Pearl', // Rohini
  'Red Coral', // Mrigashira
  'Gomed (Hessonite)', // Ardra
  'Yellow Sapphire', // Punarvasu
  'Blue Sapphire', // Pushya
  'Emerald', // Ashlesha
  "Cat's Eye", // Magha
  'Diamond', // Purva Phalguni
  'Ruby', // Uttara Phalguni
  'Red Coral', // Hasta
  'Pearl', // Chitra
  'Gomed', // Swati
  'Yellow Sapphire', // Vishakha
  'Blue Sapphire', // Anuradha
  'Emerald', // Jyeshta
  "Cat's Eye", // Moola
  'Diamond', // Purva Ashadha
  'Ruby', // Uttara Ashadha
  'Pearl', // Sravana
  'Coral', // Dhanishta
  'Gomed', // Satabhisha
  'Yellow Sapphire', // Purva Bhadra
  'Blue Sapphire', // Uttara Bhadra
  'Emerald', // Revati
];

// Yantra (recommended worship) per nakshatra, per the user's own table.
// Indexed by nakshatra (0 = Ashwini ... 26 = Revati), matching
// NAKSHATRA_NAMES order.
export const NAKSHATRA_YANTRA = [
  'Sudarshana Yantra', // Ashwini
  'TripuraSundari Yantra', // Bharani
  'Sudarshana Yantra', // Krittika
  'Venugopal Yantra', // Rohini
  'Ashawaaruda Yantra', // Mrigashira
  'Mrityunjaya Yantra', // Ardra
  'Sudarshana Yantra', // Punarvasu
  'Subramanya Yantra', // Pushya
  'Ganapathi Yantra', // Ashlesha
  'Lakshmi Narasimha Yantra', // Magha
  'Sudarshana Yantra', // Purva Phalguni
  'Bala Tripura Sundari Yantra', // Uttara Phalguni
  'Bala Yantra', // Hasta
  'Ashwa Aruda Yantra', // Chitra
  'Tripura Sundara Yantra', // Swati
  'Subramanya Yantra', // Vishakha
  'Mrityunjaya Yantra', // Anuradha
  'Tripura Sundara Yantra', // Jyeshta
  'Ganapati Yantra', // Moola
  'Tripura Sundara Yantra', // Purva Ashadha
  'Ashwa Aruda Yantra', // Uttara Ashadha
  'Rajagopala Yantra', // Sravana
  'Ganapati Yantra', // Dhanishta
  'Sudarshana Yantra', // Satabhisha
  'Sudarshana Yantra', // Purva Bhadra
  'Ashwa Aruda Yantra', // Uttara Bhadra
  'Maga Sudarshana Yantra', // Revati
];

// Abhishekam (recommended item) per nakshatra, per the user's own table.
// Indexed by nakshatra (0 = Ashwini ... 26 = Revati), matching
// NAKSHATRA_NAMES order.
export const NAKSHATRA_ABHISHEKAM = [
  'Fragrant substances (suganda tailam)', // Ashwini
  'Rice Flour', // Bharani
  'Amla powder', // Krittika
  'Turmeric', // Rohini
  'Turmeric', // Mrigashira
  'Panchagavya', // Ardra
  'Panchamrutam', // Punarvasu
  'Milk', // Pushya
  'Milk', // Ashlesha
  'Curd', // Magha
  'Ghee', // Purva Phalguni
  'Sugarcane', // Uttara Phalguni
  'Honey', // Hasta
  'Sugarcane juice', // Chitra
  'Fruit juice', // Swati
  'Tender coconut', // Vishakha
  'Cooked rice', // Anuradha
  'Vibhuti', // Jyeshta
  'Sandalwood powder', // Moola
  'Vilvam (Bhel)', // Purva Ashadha
  'Bhel', // Uttara Ashadha
  'Shankha Jalam', // Sravana
  'Shankha Jalam', // Dhanishta
  'Rose water (Paneer)', // Satabhisha
  'Golden vessel water', // Purva Bhadra
  'Silver vessel water', // Uttara Bhadra
  'Kumbha Jalam', // Revati
];
