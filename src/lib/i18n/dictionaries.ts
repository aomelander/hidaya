/**
 * @file src/lib/i18n/dictionaries.ts
 * @description Multi-language UI localization dictionary supporting English (en),
 * Swedish (sv), French (fr), and Native Arabic (ar) with full RTL support and
 * 100% localized quick topic pills.
 */

export type Locale = 'en' | 'sv' | 'fr' | 'ar';

export interface UIDictionary {
  searchButton: string;
  searchPlaceholder: string;
  voiceSearchActive: string;
  tafsirHeader: string;
  handsFreeButton: string;
  sourceLadderTitle: string;
  micDeniedError: string;
  micUnsupported: string;
  modeTitle: string;
  // Extended UI keys for complete app shell localization
  seekingStatus: string;
  portalTitle: string;
  portalSubtitle: string;
  preferencesButton: string;
  customizeSettings: string;
  verifiedPassages: string;
  adjustDepth: string;
  audioActive: string;
  listenButton: string;
  northStarNav: string;
  searchNav: string;
  audioNav: string;
  depthNav: string;
  savedNav: string;
  showMorePills: string;
  showLessPills: string;
  // Localized Quick Category Pills (mapped by QuickPill ID)
  quickPills: Record<string, string>;
}

export const dictionaries: Record<Locale, UIDictionary> = {
  en: {
    searchButton: "Seek",
    searchPlaceholder: "Search emotions, life situations, or questions...",
    voiceSearchActive: "Listening...",
    tafsirHeader: "Classical Tafsir & Exegesis",
    handsFreeButton: "Listen Hands-Free",
    sourceLadderTitle: "Source Transparency Ladder",
    micDeniedError: "Microphone access was denied",
    micUnsupported: "Your browser does not support voice search",
    modeTitle: "Choose Your Guidance Path",
    seekingStatus: "Seeking...",
    portalTitle: "What brings you to the Quran today?",
    portalSubtitle: "Write your situation, speak, or select what you feel",
    preferencesButton: "Preferences",
    customizeSettings: "Customize settings",
    verifiedPassages: "verified passages",
    adjustDepth: "Preferences",
    audioActive: "Audio Active",
    listenButton: "Listen",
    northStarNav: "North Star",
    searchNav: "Guidance",
    audioNav: "Audio",
    depthNav: "Preferences",
    savedNav: "Journal",
    showMorePills: "more",
    showLessPills: "Less",
    quickPills: {
      "anger-work": "Anger Management",
      "burnout-anxiety": "Burnout & Overwhelm",
      "grief-loss": "Grief & Loss",
      "restless-heart": "Restless & Anxious Heart",
      "lonely-abandoned": "Feeling Abandoned or Low",
      "career-decisions": "Life & Career Decisions",
      "guilt-regret": "Guilt & Repentance",
      "gratitude-joy": "Gratitude & Abundance",
      "purpose-existence": "What is my purpose?",
      "suffering-tragedy": "Why does suffering happen?",
      "justice-oppression": "Will justice ever prevail?",
      "responding-to-hostility": "Responding to hostility",
      "humility-daily-life": "Humility in everyday life",
      "purifying-speech": "Stopping gossip & suspicion",
      "family-patience": "Patience with parents & family",
    },
  },
  sv: {
    searchButton: "Sök",
    searchPlaceholder: "Sök efter känslor, livssituationer eller frågor...",
    voiceSearchActive: "Lyssnar...",
    tafsirHeader: "Klassisk Tafsir & Förklaring",
    handsFreeButton: "Lyssna handsfree",
    sourceLadderTitle: "Källtrappa & Referenser",
    micDeniedError: "Åtkomst till mikrofonen nekades",
    micUnsupported: "Webbläsaren stöder inte röstsökning",
    modeTitle: "Välj din vägledningsväg",
    seekingStatus: "Söker...",
    portalTitle: "Vad söker du i Quranen just nu?",
    portalSubtitle: "Skriv din situation, tala eller välj en känsla",
    preferencesButton: "Inställningar",
    customizeSettings: "Ändra inställningar",
    verifiedPassages: "verifierade passager",
    adjustDepth: "Inställningar",
    audioActive: "Ljud aktivt",
    listenButton: "Lyssna",
    northStarNav: "Ledstjärna",
    searchNav: "Vägledning",
    audioNav: "Ljud",
    depthNav: "Inställningar",
    savedNav: "Dagbok",
    showMorePills: "till",
    showLessPills: "Mindre",
    quickPills: {
      "anger-work": "Hantera ilska",
      "burnout-anxiety": "Utmattning & Stress",
      "grief-loss": "Sorg & Förlust",
      "restless-heart": "Rastlöst & Oroligt hjärta",
      "lonely-abandoned": "Ensamhet & Nedstämdhet",
      "career-decisions": "Livs- & Karriärbeslut",
      "guilt-regret": "Skuld & Ånger",
      "gratitude-joy": "Tacksamhet & Glädje",
      "purpose-existence": "Vad är mitt syfte?",
      "suffering-tragedy": "Varför finns lidande?",
      "justice-oppression": "Kommer rättvisa att segra?",
      "responding-to-hostility": "Bemöta fientlighet",
      "humility-daily-life": "Ödmjukhet i vardagen",
      "purifying-speech": "Undvika skvaller & misstankar",
      "family-patience": "Tålamod med familj & föräldrar",
    },
  },
  fr: {
    searchButton: "Chercher",
    searchPlaceholder: "Recherchez des émotions, des situations de vie ou des questions...",
    voiceSearchActive: "Écoute en cours...",
    tafsirHeader: "Tafsir Classique & Exégèse",
    handsFreeButton: "Écoute mains libres",
    sourceLadderTitle: "Échelle des Sources et Références",
    micDeniedError: "L'accès au microphone a été refusé",
    micUnsupported: "Votre navigateur ne prend pas en charge la recherche vocale",
    modeTitle: "Choisissez votre voie de guidance",
    seekingStatus: "Recherche...",
    portalTitle: "Que cherchez-vous dans le Coran en cet instant ?",
    portalSubtitle: "Écrivez, parlez ou choisissez un sentiment",
    preferencesButton: "Préférences",
    customizeSettings: "Modifier les paramètres",
    verifiedPassages: "passages vérifiés",
    adjustDepth: "Préférences",
    audioActive: "Audio actif",
    listenButton: "Écouter",
    northStarNav: "Étoile",
    searchNav: "Guidance",
    audioNav: "Audio",
    depthNav: "Préférences",
    savedNav: "Journal",
    showMorePills: "plus",
    showLessPills: "Moins",
    quickPills: {
      "anger-work": "Gestion de la colère",
      "burnout-anxiety": "Épuisement",
      "grief-loss": "Deuil & Perte",
      "restless-heart": "Cœur agité & Anxiété",
      "lonely-abandoned": "Solitude & Abandon",
      "career-decisions": "Décisions de vie & Carrière",
      "guilt-regret": "Culpabilité & Repentir",
      "gratitude-joy": "Gratitude & Abondance",
      "purpose-existence": "Quel est le sens de ma vie ?",
      "suffering-tragedy": "Pourquoi la souffrance existe-t-elle ?",
      "justice-oppression": "La justice triomphera-t-elle ?",
      "responding-to-hostility": "Répondre à l'hostilité",
      "humility-daily-life": "L'humilité au quotidien",
      "purifying-speech": "Préserver sa langue & éviter la médisance",
      "family-patience": "Patience envers les parents & la famille",
    },
  },
  ar: {
    searchButton: "بحث",
    searchPlaceholder: "ابحث عن المشاعر، أو المواقف الحياتية، أو الأسئلة...",
    voiceSearchActive: "جاري الاستماع...",
    tafsirHeader: "التفسير والبيان",
    handsFreeButton: "استماع بدون استخدام اليدين",
    sourceLadderTitle: "سلم المصادر والمراجع",
    micDeniedError: "تم رفض الوصول إلى الميكروفون",
    micUnsupported: "الفيسبوك/المتصفح لا يدعم البحث الصوتي",
    modeTitle: "اختر مسار التوجيه",
    seekingStatus: "جارٍ البحث...",
    portalTitle: "ما الذي يشغل قلبك اليوم؟",
    portalSubtitle: "اكتب، تحدث، أو اختر من الحالات الوجدانية",
    preferencesButton: "الإعدادات",
    customizeSettings: "تعديل الإعدادات",
    verifiedPassages: "مقاطع قرآنية موثقة",
    adjustDepth: "الإعدادات",
    audioActive: "الصوت نشط",
    listenButton: "استماع",
    northStarNav: "نجمة الهداية",
    searchNav: "التوجيه",
    audioNav: "الصوت",
    depthNav: "الإعدادات",
    savedNav: "يومياتي",
    showMorePills: "المزيد",
    showLessPills: "أقل",
    quickPills: {
      "anger-work": "الغضب وضبط النفس",
      "burnout-anxiety": "الإرهاق والضيق",
      "grief-loss": "الحزن والفقد",
      "restless-heart": "طمأنينة القلب والسكينة",
      "lonely-abandoned": "الوحشة والشعور بالوحدة",
      "career-decisions": "التوكل والقرارات المصيرية",
      "guilt-regret": "التوبة ومغفرة الذنوب",
      "gratitude-joy": "شكر النعمة والامتنان",
      "purpose-existence": "ما هي غاية وجودي؟",
      "suffering-tragedy": "الحكمة من الابتلاء والألم",
      "justice-oppression": "العدل الإلهي ونصرة المظلوم",
      "responding-to-hostility": "الدفع بالتي هي أحسن",
      "humility-daily-life": "التواضع وخفض الجناح",
      "purifying-speech": "حفظ اللسان واجتناب الظن",
      "family-patience": "بر الوالدين والصبر على الأهل",
    },
  },
};

export function getDictionary(locale: Locale = 'en'): UIDictionary {
  return dictionaries[locale] || dictionaries.en;
}
