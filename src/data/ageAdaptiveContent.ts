/**
 * @file src/data/ageAdaptiveContent.ts
 * @description Provides age-adaptive companion guidance for Kids Mode (8yo),
 * Teen Mode (13yo–17yo), and Family Halaqah Questions across English (en),
 * Swedish (sv), French (fr), and Arabic (ar).
 *
 * Strictly adheres to AGENTS.md:
 * - Never paraphrases or alters Level 1 (Uthmani Arabic), Level 2 (Certified Translation),
 *   or Level 3 (Classical Tafsir).
 * - Provides clearly labeled Level 4 reflective and educational companion guidance.
 */

import { Language, QuranVerseFixture, LinguisticRoot } from '../types';

export interface KidsStoryInsight {
  title: string;
  storyText: string;
  familyQuestionTitle: string;
  familyQuestion: string;
  tryTodayLabel: string;
  tryTodayAction: string;
}

export interface TeenWordInsight {
  term: string;
  meaning: string;
}

export interface AgeAdaptiveBundle {
  kids: KidsStoryInsight;
  teenKeyTakeaway: string;
  teenGlossary: TeenWordInsight[];
  defaultRoot: LinguisticRoot;
}

const VERSE_KIDS_STORIES: Record<
  string,
  Record<
    Language,
    {
      storyText: string;
      familyQuestion: string;
      tryTodayAction: string;
      teenTakeaway: string;
    }
  >
