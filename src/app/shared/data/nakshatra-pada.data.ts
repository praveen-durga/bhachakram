import { NakshatraPadas } from './nakshatra-pada.model';

// Keyed by nakshatra index (0 = Ashwini ... 26 = Revati), matching NAKSHATRA_NAMES order.
export const NAKSHATRA_PADA_DATA: Record<number, NakshatraPadas> = {
  0: {
    1: {
      characteristics: 'Adventurous, pioneering, energetic',
      careerPath: 'Pioneering roles, entrepreneurship, emergency services, sports',
    },
    2: {
      characteristics: 'Innovative, ambitious, dynamic',
      careerPath: 'Innovation, technology startups, management consulting',
    },
    3: {
      characteristics: 'Resourceful, determined, focused',
      careerPath: 'Engineering, research and development, military',
    },
    4: {
      characteristics: 'Resilient, inspiring, influential',
      careerPath: 'Leadership in healthcare, coaching, motivational speaking',
    },
  },
  1: {
    1: {
      characteristics: 'Strong-willed, disciplined, methodical',
      careerPath: 'Leadership roles, management, politics, entrepreneurship',
    },
    2: {
      characteristics: 'Creative, passionate, artistic',
      careerPath: 'Creative arts, writing, design, innovation, technology',
    },
    3: {
      characteristics: 'Nurturing, empathetic, protective',
      careerPath: 'Engineering, architecture, science, research, law',
    },
    4: {
      characteristics: 'Transformative, intense, powerful',
      careerPath: 'Transformative fields like psychology, counseling, crisis management',
    },
  },
  2: {
    1: {
      characteristics: 'Fiery, assertive, determined',
      careerPath: 'Administration, management, business consultancy',
    },
    2: { characteristics: 'Practical, grounded, stable', careerPath: 'Finance, real estate, agriculture' },
    3: {
      characteristics: 'Artistic, sensual, pleasure-seeking',
      careerPath: 'Performing arts, fashion, interior design, beauty industry',
    },
    4: {
      characteristics: 'Stable, reliable, methodical',
      careerPath: 'Agriculture, horticulture, farming, environmental sciences',
    },
  },
  3: {
    1: {
      characteristics: 'Artistic, creative, luxury-oriented',
      careerPath: 'Arts, entertainment, hospitality, luxury goods',
    },
    2: { characteristics: 'Nurturing, caring, sensual', careerPath: 'Counseling, teaching, childcare, hospitality' },
    3: { characteristics: 'Sensual, materialistic, grounded', careerPath: 'Food industry, fashion, real estate' },
    4: { characteristics: 'Creative, artistic, expressive', careerPath: 'Media, advertising, creative writing' },
  },
  4: {
    1: { characteristics: 'Curious, exploratory, flexible', careerPath: 'Research, exploration, travel industry' },
    2: { characteristics: 'Communicative, intellectual, adaptable', careerPath: 'Journalism, teaching, sales' },
    3: { characteristics: 'Versatile, creative, restless', careerPath: 'Marketing, event planning, consulting' },
    4: { characteristics: 'Versatile, adaptable, persuasive', careerPath: 'Public relations, negotiation, law' },
  },
  5: {
    1: { characteristics: 'Intense, passionate, transformative', careerPath: 'Research, investigation, technology' },
    2: { characteristics: 'Intellectual, curious, communicative', careerPath: 'Academia, writing, media' },
    3: { characteristics: 'Analytical, research-oriented, unconventional', careerPath: 'Science, engineering, IT' },
    4: { characteristics: 'Humanitarian, progressive, independent', careerPath: 'Activism, social work, innovation' },
  },
  6: {
    1: { characteristics: 'Optimistic, philosophical, generous', careerPath: 'Education, philosophy, publishing' },
    2: { characteristics: 'Nurturing, caring, compassionate', careerPath: 'Healthcare, counseling, teaching' },
    3: { characteristics: 'Artistic, expressive, sensitive', careerPath: 'Arts, music, therapy' },
    4: { characteristics: 'Renewing, adaptable, prosperous', careerPath: 'Business, finance, real estate' },
  },
  7: {
    1: { characteristics: 'Nurturing, protective, spiritual', careerPath: 'Administration, government, education' },
    2: {
      characteristics: 'Disciplined, responsible, traditional',
      careerPath: 'Law, management, traditional businesses',
    },
    3: { characteristics: 'Spiritual, introspective, wise', careerPath: 'Spirituality, counseling, research' },
    4: { characteristics: 'Practical, methodical, stable', careerPath: 'Engineering, agriculture, long-term projects' },
  },
  8: {
    1: { characteristics: 'Intense, secretive, perceptive', careerPath: 'Investigation, psychology, business' },
    2: { characteristics: 'Intuitive, psychological, manipulative', careerPath: 'Counseling, sales, negotiation' },
    3: { characteristics: 'Ambitious, adaptable, cunning', careerPath: 'Finance, trading, consulting' },
    4: { characteristics: 'Ambitious, leadership qualities, dramatic', careerPath: 'Media, politics, entertainment' },
  },
  9: {
    1: { characteristics: 'Authoritative, regal, dignified', careerPath: 'Government, management, heritage' },
    2: { characteristics: 'Creative, expressive, dramatic', careerPath: 'Arts, theater, public speaking' },
    3: { characteristics: 'Noble, generous, traditional', careerPath: 'Charity, history, administration' },
    4: { characteristics: 'Spiritual, philosophical, detached', careerPath: 'Spirituality, research, occult' },
  },
  10: {
    1: { characteristics: 'Charismatic, pleasure-loving, creative', careerPath: 'Entertainment, hospitality, arts' },
    2: { characteristics: 'Charismatic, social, diplomatic', careerPath: 'Public relations, diplomacy, sales' },
    3: { characteristics: 'Practical, hardworking, disciplined', careerPath: 'Business, finance, craftsmanship' },
    4: {
      characteristics: 'Analytical, detail-oriented, service-oriented',
      careerPath: 'Healthcare, service industries, analysis',
    },
  },
  11: {
    1: {
      characteristics: 'Leadership qualities, organized, ambitious',
      careerPath: 'Corporate leadership, administration, government',
    },
    2: { characteristics: 'Practical, service-oriented, helpful', careerPath: 'Healthcare, teaching, social services' },
    3: { characteristics: 'Dynamic, ambitious, recognition-seeking', careerPath: 'Media, politics, public roles' },
    4: {
      characteristics: 'Service-oriented, helpful, meticulous',
      careerPath: 'Medicine, editing, detail-oriented professions',
    },
  },
  12: {
    1: { characteristics: 'Detail-oriented, analytical, meticulous', careerPath: 'Crafts, jewelry, healing arts' },
    2: {
      characteristics: 'Practical, methodical, problem-solving',
      careerPath: 'Engineering, surgery, administration',
    },
    3: { characteristics: 'Creative, artistic, imaginative', careerPath: 'Writing, sculpture, design' },
    4: { characteristics: 'Service-oriented, humanitarian, caring', careerPath: 'Social work, therapy, volunteering' },
  },
  13: {
    1: { characteristics: 'Creative, artistic, innovative', careerPath: 'Architecture, design, fashion' },
    2: { characteristics: 'Diplomatic, balanced, harmonious', careerPath: 'Law, mediation, arts' },
    3: {
      characteristics: 'Analytical, scientific, perfectionist',
      careerPath: 'Engineering, research, jewelry making',
    },
    4: {
      characteristics: 'Humanitarian, service-oriented, compassionate',
      careerPath: 'Photography, film, humanitarian work',
    },
  },
  14: {
    1: { characteristics: 'Independent, freedom-loving, intellectual', careerPath: 'Trade, business, aviation' },
    2: { characteristics: 'Diplomatic, sociable, balanced', careerPath: 'Diplomacy, law, consulting' },
    3: { characteristics: 'Dynamic, progressive, innovative', careerPath: 'Technology, media, travel' },
    4: { characteristics: 'Humanitarian, caring, service-oriented', careerPath: 'Social work, NGOs, writing' },
  },
  15: {
    1: { characteristics: 'Ambitious, determined, goal-oriented', careerPath: 'Politics, business, military' },
    2: { characteristics: 'Charismatic, persuasive, social', careerPath: 'Sales, marketing, public speaking' },
    3: { characteristics: 'Intense, passionate, transformative', careerPath: 'Research, philosophy, counseling' },
    4: { characteristics: 'Practical, disciplined, hardworking', careerPath: 'Engineering, law, administration' },
  },
  16: {
    1: {
      characteristics: 'Determined, ambitious, leadership qualities',
      careerPath: 'Management, diplomacy, team leadership',
    },
    2: { characteristics: 'Cooperative, diplomatic, balanced', careerPath: 'HR, counseling, international relations' },
    3: { characteristics: 'Creative, artistic, expressive', careerPath: 'Arts, music, therapy' },
    4: { characteristics: 'Spiritual, philosophical, wise', careerPath: 'Teaching, spirituality, research' },
  },
  17: {
    1: { characteristics: 'Courageous, authoritative, commanding', careerPath: 'Leadership, military, occult' },
    2: { characteristics: 'Resourceful, determined, intense', careerPath: 'Finance, investigation, management' },
    3: { characteristics: 'Creative, expressive, dynamic', careerPath: 'Media, writing, entertainment' },
    4: { characteristics: 'Wise, philosophical, spiritual', careerPath: 'Philosophy, teaching, advisory roles' },
  },
  18: {
    1: { characteristics: 'Truth-seeking, spiritual, intense', careerPath: 'Research, medicine, investigation' },
    2: {
      characteristics: 'Investigative, research-oriented, determined',
      careerPath: 'Science, detective work, healing',
    },
    3: { characteristics: 'Ambitious, determined, focused', careerPath: 'Business, law, politics' },
    4: {
      characteristics: 'Practical, disciplined, methodical',
      careerPath: 'Administration, engineering, agriculture',
    },
  },
  19: {
    1: {
      characteristics: 'Charismatic, ambitious, leadership qualities',
      careerPath: 'Creative arts, performing arts',
    },
    2: { characteristics: 'Creative, expressive, diplomatic', careerPath: 'Diplomacy, writing, media' },
    3: { characteristics: 'Intellectual, philosophical, optimistic', careerPath: 'Education, publishing, consulting' },
    4: { characteristics: 'Humanitarian, compassionate, spiritual', careerPath: 'Social work, healing, arts' },
  },
  20: {
    1: { characteristics: 'Courageous, authoritative, commanding', careerPath: 'Corporate leadership, government' },
    2: { characteristics: 'Ambitious, driven, goal-oriented', careerPath: 'Business management, executive roles' },
    3: { characteristics: 'Practical, disciplined, responsible', careerPath: 'Law, administration, finance' },
    4: { characteristics: 'Spiritual, philosophical, wise', careerPath: 'Teaching, philosophy, advisory' },
  },
  21: {
    1: { characteristics: 'Wise, learned, communicative', careerPath: 'Education, journalism, counseling' },
    2: {
      characteristics: 'Practical, methodical, organized',
      careerPath: 'Administration, research, library sciences',
    },
    3: { characteristics: 'Creative, expressive, artistic', careerPath: 'Music, writing, media' },
    4: {
      characteristics: 'Service-oriented, helpful, compassionate',
      careerPath: 'Healthcare, social services, teaching',
    },
  },
  22: {
    1: { characteristics: 'Ambitious, leadership, musical', careerPath: 'Music, management, real estate' },
    2: { characteristics: 'Innovative, ambitious, social', careerPath: 'Technology, group projects, finance' },
    3: { characteristics: 'Dynamic, charismatic, group-oriented', careerPath: 'Politics, sports, orchestration' },
    4: { characteristics: 'Humanitarian, progressive, independent', careerPath: 'Social reform, innovation, military' },
  },
  23: {
    1: { characteristics: 'Inventive, humanitarian, visionary', careerPath: 'Science, medicine, technology' },
    2: { characteristics: 'Analytical, scientific, methodical', careerPath: 'Research, engineering, healing' },
    3: { characteristics: 'Independent, progressive, unconventional', careerPath: 'Aviation, IT, occult sciences' },
    4: {
      characteristics: 'Healing, mystical, compassionate',
      careerPath: 'Alternative medicine, spirituality, counseling',
    },
  },
  24: {
    1: { characteristics: 'Idealistic, spiritual, intense', careerPath: 'Philosophy, activism, teaching' },
    2: { characteristics: 'Visionary, spiritual, intuitive', careerPath: 'Writing, arts, spiritual guidance' },
    3: { characteristics: 'Philosophical, wise, compassionate', careerPath: 'Counseling, humanitarian work' },
    4: {
      characteristics: 'Transformative, intense, spiritual',
      careerPath: 'Occult, research, transformative therapies',
    },
  },
  25: {
    1: { characteristics: 'Wise, compassionate, spiritual', careerPath: 'Teaching, social work, administration' },
    2: { characteristics: 'Compassionate, intuitive, humanitarian', careerPath: 'Counseling, NGO work, healing' },
    3: { characteristics: 'Practical, responsible, disciplined', careerPath: 'Law, management, environmental' },
    4: { characteristics: 'Mystical, occult, transformative', careerPath: 'Mysticism, research, spiritual leadership' },
  },
  26: {
    1: { characteristics: 'Compassionate, kind-hearted, spiritual', careerPath: 'Healing, arts, hospitality' },
    2: { characteristics: 'Imaginative, artistic, nurturing', careerPath: 'Music, writing, caregiving' },
    3: { characteristics: 'Philosophical, wise, generous', careerPath: 'Teaching, philosophy, charity' },
    4: {
      characteristics: 'Practical, methodical, service-oriented',
      careerPath: 'Business, transportation, service industries',
    },
  },
};
