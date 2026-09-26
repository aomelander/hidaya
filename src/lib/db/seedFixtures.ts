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
      { language_code: "sv", text: "Och de som hörsammar sin Herres kallelse och förrättar bönen, och som i allt vad de företar sig rådgör med varandra, och som ger av det som Vi har skänkt dem,", source: "Knut Bernström" }
    ],
    tafsirs: [
      { scholar_name: "Ibn Kathir", work_title: "Tafsir Ibn Kathir", text: "They do not make a decision without consulting one another, to ensure that their actions are based on consensus and wisdom.", language_code: "en" }
    ],
    topic: { slug: "decisions-consultation", title: "Decisions & Consultation", life_domain: "workplace" }
  },
  {
    surah: { number: 3, name_arabic: "آل عمران", name_english: "Ali 'Imran", revelation_place: "Madinah" },
    ayah: { ayah_number: 159, text_uthmani: "فَبِمَا رَحْمَةٍ مِّنَ اللَّهِ لِنتَ لَهُمْ ۖ وَلَوْ كُنتَ فَظًّا غَلِيظَ الْقَلْبِ لَانفَضُّوا مِنْ حَوْلِكَ ۖ فَاعْفُ عَنْهُمْ وَاسْتَغْفِرْ لَهُمْ وَشَاوِرْهُمْ فِي الْأَمْرِ ۖ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ ۚ إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ", text_clean: "فبما رحمة من الله لنت لهم ولو كنت فظا غليظ القلب لانفضوا من حولك فاعف عنهم واستغفر لهم وشاورهم في الأمر فإذا عزمت فتوكل على الله إن الله يحب المتوكلين" },
    translations: [
      { language_code: "en", text: "So by mercy from Allah, [O Muhammad], you were lenient with them. And if you had been rude [in speech] and harsh in heart, they would have disbanded from about you...", source: "Saheeh International" },
      { language_code: "sv", text: "I Sin barmhärtighet lät Gud dig visa dem mildhet; om du hade varit sträng och hårdhjärtad hade de helt säkert dragit sig ifrån dig.", source: "Knut Bernström" }
    ],
    tafsirs: [
      { scholar_name: "Al-Sa'di", work_title: "Tafsir Al-Sa'di", text: "Consultation brings about love, unites hearts, and helps in reaching the correct decision.", language_code: "en" }
    ],
    topic: { slug: "leadership-mercy", title: "Leadership & Mercy", life_domain: "workplace" }
  },
  {
    surah: { number: 17, name_arabic: "الإسراء", name_english: "Al-Isra", revelation_place: "Makkah" },
    ayah: { ayah_number: 23, text_uthmani: "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا", text_clean: "وقضى ربك ألا تعبدوا إلا إياه وبالوالدين إحسانا إما يبلغن عندك الكبر أحدهما أو كلاهما فلا تقل لهما أف ولا تنهرهما وقل لهما قولا كريما" },
    translations: [
      { language_code: "en", text: "And your Lord has decreed that you not worship except Him, and to parents, good treatment. Whether one or both of them reach old age [while] with you, say not to them [so much as], \"uff,\" and do not repel them but speak to them a noble word.", source: "Saheeh International" },
      { language_code: "sv", text: "Er Herre har befallt, att ni inte skall dyrka någon annan än Honom. Och [Han har anbefallt er] att visa godhet mot [era] föräldrar. Om en av dem eller båda uppnår hög ålder hos dig, säg då inte \"Uff\" till dem och snäs inte av dem, utan tala till dem med respekt.", source: "Knut Bernström" }
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
      { language_code: "sv", text: "Troende! Bland era hustrur och era barn finns de som [kan bli] era fiender; var alltså på er vakt mot dem! Men om ni har överseende [med dem] och förlåter dem, [skall ni veta att] Gud är ständigt förlåtande, barmhärtig.", source: "Knut Bernström" }
    ],
    tafsirs: [
      { scholar_name: "Al-Sa'di", work_title: "Tafsir Al-Sa'di", text: "Sometimes love for family leads one to compromise their religious duties. One must be careful, yet forgiving and merciful in family conflicts.", language_code: "en" }
    ],
    topic: { slug: "family-conflict", title: "Family Conflict", life_domain: "family" }
  },
  {
    surah: { number: 51, name_arabic: "الذاريات", name_english: "Adh-Dhariyat", revelation_place: "Makkah" },
    ayah: { ayah_number: 56, text_uthmani: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ", text_clean: "وما خلقت الجن والإنس إلا ليعبدون" },
    translations: [
      { language_code: "en", text: "And I did not create the jinn and mankind except to worship Me.", source: "Saheeh International" },
      { language_code: "sv", text: "Jag har skapat de osynliga väsendena och människorna enbart för att de skall dyrka Mig.", source: "Knut Bernström" }
    ],
    tafsirs: [
      { scholar_name: "Ibn Kathir", work_title: "Tafsir Ibn Kathir", text: "The primary purpose of existence is to know Allah, worship Him alone, and align one's life with His guidance.", language_code: "en" }
    ],
    topic: { slug: "purpose-worship", title: "Purpose of Life", life_domain: "questions" }
  },
  {
    surah: { number: 67, name_arabic: "الملك", name_english: "Al-Mulk", revelation_place: "Makkah" },
    ayah: { ayah_number: 2, text_uthmani: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ", text_clean: "الذي خلق الموت والحياة ليبلوكم أيكم أحسن عملا وهو العزيز الغفور" },
    translations: [
      { language_code: "en", text: "[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -", source: "Saheeh International" },
      { language_code: "sv", text: "Han som har skapat döden och livet för att sätta er på prov [och se] vem av er som i sina handlingar är bäst. Han är den Mäktige, Den som ständigt förlåter.", source: "Knut Bernström" }
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
      { language_code: "sv", text: "Troende! Slå vakt om rätten och rättvisan och träd fram som vittnen inför Gud, även om det skulle vara mot er själva eller era föräldrar och nära anhöriga.", source: "Knut Bernström" }
    ],
    tafsirs: [
      { scholar_name: "Ibn Kathir", work_title: "Tafsir Ibn Kathir", text: "Justice is absolute and must be upheld even if it contradicts personal interests or the interests of close family.", language_code: "en" }
    ],
    topic: { slug: "justice", title: "Upholding Justice", life_domain: "growth" }
  },
  {
    surah: { number: 5, name_arabic: "المائدة", name_english: "Al-Ma'idah", revelation_place: "Madinah" },
    ayah: { ayah_number: 8, text_uthmani: "وَلَا يَجْرِمَنَّكُمْ شَنَآنُ قَوْمٍ عَلَىٰ أَلَّا تَعْدِلُوا ۚ اعْدِلُوا هُوَ أَقْرَبُ لِلتَّقْوَىٰ", text_clean: "ولا يجرمنكم شنآن قوم على ألا تعدلوا اعدلوا هو أقرب للتقوى" },
    translations: [
      { language_code: "en", text: "And do not let the hatred of a people prevent you from being just. Be just; that is nearer to righteousness.", source: "Saheeh International" },
      { language_code: "sv", text: "Och låt inte avsky för [vissa] människor driva er till orättvisa; [nej] var rättvisa - detta ligger gudsfruktan närmast.", source: "Knut Bernström" }
    ],
    tafsirs: [
      { scholar_name: "Al-Sa'di", work_title: "Tafsir Al-Sa'di", text: "True piety involves maintaining fairness and justice even towards one's enemies or those one dislikes.", language_code: "en" }
    ],
    topic: { slug: "justice-enemies", title: "Justice to Enemies", life_domain: "growth" }
  },
  {
    surah: { number: 39, name_arabic: "الزمر", name_english: "Az-Zumar", revelation_place: "Makkah" },
    ayah: { ayah_number: 53, text_uthmani: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا", text_clean: "قل يا عبادي الذين أسرفوا على أنفسهم لا تقنطوا من رحمة الله إن الله يغفر الذنوب جميعا" },
    translations: [
      { language_code: "en", text: "Say, \"O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins.\"", source: "Saheeh International" },
      { language_code: "sv", text: "Säg: \"Mina tjänare, ni som har gjort orätt mot er själva, misströsta inte om Guds nåd! Gud förlåter alla synder.\"", source: "Knut Bernström" }
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
      { language_code: "sv", text: "de som tror och vilkas hjärtan finner ro i ihågkommandet av Gud - ja, i ihågkommandet av Gud finner hjärtat ro!", source: "Knut Bernström" }
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
      { language_code: "sv", text: "Gud lägger inte på någon en tyngre börda än han kan bära. Det goda han har gjort skall räknas honom till förtjänst och det onda han har gjort skall läggas honom till last.", source: "Knut Bernström" }
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
      { language_code: "sv", text: "Gör det till en regel att ha överseende och förlåta, uppmana till allt vad som är rätt och riktigt, och vänd dig ifrån de oförståndiga.", source: "Knut Bernström" }
    ],
    tafsirs: [
      { scholar_name: "Al-Sa'di", work_title: "Tafsir Al-Sa'di", text: "Accept people's nature, do not demand perfection, command what is reasonably good, and ignore foolish provocations.", language_code: "en" }
    ],
    topic: { slug: "forgiveness-character", title: "Dealing with Ignorance", life_domain: "growth" }
  }
];
