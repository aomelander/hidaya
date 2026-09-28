import { EditorialReviewEntry } from '../types';

export const INITIAL_EDITORIAL_REVIEWS: Record<string, EditorialReviewEntry> = {
  '3:134': {
    verseId: '3:134',
    reviewerName: 'Dr. Tariq Al-Husseini',
    institution: 'Faculty of Usul al-Din (Al-Azhar) & Gothenburg Islamic Academy',
    status: 'verified',
    mappingConfidence: 98,
    theologicalNotes:
      'Verse directly prescribes Kadhin al-Ghaydh (anger suppression) and Afw (pardon) followed by Ihsan. Mapping to workplace and family conflict is strictly aligned with classical interpretations from Ibn Kathir and Al-Sa’di. Contextual boundary guard appropriately cautions against tolerating abusive injustice.',
    boundaryConfirmed: true,
    lastAudited: '2026-08-15',
  },
  '94:5-6': {
    verseId: '94:5-6',
    reviewerName: 'Ustadh Bilal Lindqvist',
    institution: 'Swedish Council of Imams & Scandinavian Islamic Research',
    status: 'verified',
    mappingConfidence: 100,
    theologicalNotes:
      'Grammatical analysis of "al-’usr" (definite, singular trial) vs "yusran" (indefinite, manifold ease) verified. Pastoral counseling relevance for burnout, exhaustion, and chronic stress conforms to prophetic Sunnah of giving glad tidings during hardships.',
    boundaryConfirmed: true,
    lastAudited: '2026-08-20',
  },
  '2:155-156': {
    verseId: '2:155-156',
    reviewerName: 'Shaykh Amina Zerouali',
    institution: 'European Institute of Human Sciences (IESH Paris)',
    status: 'verified',
    mappingConfidence: 99,
    theologicalNotes:
      'Addresses bereavement, economic collapse, and sudden fear through Istirja ("Inna lillahi wa inna ilayhi raji’un"). Affirmation of divine ownership shields the soul from nihilism. Theological boundaries verified: grief and weeping are human and permitted, while despair is addressed.',
    boundaryConfirmed: true,
    lastAudited: '2026-09-02',
  },
  '13:28': {
    verseId: '13:28',
    reviewerName: 'Dr. Tariq Al-Husseini',
    institution: 'Faculty of Usul al-Din (Al-Azhar) & Gothenburg Islamic Academy',
    status: 'verified',
    mappingConfidence: 96,
    theologicalNotes:
      'Directly links psychological restlessness and cognitive turbulence to spiritual estrangement. Verified that modern anxiety framing does not contradict traditional Tafsir bi-l-Ma’thur.',
    boundaryConfirmed: true,
    lastAudited: '2026-09-10',
  },
  '67:2': {
    verseId: '67:2',
    reviewerName: 'Ustadh Bilal Lindqvist',
    institution: 'Swedish Council of Imams & Scandinavian Islamic Research',
    status: 'verified',
    mappingConfidence: 95,
    theologicalNotes:
      'Existential purpose of life and mortality defined as a crucible for moral beauty ("ahsanu ’amala"). Clarified that quality and sincerity of deeds take precedence over quantity.',
    boundaryConfirmed: true,
    lastAudited: '2026-09-12',
  },
};

export interface InquirerGlossaryTerm {
  term: string;
  arabic: string;
  literalMeaning: string;
  universalLesson: {
    en: string;
    sv: string;
    fr: string;
    ar?: string;
  };
  misconceptionClarified: {
    en: string;
    sv: string;
    fr: string;
    ar?: string;
  };
}

