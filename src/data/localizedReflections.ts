/**
 * @file localizedReflections.ts
 * @description Localized reflection prompts (Step 1 Understand, Step 2 Reflect, Step 3 Apply, Step 4 Live & Carry)
 * in English, Swedish, French, and Arabic.
 * Eliminates the audio engine language-mixing bug by ensuring that when Swedish, French, or Arabic
 * is selected, native localized prompts are fed to TTS/audio players, strictly forbidding English leaks.
 */

import { Language } from '../types';

export interface LocalizedReflection {
  understand: string;
  reflectPrompt: string;
  applyAction: string;
  livePrompt: string;
}

export const FIXTURE_REFLECTIONS: Record<string, Record<Language, LocalizedReflection>> = {
  "3:134": {
    en: {
      understand: "The Arabic term 'Kadhama' is used when a water-skin is tightly tied shut so not a single drop leaks out. The verse commands you to seal anger's release before it spills into hurtful speech.",
      reflectPrompt: "In your current conflict at work or home, what would it look like right now to 'tie the waterskin'—delaying your reply and viewing the other party with compassion?",
      applyAction: "Implement the 10-minute pause: step away, make fresh wudu or wash your hands with cool water, and commit to sending no confrontational message until calm.",
      livePrompt: "How can this show in how you live? What is the one thing you will carry with you today when dealing with difficult colleagues or family?",
    },
    sv: {
      understand: "Det arabiska begreppet 'Kadhama' beskriver att binda igen en vattenlägel så hårt att inte en droppe sipprar ut. Versen uppmanar oss att försegla vreden innan den spiller över i sårande ord.",
      reflectPrompt: "I den spänning du upplever just nu – hur kan du 'binda igen vattenlägeln', fördröja ditt svar och möta motparten med självbehärskning och barmhärtighet?",
      applyAction: "Tillämpa 10-minuterspausen: res dig från skrivbordet, skölj ansiktet med svalt vatten och avstå från att skicka något svar förrän imorgon bitti.",
      livePrompt: "Hur ska detta synas i ditt sätt att leva idag? Vad är den konkreta handlingen du bär med dig i mötet med andra?",
    },
    fr: {
      understand: "Le terme 'Kadhama' évoque une outre que l'on noue fermement afin qu'aucune goutte ne s'échappe. Le verset nous commande de contenir le bouillonnement de la colère avant qu'il n'éclate en paroles blessantes.",
      reflectPrompt: "Dans vos tensions actuelles au travail ou en famille, que signifierait nouer l'outre maintenant : différer votre réplique et regarder l'autre avec bienveillance ?",
      applyAction: "Adoptez la pause des 10 minutes : éloignez-vous un instant, faites vos ablutions ou lavez vos mains à l'eau fraîche, et ne répondez pas sous le coup de l'émotion.",
      livePrompt: "Comment cela se traduira-t-il dans votre vie aujourd'hui ? Quelle attitude essentielle emportez-vous avec vous ?",
    },
    ar: {
      understand: "الكظم في لسان العرب هو شد فم القِربة الممتلئة حتى لا تخرج منها قطرة واحدة؛ فالآية ترشد إلى حبس فوران الغيظ في الصدر ومنعه من الانفجار في لسان جارح أو تصرف متهور.",
      reflectPrompt: "في خلافك الحالي في العمل أو البيت، كيف يكون 'كظم الغيظ' الآن: هل تؤجل الرد، وتخفض نبرة صوتك، وتنظر إلى المسيء بعين الشفقة والإحسان؟",
      applyAction: "التزم بمهلة العشر دقائق: ابتعد عن مكان الشحن، وتوضأ بالماء البارد، وعاهد نفسك ألا ترسل أي رد وأنت في فورة الانفعال.",
      livePrompt: "كيف يظهر هذا النور في أسلوب حياتك؟ وما هو الخلق الذي تحمله في قلبك اليوم مع أهلك وزملائك؟",
    },
  },

  "94:5-6": {
    en: {
      understand: "The repetition of 'with hardship comes ease' with dual grammatical forms proves that difficulty is flanked and overwhelmed by divine relief.",
      reflectPrompt: "Where are you treating your trial as a dead-end, overlooking the subtle forms of relief God has placed right beside it?",
      applyAction: "Write down the hardest challenge facing you right now, and next to it list three unexpected blessings currently easing your burden.",
      livePrompt: "Carry the certainty of relief into your most demanding hours today.",
    },
    sv: {
      understand: "Upprepningen av 'med svårighet följer lättnad' visar språkligt att varje prövning omges och överväldigas av Guds mångfaldiga lättnad.",
      reflectPrompt: "Var i ditt liv betraktar du en prövning som en återvändsgränd, utan att se den hjälp och styrka Gud redan skänkt dig intill den?",
      applyAction: "Skriv ner den tyngsta utmaningen du står inför just nu, och lista tre konkreta gåvor som lindrar din börda idag.",
      livePrompt: "Bär med dig vissheten om att lättnaden redan är på väg genom dagens svåraste stunder.",
    },
    fr: {
      understand: "La répétition de 'avec la difficulté est certes une facilité' prouve qu'une épreuve unique est enveloppée et submergée par une double miséricorde divine.",
      reflectPrompt: "Où considérez-vous votre situation comme une impasse, sans voir les graines de soulagement que Dieu a déjà semées à ses côtés ?",
      applyAction: "Notez votre plus grand souci actuel, et écrivez à côté trois bienfaits inattendus qui vous soutiennent en ce moment même.",
      livePrompt: "Emportez avec vous la certitude paisible de la délivrance dans vos moments les plus intenses.",
    },
    ar: {
      understand: "تكرار (إن مع العسر يسراً) مع تعريف العسر وتنكير اليسر يؤكد في لسان القرآن أن العسر الواحد محاط بيسرين عظيمين يغلبانه حتماً.",
      reflectPrompt: "أين ترى في كربتك الحالية باباً مغلقاً، بينما ألطاف الله الخفية وتيسيره تحفّ بك من كل جانب دون أن تنتبه؟",
      applyAction: "اكتب أثقل همٍّ تحمله في قلبك، ثم دوّن بجانبه ثلاثة ألطاف ونعم حالية تهوّن عليك هذا الثقل.",
      livePrompt: "امشِ اليوم بيقين واثق أن مع كل ضيق فرجاً قريباً يصحبه.",
    },
  },

  "2:155-156": {
    en: {
      understand: "Trials of fear, loss, and scarcity are framed with 'bi-shay'in' (a small portion), reminding us that adversity is bounded while divine solace is infinite.",
      reflectPrompt: "When facing unexpected loss or uncertainty, how can pronouncing 'Inna lillahi wa inna ilayhi raji'un' liberate you from paralyzing anxiety?",
      applyAction: "Surrender what you cannot control: vocalize your reliance on God and take one humble practical step forward.",
      livePrompt: "Walk with the dignity of patience and the assurance of divine return today.",
    },
    sv: {
      understand: "Prövningar av rädsla och förlust beskrivs med ordet 'bi-shay'in' (med något litet), vilket påminner oss om att smärtan är begränsad medan trösten är oändlig.",
      reflectPrompt: "Hur kan orden 'Vi tillhör Gud och till Honom återvänder vi' befria ditt hjärta från förlamande oro över framtiden?",
      applyAction: "Släpp det du inte kan styra över: uttala ditt förtroende för Gud och ta ett lugnt, praktiskt steg framåt.",
      livePrompt: "Bär med dig tålamodets värdighet och tilliten till att du alltid är i Guds omsorg.",
    },
    fr: {
      understand: "Les épreuves sont introduites par 'bi-shay'in' (une part mesurée), rappelant que la douleur est circonscrite tandis que la grâce divine est sans borne.",
      reflectPrompt: "Face à une perte ou une incertitude, comment la parole 'Inna lillahi wa inna ilayhi raji'un' peut-elle libérer votre esprit de l'angoisse ?",
      applyAction: "Lâchez prise sur ce qui échappe à votre contrôle : récitez l'Istirja' et posez une action constructive et sereine.",
      livePrompt: "Avancez aujourd'hui avec l'endurance noble des cœurs qui s'en remettent à Dieu.",
    },
    ar: {
      understand: "التعبير بـ (بشيء) يؤكد أن كل ابتلاء في الدنيا مهما بدا ساحقاً فهو يسير محدود، وأن عاقبة الصابرين المسترجعين رحمة وهدى وبشارات لا تنفد.",
      reflectPrompt: "حين يداهمك قلق الفقد أو خوف المستقبل، كيف يحررك قول 'إنا لله وإنا إليه راجعون' من وهم السيطرة ويعيدك إلى كنف الحفيظ العليم؟",
      applyAction: "سلّم ما عجزت عنه لقدر الله: استرجع بقلبك ولسانك، وبادر بخطوة واحدة مفيدة فيما هو تحت استطاعتك.",
      livePrompt: "عش يومك متدثراً ببشارة الصابرين وثقة المتوكلين على الحي القيوم.",
    },
  },

  "13:28": {
    en: {
      understand: "The spiritual heart was created with an innate thirst that worldly distractions cannot satisfy; true tranquility is unlocked solely through divine remembrance.",
      reflectPrompt: "What mental noise or digital screen habits are keeping your heart agitated and disconnected from God's soothing presence?",
      applyAction: "Take a 5-minute silent retreat: put down all electronics, breathe deeply, and anchor your heart in tasbih.",
      livePrompt: "Let continuous dhikr be your sanctuary amidst workplace pressure and chaos.",
    },
    sv: {
      understand: "Hjärtat skapades med en inre törst som materiella ting aldrig kan släcka; sann stillhet infinner sig endast genom minnet av Gud.",
      reflectPrompt: "Vilket tankebrus eller digitala vanor håller ditt hjärta splittrat och borta från stillheten i Guds närvaro?",
      applyAction: "Ta en 5-minuters tyst paus: lägg undan all teknik, andas djupt och upprepa Guds lovord med hjärtats fulla närvaro.",
      livePrompt: "Gör Guds minne till ditt inre ankare genom vardagens stress och möten.",
    },
    fr: {
      understand: "Le cœur humain possède un besoin inné que les distractions éphémères ne combleront jamais ; la paix véritable naît de l'évocation de Dieu.",
      reflectPrompt: "Quelle surstimulation ou dispersion mentale agite votre esprit et vous empêche de goûter au recueillement intérieur ?",
      applyAction: "Accordez-vous 5 minutes de déconnexion totale : posez vos écrans, respirez posément et récitez le dhikr avec présence.",
      livePrompt: "Faites du souvenir d'Allah votre forteresse de sérénité au cœur des sollicitations quotidiennes.",
    },
    ar: {
      understand: "خلق الله القلب بفطرة لا تسكن إلى زينة الدنيا وزخرفها؛ وإنما تستقر وتهدأ حين تتصل بخالقها ومولاها ذكراً ومحبة وإخباتاً.",
      reflectPrompt: "ما هو الصخب أو التشتت اليومي الذي يزاحم قلبك ويحرمك من حلاوة الأنس بالله وسكينة ذكره؟",
      applyAction: "انفرد بنفسك ٥ دقائق بعيداً عن الشاشات والأجهزة: أغمض عينيك، وتنفس بعمق، واذكر الله بقلب حاضر متأمل.",
      livePrompt: "اجعل لسانك رطباً بذكر الله في كل حركة وسكنة لتظل روحك في طمأنينة دائمة.",
    },
  },
};

