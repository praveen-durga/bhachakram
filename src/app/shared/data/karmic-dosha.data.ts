import { KarmicDosha, KarmicPlanet } from './karmic-dosha.model';

// Keyed by rasi index (0 = Aries ... 11 = Pisces); values are nakshatra indices
// considered "karmic" for that rasi.
export const KARMIC_NAKSHATRAS: Record<number, number[]> = {
  0: [0],
  1: [4],
  2: [5],
  3: [8],
  4: [10],
  5: [12],
  6: [13],
  7: [16],
  8: [18, 19, 20],
  9: [22],
  10: [24],
  11: [25],
};

// Keyed by nakshatra index.
export const KARMIC_DOSHAS: Record<number, KarmicDosha> = {
  0: {
    nakshatra: 'Ashwini',
    indications:
      'Disputes related to maternal-side property. Instances of multiple marriages on the mother’s side. The mother may experience prolonged physical or emotional suffering.',
    remedies:
      'Perform Abhishekam to Lord Ganesha (3 or 9 times), preferably at a temple under a Banyan tree, when the Moon transits Ashwini Nakshatra. Offer Darbha (Garba) grass.',
  },
  4: {
    nakshatra: 'Mrigashira',
    indications:
      'Possibility of sexual misconduct or abuse in the lineage. Strong anger, harsh speech, disregard for elders, and loss due to short temper. Lack of respect toward women in the family line.',
    remedies:
      'Visit a Lord Kartikeya (Subramanya) temple and offer a garland of Arali flowers (Oleander / Erra Ganneru) when the Moon transits Mrigashira Nakshatra.',
  },
  5: {
    nakshatra: 'Ardra',
    indications:
      'Strong helping nature, but presence of suicidal tendencies in the lineage. Improper or neglected performance of Pitru Shraddha rituals.',
    remedies: 'Perform Pitru Tarpana during Mahalaya Amavasya (Pitru Paksha period) with sincerity.',
  },
  8: {
    nakshatra: 'Ashlesha',
    indications:
      'Deceit toward women or killing of four-legged animals in the lineage. Maternal-side relatives may suffer prolonged illness or remain bedridden before death.',
    remedies:
      'Pray to Lord Vishnu in a standing posture on Ashlesha Nakshatra day. Visit a Moksha Narayana temple, chant the Moksha Narayana Mantra, and offer sugarcane juice and Tulasi-infused water.',
  },
  10: {
    nakshatra: 'Purva Phalguni',
    indications:
      'Misuse of trust and leadership for sensual pleasures in the lineage. Ego obstructed the growth of others.',
    remedies:
      'Visit Andal (Goda Devi) Temple at Srivilliputtur. Offer a pink lotus to Andal on Purva Phalguni Nakshatra day or on a Friday.',
  },
  12: {
    nakshatra: 'Hasta',
    indications:
      'Betrayal of a Guru or misuse involving the Guru’s spouse in the lineage. Strong ego and belief of always being right. Missed opportunities. Loss of wealth toward the end of life due to excessive giving to family.',
    remedies:
      'Perform Chandra Darshan on Tritiya Tithi. Visit a Goshala and donate food on a Friday during Venus Hora.',
  },
  13: {
    nakshatra: 'Chitra',
    indications:
      'Denial of property rights to women or misuse of female inheritance in the lineage. Difficulty residing peacefully in one’s own home; business decline when staying at home.',
    remedies:
      'Offer jasmine flowers at the feet of Sleeping Vishnu (Sayana Vishnu) on Tuesday, Friday, or Chitra Nakshatra day.',
  },
  16: {
    nakshatra: 'Anuradha',
    indications:
      'Acts involving arson, poisoning, or food adulteration in the lineage. Experiences of robbery, fire accidents, government property acquisition with inadequate compensation, and possible death due to fire within the lineage.',
    remedies:
      'Perform Kumkuma Archana and Shiva Sahasranama on Tuesday combined with Anuradha Nakshatra. Donate food or clothing to firefighters, police, or drivers.',
  },
  18: {
    nakshatra: 'Moola',
    indications:
      'Overuse or misuse of natural resources (especially water). Insincere charity practices (taking back donated items). Lack of temple prasadam. Water-related issues at home. Inability to remain in preferred places.',
    remedies: 'Donate rice to temples, preferably equal to the individual’s body weight.',
  },
  19: {
    nakshatra: 'Purva Ashadha',
    indications:
      'Abuse of authority or power in the lineage. Marital difficulties and lack of authority or recognition despite holding good positions.',
    remedies: 'Donate rice to temples, preferably matching the person’s body weight.',
  },
  20: {
    nakshatra: 'Uttara Ashadha',
    indications:
      'Misuse of temple resources leading to a temple-related curse. Illness and family conflicts triggered during temple visits.',
    remedies: 'Donate rice to temples, preferably equivalent to the person’s body weight.',
  },
  22: {
    nakshatra: 'Dhanishta',
    indications:
      'Honor killings related to caste or religion in the lineage. Feeding Tulasi water during others’ final moments, leading to secondary status in society. Marital instability; lack of respect from women; cases of separation.',
    remedies:
      'Visit Lord Kartikeya temple and offer a pink Arali (Oleander) garland during Dhanishta Nakshatra. Preferably walk to the temple or offer during Padayatra / deity procession.',
  },
  24: {
    nakshatra: 'Purva Bhadra',
    indications:
      'Ill-treatment of women (especially daughters-in-law) or contamination of water sources in the lineage. Leads to marriage or childbirth-related issues.',
    remedies:
      'Visit a Jeeva Samadhi when the Moon transits Purva Bhadrapada Nakshatra. Feed at least 11 cows on this day.',
  },
  25: {
    nakshatra: 'Uttara Bhadra',
    indications:
      'Misuse of authority or power in the lineage, particularly actions that obstructed others education or growth. Individuals influenced by this Nakshatra should strictly avoid taking loans or debts on Purva Bhadrapada days, as it may aggravate karmic challenges. There may be a lack of Kula Devata blessings, or the family may have changed its ancestral deity. Residences may be established on land associated with unresolved past karma, leading to instability. Properties may not yield proper resale value, and recurring difficulties related to loans or financial liabilities are common.',
    remedies:
      'Visit the Ulagalantha Perumal (Ullagaananda Perumal) Temple on Uttara Bhadrapada Nakshatra day. Offer sincere prayers to the deity on this day to seek ancestral grace, spiritual protection, and relief from property- and debt-related karmic issues.',
  },
};