export const INQUIRER_GLOSSARY: InquirerGlossaryTerm[] = [
  {
    term: 'Sabr',
    arabic: 'صَبْر',
    literalMeaning: 'To bind, withhold, or persevere with fortitude',
    universalLesson: {
      en: 'Not passive resignation or feeling defeated, but emotional grit, emotional self-regulation, and perseverance through life’s storms.',
      sv: 'Inte passiv resignation eller uppgivenhet, utan inre styrka, emotionell självbehärskning och ståndaktighet genom livets stormar.',
      fr: 'Non pas une résignation passive, mais une force d’âme, une maîtrise de soi et une persévérance active face aux épreuves.',
      ar: 'ليس استسلاماً سلبياً أو شعوراً بالهزيمة، بل هو ثبات نفسي وقوة إرادة وضبط للمشاعر واستمرارية في مواجهة أعباء الحياة.',
    },
    misconceptionClarified: {
      en: 'Sabr does NOT mean accepting abuse, injustice, or remaining silent when harm can be ethically rectified.',
      sv: 'Sabr betyder INTE att acceptera förtryck, våld eller att tiga när orättvisor etiskt kan åtgärdas.',
      fr: 'Le Sabr ne signifie PAS accepter l’injustice ou la violence sans réagir ni faire valoir ses droits.',
      ar: 'الصبر لا يعني أبداً الرضوخ للظلم أو الإهانة أو السكوت عن المنكر والضرر الذي يمكن رفعه بالحق والعدل.',
    },
  },
  {
    term: 'Ihsan',
    arabic: 'إِحْسَان',
    literalMeaning: 'Excellence, spiritual beauty, doing good beyond obligation',
    universalLesson: {
      en: 'Living with high craftsmanship and moral beauty, behaving gracefully even when nobody is watching because the divine is witnessing.',
      sv: 'Att leva med moralisk skönhet och högsta omsorg, att bemöta andra väl även när ingen ser, förankrad i det gudomligas närvaro.',
      fr: 'Vivre avec bienfaisance et noblesse, agir avec excellence même sans témoins terrestres, conscient du regard divin.',
      ar: 'العيش بإتقان وجمال خلقي رفيع، ومقابلة الإساءة بالإحسان حتى حين لا يراك أحد، استشعاراً لمراقبة الله ورؤيته.',
    },
    misconceptionClarified: {
      en: 'Ihsan is not superficial perfectionism; it is sincere effort and heartfelt kindness.',
      sv: 'Ihsan är inte ytlig perfektionism; det är uppriktig ansträngning och hjärtlig omtanke.',
      fr: 'L’Ihsan n’est pas un perfectionnisme rigide, mais une pureté d’intention et une bonté sincère.',
      ar: 'الإحسان ليس مثالية قاسية أو تكلفاً شكلياً، بل هو صدق النية واللطف الإنساني المستمر النابع من القلب.',
    },
  },
  {
    term: 'Tawakkul',
    arabic: 'تَوَكُّل',
    literalMeaning: 'Active reliance and placing one’s trust after tying the camel',
    universalLesson: {
      en: 'Taking every practical, rational step within your control, and then releasing toxic anxiety by entrusting the ultimate outcome to God.',
      sv: 'Att ta alla praktiska, rationella steg du förmår, för att därefter släppa destruktiv oro och förtrösta på det yttersta resultatet hos Gud.',
      fr: 'Mettre en œuvre tous les moyens rationnels et éthiques possibles, puis s’en remettre avec sérénité à la sagesse divine.',
      ar: 'بذل كل الأسباب والوسائل المشروعة والمتاحة، ثم التحرر من القلق بتفويض النتائج والخواتيم إلى حكمة الله وتدبيره.',
    },
    misconceptionClarified: {
      en: 'Tawakkul is the opposite of fatalism. The Prophet famously instructed: "Tie your camel first, then put your trust in Allah."',
      sv: 'Tawakkul är motsatsen till fatalism. Profeten sade: "Tjudra din kamel först, förtrösta sedan på Gud."',
      fr: 'Le Tawakkul s’oppose au fatalisme passif. Le Prophète a enseigné : "Attache ton chameau d’abord, puis place ta confiance en Dieu."',
      ar: 'التوكل نقيض التواكل؛ فالنبي ﷺ أرشد الأعرابي بقوله: "اعقلها وتوكل"، أي خذ بالأسباب أولاً ثم فوّض أمرك.',
    },
  },
  {
    term: 'Rahmah',
    arabic: 'رَحْمَة',
    literalMeaning: 'Mercy, derived from the root R-H-M (the mother’s womb)',
    universalLesson: {
      en: 'Unconditional protective compassion that embraces, nourishes, and forgives vulnerabilities, just as a womb nurtures an unborn child.',
      sv: 'Villkorslös skyddande barmhärtighet som omfamnar, ger näring och förlåter brister, precis som en moders livmoder när ett barn.',
      fr: 'Une miséricorde matricielle et enveloppante qui protège, nourrit et pardonne, à l’image du sein maternel.',
      ar: 'عاطفة رحيمة حانية تغمر وتغذي وتستر الضعف البشري، مشتقة من رحم الأم الذي يحتضن الجنين ويحميه ويرعاه.',
    },
    misconceptionClarified: {
      en: 'Divine mercy in the Quran precedes wrath. Every surah (except one) begins: "In the name of God, the Lord of Mercy, the Giver of Mercy."',
      sv: 'Guds barmhärtighet föregår vrede i Koranen. Varje kapitel (utom ett) inleds med "I Guds, den Nåderikes, den Barmhärtiges namn".',
      fr: 'La miséricorde divine prévaut sur la colère. Chaque sourate (sauf une) s’ouvre par : "Au nom de Dieu, le Tout Miséricordieux, le Très Miséricordieux".',
      ar: 'رحمة الله في القرآن تسبق غضبه؛ فكل سورة في كتاب الله (عدا التوبة) تبتدئ بـ: "بسم الله الرحمن الرحيم".',
    },
  },
];
