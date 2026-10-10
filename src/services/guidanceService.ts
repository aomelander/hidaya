/**
 * @file guidanceService.ts
 * @description Service layer for handling Quranic guidance queries, orchestrating backend API calls,
 * and providing resilient offline/client-side semantic matching.
 */

import { QueryAnalysisResponse, QuranVerseFixture, Language, EntryMode } from '../types';
import { QURAN_FIXTURES } from '../data/quranFixtures';
import { APP_CONFIG } from '../config/appConfig';

/**
 * Backend API raw response format from `/api/guidance`
 */
export interface BackendMatchPayload {
  id?: string | number;
  ayah_id?: string | number;
  relevance_score?: number;
  surah?: {
    number: number;
    name_arabic: string;
    name_english: string;
    revelation_place: string;
  };
  ayah?: {
    ayah_number: number;
    text_uthmani: string;
    text_clean: string;
  };
  translations?: Array<{
    language_code: string;
    text: string;
    source: string;
  }>;
  selectedTranslation?: {
    language_code: string;
    text: string;
    source: string;
  };
  tafsirs?: Array<{
    scholar_name: string;
    work_title: string;
    text: string;
    language_code: string;
    source_type?: string;
    source_reference?: string;
    original_arabic_raw?: string;
    verification_status?: string;
  }>;
  topic?: {
    slug: string;
    title: string;
    life_domain: string;
  };
  companionGuidance?: any;
  surroundingVerses?: QuranVerseFixture['surroundingVerses'];
}

/**
 * Backend API raw response format from `/api/guidance`
 */
export interface GuidanceAPIResponse {
  status: 'matched' | 'off-topic' | 'clarification';
  source?: QueryAnalysisResponse['source'];
  matches?: BackendMatchPayload[];
  data?: {
    selectedAyahIds?: number[];
    reasoning?: string;
    reflectionPrompt?: string;
  };
  indicator?: string;
  error?: string;
}

/**
 * Converts a live Supabase `BackendMatchPayload` into a rich `QuranVerseFixture`.
 * If the match corresponds to one of the curated `QURAN_FIXTURES`, returns the curated fixture
 * (which includes surrounding verses, linguistic roots, and Halaqah prompts).
 * Otherwise, constructs a verified 4-level `QuranVerseFixture` directly from the database row.
 */