/**
 * Helper to fetch localized reflection prompts for any verse fixture.
 * Guarantees that active language is strictly honored without English falling back into foreign voices.
 */
export function getLocalizedReflection(verseId: string, lang: Language): LocalizedReflection {
  const fixture = FIXTURE_REFLECTIONS[verseId];
  if (fixture && fixture[lang]) {
    return fixture[lang];
  }

  // Generic fallback if specific ID is not explicitly listed, strictly in the user's language
  const genericFallbacks: Record<Language, LocalizedReflection> = {
    en: {
      understand: "Contemplate the profound divine wisdom and linguistic clarity of this sacred verse.",
      reflectPrompt: "How does this divine truth mirror your current thoughts, emotions, and life challenges?",
      applyAction: "Identify one specific moral action or behavioral adjustment you will carry out today.",
      livePrompt: "Commit to one mindset shift that reflects this verse in your daily interactions.",
    },
    sv: {
      understand: "Begrunda den djupa gudomliga visheten och det klara budskapet i denna heliga vers.",
      reflectPrompt: "Hur speglar denna sanning dina tankar, känslor och livsutmaningar just nu?",
      applyAction: "Välj en konkret moralisk handling eller paus som du förbinder dig till idag.",
      livePrompt: "Bär med dig en påminnelse från denna vers i dina möten med andra människor idag.",
    },
    fr: {
      understand: "Méditez sur la sagesse divine et la profondeur spirituelle de ce verset sacré.",
      reflectPrompt: "En quoi cette vérité coranique résonne-t-elle avec vos défis et votre état intérieur actuel ?",
      applyAction: "Définissez un geste concret ou un changement de comportement à appliquer dès aujourd'hui.",
      livePrompt: "Incarnez cet enseignement dans vos paroles et vos interactions quotidiennes.",
    },
    ar: {
      understand: "تأمل في الحكمة الربانية الباهرة وظلال الإيمان والبيان في هذه الآية الكريمة.",
      reflectPrompt: "كيف يخاطب هذا التوجيه القرآني واقع قلبك وأحوالك وتحدياتك في هذه المرحلة؟",
      applyAction: "حدد خطوة عملية وسلوكاً أخلاقياً محدداً تعزم على تطبيقه اليوم ابتغاء وجه الله.",
      livePrompt: "احمل هذا المعنى القرآني نوراً في تعاملك اليومي مع أهلك والناس أجمعين.",
    },
  };

  return genericFallbacks[lang] || genericFallbacks.en;
}
