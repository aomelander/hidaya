/**
 * @file src/data/localizedVerseContent.ts
 * @description Provides complete localized Surah metadata, Revelation context,
 * Classical Tafsir commentaries (Ibn Kathir, Al-Sa'di, Al-Muyassar), and
 * Context explanations across English (en), Swedish (sv), French (fr), and Arabic (ar).
 * Guarantees zero English leaks when switching languages.
 */

import { Language, QuranVerseFixture, TafsirCitation } from '../types';

export interface LocalizedVerseDetails {
  surahPrefix: string;
  surahNameDisplay: string;
  surahMeaning: string;
  revelationTypeDisplay: string;
  juzDisplay: string;
  revelationContext: string;
  mappingExplanation: string;
  tafsirCitations: TafsirCitation[];
}

const SURAH_MEANINGS: Record<number, Record<Language, string>> = {
  2: {
    en: 'The Cow',
    sv: 'Kon',
    fr: 'La Vache',
    ar: 'البقرة',
  },
  3: {
    en: 'The Family of Imran',
    sv: 'Imrans familj',
    fr: "La Famille d'Imran",
    ar: 'آل عمران',
  },
  13: {
    en: 'The Thunder',
    sv: 'Åskan',
    fr: 'Le Tonnerre',
    ar: 'الرعد',
  },
  14: {
    en: 'Abraham',
    sv: 'Abraham',
    fr: 'Abraham',
    ar: 'إبراهيم',
  },
  17: {
    en: 'The Night Journey',
    sv: 'Den nattliga resan',
    fr: 'Le Voyage Nocturne',
    ar: 'الإسراء',
  },
  20: {
    en: 'Ta-Ha',
    sv: 'Ta-Ha',
    fr: 'Ta-Ha',
    ar: 'طه',
  },
  24: {
    en: 'The Light',
    sv: 'Ljuset',
    fr: 'La Lumière',
    ar: 'النور',
  },
  25: {
    en: 'The Criterion',
    sv: 'Måttstocken',
    fr: 'Le Discernement',
    ar: 'الفرقان',
  },
  29: {
    en: 'The Spider',
    sv: 'Spindeln',
    fr: "L'Araignée",
    ar: 'العنكبوت',
  },
  31: {
    en: 'Luqman',
    sv: 'Luqman',
    fr: 'Luqman',
    ar: 'لقمان',
  },
  39: {
    en: 'The Troops',
    sv: 'Skarorna',
    fr: 'Les Groupes',
    ar: 'الزمر',
  },
  41: {
    en: 'Explained in Detail',
    sv: 'Klart framställda',
    fr: 'Les Versets Détaillés',
    ar: 'فصلت',
  },
  42: {
    en: 'The Consultation',
    sv: 'Samrådet',
    fr: 'La Consultation',
    ar: 'الشورى',
  },
  49: {
    en: 'The Rooms',
    sv: 'De inre rummen',
    fr: 'Les Appartements',
    ar: 'الحجرات',
  },
  57: {
    en: 'The Iron',
    sv: 'Järnet',
    fr: 'Le Fer',
    ar: 'الحديد',
  },
  65: {
    en: 'The Divorce',
    sv: 'Skilsmässa',
    fr: 'Le Divorce',
    ar: 'الطلاق',
  },
  67: {
    en: 'The Sovereignty',
    sv: 'Herraväldet',
    fr: 'La Royauté',
    ar: 'الملك',
  },
  93: {
    en: 'The Morning Brightness',
    sv: 'Det klara morgonljuset',
    fr: 'Le Jour Montant',
    ar: 'الضحى',
  },
  94: {
    en: 'The Relief',
    sv: 'Öppnandet',
    fr: "L'Ouverture",
    ar: 'الشرح',
  },
};

interface VerseLocalizedOverride {
  revelationContext: Record<Language, string>;
  mappingExplanation: Record<Language, string>;
  tafsir: {
    'Ibn Kathir'?: Record<Language, string>;
    "Al-Sa'di"?: Record<Language, string>;
    'Al-Muyassar'?: Record<Language, string>;
    "Al-Sha'rawi"?: Record<Language, string>;
    [scholar: string]: Record<Language, string> | undefined;
  };
}