function hydrateMatchToFixture(match: BackendMatchPayload): QuranVerseFixture | null {
  const id = String(match.id || match.ayah_id || '');
  if (!id) return null;

  const curated = QURAN_FIXTURES.find(
    (f) =>
      f.id === id ||
      f.id.startsWith(`${id}-`) ||
      id.startsWith(`${f.id}-`) ||
      f.id.split('-')[0] === id.split('-')[0]
  );
  if (curated) {
    const shaarawiDb = match.tafsirs?.find(
      (t) => t.scholar_name === "Al-Sha'rawi" || t.scholar_name === 'الشعراوي'
    );
    const hasShaarawiCurated = curated.tafsirCitations.some(
      (c) => c.scholar === "Al-Sha'rawi" || c.scholar === 'الشعراوي'
    );
    const mergedCitations =
      shaarawiDb && !hasShaarawiCurated
        ? [
            ...curated.tafsirCitations,
            {
              scholar: "Al-Sha'rawi",
              sourceBook: shaarawiDb.work_title,
              text: shaarawiDb.text,
              languageCode: shaarawiDb.language_code || 'ar',
              sourceType: (shaarawiDb.source_type as any) || 'classical_book',
              sourceReference: shaarawiDb.source_reference,
              originalArabicRaw: shaarawiDb.original_arabic_raw || shaarawiDb.text,
              verificationStatus: (shaarawiDb.verification_status as any) || 'ai_translated_pending_review',
            },
          ]
        : curated.tafsirCitations;

    return {
      ...curated,
      tafsirCitations: mergedCitations,
      ...(match.companionGuidance ? { companionGuidance: match.companionGuidance } : {}),
    };
  }

  if (!match.surah || !match.ayah) {
    return null;
  }

  const surah = match.surah;
  const ayah = match.ayah;
  const surahNum = surah.number;
  const ayahNum = ayah.ayah_number;
  const paddedSurah = String(surahNum).padStart(3, '0');
  const paddedAyah = String(ayahNum).padStart(3, '0');

  const enTrans =
    match.translations?.find((t) => t.language_code === 'en') ||
    (match.selectedTranslation?.language_code === 'en' ? match.selectedTranslation : undefined) || {
      text: '',
      source: '',
    };
  let svTrans =
    match.translations?.find((t) => t.language_code === 'sv') ||
    (match.selectedTranslation?.language_code === 'sv' ? match.selectedTranslation : undefined);
  let frTrans =
    match.translations?.find((t) => t.language_code === 'fr') ||
    (match.selectedTranslation?.language_code === 'fr' ? match.selectedTranslation : undefined);
  let arTrans =
    match.translations?.find((t) => t.language_code === 'ar') ||
    (match.selectedTranslation?.language_code === 'ar' ? match.selectedTranslation : undefined);

  // If 7:199 is returned and fr is missing from DB query, populate certified Muhammad Hamidullah French translation
  if (id === '7:199' || (surahNum === 7 && ayahNum === 199)) {
    if (!frTrans?.text) {
      frTrans = {
        language_code: 'fr',
        text: "Accepte ce qu'on t'offre de raisonnable, commande ce qui est convenable et éloigne-toi des ignorants.",
        source: 'Muhammad Hamidullah',
      };
    }
    if (!svTrans?.text) {
      svTrans = {
        language_code: 'sv',
        text: "ÖVERSE med människornas natur [och deras brister], och uppmana [alla att visa] hövlighet och vänlighet och undvik [alla ordväxlingar med] dem som [står kvar i hednisk] okunnighet.",
        source: 'Mohammed Knut Bernström',
      };
    }
    if (!arTrans?.text) {
      arTrans = {
        language_code: 'ar',
        text: 'اقبل الفضل والعفو من أخلاق الناس وتجاوز عن تقصيرهم، وأمر بكل قول حسن وعمل معروف، وأعرض عن منازعة السفهاء.',
        source: 'التفسير الميسر',
      };
    }
  }

  const rawTafsirs = match.tafsirs || [];

  // Filter out any tafsir that equals the Quranic verse or duplicates any translation
  const trustedTafsirs = rawTafsirs.filter((t) => {
    if (!t || !t.text || !['verified_canonical', 'transcription_verified'].includes(t.verification_status || '')) return false;
    const txt = t.text.trim();
    if (txt.length === 0) return false;
    if (txt === ayah.text_uthmani.trim() || txt === ayah.text_clean.trim()) return false;
    if (enTrans.text && txt === enTrans.text.trim()) return false;
    if (svTrans?.text && txt === svTrans.text.trim()) return false;
    if (frTrans?.text && txt === frTrans.text.trim()) return false;
    return true;
  });

  const findScholarTafsir = (
    scholarKey: 'Ibn Kathir' | "Al-Sa'di" | 'Al-Muyassar' | "Al-Sha'rawi",
    defaultBook: string
  ) => {
    const found = trustedTafsirs.find((t) =>
      t.scholar_name.toLowerCase().includes(scholarKey.toLowerCase().split(' ')[1] || scholarKey.toLowerCase())
    );
    return {
      scholar: scholarKey,
      sourceBook: found?.work_title || defaultBook,
      text: found?.text || '',
      languageCode: found?.language_code,
      sourceType: (found?.source_type as any) || 'classical_book',
      sourceReference: found?.source_reference,
      originalArabicRaw: found?.original_arabic_raw,
      verificationStatus: (found?.verification_status as any) || 'ai_translated_pending_review',
    };
  };

  const dynamicTafsirCitations =
    trustedTafsirs.length > 0
      ? trustedTafsirs.map((t) => ({
          scholar: t.scholar_name,
          sourceBook: t.work_title,
          text: t.text,
          languageCode: t.language_code,
          sourceType: (t.source_type as any) || 'classical_book',
          sourceReference: t.source_reference,
          originalArabicRaw: t.original_arabic_raw,
          verificationStatus: (t.verification_status as any) || 'ai_translated_pending_review',
        }))
      : [
          findScholarTafsir('Ibn Kathir', "Tafsir al-Qur'an al-'Azim"),
          findScholarTafsir("Al-Sa'di", 'Taysir al-Karim al-Rahman'),
          findScholarTafsir('Al-Muyassar', 'Al-Tafsir Al-Muyassar'),
          findScholarTafsir("Al-Sha'rawi", 'تفسير الشعراوي (Quranpedia Book #18)'),
        ].filter((c) => c.text.length > 0);

  const revType =
    match.surah.revelation_place?.toLowerCase() === 'medinan' ? 'Medinan' : 'Meccan';

  return {
    id,
    surahNumber: surahNum,
    surahNameArabic: match.surah.name_arabic,
    surahNameTransliterated: match.surah.name_english,
    surahNameMeaning: match.surah.name_english,
    verseNumber: String(ayahNum),
    juz: Math.min(30, Math.max(1, Math.ceil(surahNum / 4))),
    revelationType: revType,
    revelationContext: `Revealed in Surah ${match.surah.name_english} (${revType}), offering direct Quranic light and spiritual grounding.`,
    arabicText: match.ayah.text_uthmani,
    transliteration: '',
    translations: {
      en: {
        text: enTrans.text,
        translator:
          !enTrans.source || enTrans.source === 'Saheeh International'
            ? 'Sahih International'
            : enTrans.source,
      },
      sv: {
        text: svTrans?.text || '',
        translator:
          !svTrans?.source || svTrans.source === 'Knut Bernström'
            ? (svTrans?.text ? 'Mohammed Knut Bernström' : '')
            : svTrans.source,
      },
      fr: {
        text: frTrans?.text || '',
        translator: frTrans?.source || (frTrans?.text ? 'Muhammad Hamidullah' : ''),
      },
      ...(arTrans?.text && arTrans.text !== ayah.text_uthmani
        ? { ar: { text: arTrans.text, translator: arTrans.source || 'بيان المعاني' } }
        : {}),
    },
    audioUrl: `https://everyayah.com/data/Alafasy_128kbps/${paddedSurah}${paddedAyah}.mp3`,
    category: 'moment',
    topics: match.topic ? [match.topic.title] : ['Quranic Reflection'],
    emotions: ['Reflective'],
    situations: [match.topic?.title || 'Spiritual contemplation'],
    whyThisVerse: {
      emotion: 'Seeking Guidance & Clarity',
      situation: match.topic?.title || 'Personal contemplation and spiritual grounding',
      coreNeed: 'Anchoring the heart in verified Quranic wisdom',
      spiritualPrinciple: 'Divine guidance illuminates the path for those who reflect.',
      mappingExplanation: `Surah ${match.surah.name_english} (${id}) directly addresses your search with verified Quranic guidance.`,
      topics: match.topic ? [match.topic.title] : ['Guidance'],
    },
    tafsirCitations: dynamicTafsirCitations,
    reflectionFramework: {
      understand: `Pause and absorb the words of Surah ${match.surah.name_english} (${id}) and its call to mindfulness and steadfastness.`,
      reflectPrompt: 'How does this verse speak to what your heart is carrying right now?',
      applyAction: 'Choose one calm, sincere action today that aligns with the wisdom of this verse.',
      livePrompt: 'What reminder from this verse will you carry with you through the rest of today?',
    },
    surroundingVerses: match.surroundingVerses,
    lifeSphere:
      match.topic?.life_domain === 'family'
        ? 'family'
        : match.topic?.life_domain === 'society'
        ? 'society'
        : 'individual',
    companionGuidance: match.companionGuidance,
  };
}

/**
 * Scores all 18 verified `QURAN_FIXTURES` against the user's query across topics,
 * situations, emotions, translations, and Arabic text so we can return 3 to 5
 * genuinely relevant verses when multiple fixtures match.
 */
