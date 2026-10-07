import { QuranVerseFixture, QuickPill } from '../types';

export const QURAN_FIXTURES: QuranVerseFixture[] = [
  {
    id: "3:134",
    surahNumber: 3,
    surahNameArabic: "آل عمران",
    surahNameTransliterated: "Ali 'Imran",
    surahNameMeaning: "The Family of Imran",
    verseNumber: "134",
    juz: 4,
    revelationType: "Medinan",
    revelationContext: "Revealed following the battle of Uhud, instructing the community on maintaining sublime character, self-restraint, mutual forgiveness, and financial spending during times of pressure.",
    arabicText: "الَّذِينَ يُنفِقُونَ فِي السَّرَّاءِ وَالضَّرَّاءِ وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ ۗ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ",
    transliteration: "Alladheena yunfiqoona fee as-sarraa'i wad-darraa'i wal-kaadhimeena al-ghaydha wal-'aafeena 'anin-naas, wallaahu yuhibbul-muhsineen.",
    translations: {
      en: {
        text: "Who spend [in the cause of Allah] during ease and hardship and who restrain anger and who pardon the people - and Allah loves the doers of good.",
        translator: "Sahih International"
      },
      sv: {
        text: "De som ger åt andra såväl i välstånd som i nöd, och som behärskar sin vrede och förlåter sina medmänniskor - Gud älskar dem som gör det goda.",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Qui dépensent dans l'aisance et dans l'adversité, qui dominent leur rage et pardonnent à autrui - car Allah aime les bienfaisants.",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/003134.mp3",
    category: "moment",
    topics: ["Anger Management", "Speech Control", "Forgiveness", "Patience at Work", "Emotional Regulation", "Ihsan"],
    emotions: ["Anger", "Frustration", "Resentment", "Irritation", "Betrayal"],
    situations: ["Anger at work", "Workplace conflict", "Family disputes", "Unfair criticism", "Negotiation strain"],
    whyThisVerse: {
      emotion: "Anger & Frustration",
      situation: "Workplace or interpersonal tension where emotions run high and speech risks causing harm.",
      coreNeed: "Channeling instinctive rage into self-mastery, strategic silence, and grace under pressure.",
      spiritualPrinciple: "Self-restraint (Kadhin al-Ghaydh) followed by active pardon ('Afw) elevates a person to the divine rank of Ihsan.",
      mappingExplanation: "This verse addresses the intense physiological surge of anger ('al-ghaydh' - rage boiling like a kettle) by giving three sequential steps: first contain the anger without erupting, second pardon the transgressor, and third return good for harm. Perfect for high-friction work environments.",
      topics: ["Anger Management", "Speech Control", "Forgiveness", "Excellence in Action (Ihsan)"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "The phrase 'wal-kaadhimeena al-ghaydha' means: they do not unleash their anger upon people; rather, they hold it back and endure patiently, expecting reward with Allah. Then Allah adds 'wal-'aafeena 'anin-naas' meaning they not only suppress the impulse to retaliate, but also pardon those who wronged them, harboring no hidden rancor.",
        sourceType: 'classical_book',
        sourceReference: "Tafsir Ibn Kathir, Vol. 2, p. 119 (Dar Taybah Edition)",
        originalArabicRaw: "قوله تعالى: (والكاظمين الغيظ) أي: إذا ثار بهم الغيظ كظموه بمعنى كتموه فلم يعملوه، وصبروا، وتجرعوا مرارته احتساباً للأجر عند الله، ثم قال: (والعافين عن الناس) أي: مع كف الشر يعفون عمن ظلمهم في أنفسهم فلا يبقى في قلوبهم حقد على أحد.",
        verificationStatus: 'verified_canonical'
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "Restraining anger is not merely staying silent while burning inside; it is the deliberate mastery over one's nafs when stirred by provocative words or hostile acts. Allah emphasizes Ihsan because the pinnacle of character is to treat kindly the one who has acted poorly toward you.",
        sourceType: 'classical_book',
        sourceReference: "Taysir al-Karim al-Rahman fi Tafsir Kalam al-Mannan, Surah Ali Imran 134",
        originalArabicRaw: "كظم الغيظ: هو حبس النفس عند هيجان الغضب بالحلم، والعفو عن الناس بترك المؤاخذة، والإحسان إليهم بمقابلة الإساءة بالإحسان؛ فجمع بين درجات الفضل الثلاث.",
        verificationStatus: 'verified_canonical'
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar (King Fahd Complex)",
        text: "Those who spend in ease and straitened circumstances, who swallow the bitter taste of anger when provoked and excuse those who transgress against their rights, attaining the beloved state of beneficence.",
        sourceType: 'classical_book',
        sourceReference: "Al-Tafsir Al-Muyassar, King Fahd Complex for Printing the Holy Quran",
        originalArabicRaw: "الذين ينفقون أموالهم في اليسر والعسر، ويمسكون أنفسهم عند الغضب فلا ينتقمون، ويعفون عمن ظلمهم، والله يحب المحسنين.",
        verificationStatus: 'verified_canonical'
      },
      {
        scholar: "Al-Sha'rawi",
        century: "Contemporary (1911–1998 CE)",
        sourceBook: "تفسير الشعراوي (Quranpedia Book #18)",
        text: "هذه بعض من صفات المتقين ﴿والكاظمين الغيظ﴾ لأن المعركة - معركة أُحد - ستعطينا هذه الصورة أيضاً. وأصل الكظم أن تملأ القِرْبة، والقِرَب كان يحملها «السقا» في الماضي، وكانت وعاء نقل الماء عند العرب، وهي من جلد مدبوغ، فإذا مُلئت القربة بالماء شُدّ على رأسها أي رُبط رأسها ربطاً محكماً بحيث لا يخرج شيء مَمّا فيها، ويقال عن هذا الفعل: «كظم القربة» أي ملأها وربطها. كذلك الغيظ يفعل في النفس البشرية، إنه يهيجها، والله لا يمنع الهياج في النفس لأنه انفعال طبيعي، ولكن على المؤمن أن يكظمه.. أي لا يجعل الانفعال غالبا على حسن السلوك والتدبير. والحق سبحانه يقول: ﴿والكاظمين الغيظ والعافين عَنِ الناس﴾. فهناك ثلاث مراحل: الأولى: كظم الغيظ. والثانية: العفو وهو أن تخرج الغيظ من قلبك وكأن الأمر لم يحدث. والثالثة: أن يتجاوز الإنسان الكظم والعفو بأن يحسن إلى المسئ إليه ﴿والله يُحِبُّ المحسنين﴾.",
        sourceType: 'classical_book',
        sourceReference: "Quranpedia (book_id=18) | verse_key=3:134 | Vol. 3 | pp. 1753–1757 | version=2026-08-10",
        originalArabicRaw: "هذه بعض من صفات المتقين ﴿والكاظمين الغيظ﴾ لأن المعركة - معركة أُحد - ستعطينا هذه الصورة أيضاً. وأصل الكظم أن تملأ القِرْبة، والقِرَب كان يحملها «السقا» في الماضي، وكانت وعاء نقل الماء عند العرب، وهي من جلد مدبوغ، فإذا مُلئت القربة بالماء شُدّ على رأسها أي رُبط رأسها ربطاً محكماً بحيث لا يخرج شيء مَمّا فيها، ويقال عن هذا الفعل: «كظم القربة» أي ملأها وربطها. كذلك الغيظ يفعل في النفس البشرية، إنه يهيجها، والله لا يمنع الهياج في النفس لأنه انفعال طبيعي، ولكن على المؤمن أن يكظمه.. أي لا يجعل الانفعال غالبا على حسن السلوك والتدبير. والحق سبحانه يقول: ﴿والكاظمين الغيظ والعافين عَنِ الناس﴾. فهناك ثلاث مراحل: الأولى: كظم الغيظ. والثانية: العفو وهو أن تخرج الغيظ من قلبك وكأن الأمر لم يحدث. والثالثة: أن يتجاوز الإنسان الكظم والعفو بأن يحسن إلى المسئ إليه ﴿والله يُحِبُّ المحسنين﴾.",
        verificationStatus: 'verified_canonical'
      }
    ],
    reflectionFramework: {
      understand: "The Arabic term 'Kadhama' is used when a water-skin is tightly tied shut so not a single drop leaks out. The verse acknowledges anger as a natural human emotion, but commands you to seal its release so it does not spill into hurtful speech or rash emails.",
      reflectPrompt: "In your current conflict at work or home, what would it look like right now to 'tie the waterskin'—to delay your reply, soften your tone, and view the provoking party with compassion rather than vindication?",
      applyAction: "Implement the 10-minute pause: step away from your desk, make fresh wudu or wash your hands with cool water, and commit to not sending any confrontational response until tomorrow morning.",
      livePrompt: "How can this show in how you live? What is the one thing you will carry with you today when dealing with difficult colleagues or family?"
    },
    notSaying: {
      en: "This verse is NOT asking you to tolerate ongoing abuse, physical danger, or toxic exploitation. Forgiving an individual error or restraining a sudden outburst does not mean abandoning healthy professional boundaries or legal rights.",
      sv: "Denna vers ber dig INTE att acceptera upprepat förtryck, fysisk fara eller skadlig behandling. Att behärska vreden och förlåta en enskild oförrätt innebär inte att avstå från sunda professionella gränser eller rättsliga rättigheter.",
      fr: "Ce verset ne vous demande PAS de tolérer des violences continues ou une injustice destructrice. Maîtriser son emportement et pardonner n'exclut nullement d'établir des limites fermes et de faire respecter ses droits."
    },
    surroundingVerses: {
      before: {
        verseNumber: "133",
        arabicText: "وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ",
        translations: {
          en: "And hasten to forgiveness from your Lord and a garden as wide as the heavens and earth, prepared for the righteous.",
          sv: "Och tävla med varandra om er Herres förlåtelse och ett paradis, vars vidd är som himlarnas och jordens, berett för de gudfruktiga.",
          fr: "Et empressez-vous vers le pardon de votre Seigneur ainsi qu'un Jardin large comme les cieux et la terre, préparé pour les pieux."
        }
      },
      after: {
        verseNumber: "135",
        arabicText: "وَٱلَّذِينَ إِذَا فَعَلُوا۟ فَٰحِشَةً أَوْ ظَلَمُوٓا۟ أَنفُسَهُمْ ذَكَرُوا۟ ٱللَّهَ فَٱسْتَغْفَرُوا۟ لِذُنُوبِهِمْ وَمَن يَغْفِرُ ٱلذُّنُوبَ إِلَّا ٱللَّهُ وَلَمْ يُصِرُّوا۟ عَلَىٰ مَا فَعَلُوا۟ وَهُمْ يَعْلَمُونَ",
        translations: {
          en: "And those who, when they commit an immorality or wrong themselves, remember Allah and seek forgiveness for their sins - and who can forgive sins except Allah? - and [who] do not persist in what they have done while they know.",
          sv: "Och de som, om de har begått en skamlig handling eller tillfogat sig själva orätt, minns Gud och ber Honom om förlåtelse för sina synder - och vem kan förlåta synderna utom Gud? - och som inte fortsätter att begå sådana handlingar mot bättre vetande.",
          fr: "Et ceux qui, s'ils ont commis une turpitude ou causé du tort à eux-mêmes, se souviennent d'Allah et demandent pardon pour leurs péchés - et qui pardonne les péchés sinon Allah ? - et qui ne persistent pas sciemment dans le mal qu'ils ont fait."
        }
      }
    },
    lifeSphere: "society",
    linguisticRoots: [
      {
        termArabic: "الْكَاظِمِينَ",
        termTransliterated: "Al-Kaadhimeen",
        root: "ك - ظ - م (k-dh-m)",
        literalImagery: {
          en: "Tying a leather water-skin so full with liquid that it bulges and could burst, fastening it tightly with cord so not a single drop leaks out.",
          sv: "Att binda igen en lädersäck så full med vatten att den buktar ut och kan brista, med ett snöre så att inte en droppe sipprar ut.",
          fr: "Nouer hermétiquement une outre d'eau si pleine qu'elle menace d'éclater, afin qu'aucune goutte ne s'en échappe."
        },
        spiritualDepth: {
          en: "Acknowledges anger as a natural boiling surge, commanding deliberate mastery to seal its outlet before it turns into hurtful speech or rash retaliation.",
          sv: "Bekräftar att vrede är en naturlig kokande kraft, men befaller medveten självkontroll att försegla utloppet innan det blir till sårande ord.",
          fr: "Reconnaît la colère comme une pulsion bouillonnante, ordonnant la maîtrise de soi pour sceller toute réaction blessante."
        }
      },
      {
        termArabic: "الْعَافِينَ",
        termTransliterated: "Al-'Aafeen",
        root: "ع - ف - و ('-f-w)",
        literalImagery: {
          en: "Desert winds blowing over sand dunes, completely erasing tracks and footprints until no mark remains.",
          sv: "Ökenvinden som sveper över sanddynerna och raderar alla fotspår tills ingen markering återstår.",
          fr: "Le vent du désert qui balaye les dunes et efface complètement les empreintes sans laisser de trace."
        },
        spiritualDepth: {
          en: "Pardon ('Afw) is not brooding in bitter silence; it is wiping the slate clean and moving forward without holding the fault over the person's head.",
          sv: "Förlåtelse ('Afw) är inte att älta i bitter tystnad; det är att stryka ett streck och gå vidare utan att ständigt påminna den andre om felet.",
          fr: "Le pardon ('Afw) ne consiste pas à ruminer dans l'amertume ; c'est effacer la faute et avancer sans rancœur."
        }
      }
    ],
    halaqahPrompts: {
      discussionQuestions: {
        en: [
          "When was the last time someone tested your patience at home or work, and how did you handle the impulse to retaliate?",
          "Why does the Quran pair swallowing anger WITH actively pardoning the person?",
          "How can we help each other pause for 10 seconds before reacting when stress rises in our home?"
        ],
        sv: [
          "När sattes ditt tålamod senast på prov hemma eller på jobbet, och hur hanterade du impulsen att ge igen?",
          "Varför kopplar Quranen ihop att svälja vreden MED att aktivt förlåta personen?",
          "Hur kan vi hjälpa varandra att ta en 10-sekunders paus innan vi reagerar när stämningen blir hetsig hemma?"
        ],
        fr: [
          "Quand votre patience a-t-elle été éprouvée récemment, et comment avez-vous géré l'envie de réagir vivement ?",
          "Pourquoi le Coran associe-t-il la maîtrise de la colère AU pardon actif de la personne ?",
          "Comment pouvons-nous nous entraider pour marquer 10 secondes de pause en cas de tension dans notre foyer ?"
        ]
      },
      familyCommitment: {
        en: "Whenever friction flares up in our circle this week, we agree to pause for 10 seconds, take three slow breaths, and speak in lower tones.",
        sv: "Varje gång irritation blossar upp i vår cirkel i veckan pausar vi i 10 sekunder, tar tre djupa andetag och talar med dämpad röst.",
        fr: "Chaque fois qu'une tension surgira cette semaine, nous prendrons 10 secondes de pause, trois respirations et un ton apaisé."
      }
    }
  },
  {
    id: "94:5-6",
    surahNumber: 94,
    surahNameArabic: "الشرح",
    surahNameTransliterated: "Ash-Sharh",
    surahNameMeaning: "The Relief",
    verseNumber: "5-6",
    juz: 30,
    revelationType: "Meccan",
    revelationContext: "Revealed during the peak of severe rejection in Makkah, comforting the Prophet ﷺ when burdens felt heavy upon his back, assuring divine expansion of the chest and imminent dual ease.",
    arabicText: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    transliteration: "Fa inna ma'al-'usri yusra. Inna ma'al-'usri yusra.",
    translations: {
      en: {
        text: "For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.",
        translator: "Sahih International"
      },
      sv: {
        text: "På prövningen följer lättnad! Ja, på prövningen följer lättnad!",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "A côté de la difficulté est, certes, une facilité! A côté de la difficulté est, certes, une facilité!",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/094005.mp3",
    category: "moment",
    topics: ["Burnout", "Anxiety", "Financial Stress", "Hope", "Resilience"],
    emotions: ["Overwhelmed", "Anxious", "Exhausted", "Hopeless", "Stressed"],
    situations: ["Work burnout", "Academic stress", "Heavy family burdens", "Career uncertainty", "Chronic fatigue"],
    whyThisVerse: {
      emotion: "Overwhelm & Anxiety",
      situation: "Facing compounding deadlines, exhausting challenges, or feelings of inadequacy.",
      coreNeed: "Reassurance that pain is neither terminal nor isolated; relief is already bundled alongside the trial.",
      spiritualPrinciple: "Ease does not merely follow hardship chronologically; grammatically 'ma'a' indicates it is accompanying it simultaneously.",
      mappingExplanation: "Linguistically in Arabic, 'Al-'Usr' is definite (the specific trial), while 'Yusr' is indefinite (abundant, multidimensional ease). Thus, classical scholars noted: one hardship can never defeat two eases.",
      topics: ["Ease & Hardship", "Emotional Resilience", "Hope in Crisis"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "The repetition confirms the promise. The Prophet ﷺ said: 'Rejoice, for ease has come to you; one hardship will never overcome two eases.' Because 'al-'usr' is repeated with the definite article 'al', it is one single hardship, whereas 'yusra' is indefinite and doubled.",
        sourceType: 'classical_book',
        sourceReference: "Tafsir Ibn Kathir, Surah Al-Sharh 94:5-6",
        originalArabicRaw: "تكرر الوعد تأكيداً وتثبيتاً، وروي عن النبي ﷺ أنه قال: 'لن يغلب عسر يسرين'؛ لأن العسر معرف بأل فهو عسر واحد، واليسر منكر فهو يسران متعددان.",
        verificationStatus: 'verified_canonical'
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "This carries immense tidings for every believer undergoing distress: no matter how tight the constriction becomes, divine relief is entwined within its very folds, expanding the heart and delivering uncalculated openings.",
        sourceType: 'classical_book',
        sourceReference: "Taysir al-Karim al-Rahman fi Tafsir Kalam al-Mannan, Surah Al-Inshirah",
        originalArabicRaw: "بشارة عظيمة أنه كلما وجد عسر وصعوبة، فإن اليسر يقارنه ويصاحبه، حتى لو دخل العسر جحر ضب لدخل عليه اليسر فأخرجه.",
        verificationStatus: 'verified_canonical'
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "Truly with hardship comes great relief, so let not distress cause despair; the relief of Allah is near.",
        sourceType: 'classical_book',
        sourceReference: "Al-Tafsir Al-Muyassar, King Fahd Complex",
        originalArabicRaw: "فإن مع الضيق والشدة سعةً وفرجاً، إن مع الضيق والشدة سعةً وفرجاً، فلا يثنك الأذى عن تبليغ رسالتك.",
        verificationStatus: 'verified_canonical'
      }
    ],
    reflectionFramework: {
      understand: "The word 'Sharh' means to surgically cut open or expand what was previously constricted. Allah promised that every constriction contains the seeds of unseen blessings, stamina, and future doors.",
      reflectPrompt: "Think of a previous season of hardship you survived. What hidden ease, resilience, or relationships grew out of that very difficulty that you could not see while inside it?",
      applyAction: "Identify the single biggest mental burden causing you friction today. Write it down, make sincere du'a surrendering its outcome, and intentionally take one small concrete step forward.",
      livePrompt: "How can this show in how you live? What is the one thing you will carry with you today when pressure feels heavy?"
    },
    notSaying: {
      en: "This verse is NOT stating that hardship will vanish magically without any effort, nor that you should feel guilty for feeling tired. The verse guarantees that relief is accompanied by divine presence, not that challenges are effortless.",
      sv: "Denna vers påstår INTE att svårigheten försvinner magiskt utan ansträngning, eller att du ska känna skuld för att du känner dig trött. Den garanterar att lättnad och nåd finns invävd vid sidan av prövningen.",
      fr: "Ce verset ne prétend PAS que la difficulté disparaîtra instantanément sans effort, ni que vous devriez culpabiliser d'être fatigué. Il assure que le secours divin accompagne l'épreuve à chaque instant."
    },
    surroundingVerses: {
      before: {
        verseNumber: "1-4",
        arabicText: "أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ ۝ وَوَضَعْنَا عَنكَ وِزْرَكَ ۝ الَّذِي أَنقَضَ ظَهْرَكَ ۝ وَرَفَعْنَا لَكَ ذِكْرَكَ",
        translations: {
          en: "Did We not expand for you your breast? And We removed from you your burden which had weighed upon your back, and raised high for you your repute.",
          sv: "Har Vi inte öppnat ditt bröst och lättat den börda som tyngde din rygg och gett dig ett aktat namn?",
          fr: "N'avons-Nous pas ouvert pour toi ta poitrine ? Et ne t'avons-Nous pas déchargé du fardeau qui accablait ton dos ?"
        }
      },
      after: {
        verseNumber: "7-8",
        arabicText: "فَإِذَا فَرَغْتَ فَانصَبْ ۝ وَإِلَىٰ رَبِّكَ فَارْغَب",
        translations: {
          en: "So when you have finished [your duties], then stand up [for worship], and to your Lord direct [your] longing.",
          sv: "När du har fullgjort [dina plikter], förrätta då din bön och vänd hela din längtan till din Herre.",
          fr: "Quand tu te libères, consacre-toi donc à la prière, et vers ton Seigneur dirige ton aspiration."
        }
      }
    },
    lifeSphere: "individual",
    linguisticRoots: [
      {
        termArabic: "نَشْرَحْ",
        termTransliterated: "Nashrah",
        root: "ش - ر - ح (sh-r-h)",
        literalImagery: {
          en: "Surgically opening, slicing, and widely expanding something that was previously constricted, suffocated, or tightly compressed.",
          sv: "Att kirurgiskt öppna och vidga något som tidigare var trångt, sammandraget eller kvävt.",
          fr: "Ouvrir chirurgicalement et déployer largement ce qui était à l'étroit ou étouffé."
        },
        spiritualDepth: {
          en: "Divine expansion of the chest ('Sharh as-Sadr') takes inner constriction and claustrophobia, dissolving it into spacious clarity and serene resilience.",
          sv: "Gudomligt öppnande av bröstet ('Sharh as-Sadr') förvandlar inre ångest och kvävningskänsla till rymd, klarhet och lugn.",
          fr: "L'ouverture divine de la poitrine dissipe l'angoisse étouffante pour faire place à la sérénité et à la paix du cœur."
        }
      },
      {
        termArabic: "الْعُسْرِ / يُسْرًا",
        termTransliterated: "Al-'Usr / Yusr",
        root: "ع - س - ر / ي - س - ر",
        literalImagery: {
          en: "'Usr is a steep, impassable rocky mountain pass. Yusr is smooth, level, open grazing ground with clear pathways.",
          sv: "'Usr är ett brant, otillgängligt stenigt bergspass. Yusr är en jämn, vidsträckt och öppen betesmark med fri väg.",
          fr: "'Usr évoque un col montagneux escarpé et hostile. Yusr représente une terre fertile et plane où le chemin est limpide."
        },
        spiritualDepth: {
          en: "Grammatically, the trial ('al-'usr') is singular and definite, while ease ('yusr') is indefinite and repeated. Thus, one hardship can never overpower two eases.",
          sv: "Grammatiskt är prövningen ('al-'usr') bestämd och ental, medan lättnaden ('yusr') är obestämd och upprepad. En svårighet kan därför aldrig besegra två lättnader.",
          fr: "Grammaticalement, l'épreuve est définie (unique), tandis que la facilité est indéfinie (infinie). Une difficulté ne surmontera jamais deux facilités."
        }
      }
    ],
    halaqahPrompts: {
      discussionQuestions: {
        en: [
          "What is one difficulty our family or circle recently overcame that taught us resilience?",
          "What small eases are we taking for granted right now while focusing on our challenges?",
          "How can we reassure each other when one of us feels overwhelmed?"
        ],
        sv: [
          "Vilken svårighet har vår familj nyligen tagit sig igenom som gav oss styrka och klokhet?",
          "Vilka små lättnader tar vi för givna just nu medan vi oroar oss för bekymmer?",
          "Hur kan vi finnas där för varandra när någon i hemmet känner sig överväldigad?"
        ],
        fr: [
          "Quelle épreuve passée a forgé la force et la cohésion de notre famille ?",
          "Quelles facilités évidentes oublions-nous de remercier lorsque nous sommes sous pression ?",
          "Comment pouvons-nous nous réconforter mutuellement dans les moments de fatigue ?"
        ]
      },
      familyCommitment: {
        en: "At every meal this week, each person names one unexpected blessing or ease they noticed today.",
        sv: "Vid varje middag i veckan delar varje person en oväntad lättnad eller välsignelse som inträffade under dagen.",
        fr: "À chaque repas cette semaine, chacun partagera une facilité ou bénédiction inattendue constatée dans la journée."
      }
    }
  },
  {
    id: "2:155-156",
    surahNumber: 2,
    surahNameArabic: "البقرة",
    surahNameTransliterated: "Al-Baqarah",
    surahNameMeaning: "The Cow",
    verseNumber: "155-156",
    juz: 2,
    revelationType: "Medinan",
    revelationContext: "Revealed to the early Muslim community facing displacement, bereavement, economic boycott, and fear after emigrating to Madinah.",
    arabicText: "وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَالِ وَالْأَنفُسِ وَالثَّمَرَاتِ ۗ وَبَشِّرِ الصَّابِرِينَ ۝ الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
    transliteration: "Wa lanabluwannakum bi-shay'im-minal-khawfi wal-joo'i wa naqsim-minal-amwaali wal-anfusi wath-thamaraat, wa bashshiris-saabireen. Alladheena idhaa asaabat-hum museebatun qaaloo innaa lillaahi wa innaa ilayhi raaji'oon.",
    translations: {
      en: {
        text: "And We will surely test you with something of fear and hunger and a loss of wealth and lives and fruits, but give good tidings to the patient, Who, when disaster strikes them, say, 'Indeed we belong to Allah, and indeed to Him we will return.'",
        translator: "Sahih International"
      },
      sv: {
        text: "Helt visst skall Vi pröva er med något av fruktan, hunger och förlust av egendom, liv och frukten [av ert arbete]. Men ge det glada budskapet till dem som håller ut i tålamod, dem som när en olycka drabbar dem säger: 'Vi tillhör Gud och till Honom skall vi återvända.'",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Très certainement, Nous vous éprouverons par un peu de peur, de faim et de diminution de biens, de personnes et de fruits. Et fais la bonne annonce aux endurants, qui disent, quand un malheur les atteint: 'Certes nous sommes à Allah, et c'est à Lui que nous retournerons.'",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/002155.mp3",
    category: "moment",
    topics: ["Grief", "Loss", "Calamity", "Patience (Sabr)", "Istirja'"],
    emotions: ["Grief", "Sadness", "Heartbreak", "Fear", "Mourning"],
    situations: ["Loss of a loved one", "Financial loss", "Health diagnosis", "Job redundancy", "Divorce / Breakup"],
    whyThisVerse: {
      emotion: "Grief & Profound Loss",
      situation: "Facing sudden bereavement, material loss, illness, or shattering news.",
      coreNeed: "A cognitive anchor that grounds the soul: acknowledging reality without falling into existential despair.",
      spiritualPrinciple: "The phrase 'Inna lillahi wa inna ilayhi raji'un' resets ownership: we, and all we cherish, are trusted loans belonging to the Creator.",
      mappingExplanation: "The verse uses the diminutive 'bi-shay'in' (with something small of fear/loss), reminding the believer that earthly tribulations are finite and outweighed by divine mercy.",
      topics: ["Grief Processing", "Surrender", "The Nature of Life's Tests"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "Saying the statement of Istirja' consoles the soul because the person remembers: I am a servant of Allah, under His decree, and my final destiny is back to Him, where no righteous deed is lost."
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "The patient ones do not complain against Allah's decree; they confess their identity as His property. Since the Master has the right to dispose of His property as He wills, they accept His wisdom with tranquil trust."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "Give glad tidings of peace and honor in this life and the hereafter to those who steadfastly endure and return all matters to their Creator."
      }
    ],
    reflectionFramework: {
      understand: "The word 'Musibah' comes from the root that means an arrow that hits its target precisely. Your test did not miss you by mistake; it was measured with divine precision for your spiritual elevation.",
      reflectPrompt: "Where are you currently holding on to ownership of an outcome or relationship, rather than seeing yourself as a temporary trustee caring for it with grace?",
      applyAction: "Speak the Istirja' aloud: 'Inna lillahi wa inna ilayhi raji'un. Allahumma ajirni fi museebati wakhluf li khayran minha' (O Allah, reward me in my affliction and grant me better in exchange)."
    },
    surroundingVerses: {
          "before": {
                "verseNumber": "154",
                "arabicText": "وَلَا تَقُولُوا لِمَن يُقْتَلُ فِي سَبِيلِ اللَّهِ أَمْوَاتٌ ۚ بَلْ أَحْيَاءٌ وَلَٰكِن لَّا تَشْعُرُونَ",
                "translations": {
                      "en": "And do not say about those who are killed in the way of Allah, 'They are dead.' Rather, they are alive, but you perceive [it] not.",
                      "sv": "Och säg inte om dem som stupar för Guds sak att de är döda. Nej, de lever, fastän ni inte märker det.",
                      "fr": "Et ne dites pas de ceux qui sont tués dans le sentier d'Allah qu'ils sont morts. Au contraire ils sont vivants, mais vous en êtes inconscients."
                }
          },
          "after": {
                "verseNumber": "157",
                "arabicText": "أُولَٰئِكَ عَلَيْهِمْ صَلَوَاتٌ مِّن رَّبِّهِمْ وَرَحْمَةٌ ۖ وَأُولَٰئِكَ هُمُ الْمُهْتَدُونَ",
                "translations": {
                      "en": "Those are the ones upon whom are blessings from their Lord and mercy. And it is those who are the [rightly] guided.",
                      "sv": "De ska få ta emot välsignelse och barmhärtighet från sin Herre; det är de som är rätt vägledda.",
                      "fr": "Ceux-là reçoivent des bénédictions de leur Seigneur, ainsi que la miséricorde ; et ceux-là sont les biens guidés."
                }
          }
    }
  },
  {
    id: "13:28",
    surahNumber: 13,
    surahNameArabic: "الرعد",
    surahNameTransliterated: "Ar-Ra'd",
    surahNameMeaning: "The Thunder",
    verseNumber: "28",
    juz: 13,
    revelationType: "Medinan",
    revelationContext: "Revealed in response to those demanding material miracles, redirecting human consciousness to the internal miracle of spiritual tranquility through divine remembrance.",
    arabicText: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    transliteration: "Alladheena aamanoo wa tatma'innu quloobuhum bidhikril-laah, alaa bidhikril-laahi tatma'innul-quloob.",
    translations: {
      en: {
        text: "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.",
        translator: "Sahih International"
      },
      sv: {
        text: "De som tror och vars hjärtan finner ro i åkallan av Gud - ja, sannerligen, i åkallan av Gud finner hjärtat ro!",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Ceux qui ont cru, et dont les cœurs s'apaisent à l'évocation d'Allah. N'est-ce point par l'évocation d'Allah que se tranquillisent les cœurs?",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/013028.mp3",
    category: "moment",
    topics: ["Inner Peace", "Mindfulness", "Dhikr", "Mental Stillness", "Spiritual Healing"],
    emotions: ["Restlessness", "Panic", "Anxiety", "Loneliness", "Inner Chaos"],
    situations: ["Panic attacks", "Late-night insomnia", "Racing thoughts", "Overthinking", "Existential dread"],
    whyThisVerse: {
      emotion: "Inner Restlessness & Heart Palpitations",
      situation: "When thoughts are racing, external noise is deafening, and nothing material settles the heart.",
      coreNeed: "True stillness (Itmi'nan) that transcends fleeting worldly remedies.",
      spiritualPrinciple: "The human heart was created by God with a vacuum that only His conscious remembrance can truly satisfy.",
      mappingExplanation: "The particle 'Ala' (Unquestionably / Behold) is used in Arabic for awakening alertness, drawing the restless soul back to the singular true sanctuary.",
      topics: ["Dhikr as Medicine", "Stillness of Heart", "Divine Connection"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "Their hearts find contentment in Allah's side; their agitation settles, and they find peace whenever He is remembered and His majesty recalled."
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "It is worthy and fitting that hearts should find peace in Him, for there is nothing more beloved or sweet to the soul than knowing its Maker, worshiping Him, and conversing with Him."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "Verily through obedience to Allah and His remembrance, all fear dissolves and spirits attain total serenity."
      }
    ],
    reflectionFramework: {
      understand: "The word 'Itmi'nan' signifies deep, rooted tranquility—like an anchor resting on the solid sea floor while winds howl on the surface.",
      reflectPrompt: "What worldly distractions or digital consumption are you currently using to numb your anxious heart instead of sitting quietly with your Creator?",
      applyAction: "Engage in 3 minutes of mindful breathing accompanied by silent tasbih: 'SubhanAllah', 'Alhamdulillah', 'Allahu Akbar', feeling your heart rhythm synchronize with each utterance."
    },
    surroundingVerses: {
          "before": {
                "verseNumber": "27",
                "arabicText": "وَيَقُولُ الَّذِينَ كَفَرُوا لَوْلَا أُنزِلَ عَلَيْهِ آيَةٌ مِّن رَّبِّهِ ۗ قُلْ إِنَّ اللَّهَ يُضِلُّ مَن يَشَاءُ وَيَهْدِي إِلَيْهِ مَنْ أَنَابَ",
                "translations": {
                      "en": "And those who disbelieved say, 'Why has a sign not been sent down to him from his Lord?' Say, 'Indeed, Allah leaves astray whom He wills and guides to Himself whoever turns back [to Him] -'",
                      "sv": "De som förnekar sanningen säger: 'Varför har inget tecken sänts ner till honom från hans Herre?' Säg: 'Gud låter den gå vilse som Han vill, och Han vägleder till Sig den som vänder om i ånger -'",
                      "fr": "Ceux qui ont mécru disent : 'Pourquoi n'a-t-on pas fait descendre sur lui un miracle de son Seigneur ?' Dis : 'En vérité, Allah égare qui Il veut et guide vers Lui celui qui se repent -'"
                }
          },
          "after": {
                "verseNumber": "29",
                "arabicText": "الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ طُوبَىٰ لَهُمْ وَحُسْنُ مَآبٍ",
                "translations": {
                      "en": "Those who have believed and done righteous deeds - a good state is theirs and a good return.",
                      "sv": "De som tror och lever ett rättskaffens liv - dem väntar lycksalighet och en skön återkomst.",
                      "fr": "Ceux qui croient et font de bonnes œuvres, le bonheur est pour eux et un bon lieu de retour."
                }
          }
    }
  },
  {
    id: "93:3-5",
    surahNumber: 93,
    surahNameArabic: "الضحى",
    surahNameTransliterated: "Ad-Duha",
    surahNameMeaning: "The Morning Hours",
    verseNumber: "3-5",
    juz: 30,
    revelationType: "Meccan",
    revelationContext: "Revealed after a period of pause in revelation when detractors mockingly claimed Muhammad ﷺ had been abandoned by his Lord, lifting his sadness with unconditional love.",
    arabicText: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ ۝ وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ ۝ وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
    transliteration: "Maa wadda'aka rabbuka wa maa qalaa. Wa lal-aakhiratu khayrul-laka minal-oolaa. Wa lasawfa yu'teeka rabbuka fatardaa.",
    translations: {
      en: {
        text: "Your Lord has not taken leave of you, [O Muhammad], nor has He detested [you]. And the Hereafter is better for you than the first [life]. And your Lord is going to give you, and you will be satisfied.",
        translator: "Sahih International"
      },
      sv: {
        text: "Din Herre har inte övergett dig och känner ingen motvilja mot dig. Och det kommande livet skall helt visst vara bättre för dig än det första. Och din Herre skall sannerligen skänka dig [av Sina gåvor] så att du blir nöjd.",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Ton Seigneur ne t'a ni abandonné, ni détesté. La vie dernière t'est, certes, meilleure que la vie présente. Ton Seigneur t'accordera certes [Ses dons], et alors tu seras satisfait.",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/093003.mp3",
    category: "moment",
    topics: ["Depression", "Feeling Unloved", "Spiritual Dryness", "Validation", "Hope"],
    emotions: ["Abandoned", "Depressed", "Rejected", "Inadequate", "Lonely"],
    situations: ["Imposter syndrome", "Social isolation", "Spiritual low", "Creative block", "Breakups"],
    whyThisVerse: {
      emotion: "Feeling Abandoned & Unworthy",
      situation: "Feeling like everyone has walked away, or that your prayers go unanswered.",
      coreNeed: "Intimate affirmation that you are seen, held, and unconditionally valued by the Most Merciful.",
      spiritualPrinciple: "A temporary silence from heaven is not abandonment; it is the silent cultivation of a greater gift.",
      mappingExplanation: "The oath by the morning light (Duha) and quiet night (Layl) reminds us that day and night alternate by divine design; the cold darkness of sorrow will unfailingly yield to dawn.",
      topics: ["Divine Affection", "Healing from Rejection", "Patience with Seasons"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "'Your Lord has not forsaken you' means He has not left you alone or stopped caring for you. 'Wa lasawfa yu'teeka rabbuka fatardaa' is an absolute guarantee of boundless generosity until his soul is entirely pleased."
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "This reveals Allah's tender gentleness with His servant in times of sorrow, reminding him of past favors as proof that the future holds heights far surpassing current pains."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "Allah will grant you honor, victory, and spiritual treasures until you are overflowing with contentment."
      }
    ],
    reflectionFramework: {
      understand: "Notice the personal pronoun 'Rabbuka' (Your Sustainer, the One who nurtures you step by step). He did not use an impersonal name; He spoke as the Loving Guardian.",
      reflectPrompt: "When you feel like a failure, whose voice are you listening to? Compare what people say with Allah's promise: 'Your Lord will give you until you are content.'",
      applyAction: "Write down 3 times in your life when you felt completely hopeless, yet doors opened unexpectedly. Say 'Alhamdulillah' for surviving those chapters."
    },
    surroundingVerses: {
          "before": {
                "verseNumber": "2",
                "arabicText": "وَاللَّيْلِ إِذَا سَجَىٰ",
                "translations": {
                      "en": "And [by] the night when it covers with darkness,",
                      "sv": "Och vid natten när den sänker sig,",
                      "fr": "Et par la nuit quand elle couvre tout,"
                }
          },
          "after": {
                "verseNumber": "6",
                "arabicText": "أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ",
                "translations": {
                      "en": "Did He not find you an orphan and give [you] refuge?",
                      "sv": "Fann Han dig inte faderlös och gav dig ett hem?",
                      "fr": "Ne t'a-t-Il pas trouvé orphelin, puis t'a accueilli ?"
                }
          }
    }
  },
  {
    id: "65:2-3",
    surahNumber: 65,
    surahNameArabic: "الطلاق",
    surahNameTransliterated: "At-Talaq",
    surahNameMeaning: "The Divorce",
    verseNumber: "2-3",
    juz: 28,
    revelationType: "Medinan",
    revelationContext: "Revealed within rules of marital dissolution, reminding both spouses undergoing heartbreaking life disruption that God provides exits and sustenance from unseen avenues.",
    arabicText: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَيْءٍ قَدْرًا",
    transliteration: "Wa man yattaqil-laaha yaj'al lahu makhrajaa. Wa yarzuq-hu min haythu laa yahtasib, wa man yatawakkal 'alal-laahi fahuwa hasbuh, innal-laaha baalighu amrih, qad ja'alal-laahu li-kulli shay'in qadraa.",
    translations: {
      en: {
        text: "And whoever fears Allah - He will make for him a way out. And will provide for him from where he does not expect. And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose. Allah has already set for everything a [decreed] extent.",
        translator: "Sahih International"
      },
      sv: {
        text: "Och den som fruktar Gud skall Han visa en väg ut, och Han skall försörja honom på ett sätt som han inte kan förutse. Och den som sätter sin lit till Gud behöver ingen annan hjälp. Gud fullbordar alltid Sina beslut, och Gud har fastställt ett mått för allt.",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Et quiconque craint Allah, Il lui donnera une issue favorable, et lui accordera Ses dons par [des moyens] sur lesquels il ne comptait pas. Et quiconque place sa confiance en Allah, Il lui suffit. Allah atteint ce qu'Il Se propose. Allah a assigné une mesure à chaque chose.",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/065002.mp3",
    category: "moment",
    topics: ["Decisions", "Tawakkul", "Financial Provision", "Career Uncertainty", "Life Transitions"],
    emotions: ["Uncertainty", "Doubt", "Fear of Poverty", "Paralysis", "Hesitation"],
    situations: ["Career pivot", "Quitting a toxic job", "Starting a business", "Divorce / Separation", "Big life crossroad"],
    whyThisVerse: {
      emotion: "Uncertainty & Fear of Ruin",
      situation: "Facing a high-stakes life decision where every logical path seems obstructed or terrifying.",
      coreNeed: "Courage to prioritize moral integrity and trust that God's provision exceeds human spreadsheet calculations.",
      spiritualPrinciple: "Tawakkul is taking lawful action while delegating heart-level outcome control solely to Allah.",
      mappingExplanation: "The promise of 'Makhraj' (a clear emergency exit) applies when walls close in. God promises provision 'min haythu la yahtasib'—from coordinates beyond human imagination.",
      topics: ["Faith-driven Decisions", "Tawakkul in Action", "Divine Sufficiency"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "'He will make for him a way out' from every worldly distress and spiritual doubt, providing sustenance from paths he never anticipated."
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "Whoever places their reliance on Allah alone, Allah is sufficient for all their religious and worldly needs. 'Hasbuh' means your sufficiency—you need no other ultimate sponsor."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "Allah will accomplish His decree in your life without fail, according to the precise measure and timing He has ordained."
      }
    ],
    reflectionFramework: {
      understand: "The word 'Qadra' indicates that your trial has a designated expiration date and weight. It will not last one second longer than decreed by Divine Wisdom.",
      reflectPrompt: "What compromise or dishonest shortcut are you tempted to make right now because you fear missing out on income, career advancement, or social status?",
      applyAction: "Perform Salat al-Istikhara regarding your pending decision, commit to the path of highest ethical integrity, and let go of obsessive outcome checking."
    },
    surroundingVerses: {
          "before": {
                "verseNumber": "1",
                "arabicText": "يَا أَيُّهَا النَّبِيُّ إِذَا طَلَّقْتُمُ النِّسَاءَ فَطَلِّقُوهُنَّ لِعِدَّتِهِنَّ وَأَحْصُوا الْعِدَّةَ ۖ وَاتَّقُوا اللَّهَ رَبَّكُمْ",
                "translations": {
                      "en": "O Prophet, when you [Muslims] divorce women, divorce them for [the commencement of] their waiting period and keep count of the waiting period, and fear Allah, your Lord.",
                      "sv": "O Profet! När ni skiljer er från kvinnor, skilj er då från dem vid början av deras väntetid och räkna väntetiden noga, och frukta Gud, er Herre.",
                      "fr": "Ô Prophète ! Quand vous répudiez les femmes, répudiez-les conformément à leur période d'attente prescrite et comptez-la avec soin, et craignez Allah votre Seigneur."
                }
          },
          "after": {
                "verseNumber": "4",
                "arabicText": "وَاللَّائِي يَئِسْنَ مِنَ الْمَحِيضِ مِن نِّسَائِكُمْ إِنِ ارْتَبْتُمْ فَعِدَّتُهُنَّ ثَلَاثَةُ أَشْهُرٍ وَاللَّائِي لَمْ يَحِضْنَ ۚ وَأُولَاتُ الْأَحْمَالِ أَجَلُهُنَّ أَن يَضَعْنَ حَمْلَهُنَّ ۚ وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مِنْ أَمْرِهِ يُسْرًا",
                "translations": {
                      "en": "And those who no longer expect menstruation among your women - if you doubt, then their period is three months, and [also for] those who have not menstruated. And for those who are pregnant, their term is until they give birth. And whoever fears Allah - He will make for him of his matter ease.",
                      "sv": "Och för de av era kvinnor som inte längre väntar menstruation, om ni är osäkra, är väntetiden tre månader, liksom för dem som ännu inte har haft menstruation. Och för de havande kvinnorna är fristen tills de har fött sitt barn. Och den som fruktar Gud ska Han göra det lätt för.",
                      "fr": "Et pour celles de vos femmes qui n'espèrent plus avoir de règles, leur délai de viduité est de trois mois, de même pour celles qui n'ont pas encore de règles. Et quant à celles qui sont enceintes, leur période s'achèvera par leur accouchement. Quiconque craint Allah, Il lui facilite les choses."
                }
          }
    }
  },
  {
    id: "21:87-88",
    surahNumber: 21,
    surahNameArabic: "الأنبياء",
    surahNameTransliterated: "Al-Anbiya",
    surahNameMeaning: "The Prophets",
    verseNumber: "87-88",
    juz: 17,
    revelationType: "Meccan",
    revelationContext: "Recounting Prophet Yunus (Jonah) ﷺ in the belly of the whale under triple layers of darkness (the deep ocean, the belly of the whale, and the night), calling out in sincere repentance.",
    arabicText: "وَذَا النُّونِ إِذ ذَّهَبَ مُغَاضِبًا فَظَنَّ أَن لَّن نَّقْدِرَ عَلَيْهِ فَنَادَىٰ فِي الظُّلُمَاتِ أَن لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ ۝ فَاسْتَجَبْنَا لَهُ وَنَجَّيْنَاهُ مِنَ الْغَمِّ ۚ وَكَذَٰلِكَ نُنجِي الْمُؤْمِنِينَ",
    transliteration: "Wa dhan-Nooni idh dhahaba mughaadiban fadkanna an lan naqdira 'alayhi fanaadaa fiz-dhulumaati an laa ilaaha illaa anta subhaanaka innee kuntu minadh-dhaalimeen. Fastajabnaa lahu wa najjaynaahu minal-ghamm, wa kadhaalika nunjil-mu'mineen.",
    translations: {
      en: {
        text: "And [mention] the man of the fish, when he went off in anger and thought that We would not decree [anything] upon him. And he called out within the darknesses, 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.' So We responded to him and saved him from the distress. And thus do We save the believers.",
        translator: "Sahih International"
      },
      sv: {
        text: "Och minns honom [som slukades av] den stora fisken när han gick sin väg i vrede och trodde att Vi inte skulle ställa honom till svars. Men i djupens mörker ropade han: 'Det finns ingen gud utom Du! Stor är Du i Din härlighet! Jag har sannerligen handlat orätt!' Och Vi bönhörde honom och räddade honom ur hans förtvivlan. Så räddar Vi de troende.",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Et l'homme au poisson (Jonas) quand il partit, irrité. Il pensa que Nous N'allions rien pouvoir contre lui. Puis il cria dans les ténèbres: 'Pas de divinité à part Toi! Pureté à Toi! J'ai été vraiment du nombre des injustes.' Nous l'exauçâmes et le sauvâmes de son angoisse. Et c'est ainsi que Nous sauvons les croyants.",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/021087.mp3",
    category: "moment",
    topics: ["Guilt", "Repentance (Tawbah)", "Depths of Despair", "Dua of Yunus", "Hope for Sinners"],
    emotions: ["Guilt", "Shame", "Regret", "Suffocation", "Self-blame"],
    situations: ["Relapse into bad habits", "Severe mistake made", "Feeling unforgivable", "Crushing moral failure"],
    whyThisVerse: {
      emotion: "Crushing Guilt & Moral Regret",
      situation: "When you made a colossal error, let others down, and feel trapped in self-inflicted misery.",
      coreNeed: "A formula for total redemption that begins with owning one's flaw without self-justification.",
      spiritualPrinciple: "Acknowledgment of divine perfection paired with radical honesty about one's wrongdoing unlocks instant rescue.",
      mappingExplanation: "Notice the universal promise concluding verse 88: 'And thus do We save the believers'—this prayer was not exclusive to Yunus; it is a permanent lifeline for every believer in distress.",
      topics: ["The Sovereign Du'a", "Overcoming Shame", "Mercy Over Judgment"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "The Prophet ﷺ taught: 'No Muslim supplicates with the words of Dhun-Nun for any matter except that Allah answers him.' It gathers pure Tawhid, purification of Allah from all imperfection, and direct confession of sin."
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "True tawbah requires shedding pride. When Yunus turned to Allah in the depths of the ocean, the angels heard his voice. Allah turned his suffocation into salvation."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "We answered his plea and delivered him from constriction and sorrow, and likewise We rescue the faithful who call upon Us."
      }
    ],
    reflectionFramework: {
      understand: "The 'dhulumaat' (plural darknesses) symbolize whatever layers of isolation surround you: shame, secrecy, fear of consequences, and isolation.",
      reflectPrompt: "What error are you defensively justifying to yourself or others? What peace might come if you simply told God: 'Subhanaka inni kuntu min adh-dhalimeen'?",
      applyAction: "Make this du'a with your forehead on the ground in sujood, naming your exact mistake before Allah, and ask for His loving pardon."
    },
    surroundingVerses: {
          "before": {
                "verseNumber": "86",
                "arabicText": "وَأَدْخَلْنَاهُمْ فِي رَحْمَتِنَا ۖ إِنَّهُم مِّنَ الصَّالِحِينَ",
                "translations": {
                      "en": "And We admitted them into Our mercy. Indeed, they were of the righteous.",
                      "sv": "Och Vi omslöt dem med Vår barmhärtighet; de hörde sannerligen till de rättfärdiga.",
                      "fr": "Et Nous les fîmes entrer en Notre miséricorde, car ils étaient vraiment du nombre des gens de bien."
                }
          },
          "after": {
                "verseNumber": "89",
                "arabicText": "وَزَكَرِيَّا إِذْ نَادَىٰ رَبَّهُ رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ",
                "translations": {
                      "en": "And [mention] Zechariah, when he called to his Lord, 'My Lord, do not leave me alone [with no heir], while You are the best of inheritors.'",
                      "sv": "Och Zakarias, då han ropade till sin Herre: 'Herre! Lämna mig inte barnlös, Du som är den bäste arvtagaren!'",
                      "fr": "Et Zacharie, quand il implora son Seigneur : 'Seigneur, ne me laisse pas seul, bien que Tu sois le meilleur des héritiers !'"
                }
          }
    }
  },
  {
    id: "67:2",
    surahNumber: 67,
    surahNameArabic: "الملك",
    surahNameTransliterated: "Al-Mulk",
    surahNameMeaning: "The Sovereignty",
    verseNumber: "2",
    juz: 29,
    revelationType: "Meccan",
    revelationContext: "Revealed in Makkah to reshape human worldview regarding life, mortality, and the purpose of the cosmos.",
    arabicText: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ",
    transliteration: "Alladhee khalaqal-mawta wal-hayaata liyabluwakum ayyukum ahsanu 'amalaa, wa huwal-'Azeezul-Ghafoor.",
    translations: {
      en: {
        text: "[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving.",
        translator: "Sahih International"
      },
      sv: {
        text: "Han som har skapat döden och livet för att sätta er på prov och [se] vem av er som i handling visar sig vara bäst. Han är den Allsmäktige, den Ständige Förlåtaren.",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Celui qui a créé la mort et la vie afin de vous éprouver [et de savoir] qui de vous est le meilleur en œuvre, et c'est Lui le Puissant, le Pardonneur.",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/067002.mp3",
    category: "questions",
    topics: ["Purpose of Life", "Meaning of Mortality", "Existential Questions", "Quality over Quantity", "Divine Justice"],
    emotions: ["Existential Dread", "Apathy", "Confusion", "Nihilism", "Curiosity"],
    situations: ["Midlife reflection", "Questioning existence", "Grappling with mortality", "Seeking purpose", "Career existential crisis"],
    whyThisVerse: {
      emotion: "Existential Aimlessness & Dread",
      situation: "Pondering: 'Why am I here? What is the point of working, suffering, and dying?'",
      coreNeed: "A grand cosmic narrative that dignifies life and frames mortality as a meaningful test of moral excellence.",
      spiritualPrinciple: "Life is not an arbitrary accident; it is an arena calibrated for developing 'Ahsan 'Amala' (highest quality character and sincerity).",
      mappingExplanation: "Notice that death is mentioned before life: human existence begins from non-being, passes through transient vitality, and matures into eternal accountability.",
      topics: ["Cosmic Purpose", "The Test of Excellence", "Redefining Success"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "Al-Fudayl ibn 'Iyad said regarding 'ahsanu 'amala': It means the most sincere (ikhlas) and the most correct according to the Sunnah. If an action is sincere but incorrect, it is not accepted; if it is correct but not sincere, it is not accepted."
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "Allah did not say 'most in deeds' (aktharu 'amala), but 'best in deeds' (ahsanu 'amala). What matters to the Divine is the purity of the heart, the humility, and the moral beauty behind the act."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "He brought forth existence to examine who among you carries out their responsibilities with sincere fidelity and righteous conduct."
      }
    ],
    reflectionFramework: {
      understand: "The verse concludes by pairing 'Al-'Aziz' (The Almighty, whose law governs the cosmos) with 'Al-Ghafoor' (The All-Forgiving, who overlooks your human shortcomings when you stumble during the test).",
      reflectPrompt: "If your life purpose is not to amass the most wealth or followers, but to perform the purest, most honorable deeds, how does that simplify your choices today?",
      applyAction: "Choose one ordinary act today (washing dishes, writing an email, greeting a neighbor) and perform it with 100% excellence and total devotion to God."
    },
    surroundingVerses: {
          "before": {
                "verseNumber": "1",
                "arabicText": "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
                "translations": {
                      "en": "Blessed is He in whose hand is dominion, and He is over all things competent -",
                      "sv": "Välsignad är Han som har herraväldet i Sin hand och som har makt över allt -",
                      "fr": "Béni soit celui dans la main de qui est la royauté, et Il est Omnipotent -"
                }
          },
          "after": {
                "verseNumber": "3",
                "arabicText": "الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ",
                "translations": {
                      "en": "[He] who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency. So return [your] vision [to the sky]; do you see any breaks?",
                      "sv": "Han som har skapat sju himlar, den ena över den andra. Du ser ingen brist i den Nåderikes skapelse. Vänd blicken åter mot skyn: ser du någon spricka?",
                      "fr": "Celui qui a créé sept cieux superposés sans que tu voies de disproportion dans la création du Tout Miséricordieux. Regarde donc de nouveau : y vois-tu une faille ?"
                }
          }
    }
  },
  {
    id: "57:22-23",
    surahNumber: 57,
    surahNameArabic: "الحديد",
    surahNameTransliterated: "Al-Hadid",
    surahNameMeaning: "The Iron",
    verseNumber: "22-23",
    juz: 27,
    revelationType: "Medinan",
    revelationContext: "Revealed to orient the believers' psychology toward destiny (Qadr), eradicating paralyzing regret over missed chances and toxic arrogance over triumphs.",
    arabicText: "مَا أَصَابَ مِن مُّصِيبَةٍ فِي الْأَرْضِ وَلَا فِي أَنفُسِكُمْ إِلَّا فِي كِتَابٍ مِّن قَبْلِ أَن نَّبْرَأَهَا ۚ إِنَّ ذَٰلِكَ عَلَى اللَّهِ يَسِيرٌ ۝ لِّكَيْلَا تَأْسَوْا عَلَىٰ مَا فَاتَكُمْ وَلَا تَفْرَحُوا بِمَا آتَاكُمْ ۗ وَاللَّهُ لَا يُحِبُّ كُلَّ مُخْتَالٍ فَخُورٍ",
    transliteration: "Maa asaaba mim-museebatin fil-ardi wa laa fee anfusikum illaa fee kitaabim-min qabli an nabra'ahaa, inna dhaalika 'alal-laahi yaseer. Likaylaa ta'saw 'alaa maa faatakum wa laa tafrahoo bimaa aataakum, wallaahu laa yuhibbu kulla mukhtaalin fakhoor.",
    translations: {
      en: {
        text: "No disaster strikes upon the earth or among yourselves except that it is in a register before We bring it into being - indeed that, for Allah, is easy - In order that you not despair over what has eluded you and not exult [in pride] over what He has given you. And Allah does not like everyone self-deluded and boastful.",
        translator: "Sahih International"
      },
      sv: {
        text: "Ingen olycka drabbar jorden eller er själva som inte [redan] är upptecknad i en Skrift innan Vi ger den verklighet - detta är lätt för Gud. [Lär er detta] för att ni inte skall sörja över det som gått förlorat för er och inte förhäva er över det som Han har skänkt er. Gud älskar inte den som är full av högmod och skryt.",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Nul malheur n'atteint la terre ni vos personnes, qui ne soit enregistré dans un Livre avant que Nous ne l'ayons créé; et cela est certes facile à Allah, afin que vous ne vous tourmentiez pas au sujet de ce qui vous a échappé, ni n'exultiez pour ce qu'Il vous a donné. Et Allah n'aime point tout présomptueux plein de gloriole.",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/057022.mp3",
    category: "questions",
    topics: ["Suffering & Tragedy", "Divine Decree (Qadr)", "Regret & Envy", "Emotional Balance", "Destiny"],
    emotions: ["Bitter Regret", "Envy", "Jealousy", "Why Me?", "Anguish"],
    situations: ["Missed dream opportunity", "Loss of an investment", "Unplanned hardship", "Comparing oneself to others on social media"],
    whyThisVerse: {
      emotion: "Why Me? / Bitter Regret",
      situation: "Haunted by 'if only I had chosen differently' or grappling with catastrophic misfortune.",
      coreNeed: "Spiritual equanimity: liberation from toxic regret over the past and toxic boastfulness over success.",
      spiritualPrinciple: "Everything was registered in the Divine Book (Al-Lawh Al-Mahfudh); what missed you could never have hit you, and what hit you could never have missed you.",
      mappingExplanation: "The verse teaches psychological balance: neither disintegrate in despair when things fail ('likayla ta'saw'), nor puff up in self-congratulation when you succeed.",
      topics: ["Liberation through Qadr", "Coping with the Uncontrollable", "Overcoming Comparison"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "'Likayla ta'saw': Allah informs us of His prior knowledge so that when we miss an opportunity, we know it was preordained by divine wisdom, softening our grief and eliminating despair."
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "This belief cures the sickness of extreme emotional volatility. When calamity strikes, you see the pen that wrote it; when a gift arrives, you see the Giver rather than praising your own cleverness."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "Know that all circumstances were decreed before creation, so do not consume your soul with remorse for missed worldly gains."
      }
    ],
    reflectionFramework: {
      understand: "The word 'Asa' means overwhelming sorrow that paralyzes action. God reveals destiny specifically to liberate you from the endless loops of 'if only' (law).",
      reflectPrompt: "What past door closed that you are still mourning or resenting? How does knowing that God closed it for a wiser destiny release you from that grief?",
      applyAction: "Speak the prophetic reminder: 'QaddarAllahu wa ma sha'a fa'al' (Allah has decreed and whatever He wills, He does), and intentionally close the chapter on that regret."
    },
    surroundingVerses: {
          "before": {
                "verseNumber": "21",
                "arabicText": "سَابِقُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا كَعَرْضِ السَّمَاءِ وَالْأَرْضِ أُعِدَّتْ لِلَّذِينَ آمَنُوا بِاللَّهِ وَرُسُلِهِ ۚ ذَٰلِكَ فَضْلُ اللَّهِ يُؤْتِيهِ مَن يَشَاءُ ۚ وَاللَّهُ ذُو الْفَضْلِ الْعَظِيمِ",
                "translations": {
                      "en": "Race toward forgiveness from your Lord and a Garden whose width is like the width of the heaven and earth, prepared for those who believed in Allah and His messengers.",
                      "sv": "Tävla om er Herres förlåtelse och ett paradis vars vidd är som himlens och jordens vidd, berett för dem som tror på Gud och Hans sändebud.",
                      "fr": "Hâtez-vous vers un pardon de votre Seigneur ainsi qu'un Paradis aussi large que le ciel et la terre, préparé pour ceux qui ont cru en Allah et en Ses messagers."
                }
          },
          "after": {
                "verseNumber": "24",
                "arabicText": "الَّذِينَ يَبْخَلُونَ وَيَأْمُرُونَ النَّاسَ بِالْبُخْلِ ۗ وَمَن يَتَوَلَّ فَإِنَّ اللَّهَ هُوَ الْغَنِيُّ الْحَمِيدُ",
                "translations": {
                      "en": "[Those] who are stingy and enjoin upon people stinginess. And whoever turns away - then indeed, Allah is the Free of need, the Praiseworthy.",
                      "sv": "De som är snåla och förmår andra att vara snåla. Och den som vänder sig bort - sannerligen är Gud den Självtillräcklige, den Prisvärde.",
                      "fr": "Ceux qui sont avares et ordonnent aux gens l'avarice. Et quiconque se détourne... Allah est vraiment le Riche, le Digne de louange."
                }
          }
    }
  },
  {
    id: "45:22",
    surahNumber: 45,
    surahNameArabic: "الجاثية",
    surahNameTransliterated: "Al-Jathiyah",
    surahNameMeaning: "The Crouching",
    verseNumber: "22",
    juz: 25,
    revelationType: "Meccan",
    revelationContext: "Revealed addressing those who believe life is merely random material biology without ultimate justice or moral consequence.",
    arabicText: "وَخَلَقَ اللَّهُ السَّمَاوَاتِ وَالْأَرْضَ بِالْحَقِّ وَلِتُجْزَىٰ كُلُّ نَفْسٍ بِمَا كَسَبَتْ وَهُمْ لَا يُظْلَمُونَ",
    transliteration: "Wa khalaqal-laahus-samaawaati wal-arda bil-haqqi wa litujzaa kullu nafsim-bimaa kasabat wa hum laa yudhlamoon.",
    translations: {
      en: {
        text: "And Allah created the heavens and earth in truth and so that every soul may be recompensed for what it has earned, and they will not be wronged.",
        translator: "Sahih International"
      },
      sv: {
        text: "Gud har skapat himlarna och jorden med sanning och för att var och en skall belönas för vad han har förtjänat, och ingen skall lida orätt.",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Et Allah a créé les cieux et la terre en toute vérité et afin que chaque âme soit rétribuée selon ce qu'elle a acquis. Et ils ne seront point lésés.",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/045022.mp3",
    category: "questions",
    topics: ["Cosmic Justice", "Oppression & Karma", "The Problem of Evil", "Accountability", "Divine Order"],
    emotions: ["Indignation", "Moral Outrage", "Despair over Injustice", "Helplessness"],
    situations: ["Witnessing global oppression", "Cheated by a corrupt boss", "Unpunished wickedness", "Facing tyranny"],
    whyThisVerse: {
      emotion: "Moral Outrage at Injustice",
      situation: "Seeing ruthless oppressors prosper while innocent victims suffer without worldly restitution.",
      coreNeed: "Conviction that no act goes unrecorded, no tear is ignored, and justice is woven into the very fabric of reality.",
      spiritualPrinciple: "Creation is founded 'Bil-Haqq' (with purposeful truth); moral accountability is as inexorable as the physical laws of gravity.",
      mappingExplanation: "The guarantee 'wa hum la yudhlamoon' (and they will not be wronged by even a grain of dust) promises absolute cosmic balance.",
      topics: ["The Reality of Ultimate Justice", "Truth over Tyranny", "Consolation for the Oppressed"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "Allah created the universe with justice and truth, not in jest or vain amusement, so that the righteous are rewarded and the tyrant is held to account."
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "It is unthinkable to divine wisdom that the corrupt and the pious be treated identically. Every soul will receive the exact harvest of its deeds, pure and uncorrupted by any bias."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "The heavens and the earth stand upon justice, ensuring every human being meets their exact compensation without diminution or injustice."
      }
    ],
    reflectionFramework: {
      understand: "The phrase 'Bil-Haqq' means truth is the foundation of the cosmos. Tyranny and lies are unnatural aberrations that will inevitably collapse under the weight of divine truth.",
      reflectPrompt: "When you feel disheartened by global injustices or personal slights, do you remember that this worldly life is only Chapter One of the story?",
      applyAction: "Support a victim of injustice or donate toward relief for oppressed communities, standing as an agent of 'Haqq' in your own sphere."
    },
    surroundingVerses: {
          "before": {
                "verseNumber": "21",
                "arabicText": "أَمْ حَسِبَ الَّذِينَ اجْتَرَحُوا السَّيِّئَاتِ أَن نَّجْعَلَهُمْ كَالَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ سَوَاءً مَّحْيَاهُمْ وَمَمَاتُهُمْ ۚ سَاءَ مَا يَحْكُمُونَ",
                "translations": {
                      "en": "Or do those who commit evils think We will make them like those who have believed and done righteous deeds - [make them] equal in their life and their death? Evil is that which they judge.",
                      "sv": "Eller tror de som begår onda gärningar att Vi ska behandla dem på samma sätt som dem som tror och gör goda gärningar, lika i liv och död? Hur illa dömer de inte!",
                      "fr": "Ceux qui commettent des mauvaises actions comptent-ils que Nous allons les traiter comme ceux qui croient et accomplissent les bonnes œuvres, dans leur vie et dans leur mort ? Comme ils jugent mal !"
                }
          },
          "after": {
                "verseNumber": "23",
                "arabicText": "أَفَرَأَيْتَ مَنِ اتَّخَذَ إِلَٰهَهُ هَوَاهُ وَأَضَلَّهُ اللَّهُ عَلَىٰ عِلْمٍ وَخَتَمَ عَلَىٰ سَمْعِهِ وَقَلْبِهِ وَجَعَلَ عَلَىٰ بَصَرِهِ غِشَاوَةً فَمَن يَهْدِيهِ مِن بَعْدِ اللَّهِ ۚ أَفَلَا تَذَكَّرُونَ",
                "translations": {
                      "en": "Have you seen he who has taken as his god his [own] desire, and Allah has sent him astray due to knowledge and has set a seal upon his hearing and his heart and put over his vision a veil? So who will guide him after Allah? Then will you not be reminded?",
                      "sv": "Har du sett den som gör sina egna begär till sin gud? Gud har låtit honom gå vilse trots hans vetskap och förseglat hans hörsel och hans hjärta och lagt ett flor över hans ögon. Vem kan vägleda honom efter Gud? Vill ni inte tänka efter?",
                      "fr": "Vois-tu celui qui prend sa passion pour sa propre divinité ? Allah l'égare sciemment et scelle son ouïe et son cœur et étend un voile sur sa vue. Qui donc peut le guider après Allah ? Ne vous rappelez-vous donc pas ?"
                }
          }
    }
  },
  {
    id: "41:34",
    surahNumber: 41,
    surahNameArabic: "فصلت",
    surahNameTransliterated: "Fussilat",
    surahNameMeaning: "Explained in Detail",
    verseNumber: "34",
    juz: 24,
    revelationType: "Meccan",
    revelationContext: "Revealed during relentless verbal abuse and slander directed at the early believers in Makkah, instructing them on the revolutionary art of disarming hostility with unexpected gentleness.",
    arabicText: "وَلَا تَسْتَوِي الْحَسَنَةُ وَلَا السَّيِّئَةُ ۚ ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ فَإِذَا الَّذِي بَيْنَكَ وَبَيْنَهُ عَدَاوَةٌ كَأَنَّهُ وَلِيٌّ حَمِيمٌ",
    transliteration: "Wa laa tastawil-hasanatu wa las-sayyi'ah, idfa' billatee hiya ahsanu fa-idhal-ladhee baynaka wa baynahu 'adaawatun ka-annahu waliyyun hameem.",
    translations: {
      en: {
        text: "And not equal are the good deed and the bad. Repel [evil] by that [deed] which is better; and thereupon, the one with whom you had enmity [will become] as though he were a devoted friend.",
        translator: "Sahih International"
      },
      sv: {
        text: "En god handling och en ond handling kan inte jämställas. Bemöt det onda med det goda - och se, den som var din fiende blir som en varm och hängiven vän!",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "La bonne action et la mauvaise ne sont pas pareilles. Repousse (le mal) par ce qui est meilleur; et voilà que celui avec qui tu avais une animosité devient tel un ami chaleureux.",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/041034.mp3",
    category: "growth",
    topics: ["Conflict Resolution", "Forgiveness", "Interpersonal Grace", "Emotional Mastery", "Patience"],
    emotions: ["Vindictiveness", "Offense", "Bitterness", "Spite", "Desire for Revenge"],
    situations: ["Hostile coworker", "Difficult in-law", "Neighborhood dispute", "Online trolling", "Toxic communication"],
    whyThisVerse: {
      emotion: "Vindictiveness & Bitter Grudges",
      situation: "When someone has spoken harshly, insulted your dignity, and your instinct is to strike back with equal venom.",
      coreNeed: "A higher tactical and spiritual approach that breaks the cycle of mutual destruction.",
      spiritualPrinciple: "An eye for an eye leaves the world blind; repelling hostility with sublime graciousness transforms enemies into allies.",
      mappingExplanation: "The verb 'Idfa'' implies actively pushing back or shielding. The best shield against an arrow of venom is not another arrow, but a soft armor of dignified beneficence.",
      topics: ["Transforming Conflict", "The Power of Gentleness", "Moral Superiority"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "Ibn 'Abbas explained: Allah commands believers to have patience when angry, forbearance when treated ignorantly, and forgiveness when wronged. If they do so, Allah protects them and humbles their adversaries before them."
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "When someone cuts you off, connect with them; when someone wrongs you, forgive them; when someone insults you, respond with gentle speech. This melts the icy heart of enmity into the warmth of close companionship ('waliyyun hameem')."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "Repel the insult of the wrongdoer with kindness and courtesy, and watch hostility soften into loyal affection."
      }
    ],
    reflectionFramework: {
      understand: "The phrase 'Waliyyun Hameem' means an intimate protector—someone who would stand by you through fire. Gentleness holds greater persuasive power than confrontation.",
      reflectPrompt: "Who is currently your antagonist? What would happen if you shocked them tomorrow not with cold retaliation, but with an unexpected gesture of kindness or compliment?",
      applyAction: "Send a polite, respectful greeting or pray secretly for the guidance and well-being of the person who provoked you."
    },
    surroundingVerses: {
          "before": {
                "verseNumber": "33",
                "arabicText": "وَمَنْ أَحْسَنُ قَوْلًا مِّمَّن دَعَا إِلَى اللَّهِ وَعَمِلَ صَالِحًا وَقَالَ إِنَّنِي مِنَ الْمُسْلِمِينَ",
                "translations": {
                      "en": "And who is better in speech than one who invites to Allah and does righteousness and says, 'Indeed, I am of the Muslims'?",
                      "sv": "Och vem talar ett bättre ord än den som kallar människorna till Gud och gör det goda och rätta och säger: 'Jag hör sannerligen till dem som underkastar sig Hans vilja'?",
                      "fr": "Et qui profère plus belles paroles que celui qui appelle à Allah, fait bonne œuvre et dit : 'Je suis du nombre des musulmans' ?"
                }
          },
          "after": {
                "verseNumber": "35",
                "arabicText": "وَمَا يُلَقَّاهَا إِلَّا الَّذِينَ صَبَرُوا وَمَا يُلَقَّاهَا إِلَّا ذُو حَظٍّ عَظِيمٍ",
                "translations": {
                      "en": "And none will be granted it except those who are patient, and none will be granted it except one having a great portion [of good].",
                      "sv": "Men ingen förmår detta utom den som har tålamod, och ingen förmår detta utom den som har fått en stor del av det goda.",
                      "fr": "Mais cette règle n'est donnée qu'à ceux qui endurent, et elle n'est donnée qu'au possesseur d'une grâce infinie."
                }
          }
    }
  },
  {
    id: "25:63",
    surahNumber: 25,
    surahNameArabic: "الفرقان",
    surahNameTransliterated: "Al-Furqan",
    surahNameMeaning: "The Criterion",
    verseNumber: "63",
    juz: 19,
    revelationType: "Meccan",
    revelationContext: "Revealed defining the distinctive behavioral markers of the servants of the Most Merciful ('Ibad al-Rahman') in everyday public life.",
    arabicText: "وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا وَإِذَا خَاطَبَهُمُ الْجَاهِلُونَ قَالُوا سَلَامًا",
    transliteration: "Wa 'ibaadur-Rahmaanil-ladheena yamshoona 'alal-ardi hawnan wa idhaa khaatabahumul-jaahiloona qaaloo salaamaa.",
    translations: {
      en: {
        text: "And the servants of the Most Merciful are those who walk upon the earth easily, and when the ignorant address them [harshly], they say [words of] peace.",
        translator: "Sahih International"
      },
      sv: {
        text: "Den Nåderikes sanna tjänare är de som går på jorden med ödmjukhet, och som när de okunniga tilltalar dem, svarar med ord om fred och frid.",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Les serviteurs du Tout Miséricordieux sont ceux qui marchent humblement sur terre, et qui, lorsque les ignorants s'adressent à eux, disent: 'Paix'.",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/025063.mp3",
    category: "growth",
    topics: ["Humility", "Dignity", "Handling Toxicity", "Daily Conduct", "Emotional Maturity"],
    emotions: ["Arrogance", "Defensiveness", "Provocation", "Pride", "Ego"],
    situations: ["Social media arguments", "Rude strangers in public", "Commute road rage", "Petty office gossip"],
    whyThisVerse: {
      emotion: "Ego Provocation & Defensiveness",
      situation: "Entangled in silly debates, online hostility, or rude interactions in public spaces.",
      coreNeed: "Preserving your energy, dignity, and spiritual equilibrium rather than rolling in the mud.",
      spiritualPrinciple: "True dignity lies in walking gently ('hawnan') and bidding peace ('salama') to ignorance rather than proving a petty point.",
      mappingExplanation: "The word 'Hawna' does not mean walking with false slouching; it means effortless serenity, dignified modesty, and inner calm free from vanity.",
      topics: ["Spiritual Poise", "Disarming Ignorance", "Servants of the Merciful"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "They walk with tranquility, gravity, and dignity, neither insolent nor haughty. When confronted by foolish or insolent speech, they do not answer back with like abuse, but respond with speech free of defect."
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "Their mannerisms reflect humility toward the Creator and kindness toward creation. When ignorant people attempt to drag them into trivial squabbles, they answer with words of safety and composure."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "They tread gently upon the earth, and whenever foolish people address them with vulgarity, they reply with graceful words that protect them from sin."
      }
    ],
    reflectionFramework: {
      understand: "The word 'Salama' here does not necessarily mean the formal greeting; it means speaking words that ensure safety from sins, arguments, and toxic entanglement.",
      reflectPrompt: "What trivial argument on WhatsApp, Twitter/X, or around the dinner table are you burning emotional bandwidth on right now that produces no good fruit?",
      applyAction: "Adopt the 'Salama' response: gracefully exit one useless online or verbal debate today with courteous silence."
    },
    surroundingVerses: {
          "before": {
                "verseNumber": "62",
                "arabicText": "وَهُوَ الَّذِي جَعَلَ اللَّيْلَ وَالنَّهَارَ خِلْفَةً لِّمَنْ أَرَادَ أَن يَذَّكَّرَ أَوْ أَرَادَ شُكُورًا",
                "translations": {
                      "en": "And it is He who has made the night and the day in succession for whoever desires to remember or desires to be grateful.",
                      "sv": "Och Han är den som har låtit natt och dag följa på varandra till nytta för den som vill tänka efter eller visa tacksamhet.",
                      "fr": "Et c'est Lui qui a assigné une alternance à la nuit et au jour pour quiconque veut y réfléchir ou être reconnaissant."
                }
          },
          "after": {
                "verseNumber": "64",
                "arabicText": "وَالَّذِينَ يَبِيتُونَ لِرَبِّهِمْ سُجَّدًا وَقِيَامًا",
                "translations": {
                      "en": "And those who spend [part of] the night to their Lord prostrating and standing [in prayer].",
                      "sv": "Och de som tillbringar natten i bön inför sin Herre, fallande ned på sina ansikten och stående.",
                      "fr": "Et ceux qui passent les nuits prosternés et debout devant leur Seigneur."
                }
          }
    }
  },
  {
    id: "49:12",
    surahNumber: 49,
    surahNameArabic: "الحجرات",
    surahNameTransliterated: "Al-Hujurat",
    surahNameMeaning: "The Rooms",
    verseNumber: "12",
    juz: 26,
    revelationType: "Medinan",
    revelationContext: "Revealed establishing community ethics, sanctifying human reputation, and forbidding suspicion, spying, and backbiting among colleagues and brethren.",
    arabicText: "يَا أَيُّهَا الَّذِينَ آمَنُوا اجْتَنِبُوا كَثِيرًا مِّنَ الظَّنِّ إِنَّ بَعْضَ الظَّنِّ إِثْمٌ ۖ وَلَا تَجَسَّسُوا وَلَا يَغْتَب بَّعْضُكُم بَعْضًا ۚ أَيُحِبُّ أَحَدُكُمْ أَن يَأْكُلَ لَحْمَ أَخِيهِ مَيْتًا فَكَرِهْتُمُوهُ ۚ وَاتَّقُوا اللَّهَ ۚ إِنَّ اللَّهَ تَوَّابٌ رَّحِيمٌ",
    transliteration: "Yaa ayyuhal-ladheena aamanuj-taniboo katheeram-minadh-dhanni inna ba'dhadh-dhanni ithm, wa laa tajassasoo wa laa yaghtab ba'dhukum ba'dhaa. A-yuhibbu ahadukum an ya'kula lahma akheehi maytan fakarihtumooh, wat-taqul-laah, innal-laaha tawwaabur-raheem.",
    translations: {
      en: {
        text: "O you who have believed, avoid much [negative] assumption. Indeed, some assumption is sin. And do not spy or backbite each other. Would one of you like to eat the flesh of his brother when dead? You would detest it. And fear Allah; indeed, Allah is Accepting of repentance and Merciful.",
        translator: "Sahih International"
      },
      sv: {
        text: "Troende! Undvik i möjligaste mån att göra [ogrundade] antaganden [om varandra]; det finns antaganden som är synd. Och spionera inte på varandra och förtala inte varandra. Skulle någon av er vilja äta sin döde broders kött? Nej, den tanken väcker er avsky! Och frukta Gud! Gud är Den som tar emot ånger, Den Barmhärtige.",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Ô vous qui avez cru! Évitez de trop conjecturer [sur autrui] car une partie des conjectures est péché. Et n'espionnez pas; et ne médisez pas les uns des autres. L'un de vous aimerait-il manger la chair de son frère mort? Vous en auriez horreur. Et craignez Allah. Certes Allah est Grand Accueillant au repentir et Très Miséricordieux.",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/049012.mp3",
    category: "growth",
    topics: ["Tongue Control", "Gossip & Backbiting", "Suspicion", "Workplace Ethics", "Integrity"],
    emotions: ["Cynicism", "Suspicion", "Jealousy", "Schadenfreude", "Paranoia"],
    situations: ["Watercooler gossip", "Family drama group chats", "Judging others' motives", "Digging into private lives"],
    whyThisVerse: {
      emotion: "Cynical Suspicion & Gossip",
      situation: "Tempted to speculate maliciously about someone's motives or participate in tearing down a colleague behind their back.",
      coreNeed: "Purifying your tongue and mind, building the moral courage to defend absent people.",
      spiritualPrinciple: "A person's honor is sacred; cannibalizing their reputation behind closed doors poisons the soul.",
      mappingExplanation: "The graphic metaphor of eating the flesh of a deceased sibling highlights how helpless the absent person is to defend themselves while being sliced apart by gossip.",
      topics: ["Sanctity of Reputation", "Speech Hygiene", "Guarding the Heart"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "Backbiting (Gheebah) was defined by the Prophet ﷺ as: 'Mentioning your brother with what he dislikes.' When asked 'what if it is true?', he replied: 'If it is true you have backbitten him, and if it is false you have slandered him.'"
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "Suspicion breeds spying; spying breeds backbiting; and backbiting destroys social fraternity. Allah commands closing the door from the outset by rejecting malicious assumptions."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "Turn away from unfounded allegations against righteous people and guard the tongues from devouring reputations."
      }
    ],
    reflectionFramework: {
      understand: "The chain starts with 'Dhann' (unfounded mental assumptions). If you do not arrest the evil thought in your mind, it turns into spying (investigation), which inevitably spills into verbal backbiting.",
      reflectPrompt: "Think of someone you recently spoke critically about when they were not in the room. What would your conversation look like if they had been standing right next to you?",
      applyAction: "For the next 24 hours, implement the 'Absent Advocate' rule: if someone's name is criticized in your presence, mention one good trait about them or change the topic."
    },
    surroundingVerses: {
          "before": {
                "verseNumber": "11",
                "arabicText": "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا يَسْخَرْ قَوْمٌ مِّن قَوْمٍ عَسَىٰ أَن يَكُونُوا خَيْرًا مِّنْهُمْ وَلَا نِسَاءٌ مِّن نِّسَاءٍ عَسَىٰ أَن يَكُنَّ خَيْرًا مِّنْهُنَّ",
                "translations": {
                      "en": "O you who have believed, let not a people ridicule [another] people; perhaps they may be better than them; nor let women ridicule [other] women; perhaps they may be better than them.",
                      "sv": "Troende! Låt inte en grupp förlöjliga en annan grupp; de kan vara bättre än dem; låt inte heller kvinnor förlöjliga andra kvinnor; de kan vara bättre än dem.",
                      "fr": "Ô vous qui avez cru ! Qu'un groupe ne se raille pas d'un autre groupe : ceux-ci sont peut-être meilleurs qu'eux. Et que des femmes ne se raillent pas d'autres femmes : celles-ci sont peut-être meilleures qu'elles."
                }
          },
          "after": {
                "verseNumber": "13",
                "arabicText": "يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ۚ إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ ۚ إِنَّ اللَّهَ عَلِيمٌ خَبِيرٌ",
                "translations": {
                      "en": "O mankind, indeed We have created you from male and female and made you peoples and tribes that you may know one another. Indeed, the most noble of you in the sight of Allah is the most righteous of you. Indeed, Allah is Knowing and Acquainted.",
                      "sv": "Människor! Vi har skapat er av en man och en kvinna och delat in er i folk och stammar så att ni må lära känna varandra. Den ädlaste av er inför Gud är den mest gudfruktige av er. Gud är Allvetande och Välunderrättad.",
                      "fr": "Ô hommes ! Nous vous avons créés d'un mâle et d'une femelle, et Nous avons fait de vous des nations et des tribus, pour que vous vous entre-connaissiez. Le plus noble d'entre vous, auprès d'Allah, est le plus pieux. Allah est certes Omniscient et Grand-Connaisseur."
                }
          }
    }
  },
  {
    id: "14:7",
    surahNumber: 14,
    surahNameArabic: "ابراهيم",
    surahNameTransliterated: "Ibrahim",
    surahNameMeaning: "Abraham",
    verseNumber: "7",
    juz: 13,
    revelationType: "Meccan",
    revelationContext: "Revealed recalling the exhortation of Prophet Musa (Moses) to his people upon deliverance from Pharaoh's persecution, revealing the spiritual mechanics of blessing amplification.",
    arabicText: "وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ",
    transliteration: "Wa idh ta'adh-dhana rabbukum la'in shakartum la-azeedannakum, wa la'in kafartum inna 'adhaabee lashadeed.",
    translations: {
      en: {
        text: "And [remember] when your Lord proclaimed, 'If you are grateful, I will surely increase you [in favor]; but if you deny, indeed, My punishment is severe.'",
        translator: "Sahih International"
      },
      sv: {
        text: "Och minns att er Herre lät kungöra: 'Om ni visar tacksamhet skall Jag ge er större [och rikare gåvor], men om ni visar otacksamhet skall Mitt straff helt visst bli hårt!'",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Et lorsque votre Seigneur proclama: 'Si vous êtes reconnaissants, très certainement J'augmenterai [Mes bienfaits] pour vous. Mais si vous êtes ingrats, Mon châtiment sera terrible.'",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/014007.mp3",
    category: "moment",
    topics: ["Gratitude (Shukr)", "Abundance", "Contentment", "Mental Reframing", "Joy"],
    emotions: ["Gratitude", "Contentment", "Unappreciated", "Taking Things for Granted"],
    situations: ["Morning reflection", "Celebrating a milestone", "Combating consumerist greed", "Feeling unfulfilled despite wealth"],
    whyThisVerse: {
      emotion: "Gratitude & Yearning for More",
      situation: "Feeling blessed yet mindful of life's fragility, or feeling stuck in a cycle of insatiable greed.",
      coreNeed: "Connecting present gifts with their Divine Giver so they multiply in quality, depth, and barakah.",
      spiritualPrinciple: "Shukr is the leash that secures existing blessings and the magnet that attracts unseen increases.",
      mappingExplanation: "The emphasis 'la-azeedannakum' (with the lam and doubled noon of absolute certainty) is a direct divine pledge: genuine gratitude guarantees qualitative and quantitative elevation.",
      topics: ["The Science of Shukr", "Multiplication of Joy", "Humility in Success"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "If you recognize My favors upon you, submit to Me with praise and obedience, I will increase you in worldly provisions and eternal spiritual illumination."
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "Shukr is expressed by three faculties: the heart's acknowledgment, the tongue's praise, and the limbs utilizing the blessing in obedience rather than sin."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "Your Lord made known: If you give thanks for My blessings, I will multiply them for you with grace."
      }
    ],
    reflectionFramework: {
      understand: "The opposite of Shukr in the verse is 'Kufr' (ingratitude or ungrateful covering up of favors). Taking a blessing for granted is the quickest way to have it revoked.",
      reflectPrompt: "What is an invisible blessing you enjoy every single day (e.g., breathing without an oxygen tank, clean tap water, safety in your home) that you have never paused to thank God for?",
      applyAction: "Express three specific 'Alhamdulillah's today: one for a health blessing, one for an answered prayer, and one for a person who makes your life easier."
    },
    surroundingVerses: {
          "before": {
                "verseNumber": "6",
                "arabicText": "وَإِذْ قَالَ مُوسَىٰ لِقَوْمِهِ اذْكُرُوا نِعْمَةَ اللَّهِ عَلَيْكُمْ إِذْ أَنجَاكُم مِّنْ آلِ فِرْعَوْنَ يَسُومُونَكُمْ سُوءَ الْعَذَابِ",
                "translations": {
                      "en": "And [recall] when Moses said to his people, 'Remember the favor of Allah upon you when He saved you from the people of Pharaoh, who were afflicting you with the worst torment.'",
                      "sv": "Och minns när Mose sade till sitt folk: 'Minns Guds nåd mot er då Han räddade er från Faraos folk, som plågade er med svåra straff.'",
                      "fr": "Et lorsque Moïse dit à son peuple : 'Rappelez-vous le bienfait d'Allah sur vous quand Il vous sauva des gens de Pharaon qui vous infligeaient le pire châtiment.'"
                }
          },
          "after": {
                "verseNumber": "8",
                "arabicText": "وَقَالَ مُوسَىٰ إِن تَكْفُرُوا أَنتُمْ وَمَن فِي الْأَرْضِ جَمِيعًا فَإِنَّ اللَّهَ لَغَنِيٌّ حَمِيدٌ",
                "translations": {
                      "en": "And Moses said, 'If you should disbelieve, you and whoever is on the earth entirely - indeed, Allah is Free of need and Praiseworthy.'",
                      "sv": "Och Mose sade: 'Om ni och alla som finns på jorden förnekar tron, är Gud sannerligen Självtillräcklig och Prisvärd.'",
                      "fr": "Et Moïse dit : 'Si vous êtes mécréants, vous ainsi que tous ceux qui sont sur la terre, sachez qu'Allah Se suffit à Lui-même et qu'Il est Digne de louange.'"
                }
          }
    }
  },
  {
    id: "17:23-24",
    surahNumber: 17,
    surahNameArabic: "الإسراء",
    surahNameTransliterated: "Al-Isra",
    surahNameMeaning: "The Night Journey",
    verseNumber: "23-24",
    juz: 15,
    revelationType: "Meccan",
    revelationContext: "Revealed during the consolidation of the moral commandments of Islam, placing filial piety directly beneath the worship of God alone.",
    arabicText: "۞ وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا ۝ وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Wa qadaa rabbuka allaa ta'budoo illaa iyyaahu wa bil-waalidayni ihsaanaa, immaa yablughanna 'indakal-kibara ahaduhumaa aw kilaahumaa falaa taqul-lahumaa uffin wa laa tanharhumaa wa qul-lahumaa qawlan kareemaa. Wakh-fid lahumaa janaahadh-dhulli minar-rahmati wa qur-rabbir-hamhumaa kamaa rabbayaanee sagheeraa.",
    translations: {
      en: {
        text: "And your Lord has decreed that you not worship except Him, and to parents, good treatment. Whether one or both of them reach old age [while] with you, say not to them [so much as], 'uff,' and do not repel them but speak to them a noble word. And lower to them the wing of humility out of mercy and say, 'My Lord, have mercy upon them as they brought me up [when I was] small.'",
        translator: "Sahih International"
      },
      sv: {
        text: "Din Herre har befallt att ni inte skall dyrka någon annan än Honom. Och [Han har befallt er] att visa godhet mot era föräldrar. Om en av dem eller båda uppnår hög ålder hos dig, säg då inte ens ett förtretat 'usch' till dem och tillrättavisa dem inte, utan tala till dem med milda och vördnadsfulla ord. Och sänk ödmjukt din barmhärtighets vingar över dem och säg: 'Herre, visa dem Din barmhärtighet, så som de [ömt] vårdade mig när jag var liten.'",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Et ton Seigneur a décrété: 'N'adorez que Lui; et (marquez) de la bonté envers les père et mère: si l'un d'eux ou tous deux doivent atteindre la vieillesse auprès de toi, alors ne leur dis point: 'Fi!' et ne les brusque pas, mais adresse-leur des paroles respectueuses. Et par miséricorde; abaisse pour eux l'aile de l'humilité; et dis: 'Ô mon Seigneur, fais-leur, à tous deux, miséricorde comme ils m'ont élevé tout petit.'",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/017023.mp3",
    category: "growth",
    topics: ["Family Ties", "Parents", "Patience with Aging", "Humility", "Generational Healing"],
    emotions: ["Impatience", "Irritation with Family", "Guilt", "Elder Care Fatigue"],
    situations: ["Caring for elderly parents", "Strained relationship with father/mother", "Generational clash", "Family holiday tension"],
    whyThisVerse: {
      emotion: "Impatience with Family & Parents",
      situation: "Exhausted by elderly parents' repetitive questions, physical decline, or differences in opinion.",
      coreNeed: "Tenderness that reciprocates the forgotten sacrifices they made during your infancy.",
      spiritualPrinciple: "Kindness to parents (Birr al-Walidayn) is tied immediately next to Tawhid; even a sigh of irritation ('uff') breaks the standard of Ihsan.",
      mappingExplanation: "The poetical imagery of 'lowering the wing of humility out of mercy' evokes a bird sheltering its fragile fledglings beneath its wings.",
      topics: ["Family Honoring", "Overcoming Resentment", "Compassionate Caregiving"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "Do not let them hear anything unpleasant from you, not even a sigh of impatience ('uff'), which is the mildest expression of annoyance. When they age and their faculties weaken, do not scold them as if you were their master."
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "Speak to them words characterized by honor, deference, and love. Lower your ego before them willingly, remembering that when you were utterly helpless, they cleaned you and nurtured you."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "Treat parents with maximum tenderness, soft speech, and continuous supplication for their forgiveness."
      }
    ],
    reflectionFramework: {
      understand: "The word 'Uff' represents the smallest phonetic expression of exasperation—exhaling through pursed lips. The Quran forbids even this micro-expression, setting an extraordinary standard for emotional regulation.",
      reflectPrompt: "Have you noticed any subtle sharpness in your tone when speaking to your parents or elders? How might you shift from feeling burdened to feeling honored to serve them?",
      applyAction: "Call or visit your parents (or make heartfelt du'a for them if deceased), kiss their hand or head, and tell them with sincere warmth: 'Jazakum Allahu khayran for everything you gave me.'"
    },
    surroundingVerses: {
          "before": {
                "verseNumber": "22",
                "arabicText": "لَّا تَجْعَلْ مَعَ اللَّهِ إِلَٰهًا آخَرَ فَتَقْعُدَ مَذْمُومًا مَّخْذُولًا",
                "translations": {
                      "en": "Do not set up with Allah another deity and [thereby] sit reproached and abandoned.",
                      "sv": "Sätt inte en annan gud vid Guds sida, så att du blir klandrad och övergiven.",
                      "fr": "Ne place pas avec Allah d'autre divinité, sinon tu t'assoiras méprisé et abandonné."
                }
          },
          "after": {
                "verseNumber": "25",
                "arabicText": "رَّبُّكُمْ أَعْلَمُ بِمَا فِي نُفُوسِكُمْ ۚ إِن تَكُونُوا صَالِحِينَ فَإِنَّهُ كَانَ لِلْأَوَّابِينَ غَفُورًا",
                "translations": {
                      "en": "Your Lord is most knowing of what is within your souls. If you should be righteous [in intention] - then indeed He is ever, to the often returning [to Him], Forgiving.",
                      "sv": "Er Herre vet bäst vad som rör sig i era hjärtan. Om ni strävar efter att göra det rätta, är Han sannerligen Förlåtande mot dem som vänder åter till Honom i ånger.",
                      "fr": "Votre Seigneur connaît mieux ce qui est en vous-mêmes. Si vous êtes bons, Il est certes Pardonneur pour ceux qui reviennent à Lui en repentir."
                }
          }
    }
  },
  {
    id: "31:17-18",
    surahNumber: 31,
    surahNameArabic: "لقمان",
    surahNameTransliterated: "Luqman",
    surahNameMeaning: "Luqman",
    verseNumber: "17-18",
    juz: 21,
    revelationType: "Meccan",
    revelationContext: "Revealed transmitting the timeless paternal wisdom of the sage Luqman to his son regarding spiritual foundations and social etiquette.",
    arabicText: "يَا بُنَيَّ أَقِمِ الصَّلَاةَ وَأْمُرْ بِالْمَعْرُوفِ وَانْهَ عَنِ الْمُنكَرِ وَاصْبِرْ عَلَىٰ مَا أَصَابَكَ ۖ إِنَّ ذَٰلِكَ مِنْ عَزْمِ الْأُمُورِ ۝ وَلَا تُصَعِّرْ خَدَّكَ لِلنَّاسِ وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا ۖ إِنَّ اللَّهَ لَا يُحِبُّ كُلَّ مُخْتَالٍ فَخُورٍ",
    transliteration: "Yaa bunayya aqimis-salaata wa'mur bil-ma'roofi wanha 'anil-munkari was-bir 'alaa maa asaabak, inna dhaalika min 'azmil-umoor. Wa laa tusa''ir khaddaka lin-naasi wa laa tamshi fil-ardi marahaa, innal-laaha laa yuhibbu kulla mukhtaalin fakhoor.",
    translations: {
      en: {
        text: "O my son, establish prayer, enjoin what is right, forbid what is wrong, and be patient over what befalls you. Indeed, [all] that is of the matters [requiring] determination. And do not turn your cheek [in contempt] toward people and do not walk through the earth exultantly. Indeed, Allah does not like everyone self-deluded and boastful.",
        translator: "Sahih International"
      },
      sv: {
        text: "Käre son! Förrätta bönen, påbjud det som är rätt och förbjud det som är orätt och bär med tålamod det som drabbar dig! Detta är helt visst något som kräver fast beslutsamhet. Och vänd inte högmodigt bort kinden från människorna och gå inte omkring på jorden med skrytsam gång; Gud älskar inte den som är full av självgodhet och skryt.",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Ô mon enfant, accomplis la Salât, commande le convenable, interdis le blâmable et endure ce qui t'arrive avec patience. Telle est la résolution à prendre dans toute entreprise! Et ne détourne pas ton visage des hommes avec dédain, et ne foule pas la terre avec arrogance: car Allah n'aime pas le présomptueux plein de gloriole.",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/031017.mp3",
    category: "growth",
    topics: ["Character & Growth", "Humility", "Resilience ('Azm)", "Social Etiquette", "Patience in Adversity"],
    emotions: ["Pride", "Arrogance", "Snobbery", "Impatience", "Overconfidence"],
    situations: ["Social status climbing", "Entering leadership", "Mentoring youth", "Public life conduct"],
    whyThisVerse: {
      emotion: "Arrogance & Disdain for Others",
      situation: "Experiencing career or financial success that risks turning into snobbery, condescension, or treating service staff poorly.",
      coreNeed: "Grounding the soul in moral fortitude while keeping the ego thoroughly humbled.",
      spiritualPrinciple: "True greatness combines steadfast adherence to prayer and principles with soft, accessible humility toward fellow human beings.",
      mappingExplanation: "The phrase 'la tusa''ir khaddak' refers to a disease in camels that causes their necks to twist upward awkwardly; arrogance is diagnosed as an unnatural deformity of character.",
      topics: ["Curing Arrogance", "Social Grace", "Iron Determination"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "Do not turn your cheek away from people out of contempt when they speak to you or when you speak to them; rather, face them directly with an open countenance and a listening heart."
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "Luqman combines religious duties (prayer, commanding good) with interpersonal ethics (modesty, patience, gentle speech), showing that true religion is noble character."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "Do not puff up with self-admiration or strut proudly upon the earth, for Allah disdains the arrogant boaster."
      }
    ],
    reflectionFramework: {
      understand: "The word 'Azm al-Umoor' signifies the bedrock matters of resolve—the non-negotiable foundations of a mature, principled human being.",
      reflectPrompt: "When you walk into a room or interact with service workers, do you make direct, warm eye contact, or do you subtly 'turn your cheek' as if you were above them?",
      applyAction: "Make a point today to greet three people who normally go unnoticed (security guards, cleaners, cashiers) with a sincere smile and full attentive eye contact."
    },
    surroundingVerses: {
          "before": {
                "verseNumber": "16",
                "arabicText": "يَا بُنَيَّ إِنَّهَا إِن تَكُ مِثْقَالَ حَبَّةٍ مِّنْ خَرْدَلٍ فَتَكُن فِي صَخْرَةٍ أَوْ فِي السَّمَاوَاتِ أَوْ فِي الْأَرْضِ يَأْتِ بِهَا اللَّهُ ۚ إِنَّ اللَّهَ لَطِيفٌ خَبِيرٌ",
                "translations": {
                      "en": "[And Luqman said], 'O my son, indeed if wrong should be the weight of a mustard seed and should be within a rock or [anywhere] in the heavens or in the earth, Allah will bring it forth. Indeed, Allah is Subtle and Acquainted.'",
                      "sv": "'Käre son! Vore det så bara ett senapskorns vikt i en klippa, i himlarna eller i jorden, ska Gud föra det fram i ljuset. Gud är den Som genomskådar allt och är Underrättad om allt.'",
                      "fr": "'Ô mon cher fils, fût-ce le poids d'un grain de moutarde, dissimulé dans un rocher, dans les cieux ou dans la terre, Allah le fera surgir. Allah est infiniment Subtil et Parfaitement Connaisseur.'"
                }
          },
          "after": {
                "verseNumber": "19",
                "arabicText": "وَاقْصِدْ فِي مَشْيِكَ وَاغْضُضْ مِن صَوْتِكَ ۚ إِنَّ أَنكَرَ الْأَصْوَاتِ لَصَوْتُ الْحَمِيرِ",
                "translations": {
                      "en": "And be moderate in your pace and lower your voice; indeed, the most disagreeable of sounds is the voice of donkeys.",
                      "sv": "Och behärska din gång och sänk din röst; den mest motbjudande av alla röster är åsnans skriande.",
                      "fr": "Sois modeste dans ta démarche, et baisse ta voix, car la plus détestable des voix, c'est bien la voix des ânes."
                }
          }
    }
  },
  {
    id: "2:286",
    surahNumber: 2,
    surahNameArabic: "البقرة",
    surahNameTransliterated: "Al-Baqarah",
    surahNameMeaning: "The Cow",
    verseNumber: "286",
    juz: 3,
    revelationType: "Medinan",
    revelationContext: "Revealed at the conclusion of the longest Surah, lifting crushing burdens from the believers' shoulders and setting the definitive divine rule of spiritual capacity.",
    arabicText: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
    transliteration: "Laa yukalliful-laahu nafsan illaa wus'ahaa, lahaa maa kasabat wa 'alayhaa maktasabat, Rabbanaa laa tu'aakhidhnaa in-naseenaa aw akhta'naa, Rabbanaa wa laa tahmil 'alaynaa isran kamaa hamaltahoo 'alal-ladheena min qablinaa, Rabbanaa wa laa tuhammilnaa maa laa taaqata lanaa bih, wa'fu 'annaa waghfir lanaa warhamnaa, Anta mawlaanaa fansurnaa 'alal-qawmil-kaafireen.",
    translations: {
      en: {
        text: "Allah does not charge a soul except [with that within] its capacity. It will have [the consequence of] what [good] it has gained, and it will bear [the consequence of] what [evil] it has earned. 'Our Lord, do not impose blame upon us if we have forgotten or erred. Our Lord, and lay not upon us a burden like that which You laid upon those before us. Our Lord, and burden us not with that which we have no ability to bear. And pardon us; and forgive us; and have mercy upon us. You are our protector, so give us victory over the disbelieving people.'",
        translator: "Sahih International"
      },
      sv: {
        text: "Gud lägger inte på någon en tyngre börda än han kan bära. Var och en skall få [räkna] vad han har förtjänat och vad han har dragit över sig. [Bed:] 'Herre, ställ oss inte till svars om vi glömmer eller begår misstag! Herre, lägg inte på oss en sådan börda som Du lade på dem som levde före oss! Herre, lägg inte på oss mer än vi har kraft att bära! Och utplåna våra synder, förlåt oss och visa oss barmhärtighet! Du är vår Beskyddare; ge oss seger över förnekarna!'",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Allah n'impose à aucune âme une charge supérieure à sa capacité. Elle sera récompensée du bien qu'elle aura fait, punie du mal qu'elle aura fait. 'Seigneur, ne nous châtie pas s'il nous arrive d'oublier ou de commettre une erreur. Seigneur! Ne nous charge pas d'un fardeau lourd comme Tu as chargé ceux qui vécurent avant nous. Seigneur! Ne nous impose pas ce que nous ne pouvons supporter, efface nos fautes, pardonne-nous et fais-nous miséricorde. Tu es notre Maître, accorde-nous donc la victoire sur les peuples infidèles.'",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/002286.mp3",
    category: "moment",
    topics: ["Burnout", "Limits of Capacity", "Divine Compassion", "Forgiveness for Mistakes", "Relief from Burden"],
    emotions: ["Overburdened", "Crushed", "Helpless", "Tired", "Self-Defeated"],
    situations: ["Extreme pressure", "Parental exhaustion", "Multiple crises at once", "Chronic illness"],
    whyThisVerse: {
      emotion: "Feeling Crushed under Weight",
      situation: "When responsibilities feel completely impossible and you whisper: 'I can't take this anymore.'",
      coreNeed: "Divine reassurance that your soul has the spiritual capacity to endure this exact test, paired with permission to plead for relief.",
      spiritualPrinciple: "God does not make mistakes in capacity allocation ('Wus''); if you are facing it, God placed the resilience inside you to overcome it.",
      mappingExplanation: "The word 'Wus'' means full ease and breathing room. God never expects the impossible from His servants.",
      topics: ["Spiritual Capacity", "Grace in Human Weakness", "The Ultimate Night Supplication"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "Allah does not burden any soul beyond what it can reasonably bear. This demonstrates His profound gentleness, mercy, and goodness toward His creation. When the believers recited these prayers, Allah answered: 'I have done so.'"
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "All obligations of the Shari'ah are built on lightness and capacity. In times of extreme hardship, the religion creates automatic dispensations, proving religion is ease, not torment."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "Allah imposes only that which is within human power, pardoning forgetfulness and genuine mistakes when hearts turn back to Him."
      }
    ],
    reflectionFramework: {
      understand: "The tri-fold petition 'Wa'fu 'anna' (erase our faults), 'Waghfir lana' (conceal our shortcomings), 'Warhamna' (shower us with forward-looking grace) covers past, present, and future.",
      reflectPrompt: "Where are you placing unreasonable, perfectionist expectations on yourself that God Himself has not placed upon you?",
      applyAction: "Recite the final two verses of Surah Al-Baqarah before sleeping tonight, breathing in the assurance that God will not let you break."
    },
    surroundingVerses: {
      before: {
        verseNumber: "285",
        arabicText: "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ",
        translations: {
          en: "The Messenger has believed in what was revealed to him from his Lord, and [so have] the believers. All of them have believed in Allah and His angels and His books and His messengers, [saying], 'We make no distinction between any of His messengers.' And they say, 'We hear and we obey. [We seek] Your forgiveness, our Lord, and to You is the [final] destination.'",
          sv: "Sändebudet tror på vad som har uppenbarats för honom från hans Herre, och det gör även de troende. Alla tror de på Gud, Hans änglar, Hans skrifter och Hans sändebud: 'Vi gör ingen skillnad mellan något av Hans sändebud.' Och de säger: 'Vi har hört och vi lyder. Förlåt oss, Herre! Till Dig är återkomsten.'",
          fr: "Le Messager a cru en ce qu'on a fait descendre vers lui venant de son Seigneur, et aussi les croyants : tous ont cru en Allah, en Ses anges, à Ses livres et en Ses messagers ; [en disant] : 'Nous ne faisons aucune distinction entre Ses messagers.' Et ils ont dit : 'Nous avons entendu et obéi. Seigneur, nous implorons Ton pardon. C'est à Toi que sera le retour.'"
        }
      }
    }
  },
  {
    id: "39:53",
    surahNumber: 39,
    surahNameArabic: "الزمر",
    surahNameTransliterated: "Az-Zumar",
    surahNameMeaning: "The Troops",
    verseNumber: "53",
    juz: 24,
    revelationType: "Meccan",
    revelationContext: "Revealed concerning people in Makkah who had committed grave sins and idols before Islam and feared their past made them ineligible for divine mercy.",
    arabicText: "۞ قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ",
    transliteration: "Qul yaa 'ibaadiyal-ladheena asrafoo 'alaa anfusihim laa taqnatoo mir-rahmatil-laah, innal-laaha yaghfirudh-dhunooba jamee'aa, innahoo huwal-Ghafoorur-Raheem.",
    translations: {
      en: {
        text: "Say, 'O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful.'",
        translator: "Sahih International"
      },
      sv: {
        text: "Säg: '[Gud säger:] Mina tjänare, ni som har begått överträdelser mot er själva! Förlora inte hoppet om Guds nåd; Gud förlåter alla synder! Han är Den som ständigt förlåter, Den Barmhärtige.'",
        translator: "Mohammed Knut Bernström"
      },
      fr: {
        text: "Dis: 'Ô Mes serviteurs qui avez commis des excès à votre propre détriment, ne désespérez pas de la miséricorde d'Allah. Car Allah pardonne tous les péchés. Oui, c'est Lui le Pardonneur, le Très Miséricordieux.'",
        translator: "Muhammad Hamidullah"
      }
    },
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/039053.mp3",
    category: "moment",
    topics: ["Repentance", "Unconditional Mercy", "Overcoming Despair", "Hope", "Spiritual Renewal"],
    emotions: ["Unforgivable", "Despair", "Self-Loathing", "Alienation", "Heavy Past"],
    situations: ["Years away from faith", "Addiction struggles", "Regret over past life", "Fear of God's wrath"],
    whyThisVerse: {
      emotion: "Spiritual Despair & Self-Loathing",
      situation: "Believing you are too far gone, too tarnished, or that your repeat relapses disqualify you from redemption.",
      coreNeed: "A tender, unconditional invitation directly from the Divine, calling you 'My servant' even while acknowledging your transgressions.",
      spiritualPrinciple: "Despairing of Allah's mercy is a far greater tragedy than the sin itself; His capacity to forgive dwarfs any human failure.",
      mappingExplanation: "Notice that Allah refers to the sinners as 'Ya 'Ibadi' (O My servants)—attributing them to Himself in love before commanding them never to lose hope.",
      topics: ["Boundless Rahmah", "The Open Door of Tawbah", "Eradicating Guilt"]
    },
    tafsirCitations: [
      {
        scholar: "Ibn Kathir",
        century: "8th Hijri / 14th CE",
        sourceBook: "Tafsir al-Qur'an al-'Azim",
        text: "This noble verse is a call to all sinners, disbelievers, and transgressors to repent and turn back. It informs that Allah forgives all sins for whoever turns to Him in repentance, no matter how numerous they may be."
      },
      {
        scholar: "Al-Sa'di",
        century: "14th Hijri / 20th CE",
        sourceBook: "Taysir al-Karim al-Rahman",
        text: "Despair (Qunoot) pushes the sinner further into destruction; this verse dismantles despair by assuring that Divine Mercy has no ceiling."
      },
      {
        scholar: "Al-Muyassar",
        century: "Contemporary",
        sourceBook: "Al-Tafsir Al-Muyassar",
        text: "Do not cut off your hope from Allah's compassion, for He wipes clean all transgressions for the sincere seeker."
      }
    ],
    reflectionFramework: {
      understand: "The word 'Asrafoo' literally means to exceed the boundary. Allah recognizes that you crossed the boundary against your own self, yet still extends His hand with love.",
      reflectPrompt: "What old mistake or shame is holding you hostage, telling you that you are fundamentally broken or unlovable?",
      applyAction: "Turn toward the Qiblah, raise your hands, and say: 'Ya Rabb, I am Your servant who has exceeded boundaries, but Your mercy is greater than my sins. Forgive me.'"
    },
    surroundingVerses: {
          "before": {
                "verseNumber": "52",
                "arabicText": "أَوَلَمْ يَعْلَمُوا أَنَّ اللَّهَ يَبْسُطُ الرِّزْقَ لِمَن يَشَاءُ وَيَقْدِرُ ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يُؤْمِنُونَ",
                "translations": {
                      "en": "Do they not know that Allah extends provision for whom He wills and restricts it? Indeed in that are signs for a people who believe.",
                      "sv": "Vet de inte att Gud ger riklig försörjning till den Han vill och mäter ut den sparsamt [åt den Han vill]? I detta ligger sannerligen tecken för de troende.",
                      "fr": "Ne savent-ils pas qu'Allah accorde Ses dons avec largesse à qui Il veut, ou les restreint ? Il y a en cela des preuves pour des gens qui croient."
                }
          },
          "after": {
                "verseNumber": "54",
                "arabicText": "وَأَنِيبُوا إِلَىٰ رَبِّكُمْ وَأَسْلِمُوا لَهُ مِن قَبْلِ أَن يَأْتِيَكُمُ الْعَذَابُ ثُمَّ لَا تُنصَرُونَ",
                "translations": {
                      "en": "And return [in repentance] to your Lord and submit to Him before the punishment comes upon you; then you will not be helped.",
                      "sv": "Och vänd om i ånger till er Herre och underkasta er Honom innan straffet drabbar er; därefter får ni ingen hjälp.",
                      "fr": "Et revenez repentants à votre Seigneur, et soumettez-vous à Lui, avant que ne vous vienne le châtiment et vous ne recevrez alors aucun secours."
                }
          }
    }
  }
];

export const QUICK_CHOICE_PILLS: QuickPill[] = [
  // In This Moment
  {
    id: "anger-work",
    label: "Anger at work",
    labelArabic: "الغضب وضبط النفس",
    category: "moment",
    query: "Anger at work, dealing with unfair colleagues and hot temper",
    iconName: "Flame",
    description: "Restraining wrath, maintaining speech control, and embracing forgiveness when provoked."
  },
  {
    id: "burnout-anxiety",
    label: "Burnout & Overwhelm",
    labelArabic: "الإرهاق والضيق",
    category: "moment",
    query: "Feeling overwhelmed by deadlines, exhausted by burdens, finding relief",
    iconName: "Feather",
    description: "Finding ease packaged within hardship, releasing anxiety, and pacing the soul."
  },
  {
    id: "grief-loss",
    label: "Grief & Sudden Loss",
    labelArabic: "الحزن والمصيبة",
    category: "moment",
    query: "Dealing with grief, loss of a loved one, bereavement, staying patient",
    iconName: "HeartCrack",
    description: "The sanctuary of Istirja'—remembering our origins and destiny in God."
  },
  {
    id: "restless-heart",
    label: "Restless & Anxious Heart",
    labelArabic: "طمأنينة القلب",
    category: "moment",
    query: "Restless heart, racing thoughts, panic, need for stillness and peace",
    iconName: "Activity",
    description: "The restorative power of divine remembrance in anchoring agitated thoughts."
  },
  {
    id: "lonely-abandoned",
    label: "Feeling Abandoned or Low",
    labelArabic: "الوحشة والضيق",
    category: "moment",
    query: "Feeling lonely, depressed, feeling like God has abandoned me",
    iconName: "SunDim",
    description: "The comforting warmth of Ad-Duha: your Lord has not forsaken you."
  },
  {
    id: "career-decisions",
    label: "Life & Career Decisions",
    labelArabic: "التوكل والقرارات",
    category: "moment",
    query: "Facing big career decision, fear of poverty, need tawakkul and guidance",
    iconName: "Compass",
    description: "Tawakkul: divine exits and provision from uncalculated coordinates."
  },
  {
    id: "exams-future",
    label: "Exams & Future Stress",
    labelArabic: "الاختبارات والمستقبل",
    category: "moment",
    query: "School exams stress, university choices, fear of failure, need calm heart and tawakkul",
    iconName: "GraduationCap",
    description: "Steadying the heart during exams, study pressure, and life transitions."
  },
  {
    id: "guilt-regret",
    label: "Crushing Guilt & Sin",
    labelArabic: "التوبة والندم",
    category: "moment",
    query: "Guilt over mistakes, past sins, need repentance and clean slate",
    iconName: "RefreshCw",
    description: "The sovereign prayer of Yunus ﷺ from the depths of personal darkness."
  },
  {
    id: "gratitude-joy",
    label: "Gratitude & Abundance",
    labelArabic: "شكر النعمة",
    category: "moment",
    query: "Feeling grateful, appreciating blessings, multiplying joy",
    iconName: "Sparkles",
    description: "The spiritual law of Shukr: acknowledging favors to unlock divine increase."
  },

  // Big Questions
  {
    id: "purpose-existence",
    label: "What is my purpose?",
    labelArabic: "غاية الوجود",
    category: "questions",
    query: "Why did God create life and death? What is the purpose of human existence?",
    iconName: "HelpCircle",
    description: "Life and mortality calibrated as an arena for moral excellence (Ahsan 'Amala)."
  },
  {
    id: "suffering-tragedy",
    label: "Why does suffering happen?",
    labelArabic: "الحكمة في البلاء",
    category: "questions",
    query: "Why do bad things happen? Dealing with regret and missed opportunities",
    iconName: "ShieldAlert",
    description: "Understanding Divine Decree (Qadr) to eradicate paralyzing regret."
  },
  {
    id: "justice-oppression",
    label: "Will justice ever prevail?",
    labelArabic: "العدل الإلهي",
    category: "questions",
    query: "Seeing corruption and tyranny, questioning cosmic justice and moral balance",
    iconName: "Scale",
    description: "The universe created 'Bil-Haqq'—every soul recompensed without injustice."
  },

  // Character & Growth
  {
    id: "responding-to-hostility",
    label: "Responding to hostile people",
    labelArabic: "الدفع بالتي هي أحسن",
    category: "growth",
    query: "How to deal with enemies, insults, workplace bullies with dignity",
    iconName: "ShieldCheck",
    description: "Disarming animosity with superior grace to turn adversaries into allies."
  },
  {
    id: "humility-daily-life",
    label: "Humility in everyday life",
    labelArabic: "التواضع والسكينة",
    category: "growth",
    query: "Walking with humility, dealing with internet arguments and rude people",
    iconName: "Footprints",
    description: "Treading gently upon earth and replying with peace to provocative ignorance."
  },
  {
    id: "purifying-speech",
    label: "Stopping gossip & suspicion",
    labelArabic: "حفظ اللسان والظن",
    category: "growth",
    query: "Overcoming gossip, backbiting, negative assumptions about others",
    iconName: "MessageSquareOff",
    description: "Guarding personal reputation and severing the chain of malicious assumptions."
  },
  {
    id: "family-patience",
    label: "Patience with parents & family",
    labelArabic: "بر الوالدين",
    category: "growth",
    query: "Dealing with elderly parents, family frustration, honoring mother and father",
    iconName: "Users",
    description: "Lowering the wing of humility and eliminating even the sigh of 'uff'."
  },
  {
    id: "peer-pressure",
    label: "Peer Pressure & Courage",
    labelArabic: "الثبات أمام الأقران",
    category: "growth",
    query: "Standing up to peer pressure, mockery at school, staying true to good values with kindness",
    iconName: "ShieldCheck",
    description: "Walking with dignity and calm courage when others mock or pressure you."
  }
];