export const KARMIC_PLANETS: Record<string, KarmicPlanet> = {
  Sun: {
    stars: [0, 8, 16, 24],
    result: `
    <p>
      <strong>Indications</strong>
    </p>
    <ul>
      <li>Relationship with the father is ruined, separated or living away from father.</li>
      <li>Father may not be the bread winner for the family or father has financial issues.</li>
      <li>Confidence issues: less confidence or over confidence,</li>
      <li>Inclined towards politics (work life politics),</li>
      <li>Works for the central government or any government job.</li>
      <li>Father or paternal relatives will be a starting point of problem in the native’s life.</li>
      <li>Problems with authoritative people,</li>
      <li>Money flow issues particular for entrepreneur.</li>
      <li>No proper guidance or advice from the father or fatherly figure.</li>
      <li>Karmic relationship with paternal side relatives (but will end up in problems)</li>
    </ul>
    `,
  },
  Moon: {
    stars: [1, 9, 17, 25],
    result: `
    <p>
      <strong>Indications</strong>
    </p>
    <ul>
      <li>Mother may not be a loving/caring. If loving, then over protective mom.</li>
      <li>No good relationship with mother or motherly figures.</li>
      <li>Emotional/psychological issues: Emotionless or over emotional.</li>
      <li>Separation from mom, home or homeland.</li>
      <li>Food wastage and/or water wastage.</li>
      <li>Insecurity, Uncertainty & Mood swings.</li>
      <li>Cheating: Either the native’s cheats or gets cheated.</li>
      <li>Personality issues & image conscious.</li>
      <li>Karmic relationship with maternal side relatives (but will end up in problems).</li>
      <li>Mother or maternal relatives will be a starting point of problem in the native’s life.</li>
      <li>Problems in breast feeding (either mom or child will have Moon Karma).</li>
      <li>Improper guidance or improper advice received from mother or motherly figures.</li>
      <li>Doesn’t know how to handle setbacks.</li>
      <li>Frequent crying is a symptom of Moon Karma or dramas.</li>
      <li>Interested in Politics – State government, state government jobs etc.</li>
      <li>Conflicts arises in the life due to food, clothes and mom.</li>
      <li>Prefers isolation.</li>
    </ul>
    <p>
      <strong>Remidies</strong>
    </p>
    <div>
      <p>1. Stop ill treating/avoiding the primary relative associated with the planet.</p>
      <strong>Example:</strong>
      Sun → Father  Moon → Mother
      Sibling/Husband → Mars  Maternal Uncle → Mercury
    </div>
    <div>
      <p>2. Immediately stop misusing the karakas of the particular planet.</p>
      <strong>Example:</strong>
      Moon karma people, stop wasting food and water.
    </div>
    <div>
      <p>3. Don’t get over involved or indulge with the planetary relatives.</p>
      If Sun karma, don’t get over involved with the dad or follow his advice blindly. But should take care of him or offer service to him.
      This applies to the planetary relatives placed in Aswini, Asresha, Anuradha and Purva Bhadrapada.
      Highly efficient Remedy
      <ul>
        <li>Service → planet → volunteering work.</li>
        <li>Choose the career according the karmic planet.</li>
        <li>Be Vegetarian → Planet’s Day of the week.</li>
        <li>Avoid alcohol, wine → Planet’s Day of the week.</li>
        <li>Don’t over indulge with the relatives, house lords represented by the planets.</li>
      </ul>
      <strong>Example:</strong>
      If Moon gives you Sun Karma and Moon is 7L, then don’t over indulge with both mom and the spouse with respects to the karakas of Sun.
    </div>
    `,
  },
  Mars: {
    stars: [2, 10, 18, 26],
    result: `
    <p>
      <strong>Indications</strong>
    </p>
    <ul>
      <li>Unmarried person: Bachelor or spinster in the lineage.</li>
      <li>No good relationship with siblings (especially brother) or males.</li>
      <li>If female’s chart, then no good relationship with the husband.</li>
      <li>Delay in marriage.</li>
      <li>Karmic relationship with siblings, brother, cousins (but will end up in problems).</li>
      <li>Anger issues: Aggressive.</li>
      <li>Karakas of Mars will be the starting point of problem in the native’s life.</li>
      <li>Sexual issues, blood related issues (Anemia), bone marrow issues, etc.</li>
      <li>Land disputes,</li>
      <li>Prone to accidents etc.</li>
      <li>Multiple errands at the same time and stress due to that.</li>
      <li>Work/Job related to Real Estate can also be seen.</li>
      <li>Easily irritated.</li>
      <li>If Mars is well placed, then stress will be put into constructive work.</li>
      <li>Fire accidents, etc.</li>
    </ul>
    `,
  },
  Mercury: {
    stars: [3, 11, 19],
    result: `
    <p>
      <strong>Indications</strong>
    </p>
    <ul>
      <li>Communication: Speech issues, miscommunications.</li>
      <li>Intelligence: Significant memory or memory issues.</li>
      <li>No good relationship with mother’s siblings, father’s sisters or native’s sisters.</li>
      <li>If the native over indulges in a relationship with above said relatives, then they will be the starting point of problem in the native’s life.</li>
      <li>Cheating: Either the native’s cheats or gets cheated.</li>
      <li>Inter-caste marriage in the lineage.</li>
      <li>Patent issues – Should not possess a patent.</li>
      <li>Nervous systems: Problems in nervous system, neurology etc.</li>
      <li>Documentation issues, name changes/correction.</li>
      <li>Authors – but should use a pen name rather than authoring with their own name.</li>
      <li>If you witness other people who are less skillful or putting less hard work than you prospering in life.</li>
      <li>Knowledge: Did not share the knowledge with others in the previous birth.</li>
      <li>Speech disabilities: Stammering, Mute, delayed speech, etc.</li>
      <li>Problems in writing.</li>
      <li>Lack of presence of mind when needed.</li>
      <li>Skin issues, Allergies, etc.</li>
      <li>Relationship issues, separation through documentation (divorce), separation through diseases, etc.</li>
      <li>Legality issues, Small loan issues.</li>
    </ul>
    `,
  },
  Jupiter: {
    stars: [4, 12, 20],
    result: `
    <p>
      <strong>Indications</strong>
    </p>
    <ul>
      <li>Relationship with the children is ruined, separated or living away from children.</li>
      <li>Relationship with the guru is ruined, blessings of the guru is compromised.</li>
      <li>Disrespectful to elders, religious people, God, etc.</li>
      <li>Problems in child birth, miscarriage, etc.</li>
      <li>Financial issues and problem from banks can also be seen.</li>
      <li>Insecurity in marriage or lack of marital bliss.</li>
      <li>Lack of happiness, etc.</li>
      <li>Big loans and/or stress due to big loans.</li>
      <li>Issues with gold: Losing gold, gold loans etc. — <strong>Remedy:</strong> Gold should be kept in a bank locker.</li>
      <li>
        Defamation or when reputation is compromised
        <ul>
          <li>Mentorship issues.</li>
          <li>Problems with Brahmins.</li>
          <li>House should not be near a temple.</li>
          <li><strong>Religion:</strong> Inclined towards one’s religion or converted to other religion or following other religion or hatred towards other religion or atheist, etc.</li>
        </ul>
      </li>
    </ul>
    `,
  },
  Venus: {
    stars: [5, 13, 21],
    result: `
    <p>
      <strong>Indications</strong>
    </p>
    <ul>
      <li>No good relationship with females; if male chart, then no good relationship with wife.</li>
      <li>Sexual issues.</li>
      <li>Problems in relationships (relating himself to others).</li>
      <li>People who are feeling used.</li>
      <li>People who feel their love is not reciprocated.</li>
      <li>Karmic relationship with females (but will end up in problems).</li>
      <li>Venus → feelings → affected.</li>
      <li>Material comforts will be there, but the area of relationships will be ruined.</li>
      <li>Issues with Kula Devata worship – wrong deity as Kula Devata, or break in worship, or incomplete worship can be seen.</li>
    </ul>
    `,
  },
  Saturn: {
    stars: [6, 14, 22],
    result: `
    <p>
      <strong>Indications</strong>
    </p>
    <ul>
      <li>Issues with subordinates or working-class people.</li>
      <li>Issues with physically challenged people.</li>
      <li>Very slow in approaching an activity.</li>
      <li>Slow lifestyle.</li>
      <li>Consistent work schedule and perseverance in what they do.</li>
      <li>Paid less for their hard work.</li>
      <li>Boasting: Will boast about their life → life would have taught them to underplay.</li>
      <li>Should maintain a low profile.</li>
      <li>Letting go can also be seen.</li>
      <li>Social struggles and/or fighting for the rights of minorities.</li>
      <li>Last person to leave the office but given the least score in the appraisals.</li>
    </ul>
    `,
  },
  Rahu: {
    stars: [7, 15, 23],
    result: `
    <p>
      <strong>Indications</strong>
    </p>
    <ul>
      <li>Problems in learning multiple languages and eventually will learn a non-native language(s).</li>
      <li>Problem with foreigners (non-native people).</li>
      <li>Spending significant time in foreign places (non-native).</li>
      <li>Interacting with foreigners and foreign culture (non-native).</li>
      <li>Learned or acquired knowledge of non-native culture & tradition and following it.</li>
      <li>Karmic relationship with foreigners (but will end up in problems).</li>
      <li>Gambling issues and addictions.</li>
      <li>Asthma issues.</li>
      <li>Maya (mentioned here as situational secrecy or pseudo identity).</li>
      <li>Driving skills – rash drivers or significant driving skill, transportation, etc.</li>
      <li>Cancer: diagnosed with cancer; cancer-related field of study or work.</li>
    </ul>
    `,
  },
};