> = {
  '3:134': {
    en: {
      storyText:
        'When someone makes you angry, imagine your anger is water inside a leather bottle. This verse teaches us to tie the bottle shut so no mean words spill out, forgive the person, and do something kind instead.',
      familyQuestion:
        'When someone at home or school annoys us, what is one calm thing we can do before speaking?',
      tryTodayAction:
        'Count slowly to 5 and take a deep breath the next time you feel upset today.',
      teenTakeaway:
        'True strength is not winning an argument—it is holding back anger when you have the power to snap back, then choosing grace (Ihsan).',
    },
    sv: {
      storyText:
        'När någon gör dig arg, tänk dig att ilskan är vatten i en flaska. Denna vers lär oss att skruva åt korken så inga elaka ord rinner ut, förlåta personen och svara med något snällt.',
      familyQuestion:
        'När någon hemma eller i skolan gör oss irriterade, vad kan vi göra för att lugna oss innan vi svarar?',
      tryTodayAction:
        'Räkna långsamt till 5 och ta ett djupt andetag nästa gång du blir arg idag.',
      teenTakeaway:
        'Sann styrka är inte att vinna ett bråk – det är att behärska ilskan när du blir provocerad och välja godhet (Ihsan).',
    },
    fr: {
      storyText:
        "Quand quelqu'un te met en colère, imagine que ta colère est de l'eau dans une gourde. Ce verset nous apprend à bien fermer la gourde pour qu'aucun mot blessant ne sorte, à pardonner et à faire le bien.",
      familyQuestion:
        'Quand quelqu’un nous énerve à la maison ou à l’école, quel geste calme pouvons-nous faire avant de répondre ?',
      tryTodayAction:
        "Compte lentement jusqu'à 5 et respire profondément la prochaine fois que tu te sens fâché.",
      teenTakeaway:
        "La vraie force n'est pas de gagner une dispute, mais de maîtriser sa colère face à la provocation et de choisir l'excellence (Ihsan).",
    },
    ar: {
      storyText:
        'حين يُغضبك أحد، تخيّل أن الغضب ماءٌ داخل قِربة. تعلّمنا هذه الآية أن نربط فم القِربة بإحكام فلا تخرج كلمة جارحة، وأن نسامح ونقابل الإساءة بالخير.',
      familyQuestion:
        'عندما يضايقنا أحد في البيت أو المدرسة، ما هي الخطوة الهادئة التي نتفق على فعلها قبل أن نتكلم؟',
      tryTodayAction:
        'عدّ بهدوء من ١ إلى ٥ وخذ نفساً عميقاً عندما تشعر بالغضب اليوم.',
      teenTakeaway:
        'القوة الحقيقية ليست في الرد بالمثل، بل في ضبط النفس عند الغضب والارتقاء إلى مقام الإحسان والعفو.',
    },
  },
  '94:5-6': {
    en: {
      storyText:
        'Just like sunny skies always come after rain, Allah promises us twice in this verse that every hard time has relief and help right next to it.',
      familyQuestion:
        'What is one hard thing our family went through where Allah helped us and brought something good afterward?',
      tryTodayAction:
        'Thank Allah for three good helpers or blessings in your life right now.',
      teenTakeaway:
        'Exam pressure, stress, and tough seasons are never permanent dead-ends—Arabic grammar here proves that one hardship is surrounded by double ease.',
    },
    sv: {
      storyText:
        'Precis som solen alltid tittar fram efter regnet, lovar Gud oss två gånger i denna vers att varje svår sak har hjälp och lättnad precis bredvid sig.',
      familyQuestion:
        'Kan vi minnas något svårt som vår familj gick igenom där Gud hjälpte oss och gav oss något fint efteråt?',
      tryTodayAction:
        'Tacka Gud för tre bra saker som hjälper dig i din vardag just nu.',
      teenTakeaway:
        'Provstress och tunga perioder är aldrig slutet – språket i versen visar att en enda svårighet omges av dubbel lättnad.',
    },
    fr: {
      storyText:
        'Tout comme le soleil revient toujours après la pluie, Dieu nous promet deux fois dans ce verset que chaque moment difficile est accompagné d’une aide et d’une facilité.',
      familyQuestion:
        'Quel moment difficile notre famille a-t-elle traversé avant de voir l’aide et le soulagement de Dieu ?',
      tryTodayAction:
        'Remercie Dieu pour trois belles choses qui t’aident aujourd’hui.',
      teenTakeaway:
        'Le stress des études et les épreuves ne sont jamais une impasse : une seule difficulté est entourée d’une double facilité.',
    },
    ar: {
      storyText:
        'كما تشرق الشمس دائماً بعد المطر، يبشّرنا الله مرتين في هذه الآية بأن مع كل صعوبة فرجاً وتيسيراً قريباً يرافقها.',
      familyQuestion:
        'ما هو الموقف الصعب الذي مرّت به أسرتنا ثم رأينا فيه لطف الله وتيسيره؟',
      tryTodayAction:
        'اشكر الله اليوم على ثلاث نعم جميلة تيسّر لك يومك.',
      teenTakeaway:
        'ضغط الدراسة والهموم ليست طريقاً مسدوداً؛ فالعسر الواحد محاط بيسرين يغلبانه بوعد الله الصادق.',
    },
  },
  '13:28': {
    en: {
      storyText:
        'When your heart feels jumpy or worried, remembering Allah is like a warm blanket that makes your heart feel safe, quiet, and peaceful.',
      familyQuestion:
        'What is our favorite short dhikr or prayer to say together before going to sleep?',
      tryTodayAction:
        'Place your hand on your heart, close your eyes for 10 seconds, and whisper "SubhanAllah".',
      teenTakeaway:
        'Endless scrolling only adds noise to an anxious mind; genuine inner quiet (Tuma’ninah) comes from pausing to reconnect with God.',
    },
    sv: {
      storyText:
        'När ditt hjärta känns oroligt eller пирrigt är minnet av Gud som en varm filt som gör hjärtat tryggt, lugnt och stilla.',
      familyQuestion:
        'Vilket är vårt favoritord av dhikr att säga tillsammans innan vi somnar?',
      tryTodayAction:
        'Lägg handen på hjärtat, blunda i 10 sekunder och säg "SubhanAllah" tyst för dig själv.',
      teenTakeaway:
        'Att scrolla på mobilen dämpar inte inre stress – verklig sinnesro (Tuma’ninah) kommer när du stannar upp och minns Gud.',
    },
    fr: {
      storyText:
        "Quand ton cœur est inquiet ou agité, se souvenir d'Allah est comme une couverture douce qui rend ton cœur calme, en sécurité et paisible.",
      familyQuestion:
        'Quelle est notre invocation préférée à réciter ensemble avant de dormir ?',
      tryTodayAction:
        'Pose ta main sur ton cœur, ferme les yeux 10 secondes et murmure « SubhanAllah ».',
      teenTakeaway:
        "Les écrans n'apaisent pas un esprit anxieux ; la vraie paix intérieure (Tuma'ninah) naît de la connexion avec Dieu.",
    },
    ar: {
      storyText:
        'حين يشعر قلبك بالخوف أو القلق، فإن ذكر الله يشبه الدفء الحاني الذي يعيد لقلبك الأمان والهدوء والسكينة.',
      familyQuestion:
        'ما هو الذكر المفضل الذي نحب أن نردده معاً في البيت كل مساء؟',
      tryTodayAction:
        'ضع يدك على قلبك، وأغمض عينيك عشر ثوانٍ وقل بخشوع: سبحان الله وبحمده.',
      teenTakeaway:
        'كثرة التصفح والشاشات تزيد تشتت الذهن؛ والطمأنينة الحقيقية لا تسكن القلب إلا بلحظة صدق وذكر لله.',
    },
  },
  '17:23-24': {
    en: {
      storyText:
        'Just as a mother bird gently lowers her soft wings over her babies to protect them, Allah asks us to be gentle, polite, and loving to our Mom and Dad.',
      familyQuestion:
        'What is one helpful thing each of us can do today to make Mom and Dad smile?',
      tryTodayAction:
        'Hug your parents today and thank them for taking care of you.',
      teenTakeaway:
        'Even when you disagree with your parents or feel frustrated, lowering your voice and speaking with respect is one of the highest ranks of character.',
    },
    sv: {
      storyText:
        'Precis som en fågelmamma mjukt sänker sina vingar över sina ungar för att skydda dem, ber Gud oss att vara snälla, artiga och kärleksfulla mot mamma och pappa.',
      familyQuestion:
        'Vad är en snäll sak var och en av oss kan göra idag för att göra mamma och pappa glada?',
      tryTodayAction:
        'Ge dina föräldrar en kram idag och tacka dem för allt de gör.',
      teenTakeaway:
        'Även när du känner dig frustrerad hemma är en mjuk röst och respekt mot föräldrarna ett av de ädlaste karaktärsdragen.',
    },
    fr: {
      storyText:
        "Comme un oiseau qui abaisse doucement ses ailes pour protéger ses petits, Dieu nous demande d'être doux, polis et affectueux envers nos parents.",
      familyQuestion:
        "Quelle petite attention chacun de nous peut-il faire aujourd'hui pour faire sourire maman et papa ?",
      tryTodayAction:
        "Serre tes parents dans tes bras aujourd'hui et dis-leur merci.",
      teenTakeaway:
        'Même dans les moments de désaccord familial, garder un ton doux et respectueux envers ses parents est une preuve de maturité spirituelle.',
    },
    ar: {
      storyText:
        'كما يخفض الطائر جناحيه بحنان ليحمي صغاره، يأمرنا الله أن نتحدث مع أمنا وأبينا بأدب ولطف وحب، وألا نقول لهما أي كلمة تضجّر.',
      familyQuestion:
        'ما هي المبادرة الجميلة التي يمكن لكل واحد منا أن يفعلها اليوم لإدخال السرور على قلب أمي وأبي؟',
      tryTodayAction:
        'قبّل يد أو رأس والديك اليوم وقل لهما: جزاكما الله خيراً.',
      teenTakeaway:
        'حتى عند اختلاف وجهات النظر، فإن خفض الصوت واختيار الكلمة الكريمة مع الوالدين هو قمة النضج والبر.',
    },
  },
};

