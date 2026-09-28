import { Language } from '../types';

export interface DailyNorthStarVerse {
  id: string; // e.g., "94:5-6"
  surahNumber: number;
  surahNameArabic: string;
  surahNameTransliterated: string;
  surahNameMeaning: string;
  verseNumber: string;
  arabicText: string;
  transliteration: string;
  translations: {
    en: { text: string; translator: string };
    sv: { text: string; translator: string };
    fr: { text: string; translator: string };
    ar?: { text: string; translator: string };
  };
  theme: {
    en: string;
    sv: string;
    fr: string;
    ar?: string;
  };
  context: {
    en: string;
    sv: string;
    fr: string;
    ar?: string;
  };
  reflectionQuestion: {
    en: string;
    sv: string;
    fr: string;
    ar?: string;
  };
  practicalAction: {
    en: string;
    sv: string;
    fr: string;
    ar?: string;
  };
  audioUrl: string;
}

export const DAILY_NORTH_STARS: DailyNorthStarVerse[] = [
  {
    id: "94:5-6",
    surahNumber: 94,
    surahNameArabic: "الشرح",
    surahNameTransliterated: "Ash-Sharh",
    surahNameMeaning: "The Relief",
    verseNumber: "5-6",
    arabicText: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    transliteration: "Fa inna ma'al-'usri yusra. Inna ma'al-'usri yusra.",
    translations: {
      en: {
        text: "For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.",
        translator: "Saheeh International"
      },
      sv: {
        text: "Ty med varje svårighet följer lättnad; ja, med varje svårighet följer lättnad!",
        translator: "Knut Bernström"
      },
      fr: {
        text: "A côté de la difficulté est, certes, une facilité ! A côté de la difficulté est, certes, une facilité !",
        translator: "Muhammad Hamidullah"
      },
      ar: {
        text: "فإن مع الضيق والشدة يسراً وسهولة، إن مع الضيق والشدة يسراً وسهولة، ولن يغلب عسر يسرين.",
        translator: "التفسير الميسر / مجمع الملك فهد لطباعة المصحف الشريف"
      }
    },
    theme: {
      en: "The Inseparability of Ease & Hardship",
      sv: "Lättnadens oskiljaktighet från svårigheten",
      fr: "La proximité du soulagement dans l'épreuve",
      ar: "ملازمة اليسر للعسر والفرج القريب"
    },
    context: {
      en: "Revealed when the early Muslims in Makkah faced immense social and economic pressure. The Arabic grammar uses 'al-'usr' (definite: one specific hardship) and 'yusr' (indefinite: boundless forms of relief), assuring that one hardship can never overpower dual ease.",
      sv: "Uppenbarades när de tidiga muslimerna i Mecka mötte hård social och ekonomisk press. På arabiska är 'svårigheten' bestämd (en specifik prövning) medan 'lättnaden' är obestämd och mångfaldig.",
      fr: "Révélée lorsque les premiers croyants subissaient un isolement sévère à La Mecque. La forme grammaticale montre que la difficulté est unique alors que la facilité promise est multiple et abondante.",
      ar: "نزلت مواساة للمؤمنين في مكة تحت وطأة التضييق. واستعمال كلمة (العسر) بالتعريف دلالة على ضيق محدد، بينما (يسراً) بالتنكير دلالة على يسر واسع النطاق لا تحده حدود، فلن يغلب عسرٌ يسرين."
    },
    reflectionQuestion: {
      en: "Where in your life right now are you treating the hardship as permanent, while missing the subtle seeds of ease God has already planted beside it?",
      sv: "Var i ditt liv just nu betraktar du svårigheten som permanent, medan du missar de frön av lättnad som Gud redan planterat intill den?",
      fr: "Dans quel domaine de votre vie considérez-vous l'épreuve comme définitive, en oubliant les facilités que Dieu a déjà placées à ses côtés ?",
      ar: "أين تظن في حياتك اليوم أن الشدة دائمة، بينما تغفل عن ألطاف الله الخفية وتيسيره الملازم لها في نفس اللحظة؟"
    },
    practicalAction: {
      en: "Identify one small area of friction today. Before reacting, whisper 'Inna ma'al-'usr yusra' and name three hidden mercies currently surrounding you.",
      sv: "Identifiera ett friktionsmoment idag. Innan du reagerar, andas djupt och nämn tyst tre konkreta välsignelser som finns omkring dig just nu.",
      fr: "Identifiez une contrariété aujourd'hui. Avant de réagir, respirez et nommez trois bienfaits discrets qui vous accompagnent en ce moment même.",
      ar: "حدد موضع توتر وضغط يواجهك اليوم، وقبل أي ردة فعل استشعر قوله تعالى 'إن مع العسر يسرا' واستحضر ثلاث نعم تحيط بك الآن."
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/094005.mp3"
  },
  {
    id: "3:134",
    surahNumber: 3,
    surahNameArabic: "آل عمران",
    surahNameTransliterated: "Ali 'Imran",
    surahNameMeaning: "The Family of Imran",
    verseNumber: "134",
    arabicText: "الَّذِينَ يُنفِقُونَ فِي السَّرَّاءِ وَالضَّرَّاءِ وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ ۗ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ",
    transliteration: "Alladheena yunfiqoona fee as-sarraa'i wad-darraa'i wal-kaadhimeena al-ghaydha wal-'aafeena 'anin-naas, wallaahu yuhibbul-muhsineen.",
    translations: {
      en: {
        text: "Who spend [in the cause of Allah] during ease and hardship and who restrain anger and who pardon the people - and Allah loves the doers of good.",
        translator: "Saheeh International"
      },
      sv: {
        text: "De som ger åt andra såväl i välstånd som i nöd, och som behärskar sin vrede och förlåter sina medmänniskor - Gud älskar dem som gör det goda.",
        translator: "Knut Bernström"
      },
      fr: {
        text: "Qui dépensent dans l'aisance et dans l'adversité, qui dominent leur rage et pardonnent à autrui - car Allah aime les bienfaisants.",
        translator: "Muhammad Hamidullah"
      },
      ar: {
        text: "الذين يبذلون أموالهم في سبيل الله في حال الرخاء والشدة، والذين يكتمون ما في نفوسهم من الغضب عند إثارة دوافعها، ويصفحون عمن أساء إليهم، والله يحب أهل الإحسان.",
        translator: "التفسير الميسر / مجمع الملك فهد لطباعة المصحف الشريف"
      }
    },
    theme: {
      en: "Mastering the Surge of Anger with Grace",
      sv: "Att bemästra vreden med godhet och självbehärskning",
      fr: "Maîtriser sa colère et pardonner avec noblesse",
      ar: "كظم ثورة الغيظ والعفو الجميل والإحسان"
    },
    context: {
      en: "Taught to believers following emotional wounds and military setback at Uhud. The verb 'kadhama' represents tying a full waterskin shut so no drop spills, describing deliberate emotional discipline followed by pardon ('Afw).",
      sv: "Förmedlades till samfundet efter prövningarna vid Uhud. Det arabiska ordet 'kadhama' beskriver att binda igen en vattenlägel så inte en droppe spills – en bild av att hålla tillbaka vreden.",
      fr: "Enseigné aux compagnons après l'épreuve d'Uhud. Le terme 'kadhama' évoque une outre que l'on noue fermement pour que rien ne s'en échappe : retenir son emportement pour faire place au pardon.",
      ar: "توجيه رباني أعقب أحداث معركة أحد ومرارة الجراح. ولفظ (الكظم) مأخوذ من شد فم القِربة الممتلئة بالماء حتى لا تفيض، تصويراً لضبط فوران الغضب في الصدر ثم تجاوزه بالعفو والإحسان."
    },
    reflectionQuestion: {
      en: "When provoked today by a colleague, family member, or online comment, will you choose the temporary satisfaction of retaliation or the enduring honor of self-mastery?",
      sv: "När du blir provocerad idag av en kollega, anhörig eller kommentar på nätet – väljer du den snabba tillfredsställelsen i att svara med samma mynt eller hedern i självbehärskning?",
      fr: "Face à une provocation aujourd'hui, choisirez-vous la satisfaction éphémère de la riposte ou l'élévation durable de la maîtrise de soi ?",
      ar: "حين تتعرض لموقف مستفز اليوم، هل تختار راحة الانتقام المؤقتة، أم تختار شرف ملكة النفس ومحبة الله للمحسنين؟"
    },
    practicalAction: {
      en: "Implement the '10-minute pause'. When feeling irritated or wronged, delay speaking or writing any response by 10 minutes and make a quiet prayer for the provoking person.",
      sv: "Använd 10-minuterspausen: När irritation uppstår, vänta 10 minuter med att svara och önska i tysthet gott för motparten.",
      fr: "Appliquez la règle des 10 minutes : en cas d'irritation, suspendez toute réponse pendant 10 minutes et faites une invocation discrète pour apaiser votre cœur.",
      ar: "طبّق مهلة العشر دقائق: إذا شعرت بالغضب أو الإساءة، أَرجئ أي رد كتابي أو شفوي لعشر دقائق، وتوضأ واذكر الله حتى يسكن روعك."
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/003134.mp3"
  },
  {
    id: "13:28",
    surahNumber: 13,
    surahNameArabic: "الرعد",
    surahNameTransliterated: "Ar-Ra'd",
    surahNameMeaning: "The Thunder",
    verseNumber: "28",
    arabicText: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    transliteration: "Alladheena aamanoo wa tatma'innu quloobuhum bi-dhikrillaah, alaa bi-dhikrillaahi tatma'innul-quloob.",
    translations: {
      en: {
        text: "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.",
        translator: "Saheeh International"
      },
      sv: {
        text: "De som tror och vars hjärtan finner ro i tanken på Gud. Är det då inte så att i tanken på Gud finner människohjärtat ro?",
        translator: "Knut Bernström"
      },
      fr: {
        text: "Ceux qui ont cru, et dont les cœurs s'apaisent à l'évocation d'Allah. N'est-ce point par l'évocation d'Allah que se tranquillisent les cœurs ?",
        translator: "Muhammad Hamidullah"
      },
      ar: {
        text: "الذين آمنوا واطمأنت قلوبهم بتوحيد الله وطاعته؛ ألا بذكره سبحانه وطاعته تطمئن القلوب وتسكن.",
        translator: "التفسير الميسر / مجمع الملك فهد لطباعة المصحف الشريف"
      }
    },
    theme: {
      en: "The Restless Heart & Authentic Tranquility",
      sv: "Det oroliga hjärtat och den sanna friden",
      fr: "La paix du cœur par le souvenir de Dieu",
      ar: "اضطراب القلب والسكينة الحقيقية بذكر الله"
    },
    context: {
      en: "Addresses the profound existential anxiety of humanity. While material pursuits stimulate the senses, the spiritual heart was created with a void that only divine connection and gratitude can truly satisfy.",
      sv: "Talar till människans djupa existentiella rastlöshet. Medan materiella ting kan ge tillfällig distraktion, skapades människans hjärta för att finna djup ro genom minnet av sin Skapare.",
      fr: "S'adresse à l'angoisse existentielle de l'être humain. Les plaisirs matériels stimulent mais n'assouvissent jamais le besoin fondamental de paix intérieure qui réside dans le lien avec Dieu.",
      ar: "تعالج الآية القلق الوجودي وتشتت البال؛ فالقلب خلق مفتقراً إلى بارئه، ولن يملأ فراغه شيء من متاع الدنيا الزائل حتى يطمئن بمعرفة الله وذكره."
    },
    reflectionQuestion: {
      en: "What noise or digital overstimulation is crowding your mind right now, keeping your heart from tasting silence and presence?",
      sv: "Vilket digitalt brus eller tankekaos fyller ditt sinne just nu och hindrar ditt hjärta från att uppleva stillhet och närvaro?",
      fr: "Quel bruit ou quelle surstimulation numérique encombre votre esprit en ce moment, vous privant du silence intérieur ?",
      ar: "ما هو الصخب أو التشتت الرقمي الذي يزاحم قلبك وعقلك الآن ويحرمك من السكون وحضور القلب بين يدي الله؟"
    },
    practicalAction: {
      en: "Take a 3-minute screen blackout: put down your phone, close your eyes, take five slow breaths, and repeat 'SubhanAllah wa bihamdihi' with complete focus on the present moment.",
      sv: "Ta en 3-minuters digital paus: lägg bort mobilen, slut ögonen och ta fem djupa andetag med fokus på tacksamhet och inre stillhet.",
      fr: "Accordez-vous 3 minutes sans écran : posez votre téléphone, fermez les yeux et respirez profondément en répétant une formule d'apaisement et de gratitude.",
      ar: "خذ وقفة صمت لـ ٣ دقائق: أبعد هاتفك وأغمض عينيك، وتنفس بهدوء وردد 'سبحان الله وبحمده سبحان الله العظيم' بقلب حاضر."
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/013028.mp3"
  },
  {
    id: "2:155",
    surahNumber: 2,
    surahNameArabic: "البقرة",
    surahNameTransliterated: "Al-Baqarah",
    surahNameMeaning: "The Cow",
    verseNumber: "155",
    arabicText: "وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَالِ وَالْأَنفُسِ وَالثَّمَرَاتِ ۗ وَبَشِّرِ الصَّابِرِينَ",
    transliteration: "Wa lanabluwannakum bi-shay'im-minal-khawfi wal-joo'i wa naqsim-minal-amwaali wal-anfusi wath-thamaraat, wa bashshiris-saabireen.",
    translations: {
      en: {
        text: "And We will surely test you with something of fear and hunger and a loss of wealth and lives and fruits, but give good tidings to the patient.",
        translator: "Saheeh International"
      },
      sv: {
        text: "Vi skall helt visst pröva er med något av fruktan och hunger och förlust av egendom och liv och skördar, men förkunna det glada budskapet för de tålmodiga.",
        translator: "Knut Bernström"
      },
      fr: {
        text: "Très certainement, Nous vous éprouverons par un peu de peur, de faim et de diminution de biens, de personnes et de fruits. Et fais la bonne annonce aux endurants.",
        translator: "Muhammad Hamidullah"
      },
      ar: {
        text: "ولنختبرنكم بشيء يسير من الخوف والجوع ونقص في الأموال وفقد الأحبة ونقص الثمار، وبشر الصابرين المحتسبين بالخير العظيم في الدنيا والآخرة.",
        translator: "التفسير الميسر / مجمع الملك فهد لطباعة المصحف الشريف"
      }
    },
    theme: {
      en: "Facing Loss, Change & the Crucible of Life",
      sv: "Att möta förlust, förändring och livets prövningar",
      fr: "Traverser les pertes et les changements avec endurance",
      ar: "مواجهة الابتلاء والفقد وبشارة الصابرين"
    },
    context: {
      en: "Re-frames hardship from random cruelty to a purposefully calibrated crucible. The phrasing 'bi-shay'in' (with something small) reveals that no matter how staggering our trial feels, it is tempered by God's mercy and followed by glad tidings for the steadfast.",
      sv: "Omdefinierar livets svårigheter från meningslös smärta till en medveten prövning. Ordet 'bi-shay'in' (med något litet) visar att prövningen alltid hålls inom gränser och bär på ett löfte om välsignelse för den tålmodige.",
      fr: "Transforme notre regard sur l'épreuve : elle n'est pas une punition arbitraire mais une étape mesurée ('bi-shay'in', une part limitée) ouvrant la voie à une félicité supérieure pour les persévérants.",
      ar: "يُعيد هذا النص صياغة الألم من مصادفة عابثة إلى ابتلاء تربوي مقدور بحكمة ولطف، وكلمة (بشيء) تؤكد أن البلاء مهما عظم فهو يسير ومحدود بالنسبة لرحمة الله ولطفه."
    },
    reflectionQuestion: {
      en: "What unexpected loss or setback recently made you question your trajectory, and how might it be reshaping your humility, character, and empathy?",
      sv: "Vilken oväntad förlust eller motgång fick dig nyligen att tvivla, och hur kan den i själva verket forma din ödmjukhet, karaktär och empati?",
      fr: "Quelle déception ou perte récente a ébranlé vos certitudes, et comment peut-elle forger en vous davantage d'humilité et de sagesse ?",
      ar: "ما هو الفقد أو التراجع المفاجئ الذي مررت به مؤخراً، وكيف يمكن أن يكون سبباً في صقل تواضعك ورحمتك بالآخرين وتقريبك إلى الله؟"
    },
    practicalAction: {
      en: "When thoughts of worry or scarcity intrude today, verbally pronounce 'Inna lillahi wa inna ilayhi raji'un' (To God we belong and to Him we return) and release the illusion of total control.",
      sv: "När oron över framtiden gör sig påmind idag, säg tyst: 'Vi tillhör Gud och till Honom återvänder vi', och släpp kravet på att kontrollera allt.",
      fr: "Dès qu'une angoisse liée à l'avenir survient, récitez 'Inna lillahi wa inna ilayhi raji'un' et relâchez l'illusion d'un contrôle absolu sur les événements.",
      ar: "إذا داهمتك وساوس الخوف من المستقبل أو ضيق الرزق اليوم، ردد بقلب موقن 'إنا لله وإنا إليه راجعون' وألقِ حمولتك بين يدي الحكيم الخبير."
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/002155.mp3"
  },
  {
    id: "49:11",
    surahNumber: 49,
    surahNameArabic: "الحجرات",
    surahNameTransliterated: "Al-Hujurat",
    surahNameMeaning: "The Private Apartments",
    verseNumber: "11",
    arabicText: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا يَسْخَرْ قَوْمٌ مِّن قَوْمٍ عَسَىٰ أَن يَكُونُوا خَيْرًا مِّنْهُمْ وَلَا نِسَاءٌ مِّن نِّسَاءٍ عَسَىٰ أَن يَكُنَّ خَيْرًا مِّنْهُنَّ",
    transliteration: "Yaa ayyuhal-ladheena aamanoo laa yaskhar qawmum-min qawmin 'asaa ay-yakoonoo khayram-minhum wa laa nisaa'um-min nisaa'in 'asaa ay-yakunna khayram-minhunn.",
    translations: {
      en: {
        text: "O you who have believed, let not a people ridicule [another] people; perhaps they may be better than them; nor let women ridicule, perhaps they may be better than them.",
        translator: "Saheeh International"
      },
      sv: {
        text: "Troende! Män skall inte göra narr av andra män – det kan hända att dessa är bättre än de själva. Och kvinnor skall inte göra narr av andra kvinnor – det kan hända att dessa är bättre än de själva.",
        translator: "Knut Bernström"
      },
      fr: {
        text: "Ô vous qui avez cru ! Qu'un groupe ne se raille pas d'un autre groupe : ceux-ci sont peut-être meilleurs qu'eux. Et que des femmes ne se raillent pas d'autres femmes : celles-ci sont peut-être meilleures qu'elles.",
        translator: "Muhammad Hamidullah"
      },
      ar: {
        text: "يا أيها الذين صدقوا الله ورسوله، لا يسخر قوم مؤمنون من قوم مؤمنين؛ عسى أن يكون المسخور منهم خيراً عند الله من الساخرين، ولا يسخر نساء من نساء عسى أن يكن خيراً منهن.",
        translator: "التفسير الميسر / مجمع الملك فهد لطباعة المصحف الشريف"
      }
    },
    theme: {
      en: "Guarding Dignity, Speech & Eradicating Mockery",
      sv: "Att värna om människors värdighet och avstå från hån",
      fr: "Préserver la dignité d'autrui et s'abstenir de la moquerie",
      ar: "حفظ الكرامة الإنسانية وصيانة اللسان والنهي عن السخرية"
    },
    context: {
      en: "Surah Al-Hujurat provides the moral constitution for healthy communal living. It warns against superficial judgments because the internal spiritual rank of the person you ridicule may far surpass your own in the sight of God.",
      sv: "Sura Al-Hujurat utgör en etisk grundlag för mellanmänskliga relationer. Den varnar för ytliga omdömen, eftersom den människa man ser ner på kan ha en betydligt högre ställning hos Gud.",
      fr: "Cette sourate établit la constitution morale de la vie en société. Elle interdit le mépris et les jugements hâtifs, rappelant que la valeur d'une âme auprès de Dieu échappe aux apparences.",
      ar: "ترسم سورة الحجرات الدستور الأخلاقي للمجتمع المؤمن، فتحذر من المظاهر والأحكام السطحية؛ إذ قد يكون المستهزأ به أرفع منزلة وأحب إلى الله من الساخر."
    },
    reflectionQuestion: {
      en: "Do you catch yourself silently belittling someone's appearance, speech, status, or accent, and how can you replace that condescension with genuine respect?",
      sv: "Kommer du på dig själv med att i tankarna döma någons utseende, status eller sätt att tala, och hur kan du byta ut det mot uppriktig respekt?",
      fr: "Vous surprenez-vous parfois à juger intérieurement l'apparence ou la maladresse d'autrui ? Comment transformer ce réflexe en bienveillance ?",
      ar: "هل تجد في نفسك أحياناً استنقاصاً خفياً لمظهر أحد أو لهجته أو مكانته؟ وكيف تبدل هذا الترفع باحترام صادق وتواضع لله؟"
    },
    practicalAction: {
      en: "Speak of an absent person today only with genuine honor, or defend someone who is being casually gossiped about in your presence.",
      sv: "Tala idag endast väl om personer som inte är närvarande, eller lyft fram något gott hos någon som utsätts för skvaller.",
      fr: "Faites l'éloge d'une personne absente aujourd'hui, ou prenez délicatement la défense de quelqu'un qui fait l'objet de commérages.",
      ar: "اذكر غائباً اليوم بخير خالص، أو ادفع بالتي هي أحسن عن شخص يُغتاب أو يُسخر منه في مجلسك صيانة لعرضه."
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/049011.mp3"
  },
  {
    id: "65:3",
    surahNumber: 65,
    surahNameArabic: "الطلاق",
    surahNameTransliterated: "At-Talaq",
    surahNameMeaning: "The Divorce",
    verseNumber: "3",
    arabicText: "وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ",
    transliteration: "Wa yarzuqhu min haythu laa yahtasib, wa may-yatawakkal 'alallaahi fahuwa hasbuh, innallaaha baalighu amrih.",
    translations: {
      en: {
        text: "And will provide for him from where he does not expect. And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose.",
        translator: "Saheeh International"
      },
      sv: {
        text: "Och sörja för honom på ett sätt som han inte kan förutse; och den som litar till Gud behöver inget annat stöd. Gud fullbordar alltid sitt verk.",
        translator: "Knut Bernström"
      },
      fr: {
        text: "Et lui accordera Ses dons par des voies sur lesquelles il ne comptait pas. Et quiconque place sa confiance en Allah, Il lui suffit. Allah atteint ce qu'Il Se propose.",
        translator: "Muhammad Hamidullah"
      },
      ar: {
        text: "ويرزقه من وجه لا يخطر بباله ولا يرجوه، ومن يتوكل على الله في أموره فهو كافيه ومغنيه، إن الله نافذ أمره وما قدره كائن لا محالة.",
        translator: "التفسير الميسر / مجمع الملك فهد لطباعة المصحف الشريف"
      }
    },
    theme: {
      en: "Tawakkul: Trusting God When All Exits Seem Blocked",
      sv: "Tillit (Tawakkul) när alla vägar tycks stängda",
      fr: "La confiance absolue (Tawakkul) face aux impasses",
      ar: "صدق التوكل على الله وفتح أبواب الرزق من حيث لا يحتسب"
    },
    context: {
      en: "Remarkably embedded in a surah dealing with divorce and financial settlement—moments of extreme vulnerability and fear of future poverty. God promises that moral integrity unlocks sustenance from coordinates no human spreadsheet could calculate.",
      sv: "Förekommer i en sura som behandlar skilsmässa och ekonomisk osäkerhet – situationer då människan känner stark oro för framtiden. Gud lovar att den som bevarar sin moraliska kompass får försörjning från oväntat håll.",
      fr: "Révélé dans un contexte de séparation conjugale et d'angoisse matérielle. Dieu assure que la droiture morale ouvre des portes de subsistance qu'aucun calcul humain ne pouvait anticiper.",
      ar: "جاءت هذه الآية العظيمة ضمن أحكام الفراق والطلاق—حيث تبلغ النفس غاية الهشاشة والخوف من الفقر والضياع. فيعد الله بأن تقواه وتفويض الأمر إليه يفتحان آفاقاً من الفرج لا يمكن لحسابات البشر إدراكها."
    },
    reflectionQuestion: {
      en: "Are you holding onto an unethical compromise or paralyzing fear because you don't yet see the physical exit door?",
      sv: "Håller du fast vid en ohälsosam kompromiss eller förlamande oro därför att du ännu inte kan se den konkreta utvägen?",
      fr: "Vous cramponnez-vous à un compromis douteux ou à une peur paralysante simplement parce que la solution n'est pas encore visible ?",
      ar: "هل تتمسك بحل غير لائق أو يسيطر عليك قلق مشلّ لأنك لا ترى مخرجاً حسياً أمامك الآن؟"
    },
    practicalAction: {
      en: "Take the single next righteous action in your control today, then consciously let go of scheming about the outcome: 'Hasbunallahu wa ni'mal wakeel'.",
      sv: "Gör det enda rätta nästa steget som står i din makt idag, och lämna sedan resultatet i Guds händer med full tillit.",
      fr: "Accomplissez la démarche juste qui dépend de vous aujourd'hui, puis confiez sereinement l'issue à Dieu : 'HasbounAllah wa ni'mal wakeel'.",
      ar: "بادر بالخطوة الصالحة التالية المتاحة لك اليوم، ثم فوّض تدبير العواقب والنتائج إلى الله موقناً: 'حسبنا الله ونعم الوكيل'."
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/065003.mp3"
  },
  {
    id: "67:2",
    surahNumber: 67,
    surahNameArabic: "الملك",
    surahNameTransliterated: "Al-Mulk",
    surahNameMeaning: "The Sovereignty",
    verseNumber: "2",
    arabicText: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ",
    transliteration: "Alladhee khalaqal-mawta wal-hayaata liyabluwakum ayyukum ahsanu 'amalaa, wa huwal-'Azeezul-Ghafoor.",
    translations: {
      en: {
        text: "[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving.",
        translator: "Saheeh International"
      },
      sv: {
        text: "Han som har skapat döden och livet för att sätta er på prov och [se] vem av er som i sitt handlande är bäst. Han är den Allsmäktige, Den som ständigt förlåter.",
        translator: "Knut Bernström"
      },
      fr: {
        text: "Celui qui a créé la mort et la vie afin de vous éprouver (et de savoir) qui de vous est le meilleur en œuvre, et c'est Lui le Puissant, le Pardonneur.",
        translator: "Muhammad Hamidullah"
      },
      ar: {
        text: "الذي أوجد الموت والحياة ليختبركم: أيكم أخلص عملاً وأصوبه وأحسنه لوجه الله، وهو العزيز الذي لا يغلبه شيء، الغفور لمن تاب من عباده.",
        translator: "التفسير الميسر / مجمع الملك فهد لطباعة المصحف الشريف"
      }
    },
    theme: {
      en: "Life as an Arena for Moral Beauty (Ahsan 'Amala)",
      sv: "Livet som en arena för moralisk skönhet och goda handlingar",
      fr: "La vie comme creuset de l'excellence morale",
      ar: "الحياة والموت ميدان للإحسان والعمل الصالح الأخلص والأصوب"
    },
    context: {
      en: "Death is mentioned before life because mortality frames our urgency and purpose. Classical scholars note that God does not ask for 'the most deeds' (akthar 'amala) but 'the best in deed' (ahsan 'amala)—defined as the most sincere and morally upright.",
      sv: "Döden nämns före livet eftersom vetskapen om vår förgänglighet ger livet dess allvar och syfte. De lärda påpekar att Gud inte söker 'flest gärningar' utan 'de vackraste och mest uppriktiga gärningarna'.",
      fr: "La mort est mentionnée avant la vie car la conscience de notre finitude donne tout son sens à nos actes. Les savants soulignent que Dieu ne demande pas la quantité ('akthar') mais la pureté et la beauté ('ahsan').",
      ar: "قدّم الموت على الحياة لأن حقيقة الفناء توقظ الروح وتحدد الوجهة. ونبّه السلف الصالح (كالفضيل بن عياض) أن الله لم يقل 'أكثر عملاً' بل 'أحسن عملاً'، وهو أخلصه لله وأصوبه على السنة."
    },
    reflectionQuestion: {
      en: "If life is measured not by accumulated wealth or status, but by the moral sincerity of your deeds, how would that change your priorities before dusk today?",
      sv: "Om livets värde inte mäts i status eller ackumulerad rikedom, utan i uppriktigheten i dina handlingar – hur förändrar det dina prioriteringar före kvällen?",
      fr: "Si la valeur de votre vie se mesure à la sincérité de vos actes plutôt qu'à vos réussites extérieures, comment cela réoriente-t-il votre journée ?",
      ar: "لو كان مقياس يومك ليس كثرة المهام أو المكاسب الدنيوية، بل إخلاص نيتك وجمال خلقك، فما الذي ستغيره في أولوياتك قبل غروب شمس اليوم؟"
    },
    practicalAction: {
      en: "Perform one meaningful act of kindness or charity entirely in secret today, telling no one on social media or in conversation.",
      sv: "Gör en meningsfull god handling i fullständig tystnad idag, utan att berätta om det för någon eller posta det på sociala medier.",
      fr: "Accomplissez un geste généreux ou bienveillant dans le secret le plus absolu aujourd'hui, sans en parler à qui que ce soit.",
      ar: "قم بعمل خير أو صدقة أو جبر خاطر في خفاء تام اليوم، لا يعلم به إلا الله وحده، طلباً لصفاء النية وحسن العمل."
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/067002.mp3"
  }
];

/**
 * Returns today's North Star passage deterministically by calendar day of year,
 * ensuring all users across the world experience the same synchronicity today.
 */
export function getTodayNorthStar(date: Date = new Date()): DailyNorthStarVerse {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffTime = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const index = Math.abs(dayOfYear) % DAILY_NORTH_STARS.length;
  return DAILY_NORTH_STARS[index];
}

/**
 * Helper to get localized field for the active language.
 */
export function getLocalizedText(
  item: { en: string; sv: string; fr: string; ar?: string },
  lang: Language
): string {
  if (lang === 'ar' && item.ar) return item.ar;
  return item[lang] || item.ar || item.en;
}