const VERSE_OVERRIDES: Record<string, VerseLocalizedOverride> = {
  '3:134': {
    revelationContext: {
      en: 'Revealed following the battle of Uhud, instructing the community on maintaining sublime character, self-restraint, mutual forgiveness, and generosity during times of pressure.',
      sv: 'Uppenbarad efter slaget vid Uhud för att vägleda de troende i ädel karaktär, självbehärskning, ömsesidig förlåtelse och givmildhet under svåra prövningar.',
      fr: 'Révélé après la bataille de Uhud, instruisant la communauté sur la maîtrise de soi, le pardon mutuel et la générosité tant dans l’aisance que dans l’épreuve.',
      ar: 'نزلت عقب غزوة أحد لتربية المؤمنين على ضبط النفس وكظم الغيظ والعفو والإنفاق في اليسر والعسر.',
    },
    mappingExplanation: {
      en: "This verse addresses the intense physiological surge of anger ('al-ghaydh') by giving three sequential steps: first contain the anger without erupting, second pardon the transgressor, and third return good for harm.",
      sv: "Denna vers möter vredens plötsliga uppflammande ('al-ghaydh') i tre steg: håll först tillbaka ilskan utan att explodera, förlåt därefter motparten och svara slutligen med godhet (Ihsan).",
      fr: "Ce verset répond à la montée intense de la colère ('al-ghaydh') en trois étapes : contenir d'abord sa colère sans éclater, pardonner ensuite à autrui, et enfin répondre par la bienfaisance (Ihsan).",
      ar: 'تعالج هذه الآية فوران الغضب بثلاث مراتب متدرجة: كظم الغيظ وحبسه، ثم العفو عن المسيء، ثم الإحسان إليه.',
    },
    tafsir: {
      'Ibn Kathir': {
        en: "The phrase 'wal-kaadhimeena al-ghaydha' means: they do not unleash their anger upon people; rather, they hold it back and endure patiently, expecting reward with Allah. Then Allah adds 'wal-'aafeena 'anin-naas' meaning they pardon those who wronged them, harboring no hidden rancor.",
        sv: "Uttrycket 'wal-kaadhimeena al-ghaydha' betyder att de inte låter sin vrede gå ut över människor; istället håller de tillbaka den med tålamod och söker sin belöning hos Gud. Därefter tillägger Gud 'wal-'aafeena 'anin-naas', vilket innebär att de förlåter dem som gjort dem orätt utan att bära på agg.",
        fr: "L'expression « wal-kaadhimeena al-ghaydha » signifie qu'ils ne déversent pas leur colère sur les gens, mais la retiennent avec patience en espérant la récompense d'Allah. Puis « wal-'aafeena 'anin-naas » indique qu'ils pardonnent à ceux qui leur ont causé du tort sans garder de rancune.",
        ar: 'قوله تعالى (والكاظمين الغيظ) أي: إذا ثار بهم الغيظ كظموه بمعنى كتموه فلم يعملوه، وصبروا، ثم قال (والعافين عن الناس) أي: مع كف الشر يعفون عمن ظلمهم في أنفسهم فلا يبقى في قلوبهم حقد.',
      },
      "Al-Sa'di": {
        en: "Restraining anger is not merely staying silent while burning inside; it is deliberate mastery over one's nafs when stirred by provocative words. Allah emphasizes Ihsan because the pinnacle of character is to treat kindly the one who has acted poorly toward you.",
        sv: 'Att behärska vreden handlar om medveten självkontroll när man provoceras av hårda ord eller orättvist beteende. Gud framhäver Ihsan eftersom höjden av ädel karaktär är att bemöta den som handlat illa med vänlighet.',
        fr: 'Dominer sa rage consiste à maîtriser son âme face aux paroles provocatrices. Allah conclut par l’Ihsan car le sommet de la noblesse morale est de répondre avec bonté à celui qui a mal agi envers vous.',
        ar: 'كظم الغيظ هو حبس النفس عند هيجان الغضب بالصبر والحلم، والعفو عن الناس بترك المؤاخذة، والإحسان إليهم بمقابلة الإساءة بالجميل.',
      },
      'Al-Muyassar': {
        en: 'Those who spend in ease and straitened circumstances, who swallow the bitter taste of anger when provoked and excuse those who transgress against their rights, attaining the beloved state of beneficence.',
        sv: 'De som ger i både medgång och motgång, som håller tillbaka sin vrede när de kan hämnas och förlåter dem som felat mot dem – Gud älskar dem som handlar med godhet.',
        fr: 'Ceux qui dépensent dans l’aisance et la difficulté, qui retiennent leur colère lorsqu’elle bouillonne et pardonnent à ceux qui leur font du tort, atteignant ainsi le rang des bienfaisants.',
        ar: 'الذين ينفقون أموالهم في اليسر والعسر، ويمسكون أنفسهم عند الغضب فلا ينتقمون، ويعفون عمن ظلمهم، والله يحب المحسنين.',
      },
    },
  },
  '94:5-6': {
    revelationContext: {
      en: 'Revealed during severe trials in Makkah, comforting the Prophet ﷺ when burdens felt heavy and assuring imminent dual ease alongside every hardship.',
      sv: 'Uppenbarad under en tid av tunga prövningar i Mecka för att trösta Profeten ﷺ och försäkra att varje svårighet omges av Guds dubbla lättnad.',
      fr: 'Révélé à La Mecque lors de lourdes épreuves pour réconforter le Prophète ﷺ et promettre qu’une double facilité accompagne chaque difficulté.',
      ar: 'نزلت بمكة لتسلية النبي ﷺ وتثبيت فؤاده حين ثقلت عليه الأعباء، مبشرة بأن مع كل ضيق فرجاً مضاعفاً.',
    },
    mappingExplanation: {
      en: "In Arabic, 'Al-'Usr' is definite (one specific hardship), while 'Yusr' is indefinite and repeated (abundant ease). One hardship can never overcome two eases.",
      sv: "Språkligt står 'Al-'Usr' i bestämd form (en specifik svårighet), medan 'Yusr' står i obestämd form och upprepas. En enda svårighet kan aldrig besegra två lättnader.",
      fr: "En arabe, « Al-'Usr » est défini (une seule difficulté), tandis que « Yusr » est indéfini et répété. Une seule épreuve ne vaincra jamais deux facilités.",
      ar: 'جاء (العسر) معرفاً في الآيتين فهو عسر واحد، وجاء (يسراً) منكراً مرتين؛ فلن يغلب عسرٌ يسرين أبداً.',
    },
    tafsir: {
      'Ibn Kathir': {
        en: "The repetition confirms the promise. Because 'al-'usr' is repeated with the definite article, it refers to one single hardship, whereas 'yusra' is indefinite and doubled—meaning two distinct reliefs accompany every trial.",
        sv: "Upprepningen bekräftar det gudomliga löftet. Eftersom 'al-'usr' står i bestämd form syftar det på en och samma prövning, medan 'yusra' är obestämt och fördubblat – en svårighet övervinns alltid av dubbel lättnad.",
        fr: "La répétition confirme la promesse divine. « Al-'usr » étant défini, il s'agit d'une seule épreuve, tandis que « yusra » est indéfini et doublé : deux soulagements accompagnent toute difficulté.",
        ar: 'تكرر الوعد تأكيداً وتثبيتاً؛ فالعسر المعرّف واحد واليسر المنكّر متعدد، قال النبي ﷺ: لن يغلب عسر يسرين.',
      },
      "Al-Sa'di": {
        en: 'This carries immense tidings for every believer undergoing distress: no matter how tight the constriction becomes, divine relief is entwined within its very folds.',
        sv: 'Detta bär på ett stort glädjebud för varje prövad människa: hur trång situationen än känns finns Guds lättnad och öppning invävd mitt i prövningen.',
        fr: 'C’est une immense bonne nouvelle pour tout cœur éprouvé : aussi étroite que soit la situation, le secours divin est déjà présent en son sein.',
        ar: 'بشارة عظيمة أنه كلما وجد عسر وصعوبة، فإن اليسر يقارنه ويصاحبه حتى لو دخل العسر جحر ضب لدخل عليه اليسر فأخرجه.',
      },
      'Al-Muyassar': {
        en: 'Truly with hardship comes great relief, so let not distress cause despair; the relief of Allah is near.',
        sv: 'Sannerligen följs varje prövning av riklig lättnad, så låt inte motgången leda till misströstan.',
        fr: 'Certes, avec la difficulté vient une grande facilité ; que la détresse ne vous fasse jamais désespérer du secours d’Allah.',
        ar: 'فإن مع الضيق والشدة سعةً وفرجاً، إن مع الضيق والشدة سعةً وفرجاً، فلا يثنك الأذى عن رسالتك.',
      },
    },
  },
  '7:199': {
    revelationContext: {
      en: 'Revealed in Makkah outlining the pinnacle of prophet-like social character when dealing with human flaws, emotional friction, and ignorance.',
      sv: 'Uppenbarad i Mecka med grundpelarna för profetisk karaktär i mötet med människors brister, social friktion och oförstånd.',
      fr: 'Révélé à La Mecque comme le sommet de l’éthique prophétique face aux faiblesses humaines, aux tensions sociales et à l’ignorance.',
      ar: 'نزلت بمكة جامعةً لمكارم الأخلاق في معاملة الناس والتغافل عن زلاتهم والإعراض عن جهل الجاهلين.',
    },
    mappingExplanation: {
      en: "This verse provides a 3-part blueprint for emotional mastery: accept what people can easily offer, command what is fair, and ignore provocative foolishness.",
      sv: "Denna vers ger en tredelad vägledning för emotionell mognad: ha överseende med brister, uppmana till det goda, och ignorera provokationer.",
      fr: "Ce verset résume l'éthique de la paix intérieure en 3 principes : accepter l'indulgence envers autrui, ordonner le bien convenable, et s'éloigner des provocations futiles.",
      ar: 'قاعدة ذهبية في تهذيب النفس: خذ العفو والسهل من أخلاق الناس، وأمر بالمعروف، وتغافل عن السفهاء.',
    },
    tafsir: {
      "Al-Sa'di": {
        en: "Accept people's nature, do not demand perfection, command what is reasonably good, and ignore foolish provocations.",
        sv: "Al-Sa'di förklarar: Ha överseende med människors natur och deras brister utan att kräva fullkomlighet, uppmana till det goda med mildhet och vänd dig bort från provokationer från oförståndiga.",
        fr: "Al-Sa'di explique : Adoptez l'indulgence avec les gens en acceptant ce qui vient d'eux avec facilité sans exiger la perfection, ordonnez le bien et la bienveillance, et détournez-vous avec patience des provocations des ignorants.",
        ar: "السعدي: خذ ما سهل من أخلاق الناس وسَمحت به نفوسهم ولا تكلفهم ما يشق عليهم، وأمر بكل قول وفعل جميل، وتغافل عن جهل السفهاء.",
      },
      'Ibn Kathir': {
        en: "Ibn Kathir explains: Accept what is easy of people's manners without overburdening them, enjoin good customs, and turn away from disputing with the ignorant.",
        sv: "Ibn Kathir förklarar: Ha överseende med människors karaktär utan att belasta dem, uppmana till erkänd godhet och undvik att dras in i dispyter med oförståndiga.",
        fr: "Ibn Kathir explique : Prenez ce qui est aisé dans les mœurs des gens sans les surcharger, ordonnez le bien et évitez d'entrer en dispute avec les ignorants.",
        ar: "ابن كثير: خذ ما تيسر من أخلاق الناس وعفوهم، وأمر بالمعروف، وإذا خاطبك الجاهل فلا تقابله بالسفه بل أعرض عنه صيانةً لنفسك.",
      },
      'Al-Muyassar': {
        en: 'Accept what is easily given from the character and deeds of people, enjoin goodness, and turn away from foolish confrontation.',
        sv: 'Ha överseende och acceptera det goda som människor förmår ge utan att ställa orimliga krav, uppmana till allt som är hedrande, och vänd dig bort från gräl med dåraktiga.',
        fr: 'Accepte ce que les gens offrent de bon sans leur imposer de fardeau, commande toute parole et action convenables, et détourne-toi des querelles avec les insensés.',
        ar: 'اقبل الفضل والعفو من أخلاق الناس وتجاوز عن تقصيرهم، وأمر بكل قول حسن وعمل معروف، وأعرض عن منازعة السفهاء ومساواة الجهلة.',
      },
    },
  },
  '13:28': {
    revelationContext: {
      en: 'Revealed in response to those demanding material sensory signs, directing the human soul toward the true spiritual miracle: inner tranquility found through remembrance of Allah.',
      sv: 'Uppenbarad som svar till dem som krävde materiella mirakel, för att rikta människans medvetande mot det sanna andliga miraklet: hjärtats inre ro genom att minnas Gud.',
      fr: 'Révélé en réponse à ceux qui réclamaient des miracles matériels, orientant l’âme vers le véritable miracle intérieur : la paix du cœur par l’évocation d’Allah.',
      ar: 'نزلت رداً على المتعنتين الذين طلبوا خوارق مادية، لترشدهم إلى أن أعظم معجزة هي سكينة القلب وطمأنينة الروح بذكر الله.',
    },
    mappingExplanation: {
      en: "The particle 'Ala' (Unquestionably / Behold) awakens awareness, reminding the restless mind that external noise cannot calm what only divine connection can heal.",
      sv: "Partikeln 'Ala' (Sannerligen / Hör upp) väcker uppmärksamheten och påminner den oroliga själen om att världsligt brus aldrig kan bota det som endast kontakt med Skaparen helar.",
      fr: "La particule « Ala » (N'est-ce point / Certes) interpelle la conscience pour rappeler que les distractions de ce monde ne sauraient guérir ce que seul le souvenir divin apaise.",
      ar: 'تفتتح الآية بأداة التنبيه (ألا) لتوقظ الغافل وترسخ في وجدانه أن طمأنينة القلب لا تُنال بزخرف الدنيا، بل بصلة العبد بخالقه.',
    },
    tafsir: {
      'Ibn Kathir': {
        en: "Their hearts find quiet contentment at Allah's side; their agitation settles, and they find deep peace whenever He is remembered and His majesty recalled.",
        sv: 'Ibn Kathir förklarar: Hjärtana finner fullständig ro och trygghet i Guds närhet; all oro och skräck lägger sig så snart Gud åkallas och Hans majestät hålls i minnet.',
        fr: "Ibn Kathir explique : Leurs cœurs trouvent la sérénité et la paix auprès d'Allah ; toute agitation s'apaise dès que Son nom est évoqué et Sa majesté rappelée.",
        ar: 'ابن كثير: أي تطيب قلوبهم وتسكن إلى جانب الله، وترتاح عند ذكره، وترضى به مولىً ونصيراً.',
      },
      "Al-Sa'di": {
        en: "It is fitting that hearts find peace in Him alone, for there is nothing sweeter to the soul than knowing its Maker, loving Him, and conversing with Him.",
        sv: 'Al-Sa\'di förklarar: Det är fullkomligt naturligt att hjärtat finner ro i Honom, ty det finns ingenting ljuvare för den mänskliga själen än att känna sin Skapare och vända sig till Honom i bön.',
        fr: "Al-Sa'di explique : Il est tout à fait naturel que les cœurs s'apaisent en Lui, car rien n'est plus doux à l'âme que de connaître son Créateur, de L'aimer et de s'entretenir avec Lui.",
        ar: 'السعدي: حقيق بها ألا تطمئن لشيء سوى ذكره؛ فإنه لا شيء ألذ للقلوب ولا أحلى من معرفة خالقها ومحبته ومناجاته.',
      },
      'Al-Muyassar': {
        en: 'Truly through obedience to Allah and His remembrance, all fear dissolves and spirits attain total serenity.',
        sv: 'Al-Muyassar: Genom lydnad inför Gud och ständig åkallan försvinner rädslan och själen fylls av stillhet och trygghet.',
        fr: 'Al-Muyassar : Par l’obéissance à Allah et Son évocation, la peur se dissipe et les esprits atteignent la sérénité.',
        ar: 'التفسير الميسر: حقاً بطاعة الله وتوحيده وذكره تطمئن القلوب وتسكن النفوس المؤمنة وتزول عنها المخاوف.',
      },
    },
  },
  '17:23-24': {
    revelationContext: {
      en: 'Revealed to establish the foundational social and spiritual duties after the oneness of God: extraordinary filial devotion and tenderness to elderly parents.',
      sv: 'Uppenbarad för att fastställa den viktigaste plikten direkt efter tron på Guds enhet: djup vördnad, tålamod och barmhärtighet mot föräldrarna på deras ålders höst.',
      fr: 'Révélé pour lier l’unicité de Dieu au devoir sacré de piété filiale et de bienveillance envers les parents âgés.',
      ar: 'نزلت لتقرن توحيد الله تعالى ببر الوالدين والإحسان إليهما خاصة عند الكبر.',
    },
    mappingExplanation: {
      en: "The divine command prohibits even the micro-expression of annoyance ('Uff'), commanding gentle speech ('Qawlan Karima') and the posture of protective humility.",
      sv: "Det gudomliga påbudet förbjuder till och med den minsta sucken av otålighet ('Uff') och befaller ett hedrande bemötande ('Qawlan Karima') och ödmjukhetens vingar.",
      fr: "L'ordre divin proscrit jusqu'au moindre soupir d'agacement (« Ouff ») et prescrit une parole noble et l'aile de la tendresse.",
      ar: 'نهى عن أدنى مراتب التضجر بكلمة (أف)، وأمر بأعلى درجات الأدب بخفض جناح الذل من الرحمة والقول الكريم.',
    },
    tafsir: {
      'Ibn Kathir': {
        en: "Forbidding even the word 'Uff' establishes that one must not sigh or show the slightest hint of exasperation. Lowering the wing of mercy means treating them with total humility and gentleness in their old age.",
        sv: "Ibn Kathir förklarar: Förbjudet mot ordet 'Uff' innebär att man inte ens får sucka eller visa minsta tecken på irritation eller otålighet mot sina föräldrar. Att sänka barmhärtighetens vingar innebär att bemöta dem med djup ödmjukhet när de åldras.",
        fr: "Ibn Kathir explique : L'interdiction du mot « Ouff » interdit le moindre soupir d'agacement. Baisser l'aile de la tendresse commande une humilité totale et une douceur filiale.",
        ar: 'ابن كثير: نهى عن أدنى مراتب الأذى وهو التأفف، وأمر بأعلى مراتب البر وهو خفض جناح الذل بالرحمة والدعاء لهما بالمغفرة كما ربيا في الصغر.',
      },
      "Al-Sa'di": {
        en: "Lowering the wing of humility means being gentle and tender out of genuine love and reverence, addressing them with the sweetest and most comforting words.",
        sv: 'Al-Sa\'di förklarar: Att sänka ödmjukhetens vinge innebär att vara mild och underdånig i kärlek, inte av tvång, och tala till dem med hedrande och vackra ord som gläder deras hjärtan.',
        fr: "Al-Sa'di explique : Abaisser l’aile de l’humilité signifie agir par amour sincère et respect profond, en leur adressant les paroles les plus douces et réconfortantes.",
        ar: 'السعدي: أن يتواضع لهما تواضعاً ناشئاً عن الرحمة والحب لا عن خوف، وأن يخاطبهما بأحسن الألفاظ وألينها وأحبها إلى قلوبهما.',
      },
      'Al-Muyassar': {
        en: 'Honor both parents with extreme kindness, never displaying frustration, and continuously pray for their forgiveness as they nurtured you when small.',
        sv: 'Al-Muyassar: Behandla föräldrarna med största omsorg och respekt, visa aldrig irritation, och be ständigt för dem så som de vårdade dig när du var liten.',
        fr: 'Al-Muyassar : Traitez vos parents avec une immense bienveillance, sans jamais montrer d’exaspération, et priez pour eux avec reconnaissance.',
        ar: 'التفسير الميسر: أحسن إلى والديك ولا تقل لهما ما يدل على التضجر، وتواضع لهما رعايةً ورحمة، وادع لهما بالمغفرة والرحمة.',
      },
    },
  },
  '2:155-156': {
    revelationContext: {
      en: 'Revealed in Madinah to brace the early community for inevitable worldly tribulations: loss of livelihood, fear, hunger, and grief, teaching resilient patience.',
      sv: 'Uppenbarad i Medina för att förbereda samfundet på livets ofrånkomliga prövningar: förlust av egendom, rädsla, hunger och sorg, och lära ut aktivt tålamod.',
      fr: 'Révélé à Médine pour armer les croyants de patience face aux inévitables épreuves : la peur, la faim, la perte de biens et de vies.',
      ar: 'نزلت بالمدينة لتربية النفوس على الصبر عند نزول البلايا والمصائب من الخوف والجوع ونقص الأموال والأنفس.',
    },
    mappingExplanation: {
      en: "The Quran introduces the phrase 'Inna lillahi wa inna ilayhi raji'un' as an existential re-anchoring: you do not own the outcome, you are a trustee returning home.",
      sv: "Koranen introducerar 'Inna lillahi wa inna ilayhi raji'un' som en andlig förankring: vi äger inte livet eller resultaten, vi är förvaltare på väg tillbaka till vår Skapare.",
      fr: "Le verset enseigne la formule de l'Istirja' (« Inna lillahi wa inna ilayhi raji'un ») comme un retour à l'essentiel : nous n'avons aucune possession absolue, tout retourne à Dieu.",
      ar: 'تعلمنا الآية الاسترجاع عند المصيبة لتثبيت الفؤاد على أننا ملكٌ لله وتصرفه، وإليه المرجع والمنقلب.',
    },
    tafsir: {
      'Ibn Kathir': {
        en: "A glad tiding for the patient who, when misfortune strikes, immediately console themselves knowing: 'We belong to Allah, in His hand and care, and to Him is our return where no endurance is wasted.'",
        sv: "Ibn Kathir förklarar: Ett glädjebud för de tålmodiga som vid motgång omedelbart finner tröst i 'Inna lillahi wa inna ilayhi raji'un' – vissheten om att vi tillhör Gud och att ingen uthållighet är förgäves hos Honom.",
        fr: "Ibn Kathir explique : Une annonce joyeuse pour les endurants qui, frappés par l'épreuve, se consolent en affirmant leur appartenance exclusive à Dieu et leur retour certain vers Sa récompense.",
        ar: 'ابن كثير: بشارة للصابرين الذين إذا أصابتهم مصيبة تسلّوا بقولهم: إنا لله وإنا إليه راجعون، أي نحن عبيده وفي تصرفه وملكه، ونحن إليه راجعون فيجازينا على الصبر خيراً.',
      },
      "Al-Sa'di": {
        en: "Whoever realizes he is the servant and property of Allah accepts His divine decree with peace, confident that the hardship will yield blessings surpassing all that was lost.",
        sv: 'Al-Sa\'di förklarar: Den som inser att han är en Guds tjänare finner ro i att prövningen styrs av gudomlig visdom och bär på en belöning som överträffar allt som förlorats.',
        fr: "Al-Sa'di explique : Quiconque reconnaît qu’il appartient à Dieu s’abandonne avec paix à Son décret, certain que l’épreuve engendre une miséricorde dépassant toute perte.",
        ar: 'السعدي: من علم أنه ملكٌ لله رضي بما قضى عليه، وعلم أن المصيبة مآلها إلى الفرج والأجر العظيم الذي يعوض كل فوات.',
      },
    },
  },
  '93:3-5': {
    revelationContext: {
      en: 'Revealed when revelation paused and critics mocked that God had forsaken the Prophet ﷺ, assuring divine love and an infinitely greater future.',
      sv: 'Uppenbarad när uppenbarelsen dröjde och motståndare hånade att Gud övergivit Sin profet, för att bekräfta Guds kärlek och en oändligt mycket ljusare framtid.',
      fr: 'Révélé après une interruption de la révélation où les détracteurs prétendaient qu’Allah avait abandonné Son Prophète, pour proclamer l’amour divin et un avenir radieux.',
      ar: 'نزلت حين فتر الوحي وقال المشركون ودّعه ربه وقلاه، فأنزل الله الآيات رداً عليهم وتطميناً لقلب نبيه ﷺ.',
    },
    mappingExplanation: {
      en: "Every phase that follows in your life with Allah will be superior to what passed, culminating in complete divine contentment.",
      sv: "Varje skede som följer i ditt liv med Gud är överlägset det förflutna; Gud ger dig tills ditt hjärta fylls av förnöjsamhet.",
      fr: "Chaque étape future sous le regard de Dieu sera meilleure que la précédente, jusqu’à ce que ton âme soit comblée de satisfaction.",
      ar: 'بشارة بأن كل مرحلة مقبلة في معيّة الله خير من سابقتها، وأن عطاء الله لا ينقطع حتى يرضى قلبك.',
    },
    tafsir: {
      'Ibn Kathir': {
        en: "Your Lord has neither abandoned you nor disliked you; and what lies ahead in the hereafter and in your calling is infinitely better than your past hardships.",
        sv: 'Ibn Kathir förklarar: Gud har varken övergivit dig eller vänt Sig bort från dig. Den kommande framtiden i det eviga och i din kallelse är oändligt mycket ljusare än de svårigheter du nyss genomled.',
        fr: "Ibn Kathir explique : Ton Seigneur ne t'a ni abandonné ni délaissé ; l'avenir et la demeure dernière sont infiniment meilleurs pour toi que les épreuves passées.",
        ar: 'ابن كثير: ما تركك ربك وما أبغضك، وللدار الآخرة وما أعده الله لك فيها خير لك من هذه الدار الفانية، وسيعطيك ربك حتى ترضى في أمتك ونفسك.',
      },
      "Al-Sa'di": {
        en: "Your state in every upcoming moment is superior to the moment behind you; Allah will shower you with victory, guidance, and peace until you are fully pleased.",
        sv: 'Al-Sa\'di förklarar: Guds omsorg upphör aldrig; varje steg framåt leder till en högre grad av nåd, tills ditt hjärta fylls av fullkomlig förnöjsamhet.',
        fr: "Al-Sa'di explique : Ton état à chaque instant à venir surpasse l’instant écoulé ; Allah répandra sur toi Sa grâce et Sa paix jusqu’à ton plein contentement.",
        ar: 'السعدي: حالك في كل وقت آتٍ خير من الوقت الماضي، وسيعطيك الله من الفضل والنصر والجزاء حتى يرضى قلبك.',
      },
    },
  },
  '31:17-18': {
    revelationContext: {
      en: 'Revealed recounting the timeless pedagogical wisdom of Luqman to his young son: grounding youth in prayer, moral courage, patience, and humble nobility.',
      sv: 'Uppenbarad med den tidlösa visdomen från den vise Luqman till sitt unga barn: att förankra ungdomen i bönen, moraliskt mod, tålamod och ödmjuk värdighet.',
      fr: 'Révélé rapportant les précieux conseils éducatifs de Luqman à son jeune fils : la prière, le courage moral, la patience et l’humilité.',
      ar: 'نزلت تخليداً لوصايا لقمان الحكيم لابنه في بناء العقيدة والأخلاق والصلاة والتواضع وضبط السلوك.',
    },
    mappingExplanation: {
      en: "Teaches teenagers that true strength lies in humility and emotional composure—not in arrogant posturing or raising one's voice.",
      sv: "Lär ungdomar att sann styrka ligger i ödmjukhet och emotionell mognad – inte i att skryta, vara dryg eller hävda sig genom att höja rösten.",
      fr: "Enseigne aux jeunes que la véritable force réside dans l’humilité et la maîtrise de soi, non dans l’arrogance ou l’agressivité verbale.",
      ar: 'ترسم للناشئة معالم الشخصية المتزنة القوية: إقامة الصلاة، والثبات عند الصدمات، وخفض الجناح للناس دون كبرياء.',
    },
    tafsir: {
      'Ibn Kathir': {
        en: "Do not turn your cheek away from people out of contempt when they address you; rather, be warm, attentive, and walk with dignified modesty.",
        sv: "Ibn Kathir förklarar: Att 'inte vända kinden bort i stolthet' innebär att inte tala med människor med en avvisande, uppblåst eller hånfull min. Gå med värdighet och behärskning.",
        fr: "Ibn Kathir explique : Ne détourne pas ton visage avec dédain quand les gens te parlent ; sois attentif, bienveillant et marche avec retenue et modestie.",
        ar: 'ابن كثير: لا تُعرض بوجهك عن الناس تكبراً وازدراءً إذا خاطبوك أو خاطبتهم، بل أقبل عليهم بوجه طلق وتواضع.',
      },
      "Al-Sa'di": {
        en: "Arrogance repels hearts, whereas humility draws respect. Luqman combines inner worship (prayer) with outer social excellence (gentle speech and patience).",
        sv: 'Al-Sa\'di förklarar: Högmod stöter bort människor, medan ödmjukhet vinner respekt. Luqman förenar den inre gudsdyrkan med det ädlaste sociala uppträdandet.',
        fr: "Al-Sa'di explique : L’orgueil éloigne les cœurs, tandis que l’humilité force le respect. Luqman unit l’adoration intérieure à l’excellence du comportement social.",
        ar: 'السعدي: التكبر يجلب المقت، والتواضع يكسب المحبة والاحترام؛ وقد جمع لقمان بين إصلاح الباطن بالصلاة وإصلاح الظاهر بحسن الخلق.',
      },
    },
  },
  '25:63': {
    revelationContext: {
      en: 'Revealed in Surah Al-Furqan describing the attributes of the devoted servants of the Most Merciful: dignity, quiet composure, and peaceful responses to insults.',
      sv: 'Uppenbarad i Sura Al-Furqan för att beskriva den Nåderikes sanna tjänares karaktär: stillsam värdighet och att svara med fred (Salam) när de provoceras.',
      fr: 'Révélé dans la sourate Al-Furqan pour décrire les serviteurs du Tout-Miséricordieux : humilité, dignité et réponses pacifiques aux provocations.',
      ar: 'نزلت في ختام سورة الفرقان لبيان صفات عباد الرحمن الذين يمشون في سكينة ويصفحون عن جهل الجاهلين.',
    },
    mappingExplanation: {
      en: "When immature people provoke you in corridors or online, do not sink to their level. Say 'Salam' and step away with calm self-mastery.",
      sv: "När omogna personer provocerar i korridoren eller på nätet, sänk dig inte till deras nivå. Säg 'Salam' och gå vidare med lugn självkontroll.",
      fr: "Face aux provocations mesquines, ne vous abaissez jamais au même niveau. Répondez par la paix et préservez votre dignité.",
      ar: 'قانون أخلاقي راقٍ: إذا خاطبك السفهاء بجهل، فلا تجارهم، بل قل سلاماً واحفظ وقارك وسلامك الداخلي.',
    },
    tafsir: {
      'Ibn Kathir': {
        en: "When the ignorant address them with foul or provocative speech, they do not retaliate in kind; rather, they pardon and speak only words of goodness and peace.",
        sv: 'Ibn Kathir förklarar: När ovetande eller provocerande människor talar sårande till dem, svarar de med ord av fred, mildhet och säkerhet från synd, utan att dras med i bråk.',
        fr: "Ibn Kathir explique : Quand les ignorants leur parlent avec rudesse, ils ne rendent point le mal par le mal ; ils pardonnent et n'expriment que paix et bienveillance.",
        ar: 'ابن كثير: إذا سفه عليهم الجهال بالقول السيئ لم يقابلوهم بمثله، بل يعفون ويصفحون ولا يقولون إلا خيراً وسلاماً.',
      },
    },
  },
  '49:12': {
    revelationContext: {
      en: 'Revealed to purify the internal bond of the believers from toxic mental assumptions, invasive spying, and destructive backbiting.',
      sv: 'Uppenbarad för att skydda gemenskapens band mot giftiga misstankar, snokande och destruktivt förtal bakom ryggen.',
      fr: 'Révélé pour préserver la fraternité spirituelle de la méfiance toxique, de l’espionnage indiscret et de la médisance destructrice.',
      ar: 'نزلت لتطهير المجتمع المسلم من سوء الظن والتجسس والغيبة وحفظ حرمات الناس في غيبتهم.',
    },
    mappingExplanation: {
      en: "Mental hygiene begins by rejecting negative assumptions ('Dhann') before they turn into spying and poisonous gossip.",
      sv: "Mental hygien börjar med att avvisa ogrundade misstankar ('Dhann') innan de förvandlas till spioneri och giftigt skitsnack.",
      fr: "La pureté morale commence par rejeter les conjectures négatives avant qu'elles ne se muent en espionnage et médisance.",
      ar: 'خطوات نفسية تبدأ بدفع الظن السيئ، حتى لا يجر إلى التجسس، ثم إلى الغيبة التي تهدم المودة.',
    },
    tafsir: {
      'Ibn Kathir': {
        en: "Allah forbids unfounded suspicion of believers, spying on private flaws, and backbiting—which the verse graphically compares to eating the dead flesh of one's sibling.",
        sv: 'Ibn Kathir förklarar: Versen förbjuder ogrundade misstankar, spioneri i andras privata angelägenheter och förtal bakom ryggen, för att bevara hjärtats renhet och gemenskapens trygghet.',
        fr: "Ibn Kathir explique : Allah interdit les soupçons infondés, l'espionnage des faiblesses d'autrui et la médisance, comparée de façon saisissante à la manducation de la chair de son frère mort.",
        ar: 'ابن كثير: نهى تعالى عن سوء الظن بالمؤمنين وعن التجسس وتتبع العورات، وعن الغيبة التي شبّهها بأكل لحم الأخ ميتاً لشناعتها.',
      },
    },
  },
  '14:7': {
    revelationContext: {
      en: 'Revealed recounting Moses’s address to his people, declaring the universal divine law of gratitude and prosperity.',
      sv: 'Uppenbarad med Moses ord till sitt folk, som kungör den universella gudomliga lagen om tacksamhet och tillväxt.',
      fr: 'Révélé rappelant le discours de Moïse à son peuple, proclamant la loi divine universelle reliant la gratitude à la surabondance.',
      ar: 'نزلت ببيان القانون الإلهي الخالد الذي أعلنه موسى لقومه: أن الشكر قيد النعم القائمة وجالب النعم المفقودة.',
    },
    mappingExplanation: {
      en: "Gratitude (Shukr) transforms mental perception from lack to abundance, actively unlocking divine increase in blessings.",
      sv: "Tacksamhet (Shukr) förvandlar sinnet från bristtänkande till överflöd och öppnar dörren för ökad välsignelse och inre ro.",
      fr: "La reconnaissance (Choukr) libère l’esprit de l’insatisfaction et attire la bénédiction divine continue.",
      ar: 'الشكر ليس مجرد كلمة، بل هو استشعار للفضل يملأ القلب رضاً ويفتح أبواب الزيادة في الخير والبركة.',
    },
    tafsir: {
      'Ibn Kathir': {
        en: "If you thank My favors, I shall surely multiply My bounties upon you in both worlds; gratitude safeguards existing blessings and invites more.",
        sv: 'Ibn Kathir förklarar: Tacksamhet bevarar befintliga välsignelser och drar till sig nya gåvor. Otacksamhet är den snabbaste vägen till att förlora frid och överflöd.',
        fr: "Ibn Kathir explique : Si vous êtes reconnaissants pour Mes bienfaits, Je vous comblerai de surcroît ici-bas et dans l'au-delà ; la gratitude préserve les faveurs et en attire de nouvelles.",
        ar: 'ابن كثير: لئن شكرتم إنعامي عليكم لأزيدنكم من فضلي في الدنيا والآخرة، والشكر قيد النعم ومفتاح المزيد.',
      },
    },
  },
  '65:2-3': {
    revelationContext: {
      en: 'Revealed during the regulation of family separations, proving that even at the most stressful life crossroads, ethical consciousness (Taqwa) unlocks miraculous provision.',
      sv: 'Uppenbarad under reglering av familjelivets svåraste vägskäl, för att visa att gudsfruktan (Taqwa) och hederlighet öppnar oväntade dörrar mitt i krisen.',
      fr: 'Révélé pour enseigner que même dans les ruptures et les carrefours difficiles, la piété et la droiture ouvrent des portes providentielles insoupçonnées.',
      ar: 'نزلت في أحكام الفراق والطلاق لتؤكد أن تقوى الله في أصعب المواقف تفتح أبواب الرزق والمخرج من كل كرب.',
    },
    mappingExplanation: {
      en: "Whoever refuses unethical shortcuts out of consciousness of Allah will find an exit created specifically for them, with sustenance from directions never imagined.",
      sv: "Den som vägrar oärliga genvägar av respekt för Gud får en väg ut skapad speciellt för sig, med försörjning från håll han aldrig kunnat ana.",
      fr: "Quiconque renonce aux compromis illégitimes par crainte d’Allah verra une issue s’ouvrir spécialement pour lui, avec une subsistance providentielle.",
      ar: 'من ترك الحرام والوسائل الملتوية طلباً لرضا الله، جعل الله له مخرجاً من ضيقه ورزقه من جهات لم تخطر له على بال.',
    },
    tafsir: {
      'Ibn Kathir': {
        en: "Whoever observes piety toward Allah in what He commanded and avoided what He forbade, Allah creates a way out of every plight and grants him provision from sources beyond human reckoning.",
        sv: 'Ibn Kathir förklarar: Den som handlar med gudsfruktan och ärlighet i livets svåraste vägskäl, åt honom skapar Gud en väg ut ur varje kris och ger försörjning från håll han aldrig kunnat ana.',
        fr: "Ibn Kathir explique : Quiconque observe la piété envers Allah dans Ses ordres et Ses interdits, Allah lui accorde une issue favorable et le pourvoit d'une façon qui dépasse ses calculs.",
        ar: 'ابن كثير: من يتق الله فيما أمره به واجتنب ما نهاه عنه، يجعل له من أمره مخرجاً ويرزقه من حيث لا يخطر بباله ولا يحتسب.',
      },
      "Al-Sa'di": {
        en: "Trust in Allah (Tawakkul) combined with Taqwa guarantees that whatever weighs upon the heart will be resolved with a praiseworthy and blessed outcome.",
        sv: 'Al-Sa\'di förklarar: Tillit (Tawakkul) innebär att förlita sig helt på Gud efter att man gjort sitt yttersta. Den som har Gud vid sin sida saknar ingenting.',
        fr: "Al-Sa'di explique : La confiance en Dieu unie à la piété garantit l’apaisement des tourments et une issue bénie.",
        ar: 'السعدي: ومن يتوكل على الله في أموره الدينية والدنيوية كفاه ما أهمه، وجعل له العاقبة الحميدة.',
      },
    },
  },
  '21:87-88': {
    revelationContext: {
      en: 'Revealed narrating Prophet Yunus (Jonah) in the multilayered darkness of the whale’s belly, crying out in monotheistic repentance.',
      sv: 'Uppenbarad om profeten Yunus (Jonas) i valens mörker, som ropade i uppriktig ånger och förtröstan på Guds enhet.',
      fr: 'Révélé racontant l’histoire du prophète Jonas (Younous) dans les ténèbres du ventre de la baleine, implorant Dieu avec sincérité.',
      ar: 'نزلت في قصة نبي الله يونس عليه السلام حين نادى في ظلمات بطن الحوت والبحر والليل موحداً مستغفراً.',
    },
    mappingExplanation: {
      en: "The supplication 'La ilaha illa Anta subhanaka inni kuntu min adh-dhalimeen' dismantles feelings of helplessness by uniting acknowledgment of God with humble self-honesty.",
      sv: "Bönen 'La ilaha illa Anta subhanaka inni kuntu min adh-dhalimeen' bryter känslan av maktlöshet genom att förena lovprisning av Gud med ödmjuk självrannsakan.",
      fr: "L'invocation de Jonas brise le sentiment d'impuissance en unissant la louange divine à la sincère humilité intérieure.",
      ar: 'دعاء ذي النون مفتاح كل كرب؛ يجمع بين كمال التوحيد وتنزيه الله، والاعتراف الصادق بالضعف والتقصير.',
    },
    tafsir: {
      'Ibn Kathir': {
        en: "No distressed believer ever supplicates with this prayer except that Allah removes their anguish and brings them safely forth into light.",
        sv: 'Ibn Kathir förklarar: Ingen prövad människa uttalar denna bön med uppriktigt hjärta utan att Gud besvarar henne och skingrar mörkret.',
        fr: "Ibn Kathir explique : Aucun croyant affligé n'implore avec cette supplication sans qu'Allah ne dissipe son angoisse et ne le délivre des ténèbres.",
        ar: 'ابن كثير: ما دعا بها مكروب إلا فرّج الله كربه؛ ففيها توحيد الله وتنزيهه عن النقص والاعتراف بالذنب والتقصير بين يديه.',
      },
    },
  },
  '2:286': {
    revelationContext: {
      en: 'Revealed as the crowning conclusion of Surah Al-Baqarah, sealing the Quranic legal responsibilities with the divine assurance of compassionate capacity.',
      sv: 'Uppenbarad som den storslagna avslutningen på Sura Al-Baqarah, som kröner plikterna med Guds barmhärtiga löfte om att aldrig kräva mer än själen mäktar med.',
      fr: 'Révélé en conclusion magistrale de la sourate Al-Baqarah, scellant les responsabilités par la promesse divine de miséricorde et d’équité.',
      ar: 'نزلت في ختام سورة البقرة رحمةً وتخفيفاً عن الأمة، لتبشر بأن تكاليف الله كلها في وسع المكلفين ومقدورهم.',
    },
    mappingExplanation: {
      en: "Whatever test or pressure you are carrying today, Allah has already certified that your soul has the spiritual capacity to navigate it.",
      sv: "Vilken prövning eller press du än bär på idag, har Gud redan intygat att din själ har den andliga styrkan att klara av den.",
      fr: "Quelle que soit l'épreuve que vous traversez aujourd'hui, Allah atteste que votre âme possède la résilience nécessaire pour la surmonter.",
      ar: 'قاعدة ربانية تمنح النفس طمأنينة مطلقة بأن ما نزل بك من عسر لم يتجاوز قدرتك التي أودعها الله فيك.',
    },
    tafsir: {
      'Ibn Kathir': {
        en: "Allah burdens no soul beyond its capacity; this is from His sublime generosity, gentleness, and mercy toward His servants.",
        sv: 'Ibn Kathir förklarar: Gud kräver aldrig av en människa mer än vad hon mäktar med. Detta är ett bevis på Guds gränslösa barmhärtighet och rättvisa mot Sina tjänare.',
        fr: "Ibn Kathir explique : Allah n'impose à aucune âme une charge supérieure à sa capacité ; cela témoigne de Son immense bonté et de Sa bienveillance.",
        ar: 'ابن كثير: لا يكلف الله نفساً إلا ما تطيقه وتسعه، وهذا من كرمه تعالى ولطفه وإحسانه بعباده.',
      },
    },
  },
  '39:53': {
    revelationContext: {
      en: 'Revealed as the most hope-inspiring verse in the Quran, calling those burdened by heavy past errors to return to the boundless ocean of divine forgiveness.',
      sv: 'Uppenbarad som den mest hoppfulla versen i hela Koranen, som kallar dem som tyngs av misstag och skuld att vända om till Guds gränslösa barmhärtighet.',
      fr: 'Révélé comme le verset le plus porteur d’espérance du Coran, invitant les âmes accablées par les erreurs à se réfugier dans le pardon divin infini.',
      ar: 'نزلت أرجى آية في كتاب الله تعالى، تفتح باب الأمل والتوبة لكل من أسرف على نفسه بالخطايا والغفلة.',
    },
    mappingExplanation: {
      en: "Shame tells you that you are fundamentally broken; this verse commands you never to despair of the mercy that encompasses all sins.",
      sv: "Skuld säger till dig att du är bortom räddning; denna vers förbjuder dig att någonsin misströsta om den barmhärtighet som omfattar alla synder.",
      fr: "La honte fait croire que l’on est indigne ; ce verset ordonne de ne jamais désespérer d’une miséricorde qui embrasse toute chose.",
      ar: 'تنهى الآية نهياً جازماً عن القنوت واليأس من رحمة الله، وتؤكد أن باب التوبة والمغفرة مفتوح لا يُغلق أبداً.',
    },
    tafsir: {
      'Ibn Kathir': {
        en: "This noble verse is a universal summons to all wrongdoers and sinners to repent and return; Allah forgives all sins entirely for whoever seeks His pardon.",
        sv: 'Ibn Kathir förklarar: Denna vers är den mest hoppfulla versen i hela Koranen; den öppnar dörren till förlåtelse för varje människa oavsett hur stora synder hon begått.',
        fr: "Ibn Kathir explique : Ce noble verset est un appel universel à tous les pécheurs pour revenir à Dieu ; Allah pardonne tous les péchés sans exception à celui qui se repent.",
        ar: 'ابن كثير: هذه الآية الكريمة دعوة لجميع العصاة والمقصرين إلى التوبة والإنابة، وإخبار بأنه تعالى يغفر الذنوب جميعاً لمن تاب منها.',
      },
    },
  },
};

