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
export interface GuidanceAPIResponse {
  status: 'matched' | 'off-topic' | 'clarification';
  source?: QueryAnalysisResponse['source'];
  matches?: Array<{ id?: string | number; ayah_id?: string | number }>;
  data?: {
    selectedAyahIds?: number[];
    reasoning?: string;
    reflectionPrompt?: string;
  };
  indicator?: string;
  error?: string;
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
 * Matches keywords to verified Quran fixtures without hallucinations.
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
    normalized.includes('utbränd') ||
    normalized.includes('utmattad') ||
    normalized.includes('épuisement') ||
    normalized.includes('fardeau') ||
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
    normalized.includes('sorg') ||
    normalized.includes('förlust') ||
    normalized.includes('deuil') ||
    normalized.includes('perte') ||
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
    matched = [QURAN_FIXTURES[0]]; // 3:134
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
    matched = [QURAN_FIXTURES[1], QURAN_FIXTURES[16]]; // 94:5-6, 2:286
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
    matched = [QURAN_FIXTURES[2]]; // 2:155-156
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
    matched = [QURAN_FIXTURES[3]]; // 13:28
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
    matched = [QURAN_FIXTURES[5]]; // 65:2-3
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
    matched = [QURAN_FIXTURES[10]]; // 41:34
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
    matched = [QURAN_FIXTURES[12]]; // 49:12
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
    matched = [QURAN_FIXTURES[14]]; // 17:23-24
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
    matched = [QURAN_FIXTURES[17]]; // 39:53
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
    matched = [QURAN_FIXTURES[13]]; // 14:7
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
    matched = [QURAN_FIXTURES[7]]; // 67:2
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
    // Default fallback to first verified fixture
    matched = [QURAN_FIXTURES[0]];
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

  return {
    analysisResult: {
      status: 'matched',
      source: 'offline_fallback',
      detectedSituation,
      detectedEmotion,
      underlyingNeed,
      matchedPassageIds: matched.map((m) => m.id),
      relevanceExplanation,
    },
    matchedPassages: matched,
  };
}

/**
 * Service to execute guidance search requests against the API or fallback matcher.
 */
export const GuidanceService = {
  /**
   * Dispatches a guidance search query to the backend API with fallback resilience.
   *
   * @param queryText Search query or reflection prompt
   * @param language Active UI translation language
   * @param mode Optional entry mode override
   * @returns Promise resolving to analysis result and matched passages
   */
  async searchGuidance(
    queryText: string,
    language: Language = 'en',
    _mode?: EntryMode
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

    try {
      const response = await fetch('/api/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, language }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = (await response.json()) as GuidanceAPIResponse;
      let passageIds: string[] = [];

      if (rawData.data?.selectedAyahIds) {
        passageIds = rawData.data.selectedAyahIds.map((id) => String(id));
      } else if (rawData.matches) {
        passageIds = rawData.matches.map((m) => String(m.id || m.ayah_id));
      }

      const analysisResult: QueryAnalysisResponse = {
        status: rawData.status || 'matched',
        source: rawData.source,
        detectedSituation: rawData.data?.reasoning || 'Derived from similarity matches',
        detectedEmotion: 'Reflective',
        underlyingNeed: rawData.data?.reflectionPrompt || 'Seeking guidance',
        matchedPassageIds: passageIds,
      };

      if (analysisResult.status === 'matched' && passageIds.length > 0) {
        const matches = passageIds
          .map((id) =>
            QURAN_FIXTURES.find(
              (f) =>
                f.id === id ||
                f.id.startsWith(id) ||
                id.startsWith(f.id) ||
                f.id.split('-')[0] === id.split('-')[0]
            )
          )
          .filter(Boolean) as QuranVerseFixture[];

        return {
          analysisResult,
          passages: matches.length > 0 ? matches : [QURAN_FIXTURES[0]],
        };
      }

      if (analysisResult.status === 'off-topic') {
        return {
          analysisResult,
          passages: [],
        };
      }

      // Default fallback
      return {
        analysisResult,
        passages: [QURAN_FIXTURES[0]],
      };
    } catch (err) {
      console.warn('[GuidanceService] Backend API request failed; using client fallback:', err);
      const fallback = performClientSideGuidanceMatch(queryText);
      return {
        analysisResult: fallback.analysisResult,
        passages: fallback.matchedPassages,
      };
    }
  },
};
