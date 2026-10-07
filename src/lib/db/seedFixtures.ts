export const SEED_FIXTURES = [
  {
    surah: { number: 3, name_arabic: "آل عمران", name_english: "Ali 'Imran", revelation_place: "Madinah" },
    ayah: { ayah_number: 134, text_uthmani: "الَّذِينَ يُنفِقُونَ فِي السَّرَّاءِ وَالضَّرَّاءِ وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ ۗ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ", text_clean: "الذين ينفقون في السراء والضراء والكاظمين الغيظ والعافين عن الناس والله يحب المحسنين" },
    translations: [
      { language_code: "en", text: "Who spend [in the cause of Allah] during ease and hardship and who restrain anger and who pardon the people - and Allah loves the doers of good;", source: "Saheeh International" },
      { language_code: "sv", text: "De som ger av sitt i både medgång och motgång och som bandar sin vrede och förlåter sina medmänniskor - Gud älskar dem som gör det goda.", source: "Knut Bernström" }
    ],
    tafsirs: [
      { scholar_name: "Ibn Kathir", work_title: "Tafsir Ibn Kathir", text: "They do not act upon their anger, but rather they suppress it, seeking the Face of Allah.", language_code: "en" },
      { scholar_name: "Al-Sa'di", work_title: "Tafsir Al-Sa'di", text: "Swallowing anger means not showing it to others when someone has harmed you. Pardoning them means wiping it from your heart entirely.", language_code: "en" }
    ],
    topic: { slug: "anger-control", title: "Anger Control", life_domain: "workplace" }
  },
  {
    surah: { number: 94, name_arabic: "الشرح", name_english: "Ash-Sharh", revelation_place: "Makkah" },
    ayah: { ayah_number: 5, text_uthmani: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", text_clean: "فإن مع العسر يسرا" },
    translations: [
      { language_code: "en", text: "For indeed, with hardship [will be] ease.", source: "Saheeh International" },
      { language_code: "sv", text: "Ty med varje svårighet följer lättnad;", source: "Knut Bernström" }
    ],
    tafsirs: [
      { scholar_name: "Ibn Kathir", work_title: "Tafsir Ibn Kathir", text: "Allah informs us that with the difficulty there is ease, and He affirmed this by repeating it.", language_code: "en" }
    ],
    topic: { slug: "patience-hardship", title: "Patience in Hardship", life_domain: "individual" }
  },
  {
    surah: { number: 2, name_arabic: "البقرة", name_english: "Al-Baqarah", revelation_place: "Madinah" },
    ayah: { ayah_number: 155, text_uthmani: "وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَالِ وَالْأَنفُسِ وَالثَّمَرَاتِ ۗ وَبَشِّرِ الصَّابِرِينَ", text_clean: "ولنبلونكم بشيء من الخوف والجوع ونقص من الأموال والأنفس والثمرات وبشر الصابرين" },
    translations: [
      { language_code: "en", text: "And We will surely test you with something of fear and hunger and a loss of wealth and lives and fruits, but give good tidings to the patient,", source: "Saheeh International" },
      { language_code: "sv", text: "Vi skall helt visst pröva er med något av fruktan och hunger och förlust av egendom och liv och skördar, men förkunna det glada budskapet för de tålmodiga.", source: "Knut Bernström" }
    ],
    tafsirs: [
      { scholar_name: "Al-Sa'di", work_title: "Tafsir Al-Sa'di", text: "Allah tests His servants so that the truthful may be distinguished from the liars, and the patient from the impatient.", language_code: "en" }
    ],
    topic: { slug: "patience-loss", title: "Patience during Loss", life_domain: "individual" }
  },
  {
    surah: { number: 42, name_arabic: "الشورى", name_english: "Ash-Shura", revelation_place: "Makkah" },
    ayah: { ayah_number: 38, text_uthmani: "وَالَّذِينَ اسْتَجَابُوا لِرَبِّهِمْ وَأَقَامُوا الصَّلَاةَ وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ", text_clean: "والذين استجابوا لربهم وأقاموا الصلاة وأمرهم شورى بينهم ومما رزقناهم ينفقون" },
    translations: [
      { language_code: "en", text: "And those who have responded to their lord and established prayer and whose affair is [determined by] consultation among themselves, and from what We have provided them, they spend.", source: "Saheeh International" },
      { language_code: "sv", text: "Och de som hörsammar sin Herres kallelse och förrättar bönen, och som i allt vad de företar sig rådgör med varandra, och som ger av det som Vi har skänkt dem,", source: "Knut Bernström" },
      { language_code: "fr", text: "Qui répondent à l'appel de leur Seigneur, accomplissent la Salât, se consultent entre eux à propos de leurs affaires, et dépensent de ce que Nous leur attribuons,", source: "Muhammad Hamidullah" }
    ],
    tafsirs: [
      { scholar_name: "Ibn Kathir", work_title: "Tafsir Ibn Kathir", text: "They do not make a decision without consulting one another, to ensure that their actions are based on consensus and wisdom.", language_code: "en" }
    ],
    surroundingVerses: {
      before: {
        verseNumber: "37",
        arabicText: "وَالَّذِينَ يَجْتَنِبُونَ كَبَائِرَ الْإِثْمِ وَالْفَوَاحِشَ وَإِذَا مَا غَضِبُوا هُمْ يَغْفِرُونَ",
        translations: {
          en: "And those who avoid the major sins and immoralities, and when they are angry, they forgive,",
          sv: "och de som avhåller sig från de svåraste synderna och skamlösa handlingar och som, när de grips av vrede, förlåter,",
          fr: "qui évitent les plus grands péchés ainsi que les turpitudes, et qui pardonnent après s'être mis en colère,"
        }
      },
      after: {
        verseNumber: "39",
        arabicText: "وَالَّذِينَ إِذَا أَصَابَهُمُ الْبَغْيُ هُمْ يَنتَصِرُونَ",
        translations: {
          en: "And those who, when tyranny strikes them, they defend themselves,",
          sv: "och de som, när de utsätts för övergrepp, försvarar sig.",
          fr: "et qui, atteints par l'injustice, ripostent."
        }
      }
    },
    topic: { slug: "decisions-consultation", title: "Decisions & Consultation", life_domain: "workplace" }
  },
  {
    surah: { number: 3, name_arabic: "آل عمران", name_english: "Ali 'Imran", revelation_place: "Madinah" },
    ayah: { ayah_number: 159, text_uthmani: "فَبِمَا رَحْمَةٍ مِّنَ اللَّهِ لِنتَ لَهُمْ ۖ وَلَوْ كُنتَ فَظًّا غَلِيظَ الْقَلْبِ لَانفَضُّوا مِنْ حَوْلِكَ ۖ فَاعْفُ عَنْهُمْ وَاسْتَغْفِرْ لَهُمْ وَشَاوِرْهُمْ فِي الْأَمْرِ ۖ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ ۚ إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ", text_clean: "فبما رحمة من الله لنت لهم ولو كنت فظا غليظ القلب لانفضوا من حولك فاعف عنهم واستغفر لهم وشاورهم في الأمر فإذا عزمت فتوكل على الله إن الله يحب المتوكلين" },
    translations: [
      { language_code: "en", text: "So by mercy from Allah, [O Muhammad], you were lenient with them. And if you had been rude [in speech] and harsh in heart, they would have disbanded from about you. So pardon them and ask forgiveness for them and consult them in the matter. And when you have decided, then rely upon Allah. Indeed, Allah loves those who rely [upon Him].", source: "Saheeh International" },
      { language_code: "sv", text: "I Sin barmhärtighet lät Gud dig visa dem mildhet; om du hade varit sträng och hårdhjärtad hade de helt säkert dragit sig ifrån dig. Förlåt dem därför och be om förlåtelse för dem och rådgör med dem i alla angelägenheter; och när du har fattat ditt beslut, sätt då din lit till Gud. Gud älskar dem som sätter sin lit till Honom.", source: "Knut Bernström" },
      { language_code: "fr", text: "C'est par quelque miséricorde de la part d'Allah que tu (Muhammad) as été si doux envers eux ! Mais si tu étais rude, au cœur dur, ils se seraient enfuis de ton entourage. Pardonne-leur donc, et implore pour eux le pardon (d'Allah). Et consulte-les à propos des affaires ; puis une fois que tu t'es décidé, confie-toi donc à Allah, Allah aime, en vérité, ceux qui Lui font confiance.", source: "Muhammad Hamidullah" }
    ],
    tafsirs: [
      { scholar_name: "Al-Sa'di", work_title: "Tafsir Al-Sa'di", text: "Consultation brings about love, unites hearts, and helps in reaching the correct decision.", language_code: "en" }
    ],
    surroundingVerses: {
      before: {
        verseNumber: "158",
        arabicText: "وَلَئِن مُّتُّمْ أَوْ قُتِلْتُمْ لَإِلَى اللَّهِ تُحْشَرُونَ",
        translations: {
          en: "And whether you die or are killed, unto Allah you will be gathered.",
          sv: "Och vare sig ni dör eller stupar i strid, skall ni samlas inför Gud.",
          fr: "Que vous mouriez ou que vous soyez tués, c'est vers Allah que vous serez rassemblés."
        }
      },
      after: {
        verseNumber: "160",
        arabicText: "إِن يَنصُرْكُمُ اللَّهُ فَلَا غَالِبَ لَكُمْ ۖ وَإِن يَخْذُلْكُمْ فَمَن ذَا الَّذِي يَنصُرُكُم مِّن بَعْدِهِ ۗ وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ",
        translations: {
          en: "If Allah should aid you, no one can overcome you; and if He should forsake you, who is there that can aid you after Him? And upon Allah let the believers rely.",
          sv: "Om Gud ger er Sin hjälp kan ingen besegra er, men om Han överger er, vem kan då hjälpa er efter Honom? Till Gud skall de troende sätta sin lit.",
          fr: "Si Allah vous donne Son secours, nul ne peut vous vaincre. S'Il vous abandonne, qui donc après Lui vous donnera secours ? C'est à Allah que les croyants doivent faire confiance."
        }
      }
    },
    topic: { slug: "leadership-mercy", title: "Leadership & Mercy", life_domain: "workplace" }
  },
  {
    surah: { number: 17, name_arabic: "الإسراء", name_english: "Al-Isra", revelation_place: "Makkah" },
    ayah: { ayah_number: 23, text_uthmani: "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا", text_clean: "وقضى ربك ألا تعبدوا إلا إياه وبالوالدين إحسانا إما يبلغن عندك الكبر أحدهما أو كلاهما فلا تقل لهما أف ولا تنهرهما وقل لهما قولا كريما" },
    translations: [
      { language_code: "en", text: "And your Lord has decreed that you not worship except Him, and to parents, good treatment. Whether one or both of them reach old age [while] with you, say not to them [so much as], \"uff,\" and do not repel them but speak to them a noble word.", source: "Saheeh International" },
      { language_code: "sv", text: "Er Herre har befallt, att ni inte skall dyrka någon annan än Honom. Och [Han har anbefallt er] att visa godhet mot [era] föräldrar. Om en av dem eller båda uppnår hög ålder hos dig, säg då inte \"Uff\" till dem och snäs inte av dem, utan tala till dem med respekt.", source: "Knut Bernström" },
      { language_code: "fr", text: "Et ton Seigneur a décrété : N'adorez que Lui ; et marquez de la bonté envers les père et mère : si l'un d'eux ou tous deux doivent atteindre la vieillesse auprès de toi, alors ne leur dis point : « Fi ! » et ne les brusque pas, mais adresse-leur des paroles respectueuses.", source: "Muhammad Hamidullah" }
    ],
    tafsirs: [
      { scholar_name: "Ibn Kathir", work_title: "Tafsir Ibn Kathir", text: "Allah commands kind treatment of parents, especially when they grow old and need extra care, forbidding even the slightest expression of annoyance.", language_code: "en" }
    ],
    topic: { slug: "family-parents", title: "Patience with Parents", life_domain: "family" }
  },
  {
    surah: { number: 64, name_arabic: "التغابن", name_english: "At-Taghabun", revelation_place: "Madinah" },
    ayah: { ayah_number: 14, text_uthmani: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِنَّ مِنْ أَزْوَاجِكُمْ وَأَوْلَادِكُمْ عَدُوًّا لَّكُمْ فَاحْذَرُوهُمْ ۚ وَإِن تَعْفُوا وَتَصْفَحُوا وَتَغْفِرُوا فَإِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ", text_clean: "يا أيها الذين آمنوا إن من أزواجكم وأولادكم عدوا لكم فاحذروهم وإن تعفوا وتصفحوا وتغفروا فإن الله غفور رحيم" },
    translations: [
      { language_code: "en", text: "O you who have believed, indeed, among your wives and your children are enemies to you, so beware of them. But if you pardon and overlook and forgive - then indeed, Allah is Forgiving and Merciful.", source: "Saheeh International" },
      { language_code: "sv", text: "Troende! Bland era hustrur och era barn finns de som [kan bli] era fiender; var alltså på er vakt mot dem! Men om ni har överseende [med dem] och förlåter dem, [skall ni veta att] Gud är ständigt förlåtande, barmhärtig.", source: "Knut Bernström" },
      { language_code: "fr", text: "Ô vous qui avez cru ! Vous avez de vos épouses et de vos enfants un ennemi [une tentation] ; prenez-y garde donc. Mais si vous pardonnez, passez sur leurs fautes et leur pardonnez, sachez qu'Allah est Pardonneur et Très Miséricordieux.", source: "Muhammad Hamidullah" }
    ],
    tafsirs: [
      { scholar_name: "Al-Sa'di", work_title: "Tafsir Al-Sa'di", text: "Sometimes love for family leads one to compromise their religious duties. One must be careful, yet forgiving and merciful in family conflicts.", language_code: "en" }
    ],
    surroundingVerses: {
      before: {
        verseNumber: "13",
        arabicText: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۚ وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ",
        translations: {
          en: "Allah - there is no deity except Him. And upon Allah let the believers rely.",
          sv: "Gud – det finns ingen gud utom Han! Till Gud skall de troende sätta sin lit.",
          fr: "Allah, nul autre divinité que Lui ! Et c'est à Allah que les croyants doivent faire confiance."
        }
      },
      after: {
        verseNumber: "15",
        arabicText: "إِنَّمَا أَمْوَالُكُمْ وَأَوْلَادُكُمْ فِتْنَةٌ ۚ وَاللَّهُ عِندَهُ أَجْرٌ عَظِيمٌ",
        translations: {
          en: "Your wealth and your children are but a trial, and Allah has with Him a great reward.",
          sv: "Era ägodelar och era barn är bara en prövning, men hos Gud väntar en stor belöning.",
          fr: "Vos biens et vos enfants ne sont qu'une tentation, alors qu'auprès d'Allah est une énorme récompense."
        }
      }
    },
    topic: { slug: "family-conflict", title: "Family Conflict", life_domain: "family" }
  },
  {
    surah: { number: 51, name_arabic: "الذاريات", name_english: "Adh-Dhariyat", revelation_place: "Makkah" },
    ayah: { ayah_number: 56, text_uthmani: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ", text_clean: "وما خلقت الجن والإنس إلا ليعبدون" },
    translations: [
      { language_code: "en", text: "And I did not create the jinn and mankind except to worship Me.", source: "Saheeh International" },
      { language_code: "sv", text: "Jag har skapat de osynliga väsendena och människorna enbart för att de skall dyrka Mig.", source: "Knut Bernström" },
      { language_code: "fr", text: "Je n'ai créé les djinns et les hommes que pour qu'ils M'adorent.", source: "Muhammad Hamidullah" }
    ],
    tafsirs: [
      { scholar_name: "Ibn Kathir", work_title: "Tafsir Ibn Kathir", text: "The primary purpose of existence is to know Allah, worship Him alone, and align one's life with His guidance.", language_code: "en" }
    ],
    surroundingVerses: {
      before: {
        verseNumber: "55",
        arabicText: "وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ",
        translations: {
          en: "And remind, for indeed, the reminder benefits the believers.",
          sv: "Och påminn! Påminnelsen är till nytta för de troende.",
          fr: "Et rappelle, car le rappel profite aux croyants."
        }
      },
      after: {
        verseNumber: "57",
        arabicText: "مَا أُرِيدُ مِنْهُم مِّن رِّزْقٍ وَمَا أُرِيدُ أَن يُطْعِمُونِ",
        translations: {
          en: "I do not want from them any provision, nor do I want them to feed Me.",
          sv: "Jag begär ingen försörjning av dem och Jag begär inte att de skall livnära Mig.",
          fr: "Je ne cherche pas d'eux une subsistance ; et Je ne veux pas qu'ils Me nourrissent."
        }
      }
    },
    topic: { slug: "purpose-worship", title: "Purpose of Life", life_domain: "questions" }
  },
  {
    surah: { number: 67, name_arabic: "الملك", name_english: "Al-Mulk", revelation_place: "Makkah" },
    ayah: { ayah_number: 2, text_uthmani: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ", text_clean: "الذي خلق الموت والحياة ليبلوكم أيكم أحسن عملا وهو العزيز الغفور" },
    translations: [
      { language_code: "en", text: "[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -", source: "Saheeh International" },
      { language_code: "sv", text: "Han som har skapat döden och livet för att sätta er på prov [och se] vem av er som i sina handlingar är bäst. Han är den Mäktige, Den som ständigt förlåter.", source: "Knut Bernström" },
      { language_code: "fr", text: "Celui qui a créé la mort et la vie afin de vous éprouver (et de savoir) qui de vous est le meilleur en œuvre, et c'est Lui le Puissant, le Pardonneur.", source: "Muhammad Hamidullah" }
    ],
    tafsirs: [
      { scholar_name: "Al-Sa'di", work_title: "Tafsir Al-Sa'di", text: "Life is a testing ground. The goal is not just to do deeds, but to do the best and most sincere deeds.", language_code: "en" }
    ],
    topic: { slug: "purpose-test", title: "Life as a Test", life_domain: "questions" }
  },
  {
    surah: { number: 4, name_arabic: "النساء", name_english: "An-Nisa", revelation_place: "Madinah" },
    ayah: { ayah_number: 135, text_uthmani: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا قَوَّامِينَ بِالْقِسْطِ شُهَدَاءَ لِلَّهِ وَلَوْ عَلَىٰ أَنفُسِكُمْ أَوِ الْوَالِدَيْنِ وَالْأَقْرَبِينَ", text_clean: "يا أيها الذين آمنوا كونوا قوامين بالقسط شهداء لله ولو على أنفسكم أو الوالدين والأقربين" },
    translations: [
      { language_code: "en", text: "O you who have believed, be persistently standing firm in justice, witnesses for Allah, even if it be against yourselves or parents and relatives.", source: "Saheeh International" },
      { language_code: "sv", text: "Troende! Slå vakt om rätten och rättvisan och träd fram som vittnen inför Gud, även om det skulle vara mot er själva eller era föräldrar och nära anhöriga.", source: "Knut Bernström" },
      { language_code: "fr", text: "Ô les croyants ! Observez strictement la justice et soyez des témoins (véridiques) comme Allah l'ordonne, fût-ce contre vous-mêmes, contre vos père et mère ou proches parents.", source: "Muhammad Hamidullah" }
    ],
    tafsirs: [
      { scholar_name: "Ibn Kathir", work_title: "Tafsir Ibn Kathir", text: "Justice is absolute and must be upheld even if it contradicts personal interests or the interests of close family.", language_code: "en" }
    ],
    surroundingVerses: {
      before: {
        verseNumber: "134",
        arabicText: "مَّن كَانَ يُرِيدُ ثَوَابَ الدُّنْيَا فَعِندَ اللَّهِ ثَوَابُ الدُّنْيَا وَالْآخِرَةِ ۚ وَكَانَ اللَّهُ سَمِيعًا بَصِيرًا",
        translations: {
          en: "Whoever desires the reward of this world - then with Allah is the reward of this world and the Hereafter. And ever is Allah Hearing and Seeing.",
          sv: "Den som begär denna världens belöning [skall veta att] belöningen i denna värld och i det kommande livet finns hos Gud. Gud hör allt, ser allt.",
          fr: "Quiconque désire la récompense d'ici-bas, c'est auprès d'Allah qu'est la récompense d'ici-bas et de l'au-delà. Et Allah est Audient et Clairvoyant."
        }
      },
      after: {
        verseNumber: "136",
        arabicText: "يَا أَيُّهَا الَّذِينَ آمَنُوا آمِنُوا بِاللَّهِ وَرَسُولِهِ وَالْكِتَابِ الَّذِي نَزَّلَ عَلَىٰ رَسُولِهِ",
        translations: {
          en: "O you who have believed, believe in Allah and His Messenger and the Book that He sent down upon His Messenger.",
          sv: "Troende! Tro på Gud och Hans Sändebud och den Skrift som Han har uppenbarat för Sitt Sändebud.",
          fr: "Ô les croyants ! Soyez fermes en votre foi en Allah, en Son messager, et au Livre qu'Il a fait descendre sur Son messager."
        }
      }
    },
    topic: { slug: "justice", title: "Upholding Justice", life_domain: "growth" }
  },
  {
    surah: { number: 5, name_arabic: "المائدة", name_english: "Al-Ma'idah", revelation_place: "Madinah" },
    ayah: { ayah_number: 8, text_uthmani: "وَلَا يَجْرِمَنَّكُمْ شَنَآنُ قَوْمٍ عَلَىٰ أَلَّا تَعْدِلُوا ۚ اعْدِلُوا هُوَ أَقْرَبُ لِلتَّقْوَىٰ", text_clean: "ولا يجرمنكم شنآن قوم على ألا تعدلوا اعدلوا هو أقرب للتقوى" },
    translations: [
      { language_code: "en", text: "And do not let the hatred of a people prevent you from being just. Be just; that is nearer to righteousness.", source: "Saheeh International" },
      { language_code: "sv", text: "Och låt inte avsky för [vissa] människor driva er till orättvisa; [nej] var rättvisa - detta ligger gudsfruktan närmast.", source: "Knut Bernström" },
      { language_code: "fr", text: "Et que la haine pour un peuple ne vous incite pas à être injustes. Soyez équitables, cela est plus proche de la piété.", source: "Muhammad Hamidullah" }
    ],
    tafsirs: [
      { scholar_name: "Al-Sa'di", work_title: "Tafsir Al-Sa'di", text: "True piety involves maintaining fairness and justice even towards one's enemies or those one dislikes.", language_code: "en" }
    ],
    surroundingVerses: {
      before: {
        verseNumber: "7",
        arabicText: "وَاذْكُرُوا نِعْمَةَ اللَّهِ عَلَيْكُمْ وَمِيثَاقَهُ الَّذِي وَاثَقَكُم بِهِ إِذْ قُلْتُمْ سَمِعْنَا وَأَطَعْنَا ۖ وَاتَّقُوا اللَّهَ",
        translations: {
          en: "And remember the favor of Allah upon you and His covenant with which He bound you when you said, 'We hear and we obey'; and fear Allah.",
          sv: "Och minns Guds nåd mot er och det förbund som Han slöt med er när ni sade: 'Vi hör och vi lyder', och frukta Gud.",
          fr: "Et rappelez-vous le bienfait d'Allah sur vous, ainsi que l'alliance qu'Il a conclue avec vous, quand vous avez dit : « Nous avons entendu et nous avons obéi ». Et craignez Allah."
        }
      },
      after: {
        verseNumber: "9",
        arabicText: "وَعَدَ اللَّهُ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ ۙ لَهُم مَّغْفِرَةٌ وَأَجْرٌ عَظِيمٌ",
        translations: {
          en: "Allah has promised those who believe and do righteous deeds [that] for them there is forgiveness and great reward.",
          sv: "Gud har lovat dem som tror och lever ett rättskaffens liv förlåtelse och en stor belöning.",
          fr: "Allah a promis à ceux qui croient et font de bonnes œuvres qu'il y aura pour eux un pardon et une énorme récompense."
        }
      }
    },
    topic: { slug: "justice-enemies", title: "Justice to Enemies", life_domain: "growth" }
  },
  {
    surah: { number: 39, name_arabic: "الزمر", name_english: "Az-Zumar", revelation_place: "Makkah" },
    ayah: { ayah_number: 53, text_uthmani: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا", text_clean: "قل يا عبادي الذين أسرفوا على أنفسهم لا تقنطوا من رحمة الله إن الله يغفر الذنوب جميعا" },
    translations: [
      { language_code: "en", text: "Say, \"O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins.\"", source: "Saheeh International" },
      { language_code: "sv", text: "Säg: \"Mina tjänare, ni som har gjort orätt mot er själva, misströsta inte om Guds nåd! Gud förlåter alla synder.\"", source: "Knut Bernström" },
      { language_code: "fr", text: "Dis : « Ô Mes serviteurs qui avez commis des excès à votre propre détriment, ne désespérez pas de la miséricorde d'Allah. Car Allah pardonne tous les péchés. »", source: "Muhammad Hamidullah" }
    ],
    tafsirs: [
      { scholar_name: "Ibn Kathir", work_title: "Tafsir Ibn Kathir", text: "This is a call to all sinners to repent. No matter how great the sin, Allah's mercy is greater.", language_code: "en" }
    ],
    topic: { slug: "hope-mercy", title: "Hope & Mercy", life_domain: "growth" }
  },
  {
    surah: { number: 13, name_arabic: "الرعد", name_english: "Ar-Ra'd", revelation_place: "Madinah" },
    ayah: { ayah_number: 28, text_uthmani: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", text_clean: "الذين آمنوا وتطمئن قلوبهم بذكر الله ألا بذكر الله تطمئن القلوب" },
    translations: [
      { language_code: "en", text: "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.", source: "Saheeh International" },
      { language_code: "sv", text: "de som tror och vilkas hjärtan finner ro i ihågkommandet av Gud - ja, i ihågkommandet av Gud finner hjärtat ro!", source: "Knut Bernström" },
      { language_code: "fr", text: "Ceux qui ont cru, et dont les cœurs s'apaisent à l'évocation d'Allah. N'est-ce point par l'évocation d'Allah que se tranquillisent les cœurs ?", source: "Muhammad Hamidullah" }
    ],
    tafsirs: [
      { scholar_name: "Al-Sa'di", work_title: "Tafsir Al-Sa'di", text: "The heart finds its true peace and rest only in the remembrance of its Creator.", language_code: "en" }
    ],
    topic: { slug: "peace-remembrance", title: "Inner Peace", life_domain: "individual" }
  },
  {
    surah: { number: 2, name_arabic: "البقرة", name_english: "Al-Baqarah", revelation_place: "Madinah" },
    ayah: { ayah_number: 286, text_uthmani: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ", text_clean: "لا يكلف الله نفسا إلا وسعها لها ما كسبت وعليها ما اكتسبت" },
    translations: [
      { language_code: "en", text: "Allah does not charge a soul except [with that within] its capacity. It will have [the consequence of] what [good] it has gained, and it will bear [the consequence of] what [evil] it has earned.", source: "Saheeh International" },
      { language_code: "sv", text: "Gud lägger inte på någon en tyngre börda än han kan bära. Det goda han har gjort skall räknas honom till förtjänst och det onda han har gjort skall läggas honom till last.", source: "Knut Bernström" },
      { language_code: "fr", text: "Allah n'impose à aucune âme une charge supérieure à sa capacité. Elle sera récompensée du bien qu'elle aura fait, punie du mal qu'elle aura fait.", source: "Muhammad Hamidullah" }
    ],
    tafsirs: [
      { scholar_name: "Ibn Kathir", work_title: "Tafsir Ibn Kathir", text: "This is a manifestation of Allah's immense mercy. He does not burden anyone beyond what they can bear.", language_code: "en" }
    ],
    topic: { slug: "capacity-burden", title: "Human Capacity", life_domain: "individual" }
  },
  {
    surah: { number: 7, name_arabic: "الأعراف", name_english: "Al-A'raf", revelation_place: "Makkah" },
    ayah: { ayah_number: 199, text_uthmani: "خُذِ الْعَفْوَ وَأْمُرْ بِالْعُرْفِ وَأَعْرِضْ عَنِ الْجَاهِلِينَ", text_clean: "خذ العفو وأمر بالعرف وأعرض عن الجاهلين" },
    translations: [
      { language_code: "en", text: "Take what is given freely, enjoin what is good, and turn away from the ignorant.", source: "Saheeh International" },
      { language_code: "sv", text: "ÖVERSE med människornas natur [och deras brister], och uppmana [alla att visa] hövlighet och vänlighet och undvik [alla ordväxlingar med] dem som [står kvar i hednisk] okunnighet.", source: "Mohammed Knut Bernström" },
      { language_code: "fr", text: "Accepte ce qu'on t'offre de raisonnable, commande ce qui est convenable et éloigne-toi des ignorants.", source: "Muhammad Hamidullah" },
      { language_code: "ar", text: "اقبل الفضل والعفو من أخلاق الناس وتجاوز عن تقصيرهم، وأمر بكل قول حسن وعمل معروف، وأعرض عن منازعة السفهاء.", source: "التفسير الميسر" }
    ],
    tafsirs: [
      { scholar_name: "Al-Sa'di", work_title: "Tafsir Al-Sa'di", text: "Al-Sa'di explique : Adoptez l'indulgence avec les gens en acceptant ce qui vient d'eux avec facilité sans exiger la perfection, ordonnez le bien et la bienveillance, et détournez-vous avec patience des provocations des ignorants.", language_code: "fr" },
      { scholar_name: "Al-Sa'di", work_title: "Tafsir Al-Sa'di", text: "Accept people's nature, do not demand perfection, command what is reasonably good, and ignore foolish provocations.", language_code: "en" },
      { scholar_name: "Al-Sa'di", work_title: "Tafsir Al-Sa'di", text: "Al-Sa'di förklarar: Ha överseende med människors natur och deras brister utan att kräva fullkomlighet, uppmana till det goda och vänd dig bort från provokationer från oförståndiga.", language_code: "sv" },
      { scholar_name: "Al-Sa'di", work_title: "Tafsir Al-Sa'di", text: "السعدي: خذ ما سهل من أخلاق الناس وسَمحت به نفوسهم ولا تكلفهم ما يشق عليهم، وأمر بكل قول وفعل جميل، وتغافل عن جهل السفهاء.", language_code: "ar" }
    ],
    surroundingVerses: {
      before: {
        verseNumber: "198",
        arabicText: "وَإِن تَدْعُوهُمْ إِلَى الْهُدَىٰ لَا يَسْمَعُوا ۖ وَتَرَاهُمْ يَنظُرُونَ إِلَيْكَ وَهُمْ لَا يُبْصِرُونَ",
        translations: {
          en: "And if you invite them to guidance, they do not hear; and you see them looking at you while they do not see.",
          sv: "Och om ni kallar dem till vägledningen hör de inte, och du ser dem rikta blicken mot dig men de ser ingenting.",
          fr: "Et si tu les appelles vers le droit chemin, ils n'entendent pas. Tu les vois qui te regardent, (mais) ils ne voient pas."
        }
      },
      after: {
        verseNumber: "200",
        arabicText: "وَإِمَّا يَنزَغَنَّكَ مِنَ الشَّيْطَانِ نَزْغٌ فَاسْتَعِذْ بِاللَّهِ ۚ إِنَّهُ سَمِيعٌ عَلِيمٌ",
        translations: {
          en: "And if an evil suggestion comes to you from Satan, then seek refuge in Allah. Indeed, He is Hearing and Knowing.",
          sv: "Och om Djävulen frestar dig till vrede, sök då skydd hos Gud! Han hör allt, vet allt.",
          fr: "Et si jamais le Diable t'incite à faire le mal, cherche refuge auprès d'Allah. Car Il entend, et sais tout."
        }
      }
    },
    topic: { slug: "forgiveness-character", title: "Dealing with Ignorance", life_domain: "growth" }
  }
];