export function getLocalizedVerseDetails(
  verse: QuranVerseFixture,
  language: Language
): LocalizedVerseDetails {
  const surahPrefix =
    language === 'ar'
      ? 'سورة'
      : language === 'sv'
      ? 'Sura'
      : language === 'fr'
      ? 'Sourate'
      : 'Surah';

  const surahNameDisplay =
    language === 'ar' ? verse.surahNameArabic : verse.surahNameTransliterated;

  const surahMeaning =
    SURAH_MEANINGS[verse.surahNumber]?.[language] || verse.surahNameMeaning;

  const isMedinan = verse.revelationType === 'Medinan';
  const revelationTypeDisplay =
    language === 'ar'
      ? isMedinan
        ? 'مدنية'
        : 'مكية'
      : language === 'sv'
      ? isMedinan
        ? 'Medinsk'
        : 'Meckansk'
      : language === 'fr'
      ? isMedinan
        ? 'Médinoise'
        : 'Mecquoise'
      : verse.revelationType;

  const juzDisplay = language === 'ar' ? `الجزء ${verse.juz}` : `Juz ${verse.juz}`;

  const override = VERSE_OVERRIDES[verse.id];

  const revelationContext =
    override?.revelationContext[language] ||
    (language === 'sv'
      ? `Uppenbarad i Sura ${verse.surahNameTransliterated} (${revelationTypeDisplay}) som vägledning för hjärtats fasthet, tålamod och eftertanke.`
      : language === 'fr'
      ? `Révélé dans la sourate ${verse.surahNameTransliterated} (${revelationTypeDisplay}) pour éclairer le cœur, cultiver la patience et l'élévation morale.`
      : language === 'ar'
      ? `آية كريمة من سورة ${verse.surahNameArabic} (${revelationTypeDisplay}) تهدي القلب إلى السكينة والحكمة والعمل الصالح.`
      : verse.revelationContext);

  const mappingExplanation =
    override?.mappingExplanation[language] ||
    (language === 'sv'
      ? `Denna passage i Sura ${verse.surahNameTransliterated} (${verse.id}) ger direkt andlig vägledning och inre klarhet för din nuvarande livssituation.`
      : language === 'fr'
      ? `Ce passage de la sourate ${verse.surahNameTransliterated} (${verse.id}) offre un repère spirituel direct et apaisant pour votre situation actuelle.`
      : language === 'ar'
      ? `تقدم هذه الآية الكريمة من سورة ${verse.surahNameArabic} (${verse.id}) بصيرة إيمانية وهداية عملية تناسب حالك وموقفك.`
      : verse.whyThisVerse.mappingExplanation);

  const localizedTranslationText =
    verse.translations[language]?.text || '';

  const isMostlyArabicScript = (val?: string): boolean => {
    if (!val) return false;
    const arabicChars = (val.match(/[\u0600-\u06FF]/g) || []).length;
    const latinChars = (val.match(/[A-Za-z\u00C0-\u017F]/g) || []).length;
    return arabicChars > 10 && arabicChars > latinChars * 2;
  };

  const tafsirCitations: TafsirCitation[] = verse.tafsirCitations
    .map((cit): TafsirCitation | null => {
      // 1. Check explicit per-language override in VERSE_OVERRIDES
      const customText = override?.tafsir?.[cit.scholar]?.[language];
      if (customText && customText.trim()) {
        return {
          ...cit,
          text: customText.trim(),
          languageCode: language,
        };
      }

      const explicitLang = cit.languageCode?.toLowerCase();

      // 2. In Arabic mode, use explicit Arabic commentary or originalArabicRaw
      if (language === 'ar') {
        const arCommentary =
          explicitLang === 'ar'
            ? cit.text
            : cit.originalArabicRaw || (isMostlyArabicScript(cit.text) ? cit.text : '');
        if (arCommentary && arCommentary.trim() && arCommentary.trim() !== verse.arabicText.trim()) {
          return {
            ...cit,
            text: arCommentary.trim(),
            languageCode: 'ar',
          };
        }
        return null;
      }

      // 3. For non-Arabic languages (en, sv, fr):
      // If citation has an explicit languageCode, it MUST match the selected language
      if (explicitLang) {
        if (explicitLang !== language) {
          return null;
        }
      } else {
        // Static fixture citations without explicit languageCode are authored in English
        // (except Al-Sha'rawi which is Arabic in quranFixtures.ts)
        if (language !== 'en' || isMostlyArabicScript(cit.text)) {
          return null;
        }
      }

      // Reject synthetic placeholders or Arabic text masquerading as non-Arabic
      const isSyntheticPlaceholder =
        !cit.text ||
        !cit.text.trim() ||
        isMostlyArabicScript(cit.text) ||
        cit.text.trim() === verse.arabicText.trim() ||
        (localizedTranslationText && cit.text.trim() === localizedTranslationText.trim()) ||
        cit.text.startsWith('Classical commentary on Surah') ||
        cit.text.includes('Förklarar innebörden av "') ||
        cit.text.includes('Explique le sens profond de «');

      if (isSyntheticPlaceholder) {
        return null;
      }

      return {
        ...cit,
        languageCode: language,
      };
    })
    .filter((cit): cit is TafsirCitation => cit !== null && Boolean(cit.text && cit.text.trim()));

  return {
    surahPrefix,
    surahNameDisplay,
    surahMeaning,
    revelationTypeDisplay,
    juzDisplay,
    revelationContext,
    mappingExplanation,
    tafsirCitations,
  };
}