function findRelevantFixturesForQuery(
  queryText: string,
  primaryFixtures: QuranVerseFixture[],
  maxResults: number = 5
): QuranVerseFixture[] {
  const normalized = queryText.toLowerCase().trim();
  const tokens = normalized.split(/[\s,.'"-?!]+/).filter((t) => t.length > 2);

  const primaryIds = new Set(primaryFixtures.map((f) => f.id));

  const scored = QURAN_FIXTURES.map((fixture) => {
    let score = primaryIds.has(fixture.id) ? 100 : 0;

    const searchableFields = [
      ...fixture.topics,
      ...fixture.emotions,
      ...fixture.situations,
      fixture.whyThisVerse.emotion,
      fixture.whyThisVerse.situation,
      fixture.whyThisVerse.coreNeed,
      fixture.translations.en.text,
      fixture.translations.sv.text,
      fixture.translations.fr.text,
      fixture.arabicText,
      fixture.surahNameArabic,
      fixture.surahNameTransliterated,
    ]
      .join(' ')
      .toLowerCase();

    if (normalized.length > 3 && searchableFields.includes(normalized)) {
      score += 40;
    }

    for (const token of tokens) {
      if (fixture.topics.some((t) => t.toLowerCase().includes(token))) score += 18;
      if (fixture.emotions.some((e) => e.toLowerCase().includes(token))) score += 18;
      if (fixture.situations.some((s) => s.toLowerCase().includes(token))) score += 15;
      if (searchableFields.includes(token)) score += 8;
    }

    // Also boost fixtures that share topics or emotions with the primary matched fixture
    if (!primaryIds.has(fixture.id) && primaryFixtures.length > 0) {
      const primaryTopics = new Set(
        primaryFixtures.flatMap((p) => p.topics.map((t) => t.toLowerCase()))
      );
      const primaryEmotions = new Set(
        primaryFixtures.flatMap((p) => p.emotions.map((e) => e.toLowerCase()))
      );

      for (const t of fixture.topics) {
        if (primaryTopics.has(t.toLowerCase())) score += 12;
      }
      for (const e of fixture.emotions) {
        if (primaryEmotions.has(e.toLowerCase())) score += 10;
      }
    }

    return { fixture, score };
  });

  // Keep only fixtures that have meaningful relevance (score >= 18)
  const relevant = scored
    .filter((item) => item.score >= 18)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.fixture);

  if (relevant.length > 0) {
    return relevant.slice(0, maxResults);
  }

  return primaryFixtures.length > 0 ? primaryFixtures : [QURAN_FIXTURES[0]];
}

/**
 * Checks if a user's query is non-reflective, purely technical, or off-topic.
 * @param query The user's query string
 * @returns boolean indicating if the query is off-topic
 */
export function isQueryOffTopic(query: string): boolean {
  const normalized = query.toLowerCase().trim();
  return APP_CONFIG.OFF_TOPIC_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

/**
 * Pure function providing resilient client-side matching when the server API is unavailable or offline.
 * Matches keywords to verified Quran fixtures without hallucinations, returning 3 to 5 verses when relevant.
 *
 * @param queryText The input text from the user
 * @returns Object containing the structured analysis result and matched passages
 */
export function performClientSideGuidanceMatch(
  queryText: string,
  language: Language = 'en'
): {
  analysisResult: QueryAnalysisResponse;
  matchedPassages: QuranVerseFixture[];
} {
  const normalized = queryText.toLowerCase().trim();

  // 1. Off-topic check
  if (isQueryOffTopic(normalized)) {
    const offTopicMessages: Record<Language, string> = {
      en: "Hidaya is a reflective companion dedicated to Quranic contemplation for real-life emotions, decisions, and character growth. We couldn't find a direct reflective match for this technical or non-reflective inquiry.",
      sv: "Hidaya är en reflektionsplattform dedikerad till Quranisk begrundan för livets känslor, beslut och karaktärstillväxt. Vi fann ingen direkt koppling till denna tekniska eller icke-reflekterande sökning.",
      fr: "Hidaya est un espace dédié à la méditation coranique pour vos émotions, décisions et cheminement intérieur. Cette requête semble technique ou en dehors de la démarche de méditation spirituelle.",
      ar: "هداية هي منصة للتدبر القرآني ومعالجة مشاعر الإنسان وقراراته وتزكية نفسه بنور الوحي. لم نجد صلة تدبرية مباشرة لهذا الاستفسار التقني أو الخارج عن سياق التأمل الروحي.",
    };

    return {
      analysisResult: {
        status: 'off-topic',
        offTopicMessage: offTopicMessages[language] || offTopicMessages.en,
        suggestedTopics: APP_CONFIG.CURATED_SUGGESTIONS.map((s) => s.label),
        matchedPassageIds: ['3:134', '94:5-6'],
      },
      matchedPassages: [],
    };
  }

  let matched: QuranVerseFixture[] = [];
  let detectedSituation = 'Life contemplation';
  let detectedEmotion = 'Seeking guidance';
  let underlyingNeed = 'Spiritual clarity and grounding';
  let relevanceExplanation = 'This passage provides verified Quranic perspective for your current situation.';

  const isAnger =
    normalized.includes('anger') ||
    normalized.includes('work') ||
    normalized.includes('rage') ||
    normalized.includes('boss') ||
    normalized.includes('colleague') ||
    normalized.includes('vrede') ||
    normalized.includes('ilska') ||
    normalized.includes('colère') ||
    normalized.includes('غضب') ||
    normalized.includes('غيظ') ||
    normalized.includes('كظم') ||
    normalized.includes('انفعال');

  const isBurnout =
    normalized.includes('burnout') ||
    normalized.includes('overwhelm') ||
    normalized.includes('stress') ||
    normalized.includes('exhaust') ||
    normalized.includes('burden') ||
    normalized.includes('patience') ||
    normalized.includes('hardship') ||
    normalized.includes('tålamod') ||
    normalized.includes('svårighet') ||
    normalized.includes('utbränd') ||
    normalized.includes('utmattad') ||
    normalized.includes('épuisement') ||
    normalized.includes('fardeau') ||
    normalized.includes('épreuve') ||
    normalized.includes('صبر') ||
    normalized.includes('بلاء') ||
    normalized.includes('عسر') ||
    normalized.includes('يسر') ||
    normalized.includes('شدة') ||
    normalized.includes('فرج') ||
    normalized.includes('إرهاق') ||
    normalized.includes('هم') ||
    normalized.includes('ضيق');

  const isGrief =
    normalized.includes('grief') ||
    normalized.includes('loss') ||
    normalized.includes('death') ||
    normalized.includes('mourn') ||
    normalized.includes('sad') ||
    normalized.includes('sorg') ||
    normalized.includes('förlust') ||
    normalized.includes('deuil') ||
    normalized.includes('perte') ||
    normalized.includes('tristesse') ||
    normalized.includes('حزن') ||
    normalized.includes('فقد') ||
    normalized.includes('موت') ||
    normalized.includes('مصيبة') ||
    normalized.includes('استرجاع');

  const isAnxiety =
    normalized.includes('heart') ||
    normalized.includes('anxiety') ||
    normalized.includes('panic') ||
    normalized.includes('fear') ||
    normalized.includes('peace') ||
    normalized.includes('oro') ||
    normalized.includes('ångest') ||
    normalized.includes('peur') ||
    normalized.includes('angoisse') ||
    normalized.includes('سكينة') ||
    normalized.includes('طمأنينة') ||
    normalized.includes('قلق') ||
    normalized.includes('خوف') ||
    normalized.includes('اضطراب') ||
    normalized.includes('ذكر');

  const isTawakkul =
    normalized.includes('divorce') ||
    normalized.includes('sustenance') ||
    normalized.includes('money') ||
    normalized.includes('provision') ||
    normalized.includes('career') ||
    normalized.includes('skilsmässa') ||
    normalized.includes('försörjning') ||
    normalized.includes('subsistance') ||
    normalized.includes('طلاق') ||
    normalized.includes('رزق') ||
    normalized.includes('توكل') ||
    normalized.includes('مخرج') ||
    normalized.includes('فقر');

  const isHostility =
    normalized.includes('injustice') ||
    normalized.includes('hostility') ||
    normalized.includes('enemy') ||
    normalized.includes('wronged') ||
    normalized.includes('orättvisa') ||
    normalized.includes('fientlighet') ||
    normalized.includes('ennemi') ||
    normalized.includes('ظلم') ||
    normalized.includes('عداوة') ||
    normalized.includes('إساءة') ||
    normalized.includes('أحسن') ||
    normalized.includes('صلح');

  const isMockery =
    normalized.includes('mock') ||
    normalized.includes('gossip') ||
    normalized.includes('ridicule') ||
    normalized.includes('skvaller') ||
    normalized.includes('moquerie') ||
    normalized.includes('médisance') ||
    normalized.includes('سخرية') ||
    normalized.includes('استهزاء') ||
    normalized.includes('غيبة') ||
    normalized.includes('ظن') ||
    normalized.includes('لسان');

  const isPurpose =
    normalized.includes('purpose') ||
    normalized.includes('why') ||
    normalized.includes('meaning') ||
    normalized.includes('syfte') ||
    normalized.includes('mening') ||
    normalized.includes('sens') ||
    normalized.includes('حكمة') ||
    normalized.includes('غاية') ||
    normalized.includes('معنى') ||
    normalized.includes('أحسن عملا');

  const isParents =
    normalized.includes('parent') ||
    normalized.includes('mother') ||
    normalized.includes('father') ||
    normalized.includes('family') ||
    normalized.includes('föräldrar') ||
    normalized.includes('mamma') ||
    normalized.includes('pappa') ||
    normalized.includes('والدين') ||
    normalized.includes('أمي') ||
    normalized.includes('أبي') ||
    normalized.includes('بر') ||
    normalized.includes('عقوق');

  const isRepentance =
    normalized.includes('forgive') ||
    normalized.includes('sin') ||
    normalized.includes('guilt') ||
    normalized.includes('förlåtelse') ||
    normalized.includes('pardon') ||
    normalized.includes('péché') ||
    normalized.includes('مغفرة') ||
    normalized.includes('توبة') ||
    normalized.includes('ذنوب') ||
    normalized.includes('أسرفوا') ||
    normalized.includes('رحمة');

  const isGratitude =
    normalized.includes('gratitude') ||
    normalized.includes('thank') ||
    normalized.includes('tacksamhet') ||
    normalized.includes('remerciement') ||
    normalized.includes('شكر') ||
    normalized.includes('حمد') ||
    normalized.includes('نعم') ||
    normalized.includes('زيادة');

  if (isAnger) {
    matched = [QURAN_FIXTURES[0], QURAN_FIXTURES[10], QURAN_FIXTURES[11]].filter(Boolean); // 3:134, 41:34, 25:63
    if (language === 'ar') {
      detectedSituation = 'التوتر في بيئة العمل والعلاقات الأسرية';
      detectedEmotion = 'الغضب والانفعال والغيظ';
      underlyingNeed = 'كظم ثورة الغضب والعفو الجميل والإحسان';
      relevanceExplanation = 'ترشد سورة آل عمران (٣:١٣٤) إلى كظم فوران الغضب في الصدر والصفح عن الإساءة والترقي إلى رتبة الإحسان.';
    } else if (language === 'sv') {
      detectedSituation = 'Spänningar på arbetsplatsen eller i relationer';
      detectedEmotion = 'Vrede och frustration';
      underlyingNeed = 'Självbehärskning och förlåtelse';
      relevanceExplanation = 'Sura Ali \'Imran (3:134) vägleder dig att tygla vreden, förlåta motparten och svara med godhet (Ihsan).';
    } else if (language === 'fr') {
      detectedSituation = 'Tensions professionnelles ou interpersonnelles';
      detectedEmotion = 'Colère et irritation';
      underlyingNeed = 'Maîtrise de soi et bienfaisance';
      relevanceExplanation = 'La sourate Ali \'Imran (3:134) enseigne la retenue de la colère, le pardon noble et l\'élévation par l\'Ihsan.';
    } else {
      detectedSituation = 'Workplace or interpersonal tension';
      detectedEmotion = 'Anger & Frustration';
      underlyingNeed = 'Restraining wrath and maintaining moral poise';
      relevanceExplanation = "Surah Ali 'Imran (3:134) guides you to restrain bubbling anger, pardon the provoking party, and maintain excellence (Ihsan).";
    }
  } else if (isBurnout) {
    matched = [QURAN_FIXTURES[1], QURAN_FIXTURES[16], QURAN_FIXTURES[2], QURAN_FIXTURES[4]].filter(Boolean); // 94:5-6, 2:286, 2:155-156, 93:1-5
    if (language === 'ar') {
      detectedSituation = 'تراكم الأعباء والإرهاق والمشقة';
      detectedEmotion = 'ثقل الهم والشعور بالعجز والضيق';
      underlyingNeed = 'اليقين بالفرج واليسر الملازم للشدة والرفق بالنفس';
      relevanceExplanation = 'تؤكد سورة الشرح (٩٤:٥-٦) أن مع كل عسر يسراً مضاعفاً يصاحبه، وأن الله لا يكلف نفساً إلا وسعها.';
    } else if (language === 'sv') {
      detectedSituation = 'Tunga bördor och utmattning';
      detectedEmotion = 'Överväldigad och stressad';
      underlyingNeed = 'Förtröstan på att lättnaden redan finns intill prövningen';
      relevanceExplanation = 'Sura Ash-Sharh garanterar att lättnaden är oskiljaktigt sammanflätad med varje svårighet.';
    } else if (language === 'fr') {
      detectedSituation = 'Lourdeur des épreuves et épuisement';
      detectedEmotion = 'Accablement et fatigue intérieure';
      underlyingNeed = 'Rassurance que le soulagement accompagne l\'épreuve';
      relevanceExplanation = 'La sourate Ash-Sharh affirme avec force qu\'à côté de toute difficulté se trouve une facilité immédiate.';
    } else {
      detectedSituation = 'Heavy burdens and exhaustion';
      detectedEmotion = 'Overwhelmed & Burned Out';
      underlyingNeed = 'Reassurance that relief is bundled alongside trials';
      relevanceExplanation = 'Surah Ash-Sharh guarantees that ease is intertwined directly with hardship.';
    }
  } else if (isGrief) {
    matched = [QURAN_FIXTURES[2], QURAN_FIXTURES[1], QURAN_FIXTURES[4], QURAN_FIXTURES[3]].filter(Boolean); // 2:155-156, 94:5-6, 93:1-5, 13:28
    if (language === 'ar') {
      detectedSituation = 'فقد الأحبة أو خسارة مفاجئة أو بلاء مؤلم';
      detectedEmotion = 'الحزن والأسى والفقد';
      underlyingNeed = 'الاسترجاع وتفويض الأمر لله ونيل بشارة الصابرين';
      relevanceExplanation = 'تثبت سورة البقرة (٢:١٥٥-١٥٦) قلوب الصابرين بمقام الاسترجاع: إنا لله وإنا إليه راجعون.';
    } else if (language === 'sv') {
      detectedSituation = 'Sorg, oväntad förlust eller motgång';
      detectedEmotion = 'Sorg och smärta';
      underlyingNeed = 'Att överlämna resultatet till Gud med tålamod';
      relevanceExplanation = 'Sura Al-Baqarah förankrar hjärtat i Istirja: vi tillhör Gud och till Honom återvänder vi.';
    } else if (language === 'fr') {
      detectedSituation = 'Deuil, perte imprévue ou épreuve éprouvante';
      detectedEmotion = 'Chagrin profond et deuil';
      underlyingNeed = 'S\'en remettre à Dieu et s\'ancrer dans la persévérance';
      relevanceExplanation = 'La sourate Al-Baqarah apaise les cœurs par l\'Istirja : nous appartenons à Dieu et vers Lui est le retour.';
    } else {
      detectedSituation = 'Bereavement or sudden loss';
      detectedEmotion = 'Grief & Mourning';
      underlyingNeed = 'Surrendering outcomes to God';
      relevanceExplanation = 'Surah Al-Baqarah anchors the heart in Istirja: we belong to God and to Him we return.';
    }
  } else if (isAnxiety) {
    matched = [QURAN_FIXTURES[3], QURAN_FIXTURES[1], QURAN_FIXTURES[4], QURAN_FIXTURES[5]].filter(Boolean); // 13:28, 94:5-6, 93:1-5, 65:2-3
    if (language === 'ar') {
      detectedSituation = 'تسارع الأفكار والقلق واضطراب الخاطر';
      detectedEmotion = 'القلق والخوف من المجهول';
      underlyingNeed = 'سكون الروح وطمأنينة القلب بذكر الله';
      relevanceExplanation = 'تعلن سورة الرعد (١٣:٢٨) أن الدواء الأكيد لاضطراب القلوب وقلقها هو الاتصال بالله ودوام ذكره.';
    } else if (language === 'sv') {
      detectedSituation = 'Tankekaos och inre rastlöshet';
      detectedEmotion = 'Oro och ångest';
      underlyingNeed = 'Frid och ro genom Guds minne';
      relevanceExplanation = 'Sura Ar-Ra\'d klargör att människohjärtat finner sin sanna ro och stillhet i minnet av Gud.';
    } else if (language === 'fr') {
      detectedSituation = 'Agitation mentale et incertitude';
      detectedEmotion = 'Anxiété et tourment';
      underlyingNeed = 'Tranquillité authentique par le souvenir de Dieu';
      relevanceExplanation = 'La sourate Ar-Ra\'d établit que seul le souvenir d\'Allah procure au cœur un apaisement véritable.';
    } else {
      detectedSituation = 'Racing thoughts and inner restlessness';
      detectedEmotion = 'Anxiety';
      underlyingNeed = 'Tranquility through divine remembrance';
      relevanceExplanation = 'Surah Ar-Rad establishes that only divine remembrance restores authentic peace to the heart.';
    }
  } else if (isTawakkul) {
    matched = [QURAN_FIXTURES[5], QURAN_FIXTURES[1], QURAN_FIXTURES[16]].filter(Boolean); // 65:2-3, 94:5-6, 2:286
    if (language === 'ar') {
      detectedSituation = 'ضيق الرزق أو الخلافات الأسرية والطلاق أو الحيرة في الأسباب';
      detectedEmotion = 'الخوف من المستقبل والفقر';
      underlyingNeed = 'التقوى وصدق التوكل واليقين بأن الله كافٍ عبده';
      relevanceExplanation = 'تعد سورة الطلاق (٦٥:٢-٣) بأن تقوى الله والتوكل الصادق يفتحان أبواب المخرج والرزق من حيث لا يحتسب المرء.';
    } else if (language === 'sv') {
      detectedSituation = 'Ekonomisk oro, skilsmässa eller rädsla för framtiden';
      detectedEmotion = 'Otrygghet och oro för försörjningen';
      underlyingNeed = 'Uppriktig tillit (Tawakkul) och moralisk integritet';
      relevanceExplanation = 'Sura At-Talaq lovar att Gud skänker utvägar och försörjning från oväntat håll för den som förtröstar på Honom.';
    } else if (language === 'fr') {
      detectedSituation = 'Inquiétude matérielle, séparation ou épreuve de vie';
      detectedEmotion = 'Peur du lendemain et insécurité';
      underlyingNeed = 'Confiance totale en Dieu (Tawakkul) et droiture';
      relevanceExplanation = 'La sourate At-Talaq garantit que la piété et la confiance en Dieu ouvrent des issues là où l\'on ne s\'y attendait pas.';
    } else {
      detectedSituation = 'Financial strain, divorce, or fear of future poverty';
      detectedEmotion = 'Uncertainty & Insecurity';
      underlyingNeed = 'Tawakkul and trusting divine provision';
      relevanceExplanation = 'Surah At-Talaq promises divine exits and provision from uncalculated coordinates for the steadfast.';
    }
  } else if (isHostility) {
    matched = [QURAN_FIXTURES[10], QURAN_FIXTURES[0], QURAN_FIXTURES[11]].filter(Boolean); // 41:34, 3:134, 25:63
    if (language === 'ar') {
      detectedSituation = 'مواجهة العداوة أو الإساءة والظلم من الآخرين';
      detectedEmotion = 'الألم من الخصومة والرغبة في الانتصار للنفس';
      underlyingNeed = 'الدفع بالتي هي أحسن وتحويل العداوة إلى مودة بحلم وأناة';
      relevanceExplanation = 'تأمر سورة فصلت (٤١:٣٤) بمقابلة الإساءة بالإحسان لكسب القلوب وإطفاء نيران العداوة بنبل الأخلاق.';
    } else if (language === 'sv') {
      detectedSituation = 'Konflikter, orättvisor eller fientlighet';
      detectedEmotion = 'Sårad stolthet och bitterhet';
      underlyingNeed = 'Att bemöta ondska med överlägsen godhet';
      relevanceExplanation = 'Sura Fussilat (41:34) vägleder dig att avväpna fientlighet med ädel godhet och förvandla fiender till vänner.';
    } else if (language === 'fr') {
      detectedSituation = 'Conflits, provocations ou animosité vécue';
      detectedEmotion = 'Ressentiment et blessure';
      underlyingNeed = 'Repousser le mal par ce qui est meilleur';
      relevanceExplanation = 'La sourate Fussilat (41:34) enseigne à désarmer la rancœur par une noblesse exemplaire.';
    } else {
      detectedSituation = 'Facing hostility, unfairness, or provocation';
      detectedEmotion = 'Resentment & Urge to Retaliate';
      underlyingNeed = 'Repelling negativity with superior grace';
      relevanceExplanation = 'Surah Fussilat commands responding to hostility with excellence to turn adversaries into allies.';
    }
  } else if (isMockery) {
    matched = [QURAN_FIXTURES[12], QURAN_FIXTURES[11], QURAN_FIXTURES[10]].filter(Boolean); // 49:12, 25:63, 41:34
    if (language === 'ar') {
      detectedSituation = 'مجالس السخرية أو سوء الظن أو تتبع العورات';
      detectedEmotion = 'الشعور بالإهانة أو الوقوع في الغيبة';
      underlyingNeed = 'اجتناب الظن وعفة اللسان وصيانة أعراض الناس';
      relevanceExplanation = 'تنهى سورة الحجرات (٤٩:١٢) عن سوء الظن والتجسس والغيبة، وتدعو إلى تطهير اللسان وسلامة الصدر.';
    } else if (language === 'sv') {
      detectedSituation = 'Skvaller, elaka kommentarer eller misstänksamhet';
      detectedEmotion = 'Kränkt eller frestad att baktala';
      underlyingNeed = 'Att värna om andras heder och rena sitt tal';
      relevanceExplanation = 'Sura Al-Hujurat (49:12) förbjuder illasinnade antaganden, spionage och baktal, och manar till ett rent tal.';
    } else if (language === 'fr') {
      detectedSituation = 'Commérages, moqueries ou méfiance envers autrui';
      detectedEmotion = 'Blessure de la réputation ou tentation de médire';
      underlyingNeed = 'Préserver la dignité d\'autrui et purifier sa parole';
      relevanceExplanation = 'La sourate Al-Hujurat (49:12) proscrit les soupçons non fondés et la médisance pour protéger le lien social.';
    } else {
      detectedSituation = 'Gossip, mockery, or malicious assumptions';
      detectedEmotion = 'Hurt or Temptation to Belittle';
      underlyingNeed = 'Purifying speech and protecting human dignity';
      relevanceExplanation = 'Surah Al-Hujurat prohibits unfounded suspicions, spying, and backbiting.';
    }
  } else if (isParents) {
    matched = [QURAN_FIXTURES[14], QURAN_FIXTURES[15], QURAN_FIXTURES[0]].filter(Boolean); // 17:23-24, 31:14-15, 3:134
    if (language === 'ar') {
      detectedSituation = 'رعاية الوالدين عند الكبر والتعامل مع تقلبات المزاج الأسري';
      detectedEmotion = 'الضيق أو نفاد الصبر أو الرغبة في البر';
      underlyingNeed = 'خفض جناح الذل من الرحمة وحسن القول وتجنب التأفف';
      relevanceExplanation = 'تأمر سورة الإسراء (١٧:٢٣-٢٤) ببر الوالدين بالقول الكريم وخفض جناح الرحمة والدعاء لهما كما ربيا صغيراً.';
    } else if (language === 'sv') {
      detectedSituation = 'Familjedynamik och omsorg om åldrande föräldrar';
      detectedEmotion = 'Tålamod och empati';
      underlyingNeed = 'Ödmjukhet och kärleksfull barmhärtighet';
      relevanceExplanation = 'Sura Al-Isra (17:23-24) manar till att sänka barmhärtighetens vingar och tala med mildhet till föräldrar.';
    } else if (language === 'fr') {
      detectedSituation = 'Relations familiales et prise en charge des parents âgés';
      detectedEmotion = 'Patience et tendresse filiale';
      underlyingNeed = 'Humilité et douceur dans la parole';
      relevanceExplanation = 'La sourate Al-Isra (17:23-24) prescrit d\'abaisser l\'aile de la tendresse et d\'adresser des paroles nobles aux parents.';
    } else {
      detectedSituation = 'Family dynamics and caring for aging parents';
      detectedEmotion = 'Patience & Compassion';
      underlyingNeed = 'Humbling oneself with wings of mercy';
      relevanceExplanation = 'Surah Al-Isra commands lowering the wing of humility to aging parents with tender prayer.';
    }
  } else if (isRepentance) {
    matched = [QURAN_FIXTURES[17], QURAN_FIXTURES[6], QURAN_FIXTURES[0]].filter(Boolean); // 39:53, 21:87, 3:134
    if (language === 'ar') {
      detectedSituation = 'الشعور بالذنب والتقصير والإسراف على النفس';
      detectedEmotion = 'الندم والخشية من عدم قبول التوبة';
      underlyingNeed = 'اليقين بسعة رحمة الله التي تغفر الذنوب جميعاً والرجوع الصادق إليه';
      relevanceExplanation = 'تنادي سورة الزمر (٣٩:٥٣) التائبين بالنداء الحاني: لا تقنطوا من رحمة الله إن الله يغفر الذنوب جميعاً.';
    } else if (language === 'sv') {
      detectedSituation = 'Skuldkänslor och ånger över tidigare misstag';
      detectedEmotion = 'Ånger och oro för att inte bli förlåten';
      underlyingNeed = 'Förtröstan på Guds gränslösa barmhärtighet';
      relevanceExplanation = 'Sura Az-Zumar (39:53) ropar kärleksfullt till de ångerfulla: förtvivla inte om Guds nåd.';
    } else if (language === 'fr') {
      detectedSituation = 'Culpabilité et sentiment d\'éloignement de Dieu';
      detectedEmotion = 'Regret et crainte du rejet';
      underlyingNeed = 'Certitude dans le pardon divin inconditionnel';
      relevanceExplanation = 'La sourate Az-Zumar (39:53) adresse un appel rassurant : ne désespérez pas de la miséricorde d\'Allah.';
    } else {
      detectedSituation = 'Burden of guilt, moral lapses, or past regrets';
      detectedEmotion = 'Remorse & Fear of Rejection';
      underlyingNeed = 'Absolute certainty in boundless divine forgiveness';
      relevanceExplanation = 'Surah Az-Zumar (39:53) invites those burdened by shortcomings to never despair of divine mercy.';
    }
  } else if (isGratitude) {
    matched = [QURAN_FIXTURES[13], QURAN_FIXTURES[4], QURAN_FIXTURES[3]].filter(Boolean); // 14:7, 93:1-5, 13:28
    if (language === 'ar') {
      detectedSituation = 'التأمل في نعم الله وتقلب الأحوال أو طلب دوام الفضل';
      detectedEmotion = 'الشكر والاعتراف بالفضل والرجاء';
      underlyingNeed = 'تقييد النعم بالشكر والاستبشار بزيادة الفضل والخير';
      relevanceExplanation = 'تضع سورة إبراهيم (١٤:٧) القانون الإلهي العظيم: لئن شكرتم لأزيدنكم، فالشكر قيد النعم ومفتاح المزيد.';
    } else if (language === 'sv') {
      detectedSituation = 'Tacksamhet över livets gåvor eller önskan om fortsatt välsignelse';
      detectedEmotion = 'Tacksamhet och ödmjuk glädje';
      underlyingNeed = 'Att förankra tacksamheten i hjärtat för att öppna för mer gott';
      relevanceExplanation = 'Sura Ibrahim (14:7) formulerar den andliga principen: om ni är tacksamma skall Jag ge er mer.';
    } else if (language === 'fr') {
      detectedSituation = 'Méditation sur les bienfaits reçus et l\'abondance';
      detectedEmotion = 'Reconnaissance et joie paisible';
      underlyingNeed = 'Reconnaître les grâces divines pour ouvrir les portes du bien';
      relevanceExplanation = 'La sourate Ibrahim (14:7) énonce la règle spirituelle : si vous êtes reconnaissants, très certainement J\'augmenterai Mes bienfaits.';
    } else {
      detectedSituation = 'Reflecting on blessings or seeking continuation of favor';
      detectedEmotion = 'Gratitude & Reverent Joy';
      underlyingNeed = 'Anchoring appreciation to unlock divine increase';
      relevanceExplanation = 'Surah Ibrahim (14:7) sets the spiritual law of Shukr: acknowledging favors unlocks divine increase.';
    }
  } else if (isPurpose) {
    matched = [QURAN_FIXTURES[7], QURAN_FIXTURES[8], QURAN_FIXTURES[9]].filter(Boolean); // 67:2, 57:22-23, 45:22
    if (language === 'ar') {
      detectedSituation = 'التساؤل عن سر الوجود والموت والغاية من الابتلاءات';
      detectedEmotion = 'الحيرة الوجودية والبحث عن المعنى';
      underlyingNeed = 'إدراك أن الحياة ميدان للتسابق في إحسان العمل وصدق النية';
      relevanceExplanation = 'توضح سورة الملك (٦٧:٢) أن الموت والحياة خُلقا لتزكية الإنسان وامتحان أيهما أخلص عملاً وأصوبه.';
    } else if (language === 'sv') {
      detectedSituation = 'Funderingar kring livets mening och existentiella prövningar';
      detectedEmotion = 'Existentiell nyfikenhet och sökande';
      underlyingNeed = 'Att se livet som en arena för moralisk skönhet';
      relevanceExplanation = 'Sura Al-Mulk (67:2) klargör att döden och livet skapades för att pröva vem som handlar med renast avsikt.';
    } else if (language === 'fr') {
      detectedSituation = 'Questionnement sur le sens de la vie et de la mort';
      detectedEmotion = 'Quête de sens et réflexion existentielle';
      underlyingNeed = 'Considérer la vie comme un creuset d\'élévation morale';
      relevanceExplanation = 'La sourate Al-Mulk (67:2) éclaire que la vie et la mort sont éprouvées pour révéler les meilleures œuvres.';
    } else {
      detectedSituation = 'Questioning the meaning of life, death, and suffering';
      detectedEmotion = 'Existential Curiosity';
      underlyingNeed = 'Viewing life as a crucible for moral beauty';
      relevanceExplanation = 'Surah Al-Mulk clarifies that existence is calibrated to examine who acts with highest sincerity.';
    }
  } else {
    // Score all fixtures for general queries and keep up to 5 relevant matches
    matched = findRelevantFixturesForQuery(queryText, [], 5);
    if (language === 'ar') {
      detectedSituation = 'تأمل في واقع الحياة والبحث عن الهداية القرآنية';
      detectedEmotion = 'البحث عن السكينة والبصيرة';
      underlyingNeed = 'استقاء التوجيه النوراني لتهدئة النفس وضبط البوصلة الأخلاقية';
      relevanceExplanation = 'يقدم هذا المقطع القرآني المعتمد بصيرة هادية ومعالم واضحة لسكينة قلبك ومسار حياتك.';
    } else if (language === 'sv') {
      detectedSituation = 'Livsbegrundan och sökande efter vägledning';
      detectedEmotion = 'Sökande efter klarhet';
      underlyingNeed = 'Andlig förankring och moralisk kompass';
      relevanceExplanation = 'Denna passage erbjuder ett verifierat Quraniskt perspektiv för din situation.';
    } else if (language === 'fr') {
      detectedSituation = 'Méditation sur le cours de la vie et recherche d\'orientation';
      detectedEmotion = 'Quête de sérénité et de repères';
      underlyingNeed = 'Ancrage spirituel et boussole morale';
      relevanceExplanation = 'Ce passage apporte un éclairage coranique authentique pour vous accompagner.';
    }
  }

  // Augment with any additional strongly relevant fixtures up to 5 total
  const finalMatched = findRelevantFixturesForQuery(queryText, matched, 5);

  return {
    analysisResult: {
      status: 'matched',
      source: 'offline_fallback',
      detectedSituation,
      detectedEmotion,
      underlyingNeed,
      matchedPassageIds: finalMatched.map((m) => m.id),
      relevanceExplanation,
    },
    matchedPassages: finalMatched,
  };
}

/**
 * Service to execute guidance search requests against the API or fallback matcher.
 */
export const GuidanceService = {
  /**
   * Dispatches a guidance search query to the backend API with fallback resilience.
   * Returns 3 to 5 verses when multiple verses are relevant to the query.
   *
   * @param queryText Search query or reflection prompt
   * @param language Active UI translation language
   * @param mode Optional entry mode override
   * @returns Promise resolving to analysis result and matched passages
   */
  async searchGuidance(
    queryText: string,
    language: Language = 'en',
    _mode?: EntryMode,
    signal?: AbortSignal
  ): Promise<{
    analysisResult: QueryAnalysisResponse;
    passages: QuranVerseFixture[];
  }> {
    if (!queryText.trim()) {
      const defaultVerse = QURAN_FIXTURES[0];
      return {
        analysisResult: {
          status: 'matched',
          matchedPassageIds: [defaultVerse.id],
        },
        passages: [defaultVerse],
      };
    }

    // Also compute client-side relevant curated fixtures so we can blend/enrich when relevant
    const clientMatch = performClientSideGuidanceMatch(queryText, language);

    try {
      const response = await fetch(`/api/guidance?lang=${encodeURIComponent(language)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, language, lang: language }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = (await response.json()) as GuidanceAPIResponse;

      if (rawData.status === 'off-topic' || clientMatch.analysisResult.status === 'off-topic') {
        return {
          analysisResult: clientMatch.analysisResult,
          passages: [],
        };
      }

      // Hydrate all returned database matches (both curated fixtures and any of the 6,236 live Ayahs)
      const hydratedBackendMatches: QuranVerseFixture[] = [];
      const seenIds = new Set<string>();

      if (rawData.matches && rawData.matches.length > 0) {
        for (const m of rawData.matches) {
          const hydrated = hydrateMatchToFixture(m);
          if (hydrated && !seenIds.has(hydrated.id)) {
            seenIds.add(hydrated.id);
            hydratedBackendMatches.push(hydrated);
          }
        }
      } else if (rawData.data?.selectedAyahIds) {
        for (const rawId of rawData.data.selectedAyahIds) {
          const id = String(rawId);
          const found = QURAN_FIXTURES.find(
            (f) =>
              f.id === id ||
              f.id.startsWith(id) ||
              id.startsWith(f.id) ||
              f.id.split('-')[0] === id.split('-')[0]
          );
          if (found && !seenIds.has(found.id)) {
            seenIds.add(found.id);
            hydratedBackendMatches.push(found);
          }
        }
      }

      // Blend relevant client curated matches with backend matches up to 5 relevant verses
      const combinedPassages: QuranVerseFixture[] = [...hydratedBackendMatches];
      for (const curatedPassage of clientMatch.matchedPassages) {
        if (combinedPassages.length >= 5) break;
        if (!seenIds.has(curatedPassage.id)) {
          seenIds.add(curatedPassage.id);
          combinedPassages.push(curatedPassage);
        }
      }

      const finalPassages =
        combinedPassages.length > 0
          ? combinedPassages.slice(0, 5)
          : clientMatch.matchedPassages.slice(0, 5);

      const analysisResult: QueryAnalysisResponse = {
        status: rawData.status || 'matched',
        source: rawData.source,
        detectedSituation:
          rawData.data?.reasoning || clientMatch.analysisResult.detectedSituation,
        detectedEmotion: clientMatch.analysisResult.detectedEmotion || 'Reflective',
        underlyingNeed:
          rawData.data?.reflectionPrompt || clientMatch.analysisResult.underlyingNeed,
        matchedPassageIds: finalPassages.map((p) => p.id),
        relevanceExplanation: clientMatch.analysisResult.relevanceExplanation,
      };

      return {
        analysisResult,
        passages: finalPassages,
      };
    } catch (err) {
      console.warn('[GuidanceService] Backend API request failed; using client fallback:', err);
      return {
        analysisResult: clientMatch.analysisResult,
        passages: clientMatch.matchedPassages,
      };
    }
  },
};