const TEEN_GLOSSARY_BY_LANG: Record<Language, TeenWordInsight[]> = {
  en: [
    {
      term: 'Sabr (Patience)',
      meaning: 'Active endurance and emotional steadiness under pressure—not passive waiting.',
    },
    {
      term: 'Ihsan (Excellence)',
      meaning: 'Responding with beauty, fairness, and integrity even when others act poorly.',
    },
    {
      term: 'Tawakkul (Trust in God)',
      meaning: 'Doing your absolute best preparation (studying/working) and trusting God with the result.',
    },
    {
      term: 'Tadabbur (Deep Reflection)',
      meaning: 'Looking past the surface of words to see how a verse applies to your real life.',
    },
  ],
  sv: [
    {
      term: 'Sabr (Tålamod)',
      meaning: 'Aktiv uthållighet och inre styrka under press – inte att ge upp.',
    },
    {
      term: 'Ihsan (Godhet & Excellens)',
      meaning: 'Att svara med värdighet och godhet även när andra är orättvisa.',
    },
    {
      term: 'Tawakkul (Tillit till Gud)',
      meaning: 'Att göra sitt allra bästa (t.ex. inför ett prov) och lämna resultatet i Guds händer.',
    },
    {
      term: 'Tadabbur (Djup reflektion)',
      meaning: 'Att fundera på hur versens budskap passar in i ditt eget liv idag.',
    },
  ],
  fr: [
    {
      term: 'Sabr (Patience active)',
      meaning: 'Persévérance et maîtrise de soi face à la pression, sans baisser les bras.',
    },
    {
      term: 'Ihsan (Excellence morale)',
      meaning: 'Agir avec noblesse et bienveillance, même quand les autres sont injustes.',
    },
    {
      term: 'Tawakkul (Confiance en Dieu)',
      meaning: 'Donner le meilleur de soi-même dans ses études ou projets et confier le résultat à Dieu.',
    },
    {
      term: 'Tadabbur (Méditation)',
      meaning: 'Comprendre comment le verset éclaire concrètement tes choix quotidiens.',
    },
  ],
  ar: [
    {
      term: 'الصبر',
      meaning: 'ثبات القلب وهدوء النفس عند الشدائد مع العمل الإيجابي، وليس الاستسلام.',
    },
    {
      term: 'الإحسان',
      meaning: 'إتقان العمل ومقابلة الإساءة بالخلق النبيل استشعاراً لمراقبة الله.',
    },
    {
      term: 'التوكل',
      meaning: 'بذل أقصى الجهد في الدراسة والعمل مع اطمئنان القلب بأن النتيجة بيد الله.',
    },
    {
      term: 'التدبر',
      meaning: 'تأمل معاني الآية الكريمة لتحويلها إلى نور يوجّه قراراتك وحياتك اليومية.',
    },
  ],
};

