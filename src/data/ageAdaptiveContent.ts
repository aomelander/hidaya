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
        'When someone makes you angry at school or home, imagine your anger is warm water inside a bottle. This verse teaches an 8-year-old to gently screw the cap tight so no hurtful words spill out, forgive your siblings or classmates, and do something kind (Ihsan) instead.',
      familyQuestion:
        'Around our dinner table tonight: When we feel annoyed after a long day of school or work, what is one calming signal we can give each other to show love and patience?',
      tryTodayAction:
        'Count slowly to 5 in Swedish or Arabic, take a deep breath, and smile the next time you feel frustrated today.',
      teenTakeaway:
        'True strength at 13 or 17 is not winning a loud argument at school or on social media—it is having the self-control to restrain your temper and choosing dignified grace (Ihsan).',
    },
    sv: {
      storyText:
        'När någon gör dig arg i skolan eller hemma, tänk dig att ilskan är bubblande vatten i en flaska. Denna vers lär oss att lugnt skruva på korken så inga hårda ord rinner ut, förlåta sina syskon eller klasskompisar och välja att svara med något riktigt snällt.',
      familyQuestion:
        'Runt vårt middagsbord ikväll: När vi kommer hem trötta från skola och jobb i Sverige, vad kan vi göra för att hjälpa varandra att behålla tålamodet och den varma stämningen hemma?',
      tryTodayAction:
        'Räkna långsamt till 5, ta ett djupt andetag och svara mjukt nästa gång någon irriterar dig idag.',
      teenTakeaway:
        'Sann styrka i högstadiet (13 år) och gymnasiet (17 år) är inte att vinna ett bråk eller slå tillbaka i kommentarerna – det är att behärska känslorna under press och bemöta andra med självrespekt och Ihsan.',
    },
    fr: {
      storyText:
        "Quand quelqu'un t'énerve à l'école ou à la maison, imagine que ta colère est de l'eau dans une gourde. Ce verset nous apprend à bien fermer la gourde pour qu'aucun mot blessant ne sorte, à pardonner et à faire un geste bienveillant.",
      familyQuestion:
        'Autour de la table familiale : quand la fatigue de la journée nous rend irritables, quelle habitude douce pouvons-nous adopter pour préserver la paix à la maison ?',
      tryTodayAction:
        "Compte lentement jusqu'à 5 et respire profondément la prochaine fois que tu te sens contrarié.",
      teenTakeaway:
        "La vraie force à 13 ou 17 ans n'est pas d'avoir le dernier mot, mais de dominer sa colère et de répondre avec noblesse et excellence (Ihsan).",
    },
    ar: {
      storyText:
        'حين يُغضبك أحد في المدرسة أو البيت، تخيّل أن الغضب ماء داخل قِربة. تعلّمنا هذه الآية أن نربط فم القربة بإحكام فلا تخرج كلمة تؤذي أحداً، وأن نسامح بروح طيبة ونقابل الإساءة بالإحسان.',
      familyQuestion:
        'في جلستنا العائلية الليلة: ما هي الكلمة الطيبة أو الإشارة الهادئة التي نتفق عليها في بيتنا عندما يشعر أحدنا بالغضب أو الإرهاق؟',
      tryTodayAction:
        'عدّ بهدوء من ١ إلى ٥ وخذ نفساً عميقاً وابتسم لوالديك وإخوتك اليوم.',
      teenTakeaway:
        'القوة الحقيقية في مرحلة الفتوة والشباب (١٣ و١٧ سنة) ليست في الانتصار في الجدال، بل في كبح جماح الغضب والارتقاء إلى مقام الإحسان والعفو.',
    },
  },
  '94:5-6': {
    en: {
      storyText:
        'Just like bright morning sun always melts the dark Swedish winter snow, Allah promises us twice in this verse that with every single hardship, help and ease are already walking right beside you.',
      familyQuestion:
        'What was a challenging moment our family faced in Sweden (with school, moving, or cold winters) where Allah surprised us with comfort and a beautiful way forward?',
      tryTodayAction:
        'Write down or say out loud three specific blessings and helpers Allah has put in your life right now.',
      teenTakeaway:
        'National exams (nationella prov), gymnasium stress, or feelings of uncertainty at 13 and 17 are never a permanent dead-end—the Arabic grammar proves that one isolated hardship is embraced by two abundant eases.',
    },
    sv: {
      storyText:
        'Precis som vårsolen alltid smälter bort den mörka svenska vintersnön, lovar Gud oss två gånger i denna vers att bredvid varje motgång finns lättnad, hopp och ny styrka som väntar på dig.',
      familyQuestion:
        'Minns vi någon period i Sverige – med skolan, vintern eller vardagspusslet – där det kändes tungt, men där Gud gav oss lättnad och gjorde oss starkare tillsammans som familj?',
      tryTodayAction:
        'Tacka Gud vid middagen för tre fina saker som ger dig trygghet och glädje i din vardag just nu.',
      teenTakeaway:
        'Nationella prov, betygspress i gymnasiet (17 år) eller förändringar i högstadiet (13 år) är aldrig en återvändsgränd – språket i Koranen visar att en ensam svårighet alltid omfamnas av dubbel lättnad.',
    },
    fr: {
      storyText:
        'Tout comme le printemps fait toujours fondre la neige de l’hiver, Dieu nous promet deux fois dans ce verset qu’avec chaque difficulté, la facilité et le soulagement cheminent à tes côtés.',
      familyQuestion:
        'Quel défi notre famille a-t-elle surmonté où nous avons clairement ressenti le secours et l’apaisement d’Allah ?',
      tryTodayAction:
        'Remercie Allah pour trois bénédictions concrètes qui illuminent ta journée.',
      teenTakeaway:
        'Le stress des examens ou les doutes de l’adolescence ne sont jamais une impasse : la promesse divine garantit que chaque épreuve porte en elle deux facilités.',
    },
    ar: {
      storyText:
        'كما يُشرق نور الربيع ليذيب برد الشتاء وثلوجه، يُقسم الله مرتين في هذه السورة بأن مع كل ضيق فرجاً قريباً يرافقه ويفتح أبواب الأمل.',
      familyQuestion:
        'ما هو التحدي الذي واجهته أسرتنا وكان يبدو صعباً، ثم رأينا بعده تيسير الله ولطفه يحيط بنا؟',
      tryTodayAction:
        'اذكر اليوم ثلاثة نعم جميلة يسّرها الله لك في دراستك ويومك واشكر الله عليها.',
      teenTakeaway:
        'ضغوط الامتحانات والمستقبل في عمر الـ ١٣ والـ ١٧ ليست نهاية المطاف؛ فالقاعدة القرآنية تؤكد أن عسراً واحداً لن يغلب يسرين أبداً.',
    },
  },
  '13:28': {
    en: {
      storyText:
        'When your heart feels jumpy, nervous before school, or worried, remembering Allah is like stepping into a warm, cozy home during a snowy Swedish evening. It wraps your heart in safety and peace.',
      familyQuestion:
        'When we gather together in the evening, what is our favorite dhikr or Quran verse that immediately brings peace and calm to our living room?',
      tryTodayAction:
        "Place your hand gently on your heart, close your eyes for 10 seconds, and whisper: \"Alhamdulillah 'ala kulli hal\".",
      teenTakeaway:
        'Endless phone scrolling, TikTok, and social comparison only amplify teen anxiety; authentic inner stillness (Tuma’ninah) comes from unplugging and anchoring your soul in Allah.',
    },
    sv: {
      storyText:
        'När ditt hjärta känns pirrigt eller oroligt inför skolan, är minnet av Gud som att kliva in i ett varmt, upplyst hem efter en iskall snöstorm. Det gör hjärtat tryggt, varmt och stilla.',
      familyQuestion:
        'När vi samlas i vardagsrummet om kvällarna, vilka stunder av dhikr eller samtal gör att hela familjen känner lugn och harmoni i själen?',
      tryTodayAction:
        'Lägg handen på hjärtat, blunda i 10 sekunder och viska: "SubhanAllah wa bihamdih" – känn hur lugnet sprider sig.',
      teenTakeaway:
        'Att scrolla mobilen i timmar dämpar inte inre oro – sann sinnesro (Tuma’ninah) inför framtiden, skolan och gymnasiet hittar du när du kopplar bort bruset och kopplar upp hjärtat mot Gud.',
    },
    fr: {
      storyText:
        "Quand ton cœur est agité ou inquiet, se souvenir d'Allah est comme entrer dans une maison chaleureuse au milieu du froid d'hiver. Cela apaise immédiatement ton esprit.",
      familyQuestion:
        'Quelle pratique spirituelle ou quel moment d’évocation ensemble apaise le plus l’atmosphère de notre foyer ?',
      tryTodayAction:
        'Pose ta main sur ton cœur, respire calmement pendant 10 secondes et dis avec conviction : « Alhamdulillah ».',
      teenTakeaway:
        'Les réseaux sociaux augmentent souvent la surcharge mentale ; la vraie sérénité (Tuma’ninah) s’obtient en revenant à l’essentiel auprès d’Allah.',
    },
    ar: {
      storyText:
        'حين يشعر قلبك بالخوف أو القلق، فإن ذكر الله يشبه الدخول إلى بيت دافئ ومضيء في ليلة شتوية باردة؛ فيغمر قلبك بالأمان والسكينة العميقة.',
      familyQuestion:
        'ما هي الأذكار والآيات التي نحب أن نستمع إليها أو نرددها معاً في بيتنا لتنزل السكينة في قلوبنا؟',
      tryTodayAction:
        'ضع يدك على قلبك، وأغمض عينيك عشر ثوانٍ وقل: لا إله إلا الله وحده لا شريك له.',
      teenTakeaway:
        'إدمان الشاشات والتصفح المستمر يرهق الذهن والروح؛ والطمأنينة الحقيقية التي يحتاجها الشاب والفتاة تنبع من صلة القلب بخالقه.',
    },
  },
  '17:23-24': {
    en: {
      storyText:
        'Just as a parent bird gently lowers its soft wings over its nestlings to keep them safe and warm, Allah asks children to lower the wing of tenderness, respect, and sweet words to Mom and Dad.',
      familyQuestion:
        'To parents (44 & 49) and kids (8, 13, 17): What is one special thing we love and appreciate most about how we support each other in our Swedish home?',
      tryTodayAction:
        'Surprise Mom or Dad today with a warm hug, pour them a glass of water, and say: "May Allah protect you, Mom and Dad".',
      teenTakeaway:
        'As you grow into adulthood at 13 and 17, independence never means harshness. Speaking with honor (Qawlan Karima) and lowering your voice at home is the highest mark of emotional intelligence and maturity.',
    },
    sv: {
      storyText:
        'Precis som en fågelmamma mjukt fäller ut sina vingar över sina ungar för att skydda dem mot kylan, ber Gud oss att sänka ödmjukhetens och kärlekens vingar för mamma och pappa.',
      familyQuestion:
        'Till föräldrarna (44 och 49 år) och barnen (8, 13 och 17 år): Vad är något fint vi uppskattar med hur vi hjälps åt och bryr oss om varandra i vår vardag i Sverige?',
      tryTodayAction:
        'Ge mamma eller pappa en oväntad kram idag, hjälp till att duka av bordet och säg: "Tack för allt ni gör för mig".',
      teenTakeaway:
        'När du blir äldre (13 och 17 år) betyder självständighet inte att vara kaxig eller avståndstagande. Att tala respektfullt hemma och lyssna på föräldrarnas råd är det tydligaste tecknet på mognad och styrka.',
    },
    fr: {
      storyText:
        "Comme un oiseau qui abaisse doucement ses ailes pour protéger ses petits, Dieu nous enseigne d'entourer nos parents d'amour, de respect et de paroles bienveillantes.",
      familyQuestion:
        'Que pouvons-nous faire pour exprimer concrètement notre gratitude et notre tendresse mutuelle dans notre foyer ?',
      tryTodayAction:
        'Fais un geste d’affection spontané envers tes parents aujourd’hui et remercie-les.',
      teenTakeaway:
        'Gagner en maturité à 13 et 17 ans, c’est apprendre à exprimer son avis avec douceur et respect filial (Qawlan Karima), sans élever la voix.',
    },
    ar: {
      storyText:
        'كما يخفض الطائر جناحيه بحنان ولطف ليحمي صغاره من البرد، يأمرنا الله أن نخفض لوالدينا جناح الذل من الرحمة ونتحدث معهما بأعذب الكلمات وأكرمها.',
      familyQuestion:
        'بين الوالدين (٤٤ و٤٩ سنة) والأبناء (٨، ١٣، ١٧ سنة): ما هي المبادرة اللطيفة التي نتشاركها لنظهر حبنا وتقديرنا لما يقدمه كل منا في البيت؟',
      tryTodayAction:
        'قبّل رأس أو يد والديك اليوم وقل بصدق: رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا.',
      teenTakeaway:
        'بلوغ مرحلة النضج في عمر الـ ١٣ والـ ١٧ لا يعني الاستقواء أو رفع الصوت، بل قمة الرجولة والأنوثة تكمن في بر الوالدين والحديث معهما بأدب وتوقير.',
    },
  },
  '31:17-18': {
    en: {
      storyText:
        'Wise Luqman sat down with his child and gave golden advice: establish your daily prayer, encourage what is good, be patient when things are hard, and never walk down the street with a puffed-up nose or haughty face!',
      familyQuestion:
        'How can our family practice Luqman’s advice in our Swedish neighborhood: being warm, honest, humble, and polite to everyone we meet at school and work?',
      tryTodayAction:
        'Smile and say a cheerful "Hej!" or "Salam!" to your neighbors and classmates today with genuine warmth.',
      teenTakeaway:
        'Humility is not weakness—it is quiet confidence. Luqman teaches teens that you do not need arrogance or designer clothes to stand out; authentic character, prayer, and kindness command lasting respect.',
    },
    sv: {
      storyText:
        'Den kloke Luqman satte sig med sitt barn och gav råd av guld: håll bönen levande, uppmuntra till det goda, ha tålamod i motgång och gå aldrig på gatan med näsan i vädret eller dryg uppsyn!',
      familyQuestion:
        'Hur kan vår familj leva efter Luqmans råd i vårt svenska bostadsområde: att vara varma, ärliga, ödmjuka och artiga mot alla grannar, lärare och vänner vi möter?',
      tryTodayAction:
        'Hälsa glatt och le mot dina grannar eller klasskompisar i skolan idag – en vänlig hälsning sprider ljus.',
      teenTakeaway:
        'Ödmjukhet är inte svaghet – det är äkta självförtroende. Luqman lär 13- och 17-åringar att du inte behöver skryta eller imponera med yta för att synas; din karaktär och din bön ger sann värdighet.',
    },
    fr: {
      storyText:
        'Le sage Luqman s’est assis avec son enfant et lui a transmis de précieux conseils : accomplis la prière, ordonne le bien, sois patient et ne marche pas avec orgueil.',
      familyQuestion:
        'Comment pouvons-nous incarner la sagesse de Luqman dans notre quotidien : être humbles, polis et bienveillants envers notre entourage ?',
      tryTodayAction:
        'Salue chaleureusement tes voisins ou tes camarades aujourd’hui avec un sourire sincère.',
      teenTakeaway:
        'La vraie confiance en soi n’a pas besoin d’arrogance. Luqman enseigne aux jeunes que la prière, la patience et l’humilité forgent les plus nobles personnalités.',
    },
    ar: {
      storyText:
        'جلس الحكيم لقمان مع ولده يعلّمه وصايا أغلى من الذهب: أن يقيم الصلاة، ويأمر بالمعروف، ويصبر على ما يصيبه، وألا يصعّر خدّه للناس كبراً وغروراً.',
      familyQuestion:
        'كيف نترجم وصايا لقمان الحكيم في حياتنا اليومية: في تعاملنا مع جيراننا وزملائنا في المدرسة والعمل بالصدق واللطف والتواضع؟',
      tryTodayAction:
        'ألقِ التحية بابتسامة صادقة على من تقابله اليوم وكن ليّن الجانب مع الجميع.',
      teenTakeaway:
        'التواضع هو جوهر القوة؛ وصايا لقمان ترسم للشباب (١٣ و١٧ سنة) بوصلة الهوية الحقيقية: صلاة، ثبات على المبدأ، وصوت هادئ يفرض احترامه بلا استعراض.',
    },
  },
  '2:155-156': {
    en: {
      storyText:
        'When dark winter skies or unexpected troubles come, Allah promises that tests are normal in life. The patient ones shine like stars because they immediately say: "To Allah we belong, and to Him we return."',
      familyQuestion:
        'When unexpected changes happen at home or school, how can we remind each other that Allah is in full control and has something good in store for us?',
      tryTodayAction:
        'Say "Inna lillahi wa inna ilayhi raji\'un" the moment you drop something, lose something, or face a small frustration today.',
      teenTakeaway:
        'Resilience is built in the storm, not in the calm. Facing academic stress or social hurdles at 13 and 17 with "Inna lillah" grounds your identity in the eternal rather than temporary setbacks.',
    },
    sv: {
      storyText:
        'När vintern känns mörk eller när något oväntat går fel, påminner Gud oss om att prövningar hör till livet. De tålmodiga lyser som stjärnor för att de genast säger: "Vi tillhör Gud och till Honom återvänder vi."',
      familyQuestion:
        'När planer ändras eller när någon i familjen har en tuff dag, hur kan vi påminna varandra om att Gud har kontroll och att det finns en visdom bakom allt?',
      tryTodayAction:
        'Säg "Inna lillahi wa inna ilayhi raji\'un" direkt när du tappar något, stöter på ett hinder eller känner irritation idag.',
      teenTakeaway:
        'Mental styrka byggs i motvind. Att möta skolpress, prov eller utmaningar vid 13 och 17 år med tillit till Gud befriar dig från onödig panik och ger dig djup inre ro.',
    },
    fr: {
      storyText:
        'Face aux imprévus et aux épreuves de la vie, Dieu nous rappelle que la patience est une lumière. Ceux qui disent avec foi « Nous appartenons à Allah » trouvent la paix.',
      familyQuestion:
        'Comment nous épauler mutuellement dans les moments d’épreuve pour nous rappeler la sagesse divine ?',
      tryTodayAction:
        'Récite « Inna lillahi wa inna ilayhi raji’un » dès que tu rencontres un contretemps aujourd’hui.',
      teenTakeaway:
        'L’endurance face aux défis scolaires ou personnels forge le caractère. Se rappeler que tout appartient à Dieu libère de l’anxiété.',
    },
    ar: {
      storyText:
        'حين تمر بنا أوقات صعبة، يبشّرنا الله بأن الصابرين هم الفائزون، لأنهم عند أول صدمة يملأ الرضا قلوبهم ويقولون: إنا لله وإنا إليه راجعون.',
      familyQuestion:
        'عندما يواجه بيتنا أمراً غير متوقع، كيف نتكاتف معاً لنذكّر أنفسنا بلطف الله وحكمته البالغة في كل قضاء؟',
      tryTodayAction:
        'قل "إنا لله وإنا إليه راجعون" بهدوء عند أي عثرة أو فقدان لشيء صغير اليوم واستشعر أجرها العظيم.',
      teenTakeaway:
        'الصبر ليس جموداً، بل هو ثبات ووعي بأن الصعاب تصنع معدن الإنسان؛ التمسك بقول "إنا لله" يمنح الشباب مناعة نفسية تحميهم من الانكسار.',
    },
  },
  '25:63': {
    en: {
      storyText:
        'The true friends of Allah walk gently on the earth without stomping or showing off. And when someone at school speaks rudely to them, they do not yell back—they calmly say: "Peace!" (Salam).',
      familyQuestion:
        'When someone at school or outside tests our patience, how can we respond with calm Swedish politeness and Islamic dignity (Salam)?',
      tryTodayAction:
        'Walk gently today, hold the door open for someone, and let an annoying comment roll off your back with a peaceful smile.',
      teenTakeaway:
        'Do not let immature people drag you down to their level in the school corridors. Saying "Salam" and walking away with poise is supreme self-mastery.',
    },
    sv: {
      storyText:
        'Guds sanna vänner går mjukt och ödmjukt på jorden utan att skryta eller trampa på andra. Och när någon i skolan talar otrevligt till dem, skriker de inte tillbaka – de svarar lugnt: "Fred!" (Salam).',
      familyQuestion:
        'När någon i skolan eller på bussen beter sig otrevligt, hur kan vi svara med svenskt lugn och islamisk värdighet istället för att brusa upp?',
      tryTodayAction:
        'Håll upp dörren för någon idag, gå med lugna steg och låt en irriterande kommentar passera med ett stilla leende.',
      teenTakeaway:
        'Låt inte omogna personer sänka din nivå i korridoren eller online. Att säga "Salam", behålla lugnet och gå vidare med värdighet visar vem som har verklig karaktär.',
    },
    fr: {
      storyText:
        'Les serviteurs du Tout-Miséricordieux marchent sur terre avec modestie, et lorsque des ignorants leur parlent avec rudesse, ils répondent par la paix.',
      familyQuestion:
        'Comment cultiver cette attitude noble face aux provocations du quotidien ?',
      tryTodayAction:
        'Réponds par un geste doux ou un mot courtois aujourd’hui, même si quelqu’un manque d’égards.',
      teenTakeaway:
        'Ne laisse personne dicter ta réaction. Répondre par le calme et la paix démontre une maîtrise de soi admirable.',
    },
    ar: {
      storyText:
        'عباد الرحمن يمشون على الأرض بسكينة ووقار وتواضع، وإذا خاطبهم الجاهلون بكلمات غير لائقة، لم يردوا بالمثل، بل قالوا سلاماً.',
      familyQuestion:
        'كيف نربي أنفسنا في البيت على ألا نستفز بأي كلمة عابرة، وأن نجعل شعارنا الدائم هو التسامح والسلام؟',
      tryTodayAction:
        'تجاهل اليوم أي كلمة غير لطيفة بابتسامة وقل في نفسك: "سلاماً" وتابع يومك براحة بال.',
      teenTakeaway:
        'الارتقاء عن المهاترات في المدرسة والإنترنت هو علامة النضج؛ "وإذا خاطبهم الجاهلون قالوا سلاما" قانون عملي يحفظ هيبتك وسلامك الداخلي.',
    },
  },
  '49:12': {
    en: {
      storyText:
        'Allah tells us that thinking good thoughts about our family and friends is a superpower! We should never spy on each other, listen at doors, or talk behind someone’s back.',
      familyQuestion:
        'How can we make our home a 100% gossip-free sanctuary where we only speak words that lift each other up?',
      tryTodayAction:
        'If you hear someone gossiping at school or home today, change the subject to something kind or say one good thing about that person.',
      teenTakeaway:
        'Group chats can easily turn into toxic gossip sessions. Refusing to participate in backbiting or taking screenshots to mock others preserves your spiritual purity and real integrity.',
    },
    sv: {
      storyText:
        'Gud lär oss att alltid tänka gott om vår familj och våra vänner! Vi ska aldrig snoka i andras saker, tjuvlyssna eller prata illa bakom någons rygg.',
      familyQuestion:
        'Hur kan vi göra vårt hem i Sverige till en trygg zon där vi aldrig baktalar någon, utan bara lyfter och stöttar varandra och våra vänner?',
      tryTodayAction:
        'Om du hör någon prata illa om en klasskompis idag, byt ämne eller nämn något snällt om den personen istället.',
      teenTakeaway:
        'I gruppchattar på Snapchat och Discord spårar snacket lätt ur. Att vägra delta i skitsnack och skärmdumpar visar att du har integritet och principer du står för.',
    },
    fr: {
      storyText:
        'Dieu nous enseigne d’avoir de bonnes pensées envers les autres, d’éviter l’espionnage et de ne jamais médire d’autrui dans son dos.',
      familyQuestion:
        'Comment faire de notre maison un refuge de bienveillance où la médisance n’a aucune place ?',
      tryTodayAction:
        'Défends la réputation d’un camarade ou change de sujet si une conversation devient médisante.',
      teenTakeaway:
        'Dans les groupes de discussion, refuser de colporter des rumeurs ou de juger autrui protège ton cœur et affirme ta droiture morale.',
    },
    ar: {
      storyText:
        'يأمرنا الله بحسن الظن بإخواننا وأهلنا، وينهانا عن التجسس والغيبة، لأن الحديث عن الآخرين بسوء يفسد المحبة والقلوب.',
      familyQuestion:
        'كيف نحرص في بيتنا على أن تكون مجالسنا عامرة بذكر الخير، خالية تماماً من الغيبة وتتبع عثرات الناس؟',
      tryTodayAction:
        'إذا سمعت حديثاً فيه غيبة اليوم، ذكّر بلطف أو غيّر الموضوع إلى شيء نافع وجميل.',
      teenTakeaway:
        'مجموعات التواصل والتطبيقات قد تستدرج الشباب إلى الغيبة والتنمر؛ الامتناع الواعي عن هذا السلوك يحفظ طهارة قلبك ويرفع قدرك عند الله والناس.',
    },
  },
  '14:7': {
    en: {
      storyText:
        'Gratitude (Shukr) is like watering a little flower in your garden—the more you say "Thank You, Allah!", the more the flower blossoms with more happiness, health, and joy!',
      familyQuestion:
        'What are three everyday blessings we have living as a family in Sweden—like warm water, safety, and cozy food—that we often take for granted?',
      tryTodayAction:
        'Before eating your dinner tonight, pause for 5 seconds and say: "Alhamdulillah" with full awareness of the blessing in front of you.',
      teenTakeaway:
        'Social media creates an illusion that you are always missing out (FOMO). Practicing daily Shukr shifts your mindset from scarcity to abundance, unlocking deep psychological peace.',
    },
    sv: {
      storyText:
        'Tacksamhet (Shukr) är som att vattna en blomma på fönsterbrädan – ju mer du säger "Tack Gud!", desto mer växer blomman och fyller hemmet med glädje och välsignelse!',
      familyQuestion:
        'Vilka är tre vardagliga välsignelser vi har som familj i Sverige – som rinnande varmvatten, trygghet och ett varmt hem i kylan – som vi ibland glömmer att tacka för?',
      tryTodayAction:
        'Innan du tar första tuggan vid middagen ikväll, stanna upp i 5 sekunder och säg: "Alhamdulillah" med hela hjärtat.',
      teenTakeaway:
        'Sociala medier skapar lätt en känsla av att alla andra har det roligare (FOMO). Att aktivt öva tacksamhet (Shukr) vänder tankarna från brist till överflöd och ger äkta livsglädje.',
    },
    fr: {
      storyText:
        'La gratitude (Shukr) est comme arroser une plante : plus tu remercies Allah, plus les bienfaits fleurissent dans ta vie avec abondance et joie.',
      familyQuestion:
        'Quels bienfaits quotidiens considérons-nous trop souvent comme acquis dans notre vie de famille ?',
      tryTodayAction:
        'Prends un instant avant le repas ce soir pour dire sincèrement : « Alhamdulillah ».',
      teenTakeaway:
        'La comparaison constante génère l’insatisfaction. Cultiver la gratitude quotidienne transforme ton regard et libère une joie profonde.',
    },
    ar: {
      storyText:
        'الشكر مثل سقاية شجرة طيبة في حديقتك؛ كلما قلت من قلبك "شكراً يا رب والحمد لله"، زادت الشجرة ثماراً وبركة وسعادة في حياتك.',
      familyQuestion:
        'ما هي النعم الكثيرة التي نعيش فيها كل يوم في بيتنا ونحتاج أن نستحضر شكر الله عليها دائماً؟',
      tryTodayAction:
        'تأمل نعم الله في طعامك وصحتك اليوم وقل بيقين: "اللهم لك الحمد والشكر حتى ترضى".',
      teenTakeaway:
        'مقارنة النفس بالآخرين في الشاشات تولّد ضيقاً وهمياً؛ التمسك بمبدأ "لئن شكرتم لأزيدنكم" يمنحك رضا داخلياً وثراءً نفسياً لا يقدّر بثمن.',
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