export function getAgeAdaptiveContent(
  verse: QuranVerseFixture,
  language: Language
): AgeAdaptiveBundle {
  // 1. Check if companion guidance was dynamically retrieved from Supabase
  const dynamicBundle: any =
    (verse.companionGuidance as any)?.[language] ||
    (verse.companionGuidance as any)?.languages?.[language];

  // 2. Fall back to static script fixtures if dynamic DB data not yet attached
  const custom = dynamicBundle || VERSE_KIDS_STORIES[verse.id]?.[language];
  const translationText = verse.translations[language]?.text || verse.translations.en.text;

  const titles: Record<
    Language,
    { title: string; familyTitle: string; tryLabel: string }
  > = {
    en: {
      title: 'Simple Story & Meaning (Kids & Family)',
      familyTitle: 'Family Circle Question',
      tryLabel: 'Small Step for Today',
    },
    sv: {
      title: 'Enkel berättelse & innebörd (Barn & Familj)',
      familyTitle: 'Familjefråga att prata om',
      tryLabel: 'Litet steg för idag',
    },
    fr: {
      title: 'Histoire simple & sens (Enfants & Famille)',
      familyTitle: 'Question en famille',
      tryLabel: "Petit geste pour aujourd'hui",
    },
    ar: {
      title: 'المعنى المبسّط للناشئة والأسرة',
      familyTitle: 'سؤال الحوار العائلي',
      tryLabel: 'خطوة عملية صغيرة اليوم',
    },
  };

  const t = titles[language] || titles.en;

  const fallbackStory: Record<
    Language,
    { storyText: string; familyQuestion: string; tryTodayAction: string; teenTakeaway: string }
  > = {
    en: {
      storyText: `In Surah ${verse.surahNameTransliterated}, Allah teaches us a beautiful lesson for our hearts: "${translationText}". When we remember this, we become kinder, calmer, and stronger every day.`,
      familyQuestion:
        verse.halaqahPrompts?.discussionQuestions?.en?.[0] ||
        'What is one kind action our family can practice together from this verse today?',
      tryTodayAction:
        'Share one kind word or helpful action at home today inspired by this verse.',
      teenTakeaway:
        verse.whyThisVerse?.spiritualPrinciple ||
        'This verse anchors your mindset in resilience, sincerity, and calm purpose.',
    },
    sv: {
      storyText: `I Sura ${verse.surahNameTransliterated} lär Gud oss en fin lärdom för våra hjärtan: "${translationText}". När vi minns detta blir vi snällare, lugnare och starkare varje dag.`,
      familyQuestion:
        verse.halaqahPrompts?.discussionQuestions?.sv?.[0] ||
        'Vad är en snäll sak vår familj kan göra tillsammans idag utifrån denna vers?',
      tryTodayAction:
        'Säg ett uppmuntrande ord eller hjälp någon där hemma idag.',
      teenTakeaway:
        'Denna vers ger dig inre styrka, perspektiv och lugn när vardagen känns krävande.',
    },
    fr: {
      storyText: `Dans la sourate ${verse.surahNameTransliterated}, Dieu nous enseigne une belle leçon pour notre cœur : « ${translationText} ». En gardant cela à l'esprit, nous devenons plus doux et plus sereins.`,
      familyQuestion:
        verse.halaqahPrompts?.discussionQuestions?.fr?.[0] ||
        "Quel geste bienveillant notre famille peut-elle accomplir ensemble aujourd'hui ?",
      tryTodayAction:
        "Offre une parole douce ou un coup de main à la maison aujourd'hui.",
      teenTakeaway:
        'Ce verset ancre ton esprit dans la résilience, la clarté et la confiance face aux défis.',
    },
    ar: {
      storyText: `في سورة ${verse.surahNameArabic} يعلّمنا الله درساً جميلاً ينير قلوبنا، ويدعونا إلى التحلّي بالصبر والرحمة والعمل الصالح في كل يوم.`,
      familyQuestion:
        verse.halaqahPrompts?.discussionQuestions?.ar?.[0] ||
        'ما هو الخُلُق الجميل الذي نتفق كعائلة على تطبيقه في بيتنا اليوم من وحي هذه الآية؟',
      tryTodayAction:
        'بادر اليوم بكلمة طيبة أو مساعدة لطيفة لأفراد أسرتك.',
      teenTakeaway:
        'تمنحك هذه الآية الكريمة توازناً نفسياً وبصيرة هادئة للتعامل مع تحديات الدراسة والحياة.',
    },
  };

  const chosen = custom || fallbackStory[language] || fallbackStory.en;

  const defaultRoot: LinguisticRoot =
    verse.linguisticRoots?.[0] || {
      termArabic: 'هُدًى',
      termTransliterated: 'Hudan',
      root: 'ه - د - ي (h-d-y)',
      literalImagery: {
        en: 'A gentle guide showing a traveler the clearest, safest path through the desert night.',
        sv: 'En vänlig vägvisare som visar resenären den tryggaste vägen genom ökennatten.',
        fr: 'Un guide bienveillant qui montre au voyageur le chemin le plus sûr dans la nuit.',
        ar: 'الدلالة بلطف وبيان يوضح للسائر في الليل الطريق الآمن المستقيم.',
      },
      spiritualDepth: {
        en: 'Divine guidance does not force—it illuminates your steps with clarity and warmth.',
        sv: 'Gudomlig vägledning lyser upp dina steg med klarhet, lugn och värme.',
        fr: 'La guidance divine éclaire tes pas avec douceur, clarté et sérénité.',
        ar: 'نور الوحي يهدي القلب برفق ليختار طريق السكينة والحق عن بصيرة.',
      },
    };

  return {
    kids: {
      title: dynamicBundle?.kids?.title || t.title,
      storyText: dynamicBundle?.kids?.storyText || dynamicBundle?.story_text || chosen.storyText,
      familyQuestionTitle: dynamicBundle?.kids?.familyQuestionTitle || t.familyTitle,
      familyQuestion: dynamicBundle?.kids?.familyQuestion || dynamicBundle?.family_question || chosen.familyQuestion,
      tryTodayLabel: dynamicBundle?.kids?.tryTodayLabel || t.tryLabel,
      tryTodayAction: dynamicBundle?.kids?.tryTodayAction || dynamicBundle?.action_step || chosen.tryTodayAction,
    },
    teenKeyTakeaway: dynamicBundle?.teenKeyTakeaway || dynamicBundle?.key_takeaway || chosen.teenTakeaway,
    teenGlossary: dynamicBundle?.teenGlossary || TEEN_GLOSSARY_BY_LANG[language] || TEEN_GLOSSARY_BY_LANG.en,
    defaultRoot: dynamicBundle?.defaultRoot || defaultRoot,
  };
}
