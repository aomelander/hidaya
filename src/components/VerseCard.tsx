"use client";

/**
 * @file src/components/VerseCard.tsx
 * @description Calm, minimalist Quranic Verse Card with 100% localization (EN, SV, FR, AR),
 * age-adaptive companion guidance (Adult, Teen, Kids), synchronized word-by-word Arabic
 * recitation highlighting, inline Vertical Story Card (9:16) PNG export, mood-tagged
 * reflections, Arabic root imagery, and Family Halaqah circle questions—all with zero popups.
 *
 * Enforces the 4-level hierarchy:
 * - Level 1: Verified Uthmani Arabic (always visible, with live word-by-word highlight during playback)
 * - Level 2: Certified Human Translation (always visible)
 * - Level 3: Classical Tafsir (expands inline inside the card, localized)
 * - Level 4: Personal 4-Step Reflection & Age-Adaptive Companion (expands inline, clearly tagged)
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Users,
  Heart,
  ShieldCheck,
  FileText,
  Plus,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Film,
  Share2,
  Trash2,
  Send,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Palette,
} from 'lucide-react';
import {
  QuranVerseFixture,
  Language,
  ExplanationDepth,
  PerspectiveMode,
  ReaderProfile,
  ReflectionMood,
  PreferredScholar,
  TafsirCitation,
  SocialComment,
  VerseCardPreferences,
  WordTimestamp,
} from '../types';
import { AudioPlayer, AudioSourceTier } from './AudioPlayer';
import { StorageService } from '../services/storage';
import { getLocalizedVerseDetails } from '../data/localizedVerseContent';
import { getAgeAdaptiveContent } from '../data/ageAdaptiveContent';
import { ScholarProvenanceModal } from './ScholarProvenanceModal';
import { AyahCartouche } from './AyahCartouche';
const SocialCreationStudio = React.lazy(() => import('./SocialCreationStudio').then(m => ({ default: m.SocialCreationStudio })));
import { VerseWordByWordView } from './audio/VerseWordByWordView';
import { VerseMemorizationView } from './audio/VerseMemorizationView';
import { TajweedText } from './audio/TajweedText';
import { ThumbActionRail } from './mobile/ThumbActionRail';
import {
  resolveArabicVerseWordTimestamps,
  findActiveWordIndexByMs,
  buildWeightedWordTimestamps,
} from '../lib/audio/wordTimestampsResolver';

import { expandPassage, PassageSelection, visibleVerseNumbers } from '../services/passageSelection';

interface VerseCardProps {
  selection?: PassageSelection;
  onSelectionChange?: (selection: PassageSelection) => void;
  verse: QuranVerseFixture;
  nextVerse?: QuranVerseFixture;
  language: Language;
  arabicScale: number;
  readingScale?: number;
  cardIndex?: number;
  totalCards?: number;
  showTransliteration: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (verseId: string) => void;
  onReflectionSaved?: () => void;
  onOpenTafsir?: (verse: QuranVerseFixture) => void;
  onOpenReflection?: (verse: QuranVerseFixture) => void;
  onOpenHalaqah?: (verse: QuranVerseFixture) => void;
  onOpenVisualCard?: (verse: QuranVerseFixture) => void;
  sourceIndicator?: string;
  explanationDepth?: ExplanationDepth;
  perspectiveMode?: PerspectiveMode;
  readerProfile?: ReaderProfile;
  preferredScholar?: PreferredScholar;
  onNavigateToRead?: (surahNumber: number, ayahNumber: number) => void;
  onNextVerse?: () => void;
  onPreviousVerse?: () => void;
  isActive?: boolean;
  isGlobalPlaying?: boolean;
  isContinuousReading?: boolean;
  onToggleContinuousReading?: () => void;
  cardPreferences?: VerseCardPreferences;
}

type InlineSection = 'none' | 'tafsir';

const MOOD_LABELS: Record<Language, Record<ReflectionMood, string>> = {
  en: {
    calm: 'Calm',
    anxious: 'Anxious',
    grateful: 'Grateful',
    hopeful: 'Hopeful',
    overwhelmed: 'Overwhelmed',
  },
  sv: {
    calm: 'Lugn',
    anxious: 'Orolig',
    grateful: 'Tacksam',
    hopeful: 'Hoppfull',
    overwhelmed: 'Överväldigad',
  },
  fr: {
    calm: 'Apaisé',
    anxious: 'Anxieux',
    grateful: 'Reconnaissant',
    hopeful: 'Plein d’espoir',
    overwhelmed: 'Submergé',
  },
  ar: {
    calm: 'مطمئن',
    anxious: 'قلق',
    grateful: 'شاكر',
    hopeful: 'متفائل',
    overwhelmed: 'مرهق',
  },
};

const UI_TEXT: Record<
  Language,
  {
    copyTooltip: string;
    storyCardTooltip: string;
    storyCardSaved: string;
    bookmarkTooltip: string;
    removeBookmarkTooltip: string;
    tafsirTab: string;
    reflectionTab: string;
    contextTab: string;
    revelationLabel: string;
    saveBtn: string;
    savedBtn: string;
    moodLabel: string;
    step1Title: string;
    step2Title: string;
    step2Placeholder: string;
    step3Title: string;
    step3Placeholder: string;
    step4Title: string;
    step4Placeholder: string;
    notSayingTitle: string;
    beforeVerse: string;
    afterVerse: string;
    rootImageryTitle: string;
    teenTakeawayTitle: string;
    teenGlossaryTitle: string;
    viewProvenanceBtn: string;
    badgeClassical: string;
    badgeAiTranslated: string;
    badgeAiSynthesis: string;
    originalArabicSnippetTitle: string;
    exportPPTX: string;
    exportPDF: string;
    reflectionNotepadTitle: string;
    reflectionNotepadHint: string;
    reflectionNotepadPlaceholder: string;
    tafsirNoDataText: string;
    socialLikeTooltip: string;
    socialCommentsBtn: string;
    socialStudioBtn: string;
    socialShareBtn: string;
    sharedSuccess: string;
    commentsThreadTitle: string;
    commentsEmpty: string;
    addCommentPlaceholder: string;
    postCommentBtn: string;
    prevVerseBtn: string;
    nextVerseBtn: string;
  }
> = {
  en: {
    copyTooltip: 'Copy verse',
    storyCardTooltip: 'Download Story Card (9:16 PNG)',
    storyCardSaved: 'Card Saved',
    bookmarkTooltip: 'Save verse to Journal',
    removeBookmarkTooltip: 'Remove from Journal',
    tafsirTab: 'Tafsir',
    reflectionTab: 'Reflection',
    contextTab: 'Context',
    revelationLabel: 'Revelation Context',
    saveBtn: 'Save to Journal',
    savedBtn: 'Saved to Journal',
    moodLabel: 'How are you feeling right now?',
    step1Title: '01. Understand',
    step2Title: '02. Reflect on Your Situation',
    step2Placeholder: 'Write your thoughts or feelings on this verse...',
    step3Title: '03. Practical Step',
    step3Placeholder: 'One concrete action or pause you will take...',
    step4Title: '04. Carry Today',
    step4Placeholder: 'One reminder to carry in your heart today...',
    notSayingTitle: 'Contextual Boundary',
    beforeVerse: 'Preceding Verse',
    afterVerse: 'Following Verse',
    rootImageryTitle: 'Arabic Root Imagery',
    teenTakeawayTitle: 'Key Takeaway for Your Day',
    teenGlossaryTitle: 'Quick Concept Guide',
    viewProvenanceBtn: 'View Original Arabic Source & Provenance',
    badgeClassical: 'Classical Scholar',
    badgeAiTranslated: 'AI Translation of Scholar Lecture',
    badgeAiSynthesis: 'AI Reflection Synthesis',
    originalArabicSnippetTitle: 'Verbatim Arabic Source Snippet',
    exportPPTX: 'Export PPTX',
    exportPDF: 'Print / PDF',
    reflectionNotepadTitle: 'Personal Reflection & Journal Note',
    reflectionNotepadHint: 'Saved locally to your private Journal',
    reflectionNotepadPlaceholder: 'Take a quiet moment to reflect. Write your thoughts, reflections, feelings, or a personal action or prayer inspired by this verse...',
    tafsirNoDataText: 'No verified classical exegesis is currently indexed in this language for this scholar. Tap View Original Arabic Source or switch scholar.',
    socialLikeTooltip: 'Like / Bookmark',
    socialCommentsBtn: 'Comments & Reflections',
    socialStudioBtn: 'Creation Studio',
    socialShareBtn: 'Share',
    sharedSuccess: 'Link copied!',
    commentsThreadTitle: 'Reflections & Community Notes',
    commentsEmpty: 'Be the first to share a reflection on this Ayah.',
    addCommentPlaceholder: 'Share your reflections, a practical step, or a prayer...',
    postCommentBtn: 'Post',
    prevVerseBtn: 'Previous Ayah',
    nextVerseBtn: 'Next Ayah',
  },
  sv: {
    copyTooltip: 'Kopiera vers',
    storyCardTooltip: 'Ladda ner Story-kort (9:16 PNG)',
    storyCardSaved: 'Kort sparat',
    bookmarkTooltip: 'Spara vers i dagbok',
    removeBookmarkTooltip: 'Ta bort från dagbok',
    tafsirTab: 'Tafsir',
    reflectionTab: 'Reflektion',
    contextTab: 'Sammanhang',
    revelationLabel: 'Uppenbarelsekontext',
    saveBtn: 'Spara i dagbok',
    savedBtn: 'Sparad!',
    moodLabel: 'Hur känner du dig just nu?',
    step1Title: '01. Förstå',
    step2Title: '02. Reflektera över din situation',
    step2Placeholder: 'Skriv dina tankar eller känslor kring denna vers...',
    step3Title: '03. Praktiskt steg',
    step3Placeholder: 'En konkret handling eller paus du tar...',
    step4Title: '04. Bär med dig idag',
    step4Placeholder: 'En påminnelse att bära med dig i vardagen...',
    notSayingTitle: 'Kontextuell gränsdragning',
    beforeVerse: 'Föregående vers',
    afterVerse: 'Efterföljande vers',
    rootImageryTitle: 'Arabiskt bildspråk & rot',
    teenTakeawayTitle: 'Viktig lärdom för din vardag',
    teenGlossaryTitle: 'Snabb ordlista',
    viewProvenanceBtn: 'Visa ursprunglig källtext & proveniens',
    badgeClassical: 'Klassisk lärd',
    badgeAiTranslated: 'AI-översättning av föreläsning',
    badgeAiSynthesis: 'AI-reflektionssyntes',
    originalArabicSnippetTitle: 'Ordagrant arabiskt källutdrag',
    exportPPTX: 'Exportera PPTX',
    exportPDF: 'Skriv ut / PDF',
    reflectionNotepadTitle: 'Personlig reflektion & anteckning',
    reflectionNotepadHint: 'Sparas lokalt i din privata dagbok',
    reflectionNotepadPlaceholder: 'Ta en stilla stund för eftertanke. Skriv dina egna tankar, känslor, en praktisk handling eller bön inspirerad av denna vers...',
    tafsirNoDataText: 'Ingen verifierad kommentar är tillgänglig för denna lärd på detta språk ännu. Klicka på Visa ursprunglig källtext eller byt lärd.',
    socialLikeTooltip: 'Gilla / Spara',
    socialCommentsBtn: 'Kommentarer & Reflektioner',
    socialStudioBtn: 'Skapelsestudio',
    socialShareBtn: 'Dela',
    sharedSuccess: 'Länk kopierad!',
    commentsThreadTitle: 'Reflektioner & Samtal',
    commentsEmpty: 'Bli den första att dela en reflektion om denna vers.',
    addCommentPlaceholder: 'Dela dina tankar, en praktisk handling eller bön...',
    postCommentBtn: 'Publicera',
    prevVerseBtn: 'Föregående vers',
    nextVerseBtn: 'Nästa vers',
  },
  fr: {
    copyTooltip: 'Copier le verset',
    storyCardTooltip: 'Télécharger la carte Story (9:16 PNG)',
    storyCardSaved: 'Carte enregistrée',
    bookmarkTooltip: 'Enregistrer dans le journal',
    removeBookmarkTooltip: 'Retirer du journal',
    tafsirTab: 'Tafsir',
    reflectionTab: 'Méditation',
    contextTab: 'Contexte',
    revelationLabel: 'Contexte de révélation',
    saveBtn: 'Enregistrer',
    savedBtn: 'Enregistré !',
    moodLabel: 'Comment vous sentez-vous en cet instant ?',
    step1Title: '01. Comprendre',
    step2Title: '02. Méditer sur votre situation',
    step2Placeholder: 'Notez vos pensées ou ressentis personnels...',
    step3Title: '03. Action concrète',
    step3Placeholder: 'Un geste ou temps de pause à appliquer...',
    step4Title: "04. Emporter aujourd'hui",
    step4Placeholder: 'Un rappel à garder dans votre cœur...',
    notSayingTitle: 'Limite contextuelle',
    beforeVerse: 'Verset précédent',
    afterVerse: 'Verset suivant',
    rootImageryTitle: 'Racine arabe & image littérale',
    teenTakeawayTitle: "L'essentiel pour ta journée",
    teenGlossaryTitle: 'Repères clés',
    viewProvenanceBtn: 'Consulter la source arabe originale & audit',
    badgeClassical: 'Savant classique',
    badgeAiTranslated: 'Traduction IA de conférence',
    badgeAiSynthesis: 'Synthèse de méditation IA',
    originalArabicSnippetTitle: 'Extrait arabe original textuel',
    exportPPTX: 'Exporter PPTX',
    exportPDF: 'Imprimer / PDF',
    reflectionNotepadTitle: 'Méditation personnelle & journal',
    reflectionNotepadHint: 'Enregistré localement dans votre journal',
    reflectionNotepadPlaceholder: 'Prenez un instant de recueillement. Notez vos pensées, ressentis, résolutions personnelles ou invocations inspirées de ce verset...',
    tafsirNoDataText: 'Aucun commentaire vérifié n’est actuellement indexé dans cette langue pour ce savant. Consultez la source arabe originale ou changez d’exégète.',
    socialLikeTooltip: 'Aimer / Favoris',
    socialCommentsBtn: 'Commentaires & Méditations',
    socialStudioBtn: 'Studio de Création',
    socialShareBtn: 'Partager',
    sharedSuccess: 'Lien copié !',
    commentsThreadTitle: 'Fil de Réflexions & Méditations',
    commentsEmpty: 'Soyez le premier à partager une réflexion sur ce verset.',
    addCommentPlaceholder: 'Partagez vos pensées, une action concrète ou une prière...',
    postCommentBtn: 'Publier',
    prevVerseBtn: 'Verset précédent',
    nextVerseBtn: 'Verset suivant',
  },
  ar: {
    copyTooltip: 'نسخ الآية',
    storyCardTooltip: 'تحميل بطاقة القصة (9:16 PNG)',
    storyCardSaved: 'تم الحفظ',
    bookmarkTooltip: 'حفظ في اليوميات',
    removeBookmarkTooltip: 'إزالة من اليوميات',
    tafsirTab: 'التفسير',
    reflectionTab: 'التدبر',
    contextTab: 'السياق',
    revelationLabel: 'سبب النزول والسياق',
    saveBtn: 'حفظ في اليوميات',
    savedBtn: 'تم الحفظ',
    moodLabel: 'بماذا يشعر قلبك الآن؟',
    step1Title: '٠١. الفهم والتأمل',
    step2Title: '٠٢. إسقاط الآية على واقعك',
    step2Placeholder: 'اكتب خواطرك ومشاعرك حول هذه الآية...',
    step3Title: '٠٣. الخطوة العملية',
    step3Placeholder: 'عمل محدد أو وقفة هادئة ستلتزم بها...',
    step4Title: '٠٤. أثر تحمله اليوم',
    step4Placeholder: 'معنى تحمله في قلبك طوال يومك...',
    notSayingTitle: 'تنبيه وضبط سياقي',
    beforeVerse: 'الآية السابقة',
    afterVerse: 'الآية اللاحقة',
    rootImageryTitle: 'الصورة اللغوية والجذر',
    teenTakeawayTitle: 'خلاصة مُلهمة ليومك',
    teenGlossaryTitle: 'دليل المفاهيم السريع',
    viewProvenanceBtn: 'عرض النص العربي الأصلي وتوثيق المصدر',
    badgeClassical: 'عالم كلاسيكي موثق',
    badgeAiTranslated: 'ترجمة آلية لمحاضرة عالم',
    badgeAiSynthesis: 'صياغة تدبرية بالذكاء الاصطناعي',
    originalArabicSnippetTitle: 'النص العربي المنقول بلفظه',
    exportPPTX: 'تصدير عارض (PPTX)',
    exportPDF: 'طباعة / PDF',
    reflectionNotepadTitle: 'خواطر التدبر وتدوين اليوميات',
    reflectionNotepadHint: 'تُحفظ محلياً في يومياتك الخاصة',
    reflectionNotepadPlaceholder: 'وقفة تدبر ومحاسبة هادئة... سجّل خواطرك ومشاعرك، عهداً تقطعه على نفسك، أو دعاءً يفيض به قلبك مستوحى من هذه الآية الكريمة...',
    tafsirNoDataText: 'لا يتوفر نص تفسيري موثق لهذا المفسر بهذه اللغة حالياً. انقر على عرض النص العربي الأصلي أو اختر مفسراً آخر.',
    socialLikeTooltip: 'إعجاب / حفظ',
    socialCommentsBtn: 'التعليقات والتدبرات',
    socialStudioBtn: 'استوديو الإنشاء',
    socialShareBtn: 'مشاركة',
    sharedSuccess: 'تم نسخ الرابط!',
    commentsThreadTitle: 'خواطر وتدبرات الآية',
    commentsEmpty: 'كن أول من يشارك خاطرة تدبرية حول هذه الآية الكريمة.',
    addCommentPlaceholder: 'شارك خواطرك الإيمانية، عملاً صالحاً، أو دعاءً...',
    postCommentBtn: 'نشر',
    prevVerseBtn: 'الآية السابقة',
    nextVerseBtn: 'الآية التالية',
  },
};

const toArabicDigits = (num: number | string): string => {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => digits[parseInt(d, 10)] || d);
};

export const VerseCard: React.FC<VerseCardProps> = ({
  verse,
  nextVerse,
  selection = {},
  onSelectionChange,
  language,
  arabicScale,
  readingScale = 1.0,
  cardIndex,
  totalCards,
  showTransliteration,
  isBookmarked,
  onToggleBookmark,
  onReflectionSaved,
  readerProfile = 'adult',
  preferredScholar = 'Ibn Kathir',
  onNavigateToRead,
  onNextVerse,
  onPreviousVerse,
  isActive,
  isGlobalPlaying = false,
  isContinuousReading = false,
  onToggleContinuousReading,
  cardPreferences,
}) => {
  const [activeSection, setActiveSection] = useState<InlineSection>('none');
  const [copied, setCopied] = useState(false);
  const [storyExported, setStoryExported] = useState(false);

  // Universal preferences state synced with storage and preferences sheet
  const [cardPrefs, setCardPrefs] = useState<VerseCardPreferences>(() => ({
    ...StorageService.getCardPreferences(),
    ...(cardPreferences || {}),
    showTransliteration,
  }));

  useEffect(() => {
    if (cardPreferences) {
      setCardPrefs((prev) => ({ ...prev, ...cardPreferences }));
    }
  }, [cardPreferences]);

  useEffect(() => {
    const handlePrefChange = (e?: Event) => {
      const detail = (e as CustomEvent)?.detail;
      setCardPrefs((prev) => ({
        ...prev,
        ...StorageService.getCardPreferences(),
        ...(detail || {}),
      }));
    };
    window.addEventListener('hidaya-preferences-updated', handlePrefChange);
    window.addEventListener('storage', handlePrefChange);
    return () => {
      window.removeEventListener('hidaya-preferences-updated', handlePrefChange);
      window.removeEventListener('storage', handlePrefChange);
    };
  }, []);

  const handleUpdateCardPref = (updates: Partial<VerseCardPreferences>) => {
    StorageService.setCardPreferences(updates);
    window.dispatchEvent(new CustomEvent('hidaya-preferences-updated', { detail: updates }));
    setCardPrefs((prev) => ({ ...prev, ...updates }));
  };

  // Set default tafsir open if configured in preferences
  useEffect(() => {
    if (cardPrefs.showTafsirByDefault && activeSection === 'none') {
      setActiveSection('tafsir');
    }
  }, [cardPrefs.showTafsirByDefault]);

  // Social comments and creation studio state
  const [showComments, setShowComments] = useState(false);
  const [socialComments, setSocialComments] = useState<SocialComment[]>(() =>
    StorageService.getSocialComments(verse.id)
  );
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentMood, setNewCommentMood] = useState<ReflectionMood | undefined>(undefined);
  const [showStudio, setShowStudio] = useState(false);
  const [sharedSuccess, setSharedSuccess] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [muteNotice, setMuteNotice] = useState<'muted' | 'unmuted' | null>(null);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  // Sync global mute state
  useEffect(() => {
    const handleMuteChange = (e: Event) => {
      const muted = (e as CustomEvent)?.detail?.isMuted;
      if (typeof muted === 'boolean') {
        setIsAudioMuted(muted);
      }
    };
    window.addEventListener('hidaya-mute-state', handleMuteChange);
    return () => window.removeEventListener('hidaya-mute-state', handleMuteChange);
  }, []);

  const triggerGlobalMute = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    setMuteNotice(nextMuted ? 'muted' : 'unmuted');
    setTimeout(() => setMuteNotice(null), 1000);
    window.dispatchEvent(
      new CustomEvent('hidaya-global-toggle-play', {
        detail: { action: 'toggle-mute' },
      })
    );
  };

  const triggerHaptic = (pattern: number | number[] = 15) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore haptic errors
      }
    }
  };

  useEffect(() => {
    setSocialComments(StorageService.getSocialComments(verse.id));
  }, [verse.id]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const updated = StorageService.addSocialComment(verse.id, newCommentText, newCommentMood);
    setSocialComments(updated);
    setNewCommentText('');
    setNewCommentMood(undefined);
  };

  const handleDeleteComment = (commentId: string) => {
    const updated = StorageService.deleteSocialComment(verse.id, commentId);
    setSocialComments(updated);
  };

  const handleShare = () => {
    setShowComments(false);
    setShowStudio((prev) => !prev);
    triggerHaptic(15);
    setTimeout(() => {
      const studioEl = cardRef.current?.querySelector('[data-creation-studio="true"]');
      studioEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  };

  const handleToggleComments = () => {
    setShowStudio(false);
    setShowComments((prev) => !prev);
    triggerHaptic(15);
    setTimeout(() => {
      const commentsEl = cardRef.current?.querySelector('[data-comments-thread="true"]');
      commentsEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  };

  // DOM Refs for Smart Teleprompter Auto-Scroll
  const cardRef = useRef<HTMLElement | null>(null);
  const arabicSectionRef = useRef<HTMLElement | null>(null);
  const translationSectionRef = useRef<HTMLElement | null>(null);
  const tafsirSectionRef = useRef<HTMLDivElement | null>(null);

  // Optional inclusion of adjacent preceding/following single verse when needed for context
  const includeBefore = Boolean(selection.before);
  const includeAfter = Boolean(selection.after);
  const expandedPassage = useMemo(() => expandPassage(verse, selection), [verse, selection]);

  // Word-by-word recitation & translation sync state (with exact millisecond timestamps)
  const [playbackRatio, setPlaybackRatio] = useState(0);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isReciting, setIsReciting] = useState(false);
  const [playbackPhase, setPlaybackPhase] = useState<'recitation' | 'translation' | 'tafsir' | 'idle'>('idle');
  const [audioSources, setAudioSources] = useState<{
    translation: AudioSourceTier | null;
    tafsir: AudioSourceTier | null;
    translationTimestamps?: WordTimestamp[];
    tafsirTimestamps?: WordTimestamp[];
  }>({ translation: null, tafsir: null });
  const [arabicTimestamps, setArabicTimestamps] = useState<WordTimestamp[]>([]);
  const [hasExactArabicTimestamps, setHasExactArabicTimestamps] = useState(false);

  // Preferred scholar & provenance modal state
  const [selectedScholar, setSelectedScholar] = useState<string>(preferredScholar);
  const [provenanceModalOpen, setProvenanceModalOpen] = useState(false);
  const [dynamicShaarawiCitation, setDynamicShaarawiCitation] = useState<TafsirCitation | null>(
    null
  );

  // Auto-scroll on active phase shift (Arabic -> Translation -> Tafsir)
  useEffect(() => {
    if (!isReciting) return;
    if (playbackPhase === 'recitation') {
      arabicSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (playbackPhase === 'translation') {
      translationSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (playbackPhase === 'tafsir') {
      setActiveSection('tafsir');
      tafsirSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [playbackPhase, isReciting]);

  // Touch & Tap Gesture Detection:
  // - Horizontal Swipe: Left/Right to advance to Next/Previous Ayah (with haptic feedback)
  // - Single-Tap: Instant Mute / Unmute (Instagram / TikTok Reels behavior)
  // - Double-Tap: Instant Like (♥) with Instagram-style bursting heart animation & haptic pulse
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const duration = Date.now() - touchStartTime.current;
    touchStartX.current = null;
    touchStartY.current = null;

    // Check if user tapped an interactive element (buttons, inputs, cartouche, word blocks)
    const target = e.target as HTMLElement | null;
    const isInteractive = Boolean(
      target?.closest('button') ||
      target?.closest('input') ||
      target?.closest('textarea') ||
      target?.closest('a') ||
      target?.closest('[role="button"]') ||
      target?.closest('[role="listitem"]')
    );

    // 1. Horizontal swipe gesture
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      window.dispatchEvent(new CustomEvent('hidaya-verse-swipe-handled'));
      triggerHaptic(18);
      const isRtl = language === 'ar';
      const isNext = isRtl ? deltaX > 0 : deltaX < 0;
      if (isNext) {
        onNextVerse?.();
      } else {
        onPreviousVerse?.();
      }
      return;
    }

    // 2. Tap Gestures (if enabled in cardPreferences and not on interactive buttons)
    if (
      cardPrefs.enableTapGestures !== false &&
      !isInteractive &&
      Math.abs(deltaX) < 15 &&
      Math.abs(deltaY) < 15 &&
      duration < 320
    ) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTimeRef.current;

      if (timeSinceLastTap < 300) {
        // Double-tap detected: Like with Instagram heart animation
        if (tapTimeoutRef.current) {
          clearTimeout(tapTimeoutRef.current);
          tapTimeoutRef.current = null;
        }
        lastTapTimeRef.current = 0;
        triggerHaptic([20, 50, 20]);
        if (!isBookmarked) {
          onToggleBookmark(verse.id);
        }
        setShowHeartBurst(true);
        setTimeout(() => setShowHeartBurst(false), 900);
      } else {
        // Potential single-tap: Wait 280ms before executing Mute/Unmute
        lastTapTimeRef.current = now;
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = setTimeout(() => {
          lastTapTimeRef.current = 0;
          triggerHaptic(12);
          triggerGlobalMute();
        }, 280);
      }
    }
  };

  useEffect(() => {
    if (preferredScholar) {
      setSelectedScholar(preferredScholar);
    }
  }, [preferredScholar]);

  const t = UI_TEXT[language] || UI_TEXT.en;
  const moodDict = MOOD_LABELS[language] || MOOD_LABELS.en;
  const localizedDetails = getLocalizedVerseDetails(verse, language);
  const ageBundle = useMemo(() => getAgeAdaptiveContent(verse, language), [verse, language]);

  // Count how many consecutive verses are already in the base fixture (e.g. "134" = 1, "5-6" = 2, "3-5" = 3)
  const baseRangeBounds = useMemo(() => {
    const parts = verse.verseNumber.split('-').map((s) => parseInt(s.trim(), 10));
    const start = !isNaN(parts[0]) ? parts[0] : 1;
    const end = parts.length > 1 && !isNaN(parts[1]) ? parts[1] : start;
    return { start, end, count: end - start + 1 };
  }, [verse.verseNumber]);

  const canAddBefore = useMemo(() => {
    return Boolean(verse.surroundingVerses?.before);
  }, [verse.surroundingVerses]);

  const canAddAfter = useMemo(() => {
    return Boolean(verse.surroundingVerses?.after);
  }, [verse.surroundingVerses]);

  const effectiveVerseNumberStr = expandedPassage.verseNumber;
  const effectiveVerseId = expandedPassage.id;

  // Dynamically hydrate Al-Sha'rawi's authentic Tafsir from `/api/tafsir/shaarawi` if the verse is in Surahs 1–60 or 66
  // and was loaded from a dynamic or cached source without Al-Sha'rawi pre-attached
  useEffect(() => {
    setDynamicShaarawiCitation(null);
    const hasShaarawi = localizedDetails.tafsirCitations.some(
      (c) =>
        (c.scholar === "Al-Sha'rawi" || c.scholar === 'الشعراوي') &&
        c.text &&
        c.text.trim().length > 0
    );
    if (hasShaarawi || language !== 'ar') return;

    const sNum = verse.surahNumber;
    const aNum = baseRangeBounds.start;
    if (!sNum || !aNum || (sNum > 60 && sNum !== 66)) return;

    let cancelled = false;
    fetch(`/api/tafsir/shaarawi?surah=${sNum}&ayah=${aNum}`)
      .then((res) =>
        res.ok
          ? (res.json() as Promise<{
              found?: boolean;
              bookId?: number;
              workTitle?: string;
              sourceReference?: string;
              arabicTafsirText?: string;
            }>)
          : null
      )
      .then((data) => {
        if (!cancelled && data?.found && data?.arabicTafsirText) {
          setDynamicShaarawiCitation({
            scholar: "Al-Sha'rawi",
            century: 'Contemporary (1911–1998 CE)',
            sourceBook:
              data.workTitle || `تفسير الشعراوي (Quranpedia Book #${data.bookId || 18})`,
            text: data.arabicTafsirText,
            sourceType: 'classical_book',
            sourceReference: data.sourceReference,
            originalArabicRaw: data.arabicTafsirText,
            verificationStatus: 'verified_canonical',
          });
        }
      })
      .catch(() => {
        // Ignore network errors when offline
      });

    return () => {
      cancelled = true;
    };
  }, [verse.id, verse.surahNumber, baseRangeBounds.start, localizedDetails.tafsirCitations, language]);

  const availableCitations = useMemo(() => {
    let base = localizedDetails.tafsirCitations.filter((c) =>
      Boolean(c.text && c.text.trim().length > 0)
    );
    if (base.length === 0 && Array.isArray(verse.tafsirCitations)) {
      base = verse.tafsirCitations.filter((c) => Boolean(c.text && c.text.trim().length > 0));
    }
    if (
      dynamicShaarawiCitation &&
      language === 'ar' &&
      !base.some((c) => c.scholar === "Al-Sha'rawi" || c.scholar === 'الشعراوي')
    ) {
      return [...base, dynamicShaarawiCitation];
    }
    return base;
  }, [localizedDetails.tafsirCitations, verse.tafsirCitations, dynamicShaarawiCitation, language]);

  // If tafsir is not available in selected language, reset activeSection if it was opened
  useEffect(() => {
    if (activeSection === 'tafsir' && availableCitations.length === 0) {
      setActiveSection('none');
    }
  }, [activeSection, availableCitations.length]);

  // Level 2 Human Translation object: Strictly distinct from Tafsir to prevent duplicate text
  const baseTranslationObj = useMemo(() => {
    if (language === 'ar') {
      const arTrans = verse.translations.ar?.text?.trim();
      // In Arabic, if no distinct translation exists or if it duplicates Arabic text/Tafsir, omit Level 2
      const isDuplicateOfQuranOrTafsir =
        !arTrans ||
        arTrans === verse.arabicText.trim() ||
        availableCitations.some((c) => c.text?.trim() === arTrans);

      if (isDuplicateOfQuranOrTafsir) {
        return null;
      }
      return {
        text: arTrans,
        translator: verse.translations.ar?.translator || 'بيان المعاني',
      };
    }

    const currentTrans = verse.translations[language];
    if (currentTrans?.text && currentTrans.text.trim().length > 0) {
      const transTrim = currentTrans.text.trim();
      // Verify not equal to Quranic Arabic or Tafsir text
      if (
        transTrim !== verse.arabicText.trim() &&
        !availableCitations.some((c) => c.text?.trim() === transTrim)
      ) {
        return currentTrans;
      }
    }

    return null;
  }, [language, verse.translations, verse.arabicText, availableCitations]);

  // Build structured Arabic segments (up to 3 consecutive verses) with their exact Ayah numbers
  const arabicSegments = useMemo(() => {
    const cleanText = (str: string) =>
      str
        .replace(/[\u06DD\u06DE]/g, '')
        .replace(/[\u0660-\u0669]+/g, '')
        .trim();

    const segments: { verseNumber: string; text: string }[] = [];

    const pushParsedSegments = (rawText: string, vNumStr: string) => {
      const subParts = rawText
        .split('۝')
        .map((s) => cleanText(s))
        .filter(Boolean);
      const rangeMatch = vNumStr.match(/^(\d+)\s*-\s*(\d+)$/);
      const startNum = rangeMatch ? parseInt(rangeMatch[1], 10) : parseInt(vNumStr, 10);

      if (subParts.length > 1 && !isNaN(startNum)) {
        subParts.forEach((part, idx) => {
          segments.push({
            verseNumber: String(startNum + idx),
            text: part,
          });
        });
      } else {
        segments.push({
          verseNumber: vNumStr,
          text: subParts.join(' ') || cleanText(rawText),
        });
      }
    };

    if (includeBefore && canAddBefore && verse.surroundingVerses?.before) {
      pushParsedSegments(
        verse.surroundingVerses.before.arabicText,
        verse.surroundingVerses.before.verseNumber
      );
    }

    pushParsedSegments(verse.arabicText, verse.verseNumber);

    if (includeAfter && canAddAfter && verse.surroundingVerses?.after) {
      pushParsedSegments(
        verse.surroundingVerses.after.arabicText,
        verse.surroundingVerses.after.verseNumber
      );
    }

    return segments;
  }, [verse, includeBefore, canAddBefore, includeAfter, canAddAfter]);

  const combinedArabicText = useMemo(() => {
    return arabicSegments.map((s) => `${s.text} ﴿${s.verseNumber}﴾`).join(' ');
  }, [arabicSegments]);

  const combinedTranslationText = useMemo(() => {
    if (!baseTranslationObj) return '';
    const parts: string[] = [];
    if (includeBefore && canAddBefore && verse.surroundingVerses?.before) {
      const bTrans = verse.surroundingVerses.before.translations[language];
      if (bTrans && bTrans.trim().length > 0) parts.push(bTrans.trim());
    }
    parts.push(baseTranslationObj.text);
    if (includeAfter && canAddAfter && verse.surroundingVerses?.after) {
      const aTrans = verse.surroundingVerses.after.translations[language];
      if (aTrans && aTrans.trim().length > 0) parts.push(aTrans.trim());
    }
    return parts.join(' ');
  }, [verse, language, baseTranslationObj, includeBefore, canAddBefore, includeAfter, canAddAfter]);

  const translationObj = baseTranslationObj
    ? {
        text: combinedTranslationText,
        translator: baseTranslationObj.translator,
      }
    : null;

  // Tokenize Uthmani Arabic segments into words with global indices for synchronized word-by-word reading highlight
  const { tokenizedArabicSegments, totalArabicWordsCount } = useMemo(() => {
    let globalIndex = 0;
    const tokenized = arabicSegments.map((seg) => {
      const words = seg.text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => ({
          word,
          globalIdx: globalIndex++,
        }));
      return {
        verseNumber: seg.verseNumber,
        words,
      };
    });
    return { tokenizedArabicSegments: tokenized, totalArabicWordsCount: globalIndex };
  }, [arabicSegments]);

  // Split Translation into words for synchronized word-by-word highlight when translation voiceover plays
  const translationWords = useMemo(
    () => (translationObj?.text || '').trim().split(/\s+/).filter(Boolean),
    [translationObj?.text]
  );

  // Resolve exact millisecond word timestamps & word-by-word phonetics/meaning for Arabic recitation
  useEffect(() => {
    let cancelled = false;
    const reciterId = StorageService.getPreferredReciter();
    resolveArabicVerseWordTimestamps({
      surahNumber: verse.surahNumber,
      verseNumber: effectiveVerseNumberStr,
      reciterId,
      language,
      fallbackArabicText: combinedArabicText,
      fallbackTransliteration: verse.transliteration || '',
    }).then((res) => {
      if (!cancelled) {
        setArabicTimestamps(res.words);
        setHasExactArabicTimestamps(res.isExact);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [verse.surahNumber, effectiveVerseNumberStr, language, combinedArabicText, verse.transliteration]);

  const activeWordIndex = useMemo(() => {
    if (!isReciting || playbackPhase !== 'recitation' || totalArabicWordsCount === 0) return -1;
    // Use exact millisecond timestamp matching when available and single-verse scope matches
    if (
      hasExactArabicTimestamps &&
      arabicTimestamps.length > 0 &&
      currentTimeMs > 0 &&
      !includeBefore &&
      !includeAfter
    ) {
      const exactIdx = findActiveWordIndexByMs(arabicTimestamps, currentTimeMs);
      if (exactIdx >= 0) {
        return Math.min(totalArabicWordsCount - 1, exactIdx);
      }
    }
    const idx = Math.floor(playbackRatio * totalArabicWordsCount);
    return Math.min(totalArabicWordsCount - 1, Math.max(0, idx));
  }, [
    isReciting,
    playbackPhase,
    playbackRatio,
    totalArabicWordsCount,
    hasExactArabicTimestamps,
    arabicTimestamps,
    currentTimeMs,
    includeBefore,
    includeAfter,
  ]);

  const activeTranslationWordIndex = useMemo(() => {
    if (!isReciting || playbackPhase !== 'translation' || translationWords.length === 0) return -1;
    if (
      audioSources.translationTimestamps &&
      audioSources.translationTimestamps.length > 0 &&
      currentTimeMs > 0
    ) {
      const exactIdx = findActiveWordIndexByMs(audioSources.translationTimestamps, currentTimeMs);
      if (exactIdx >= 0) {
        return Math.min(translationWords.length - 1, exactIdx);
      }
    }
    const idx = Math.floor(playbackRatio * translationWords.length);
    return Math.min(translationWords.length - 1, Math.max(0, idx));
  }, [
    isReciting,
    playbackPhase,
    playbackRatio,
    translationWords.length,
    audioSources.translationTimestamps,
    currentTimeMs,
  ]);

  const handleCopy = () => {
    const translationPortion = translationObj?.text
      ? `\n\n"${translationObj.text}"\n— ${translationObj.translator}`
      : '';
    const textToCopy = `${verse.arabicText}${translationPortion}\n— ${localizedDetails.surahPrefix} ${localizedDetails.surahNameDisplay} (${verse.id})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Generates a 9:16 Vertical Story Card (1080x1920 PNG) for Instagram/TikTok/WhatsApp sharing
   * directly from the card header without opening a modal popup.
   */
  const handleDownloadStoryCard = () => {
    try {
      const canvas = document.createElement('canvas');
      const width = 1080;
      const height = 1920;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Deep sanctuary emerald background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#06281E');
      grad.addColorStop(0.5, '#0A1E17');
      grad.addColorStop(1, '#04120D');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle architectural frame
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
      ctx.lineWidth = 3;
      ctx.strokeRect(64, 64, width - 128, height - 128);

      // Top header kicker
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HIDAYA · هِدَايَة', width / 2, 170);

      ctx.fillStyle = '#A7F3D0';
      ctx.font = '600 34px sans-serif';
      ctx.fillText(
        `${localizedDetails.surahPrefix} ${localizedDetails.surahNameDisplay} (${verse.id})`,
        width / 2,
        235
      );

      // Wrap Arabic text in center
      ctx.fillStyle = '#FFFBEB';
      ctx.font = '52px serif';
      const wrapText = (text: string, maxWidth: number) => {
        const words = text.split(' ');
        const lines: string[] = [];
        let current = '';
        for (const w of words) {
          const test = current ? `${current} ${w}` : w;
          if (ctx.measureText(test).width > maxWidth && current) {
            lines.push(current);
            current = w;
          } else {
            current = test;
          }
        }
        if (current) lines.push(current);
        return lines;
      };

      const arabicLines = wrapText(verse.arabicText, width - 220).slice(0, 8);
      let y = 440;
      for (const line of arabicLines) {
        ctx.fillText(line, width / 2, y);
        y += 84;
      }

      // Divider
      y += 30;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 140, y);
      ctx.lineTo(width / 2 + 140, y);
      ctx.stroke();

      // Translation text if available
      if (translationObj && translationObj.text.trim().length > 0) {
        y += 80;
        ctx.fillStyle = '#ECFDF5';
        ctx.font = 'italic 36px sans-serif';
        const transLines = wrapText(`"${translationObj.text}"`, width - 220).slice(0, 10);
        for (const line of transLines) {
          ctx.fillText(line, width / 2, y);
          y += 56;
        }

        // Translator attribution
        y += 24;
        ctx.fillStyle = '#6EE7B7';
        ctx.font = '500 28px sans-serif';
        ctx.fillText(`— ${translationObj.translator}`, width / 2, y);
      }

      // Footer
      ctx.fillStyle = 'rgba(255, 251, 235, 0.6)';
      ctx.font = '26px sans-serif';
      ctx.fillText('Verified Uthmani Script · Hidaya Waqf', width / 2, height - 120);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `hidaya-story-${verse.id.replace(':', '-')}.png`;
      link.href = dataUrl;
      link.click();

      setStoryExported(true);
      setTimeout(() => setStoryExported(false), 2200);
    } catch (err) {
      console.warn('Story card export failed:', err);
    }
  };

  const toggleSection = (section: InlineSection) => {
    setActiveSection((prev) => (prev === section ? 'none' : section));
  };

  const notSayingText =
    verse.notSaying?.[language] ||
    (language === 'sv'
      ? 'Denna vers bör läsas i sitt historiska och tematiska sammanhang och inte ryckas lös ur sin kontext.'
      : language === 'fr'
      ? 'Ce passage doit être compris dans son contexte global et historique.'
      : language === 'ar'
      ? 'تُفهم هذه الآية الكريمة في ضوء سياقها القرآني العام ومقاصد الشريعة.'
      : 'Read this passage within its broader Quranic context and scholarly tradition.');

  const currentCitation = useMemo(() => {
    if (!availableCitations || availableCitations.length === 0) return null;
    const match = availableCitations.find(
      (c) => c.scholar.toLowerCase() === selectedScholar.toLowerCase()
    );
    return match || availableCitations[0];
  }, [availableCitations, selectedScholar]);

  // Trusted Tafsir text audit check: ensure commentary text is genuine and not duplicated from Quran or Translation
  const isTrustedTafsirText = useMemo(() => {
    if (!currentCitation?.text) return false;
    const tafsirTrimmed = currentCitation.text.trim();
    if (tafsirTrimmed.length === 0) return false;
    // Check if duplicate of Quranic text
    if (tafsirTrimmed === verse.arabicText.trim()) return false;
    // Check if duplicate of active human translation
    if (translationObj?.text && tafsirTrimmed === translationObj.text.trim()) return false;
    // Check if duplicate of any raw translation in the fixture
    for (const trans of Object.values(verse.translations)) {
      if (trans?.text && tafsirTrimmed === trans.text.trim()) return false;
    }
    return true;
  }, [currentCitation, verse.arabicText, verse.translations, translationObj]);

  // Split Tafsir into words for synchronized word-by-word highlight when tafsir voiceover plays
  const tafsirWords = useMemo(
    () => (currentCitation?.text || '').trim().split(/\s+/).filter(Boolean),
    [currentCitation?.text]
  );

  const activeTafsirWordIndex = useMemo(() => {
    if (!isReciting || playbackPhase !== 'tafsir' || tafsirWords.length === 0) return -1;
    if (
      audioSources.tafsirTimestamps &&
      audioSources.tafsirTimestamps.length > 0 &&
      currentTimeMs > 0
    ) {
      const exactIdx = findActiveWordIndexByMs(audioSources.tafsirTimestamps, currentTimeMs);
      if (exactIdx >= 0) {
        return Math.min(tafsirWords.length - 1, exactIdx);
      }
    }
    const idx = Math.floor(playbackRatio * tafsirWords.length);
    return Math.min(tafsirWords.length - 1, Math.max(0, idx));
  }, [
    isReciting,
    playbackPhase,
    playbackRatio,
    tafsirWords.length,
    audioSources.tafsirTimestamps,
    currentTimeMs,
  ]);

  const effectiveDuoTimestamps = useMemo(() => {
    if (arabicTimestamps.length > 0 && !includeBefore && !includeAfter) {
      return arabicTimestamps;
    }
    const allWords = tokenizedArabicSegments.flatMap((s) => s.words.map((w) => w.word));
    const translitList = (verse.transliteration || '').trim().split(/\s+/).filter(Boolean);
    return buildWeightedWordTimestamps(allWords, allWords.length * 650, translitList);
  }, [arabicTimestamps, includeBefore, includeAfter, tokenizedArabicSegments, verse.transliteration]);

  const hasExactCurrentPhaseTimestamps = useMemo(() => {
    if (playbackPhase === 'recitation') return hasExactArabicTimestamps;
    if (playbackPhase === 'translation') {
      return Boolean(audioSources.translationTimestamps && audioSources.translationTimestamps.length > 0);
    }
    if (playbackPhase === 'tafsir') {
      return Boolean(audioSources.tafsirTimestamps && audioSources.tafsirTimestamps.length > 0);
    }
    return false;
  }, [
    playbackPhase,
    hasExactArabicTimestamps,
    audioSources.translationTimestamps,
    audioSources.tafsirTimestamps,
  ]);

  // User Scroll Interaction Tracking: yield control whenever user touches, scrolls, or explores
  const userScrolledManuallyRef = useRef<boolean>(false);
  const lastUserScrollTimeRef = useRef<number>(0);
  const prevIsRecitingRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onUserInteractionScroll = () => {
      userScrolledManuallyRef.current = true;
      lastUserScrollTimeRef.current = Date.now();
    };

    const onUserKeyScroll = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key)) {
        userScrolledManuallyRef.current = true;
        lastUserScrollTimeRef.current = Date.now();
      }
    };

    window.addEventListener('wheel', onUserInteractionScroll, { passive: true });
    window.addEventListener('touchmove', onUserInteractionScroll, { passive: true });
    window.addEventListener('keydown', onUserKeyScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', onUserInteractionScroll);
      window.removeEventListener('touchmove', onUserInteractionScroll);
      window.removeEventListener('keydown', onUserKeyScroll);
    };
  }, []);

  // When play mode is freshly toggled on or verse changes, reset user scroll override to position on highlighted word
  useEffect(() => {
    if (isReciting && !prevIsRecitingRef.current) {
      userScrolledManuallyRef.current = false;
      lastUserScrollTimeRef.current = 0;
    }
    prevIsRecitingRef.current = isReciting;
  }, [isReciting, verse.id]);

  // Smooth Teleprompter: position when play starts, scroll gently downward as recitation advances, but yield if user scrolls manually
  useEffect(() => {
    if (!isReciting || typeof window === 'undefined') return;

    let targetEl: HTMLElement | null = null;
    if (playbackPhase === 'recitation' && activeWordIndex >= 0) {
      targetEl = cardRef.current?.querySelector(`[data-word-index="${activeWordIndex}"]`) || null;
    } else if (playbackPhase === 'translation' && activeTranslationWordIndex >= 0) {
      targetEl = cardRef.current?.querySelector(`[data-trans-word-index="${activeTranslationWordIndex}"]`) || null;
    } else if (playbackPhase === 'tafsir' && activeTafsirWordIndex >= 0) {
      targetEl = cardRef.current?.querySelector(`[data-tafsir-word-index="${activeTafsirWordIndex}"]`) || null;
    }

    if (!targetEl) return;

    const now = Date.now();
    // If the user has manually scrolled within the last 6 seconds, let them control the screen freely
    if (userScrolledManuallyRef.current && now - lastUserScrollTimeRef.current < 6000) {
      return;
    }

    const rect = targetEl.getBoundingClientRect();

    // 1. Initial play positioning (or first word of phase)
    if (!userScrolledManuallyRef.current && (activeWordIndex === 0 || activeTranslationWordIndex === 0)) {
      const idealY = window.innerHeight * 0.38;
      const deltaY = rect.top - idealY;
      if (Math.abs(deltaY) > 25) {
        window.scrollBy({ top: deltaY, behavior: 'smooth' });
      }
      return;
    }

    // 2. Gentle downward follow ONLY when necessary (word moves past comfort reading area towards bottom)
    // We only scroll DOWN (deltaY > 0) gently, never pulling the user up if they scrolled down to read
    const lowerComfortBoundary = window.innerHeight * 0.65;
    if (rect.bottom > lowerComfortBoundary) {
      const gentleDownwardScroll = rect.bottom - lowerComfortBoundary;
      window.scrollBy({ top: gentleDownwardScroll, behavior: 'smooth' });
    }
  }, [
    isReciting,
    playbackPhase,
    activeWordIndex,
    activeTranslationWordIndex,
    activeTafsirWordIndex,
  ]);

  const rootItem = ageBundle.defaultRoot;

  return (
    <article
      ref={cardRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative bg-white dark:bg-[#0B3027] rounded-3xl border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs overflow-hidden transition-all ${
        cardPrefs.tvMode ? 'p-2 sm:p-4 text-lg' : ''
      }`}
      aria-labelledby={`verse-heading-${verse.id}`}
    >
      {/* Instagram-Style Center Bursting Heart on Double-Tap */}
      {showHeartBurst && (
        <div
          className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center animate-out fade-out duration-700"
          aria-hidden="true"
        >
          <div className="p-6 rounded-full bg-black/40 backdrop-blur-xs scale-125 animate-bounce">
            <Heart className="w-20 h-20 text-red-500 fill-current drop-shadow-lg" />
          </div>
        </div>
      )}

      {/* Ephemeral TikTok / Instagram Style Mute / Unmute Toast */}
      {muteNotice && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/75 backdrop-blur-md text-white text-xs font-bold shadow-2xl transition-all"
          aria-live="polite"
        >
          {muteNotice === 'muted' ? (
            <>
              <VolumeX className="w-5 h-5 text-red-400" />
              <span>{language === 'ar' ? 'تم كتم الصوت' : language === 'fr' ? 'Son désactivé' : language === 'sv' ? 'Ljud av' : 'Audio muted'}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5 text-emerald-400" />
              <span>{language === 'ar' ? 'تم تشغيل الصوت' : language === 'fr' ? 'Son activé' : language === 'sv' ? 'Ljud på' : 'Audio unmuted'}</span>
            </>
          )}
        </div>
      )}

      {/* Accessible Screen-Reader Heading (Visual duplicate removed, displayed in context header) */}
      <h2 id={`verse-heading-${verse.id}`} className="sr-only">
        {localizedDetails.surahPrefix} {localizedDetails.surahNameDisplay} ({effectiveVerseNumberStr})
      </h2>

      {/* Main Content Body */}
      <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-5">
        {/* LEVEL 1: Original Verified Quranic Arabic (Uthmani Script) on Warm Mushaf Surface (#F7F0E2 / #061B16) */}
        <section ref={arabicSectionRef} aria-label="Level 1: Verified Uthmani Arabic">
          <div
            className="p-4 sm:p-6 rounded-2xl bg-[#F7F0E2] dark:bg-[#061B16] border border-amber-900/12 dark:border-emerald-800/35 relative space-y-3"
            style={{
              fontSize: `${Math.round(26 * (readerProfile === 'kids' ? Math.max(arabicScale, 1.3) : arabicScale))}px`,
              lineHeight: 2.25,
            }}
          >

            {cardPrefs.enableMemorizationMode ? (
              <VerseMemorizationView
                timestamps={effectiveDuoTimestamps}
                currentTimeMs={playbackPhase === 'recitation' ? currentTimeMs : 0}
                activeWordIndex={activeWordIndex}
                isPlaying={isReciting && playbackPhase === 'recitation'}
                arabicScale={readerProfile === 'kids' ? Math.max(arabicScale, 1.3) : arabicScale}
                language={language}
              />
            ) : cardPrefs.showWordByWordDuo ? (
              <VerseWordByWordView
                timestamps={effectiveDuoTimestamps}
                currentTimeMs={playbackPhase === 'recitation' ? currentTimeMs : 0}
                activeWordIndex={activeWordIndex}
                isPlaying={isReciting && playbackPhase === 'recitation'}
                arabicScale={readerProfile === 'kids' ? Math.max(arabicScale, 1.3) : arabicScale}
                showTransliteration={showTransliteration}
                showWordTranslation={cardPrefs.showTranslation}
                language={language}
              />
            ) : (
              <p
                dir="rtl"
                lang="ar"
                className="font-arabic text-right text-emerald-950 dark:text-[#F5F7F2] select-text antialiased font-normal"
              >
                {/* Preceding Verse Extender: Pure '+' enclosed in circle without text */}
                {(canAddBefore || includeBefore) && (
                  <button
                    type="button"
                    onClick={() => onSelectionChange?.({ ...selection, before: !includeBefore })}
                    title={
                      includeBefore
                        ? `${t.beforeVerse} (${verse.surroundingVerses?.before?.verseNumber}) — ${
                            language === 'fr'
                              ? 'Cliquer pour retirer du passage'
                              : language === 'ar'
                              ? 'انقر للإزالة من المقطع'
                              : language === 'sv'
                              ? 'Klicka för att ta bort'
                              : 'Click to remove from passage'
                          }`
                        : `${t.beforeVerse} (${verse.surroundingVerses?.before?.verseNumber}) — ${
                            language === 'fr'
                              ? 'Cliquer pour ajouter le verset précédent au passage'
                              : language === 'ar'
                              ? 'انقر لإضافة الآية السابقة إلى سياق المقطع'
                              : language === 'sv'
                              ? 'Klicka för att lägga till föregående vers'
                              : 'Click to include preceding verse in passage'
                          }`
                    }
                    aria-label={`${t.beforeVerse} (${verse.surroundingVerses?.before?.verseNumber})`}
                    aria-pressed={includeBefore}
                    className={`group inline-flex items-center justify-center align-middle mx-1 w-6 h-6 rounded-full transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
                      includeBefore
                        ? 'bg-[#006D53] text-white hover:bg-[#851E1E] border border-emerald-500/50 hover:border-red-400 hover:scale-110 active:scale-95 shadow-xs'
                        : 'bg-amber-600/10 dark:bg-amber-400/10 text-amber-900 dark:text-amber-200 border border-amber-600/40 dark:border-amber-400/40 hover:bg-amber-600/20 hover:border-amber-600 dark:hover:border-amber-300 hover:scale-110 active:scale-95 shadow-2xs'
                    }`}
                  >
                    {includeBefore ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3] block group-hover:hidden" />
                        <span className="hidden group-hover:block text-[10px] font-bold leading-none">✕</span>
                      </>
                    ) : (
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </button>
                )}

                {tokenizedArabicSegments.map((seg, segIdx) => (
                  <React.Fragment key={segIdx}>
                    {seg.words.map(({ word, globalIdx }) => {
                      const isWordActive = globalIdx === activeWordIndex;
                      return (
                        <React.Fragment key={globalIdx}>
                          <span
                            data-word-index={globalIdx}
                            className={`inline-block rounded-lg px-0.5 transition-colors duration-150 ${
                              isWordActive
                                ? 'bg-[#F4B900]/35 dark:bg-[#F4B900]/30 text-emerald-950 dark:text-[#F4B900] underline decoration-[#F4B900] decoration-2 underline-offset-8'
                                : ''
                            }`}
                          >
                            {cardPrefs.showTajweedColors ? <TajweedText text={word} /> : word}
                          </span>{' '}
                        </React.Fragment>
                      );
                    })}
                    <span className="inline-flex items-center align-middle mx-1 text-amber-800 dark:text-[#F4B900] select-none">
                      <AyahCartouche
                        number={seg.verseNumber}
                        size="inline"
                        title={
                          onNavigateToRead
                            ? `${verse.surahNumber}:${seg.verseNumber}`
                            : undefined
                        }
                        onClick={
                          onNavigateToRead
                            ? () => {
                                const vNum =
                                  parseInt(String(seg.verseNumber).split('-')[0], 10) ||
                                  baseRangeBounds.start;
                                onNavigateToRead(verse.surahNumber, vNum);
                              }
                            : undefined
                        }
                      />
                    </span>{' '}
                  </React.Fragment>
                ))}

                {/* Following Verse Extender: Pure '+' enclosed in circle without text */}
                {(canAddAfter || includeAfter) && (
                  <button
                    type="button"
                    onClick={() => onSelectionChange?.({ ...selection, after: !includeAfter })}
                    title={
                      includeAfter
                        ? `${t.afterVerse} (${verse.surroundingVerses?.after?.verseNumber}) — ${
                            language === 'fr'
                              ? 'Cliquer pour retirer du passage'
                              : language === 'ar'
                              ? 'انقر للإزالة من المقطع'
                              : language === 'sv'
                              ? 'Klicka för att ta bort'
                              : 'Click to remove from passage'
                          }`
                        : `${t.afterVerse} (${verse.surroundingVerses?.after?.verseNumber}) — ${
                            language === 'fr'
                              ? 'Cliquer pour ajouter le verset suivant au passage'
                              : language === 'ar'
                              ? 'انقر لإضافة الآية اللاحقة إلى سياق المقطع'
                              : language === 'sv'
                              ? 'Klicka för att lägga till följande vers'
                              : 'Click to include following verse in passage'
                          }`
                    }
                    aria-label={`${t.afterVerse} (${verse.surroundingVerses?.after?.verseNumber})`}
                    aria-pressed={includeAfter}
                    className={`group inline-flex items-center justify-center align-middle mx-1 w-6 h-6 rounded-full transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
                      includeAfter
                        ? 'bg-[#006D53] text-white hover:bg-[#851E1E] border border-emerald-500/50 hover:border-red-400 hover:scale-110 active:scale-95 shadow-xs'
                        : 'bg-amber-600/10 dark:bg-amber-400/10 text-amber-900 dark:text-amber-200 border border-amber-600/40 dark:border-amber-400/40 hover:bg-amber-600/20 hover:border-amber-600 dark:hover:border-amber-300 hover:scale-110 active:scale-95 shadow-2xs'
                    }`}
                  >
                    {includeAfter ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3] block group-hover:hidden" />
                        <span className="hidden group-hover:block text-[10px] font-bold leading-none">✕</span>
                      </>
                    ) : (
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </button>
                )}
              </p>
            )}
          </div>

          {/* Quick Recitation Mode Toggles: Mot-à-Mot (Duo) & Mémorisation (Hifz) */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <button
              type="button"
              onClick={() =>
                handleUpdateCardPref({
                  showWordByWordDuo: !cardPrefs.showWordByWordDuo,
                  enableMemorizationMode: false,
                })
              }
              title={
                language === 'ar'
                  ? 'وضع المصحف التفاعلي كلمة بكلمة'
                  : language === 'fr'
                  ? 'Mode Coran Duo : mot-à-mot avec translittération et traduction'
                  : language === 'sv'
                  ? 'Ord-för-ord läge med fonetik'
                  : 'Word-by-Word Duo mode with phonetics & meaning'
              }
              aria-pressed={Boolean(cardPrefs.showWordByWordDuo)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                cardPrefs.showWordByWordDuo
                  ? 'bg-[#006D53] text-white border-[#006D53] shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-white/80 dark:bg-[#061B16]/80 text-emerald-950 dark:text-[#9BAFA7] border-emerald-900/15 dark:border-emerald-800/40 hover:border-[#006D53]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F4B900]" />
              <span>
                {language === 'ar'
                  ? 'كلمة بكلمة'
                  : language === 'fr'
                  ? 'Mot-à-Mot'
                  : language === 'sv'
                  ? 'Ord-för-Ord'
                  : 'Word-by-Word'}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleUpdateCardPref({
                  enableMemorizationMode: !cardPrefs.enableMemorizationMode,
                  showWordByWordDuo: false,
                })
              }
              title={
                language === 'ar'
                  ? 'وضع التحفيظ والتسميع الذكي (Hifz)'
                  : language === 'fr'
                  ? 'Mode Mémorisation interactive (Hifz)'
                  : language === 'sv'
                  ? 'Interaktivt memoreringsläge (Hifz)'
                  : 'Interactive Memorization Mode (Hifz)'
              }
              aria-pressed={Boolean(cardPrefs.enableMemorizationMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                cardPrefs.enableMemorizationMode
                  ? 'bg-[#006D53] text-white border-[#006D53] shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-white/80 dark:bg-[#061B16]/80 text-emerald-950 dark:text-[#9BAFA7] border-emerald-900/15 dark:border-emerald-800/40 hover:border-[#006D53]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#F4B900]" />
              <span>
                {language === 'ar'
                  ? 'تحفيظ (Hifz)'
                  : language === 'fr'
                  ? 'Mémorisation'
                  : language === 'sv'
                  ? 'Memorering'
                  : 'Memorization'}
              </span>
            </button>
          </div>

        </section>

        {/* LEVEL 2: Certified Human Translation with Word-by-Word Highlighting when Spoken */}
        {cardPrefs.showTranslation && translationObj && translationObj.text.trim().length > 0 && (
          <section ref={translationSectionRef} aria-label="Level 2: Certified Translation" className="space-y-1.5">
            {cardPrefs.expertMode && cardPrefs.showAudioSourceBadge && audioSources.translation && (
              <div className="flex items-center">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#006D53]/15 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border border-emerald-700/30">
                  Audio: {audioSources.translation}
                </span>
              </div>
            )}
            <blockquote
              style={{ fontSize: `${readingScale * 1.125}rem` }}
              className="text-slate-800 dark:text-[#F5F7F2] leading-relaxed font-serif"
            >
              &ldquo;
              {translationWords.map((word, idx) => {
                const isWordActive = idx === activeTranslationWordIndex;
                return (
                  <React.Fragment key={idx}>
                    <span
                      data-trans-word-index={idx}
                      className={`inline-block rounded-md px-0.5 transition-colors duration-150 ${
                        isWordActive
                          ? 'bg-[#F4B900]/35 dark:bg-[#F4B900]/30 text-emerald-950 dark:text-[#F4B900] underline decoration-[#F4B900] decoration-2 underline-offset-4'
                          : ''
                      }`}
                    >
                      {word}
                    </span>{' '}
                  </React.Fragment>
                );
              })}
              &rdquo;
            </blockquote>
            <p className="text-xs text-slate-500 dark:text-[#9BAFA7]">
              — {translationObj.translator}
            </p>
          </section>
        )}

        {/* LEVEL 4 (Kids & Family Companion): Simple Story & Family Question when Kids Mode is active */}
        {readerProfile === 'kids' && (
          <section
            aria-label="Level 4: Kids & Family Story Companion"
            className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-[#061B16]/70 border border-amber-500/25 dark:border-amber-500/20 space-y-3"
          >
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-amber-900 dark:text-[#F4B900] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-amber-600 dark:text-[#F4B900] shrink-0" />
                <span>{ageBundle.kids.title}</span>
              </h3>
              <p className="text-sm text-slate-800 dark:text-[#F5F7F2] leading-relaxed">
                {ageBundle.kids.storyText}
              </p>
            </div>

            <div className="pt-2.5 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#006D53] dark:text-emerald-400" />
                  {ageBundle.kids.familyQuestionTitle}
                </span>
                <p className="text-slate-700 dark:text-[#F5F7F2] leading-relaxed">
                  {ageBundle.kids.familyQuestion}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-amber-800 dark:text-[#F4B900] block">
                  {ageBundle.kids.tryTodayLabel}
                </span>
                <p className="text-slate-700 dark:text-[#F5F7F2] leading-relaxed">
                  {ageBundle.kids.tryTodayAction}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* LEVEL 4 (Teen Companion): Concise Takeaway & Root Snapshot when Teen Mode is active */}
        {readerProfile === 'teen' && (
          <section
            aria-label="Level 4: Teen Key Takeaway"
            className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#061B16]/70 border border-emerald-900/10 dark:border-emerald-800/35 space-y-2"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <span>{t.teenTakeawayTitle}</span>
              <span className="font-arabic text-sm text-amber-700 dark:text-[#F4B900]">
                {rootItem.termArabic} · {rootItem.root}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-[#F5F7F2] leading-relaxed">
              {ageBundle.teenKeyTakeaway}
            </p>
          </section>
        )}

        {/* Headless Audio Player Engine with Consecutive Range Playback & Word-by-Word Progress Callback */}
        <AudioPlayer
          headless={true}
          audioUrl={verse.audioUrl}
          verseNumbers={visibleVerseNumbers(expandedPassage)}
          surahNumber={verse.surahNumber}
          verseNumber={effectiveVerseNumberStr}
          surahVerseId={effectiveVerseId}
          ayahId={verse.id}
          translationSource={translationObj?.translator}
          tafsirSource={currentCitation?.scholar}
          key={`${effectiveVerseId}:${language}:${currentCitation?.scholar}`}
          translationText={translationObj?.text || ''}
          tafsirText={currentCitation?.text || ''}
          language={language}
          autoPlayOnAdvance={Boolean(isGlobalPlaying || (isReciting && cardPrefs.autoPlayOnSwipe))}
          defaultLoop={cardPrefs.loopVerse}
          defaultIncludeRecitation={cardPrefs.includeRecitationByDefault}
          defaultIncludeTranslation={cardPrefs.includeTranslationByDefault}
          defaultIncludeTafsir={cardPrefs.includeTafsirByDefault}
          nextVerseAudioUrl={nextVerse?.audioUrl}
          nextVerseTranslationText={nextVerse?.translations?.[language]?.text}
          isActive={isActive}
          onNextVerse={onNextVerse}
          onPreviousVerse={onPreviousVerse}
          onPlaybackProgress={(ratio, playing, phase, timeMs) => {
            setPlaybackRatio(ratio);
            setIsReciting(playing);
            if (typeof timeMs === 'number') {
              setCurrentTimeMs(timeMs);
            } else if (!playing) {
              setCurrentTimeMs(0);
            }
            setPlaybackPhase(phase || (playing ? 'recitation' : 'idle'));
            if (phase === 'tafsir' && playing) {
              setActiveSection('tafsir');
            }
          }}
          onAudioSourcesResolved={setAudioSources}
        />

        {/* LEVEL 3: Classical Tafsir Disclosure with Integrated Compact Scholar Selector */}
        {availableCitations.length > 0 && (
          <div className="pt-1">
            <div
              className={`w-full min-h-[42px] inline-flex items-center justify-between gap-2 px-3 sm:px-4 py-1.5 rounded-2xl text-xs font-semibold transition-all ${
                activeSection === 'tafsir'
                  ? 'bg-[#006D53] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] dark:bg-[#061B16]/80 text-emerald-950 dark:text-[#F5F7F2] border border-emerald-900/10 dark:border-emerald-800/40 hover:bg-emerald-900/10 dark:hover:bg-emerald-900/30'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleSection('tafsir')}
                aria-expanded={activeSection === 'tafsir'}
                className="flex-1 inline-flex items-center gap-2 truncate cursor-pointer py-1 focus:outline-none"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="font-bold">{t.tafsirTab}</span>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                {/* Compact Scholar Dropdown Selector */}
                <select
                  value={currentCitation?.scholar || selectedScholar}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newScholar = e.target.value;
                    setSelectedScholar(newScholar);
                    StorageService.setPreferredScholar(newScholar);
                  }}
                  aria-label="Select Tafsir Scholar"
                  className={`text-xs font-semibold py-1 px-2 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#F4B900] ${
                    activeSection === 'tafsir'
                      ? 'bg-emerald-900/40 text-emerald-100 border border-emerald-500/30'
                      : 'bg-white dark:bg-[#0B3027] text-emerald-950 dark:text-[#F5F7F2] border border-emerald-900/15 dark:border-emerald-700/40'
                  }`}
                >
                  {availableCitations.map((c) => (
                    <option key={c.scholar} value={c.scholar} className="text-slate-900 dark:text-slate-100 bg-white dark:bg-[#0B3027]">
                      {c.scholar}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => toggleSection('tafsir')}
                  aria-label={activeSection === 'tafsir' ? 'Collapse Tafsir' : 'Expand Tafsir'}
                  className="p-1 cursor-pointer focus:outline-none"
                >
                  {activeSection === 'tafsir' ? (
                    <ChevronUp className="w-4 h-4 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 shrink-0 opacity-70" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INLINE PANEL 1: LEVEL 3 CLASSICAL & EXPERT TAFSIR WITH PROVENANCE AUDIT */}
        {activeSection === 'tafsir' && availableCitations.length > 0 && (
          <div ref={tafsirSectionRef} className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#061B16]/70 border border-emerald-900/10 dark:border-emerald-800/35 space-y-4">

            {currentCitation && isTrustedTafsirText ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B3027]/70 border border-emerald-900/10 dark:border-emerald-800/35 space-y-3.5 shadow-2xs">
                {/* Audio badge and Provenance Action when applicable */}
                {(cardPrefs.expertMode || (cardPrefs.showAudioSourceBadge && audioSources.tafsir)) && (
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-emerald-900/40 text-xs">
                    {cardPrefs.showAudioSourceBadge && audioSources.tafsir ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#006D53]/15 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border border-emerald-700/30">
                        Audio: {audioSources.tafsir}
                      </span>
                    ) : <span />}
                    {cardPrefs.expertMode && (
                      <button
                        type="button"
                        onClick={() => setProvenanceModalOpen(true)}
                        className="min-h-[30px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-emerald-900 dark:text-[#F5F7F2] bg-[#FAF8F5] dark:bg-[#061B16] border border-emerald-900/15 dark:border-emerald-700/40 hover:bg-[#006D53] hover:text-white transition-colors cursor-pointer shrink-0"
                        title={t.viewProvenanceBtn}
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-[#F4B900]" />
                        <span>{t.viewProvenanceBtn}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Verbatim Arabic Quote Excerpt Preview (Expert Mode only) */}
                {cardPrefs.expertMode &&
                  currentCitation.originalArabicRaw &&
                  language !== 'ar' &&
                  currentCitation.originalArabicRaw.trim() !== currentCitation.text.trim() && (
                    <div
                      dir="rtl"
                      className="p-3.5 rounded-xl bg-[#F7F0E2] dark:bg-[#061B16] border border-amber-900/12 dark:border-emerald-800/30 text-right"
                    >
                      <p className="font-arabic text-sm text-slate-800 dark:text-[#F5F7F2] leading-loose line-clamp-2 select-text">
                        &ldquo;{currentCitation.originalArabicRaw}&rdquo;
                      </p>
                    </div>
                  )}

                {/* Commentary Text (Preserves verbatim Arabic RTL for Quranpedia Book 18 or localized commentary) with synchronized word-by-word highlighting */}
                <p
                  dir={
                    /[\u0600-\u06FF]/.test(currentCitation.text.slice(0, 80)) ? 'rtl' : undefined
                  }
                  style={{ fontSize: `${readingScale * 0.95}rem` }}
                  className={`leading-relaxed text-slate-800 dark:text-[#F5F7F2] select-text ${
                    /[\u0600-\u06FF]/.test(currentCitation.text.slice(0, 80))
                      ? 'font-arabic text-right leading-loose'
                      : ''
                  }`}
                >
                  {tafsirWords.map((word, idx) => {
                    const isWordActive = idx === activeTafsirWordIndex;
                    return (
                      <React.Fragment key={idx}>
                        <span
                          data-tafsir-word-index={idx}
                          className={`inline-block rounded-md px-0.5 transition-colors duration-150 ${
                            isWordActive
                              ? 'bg-[#F4B900]/35 dark:bg-[#F4B900]/30 text-emerald-950 dark:text-[#F4B900] underline decoration-[#F4B900] decoration-2 underline-offset-4'
                              : ''
                          }`}
                        >
                          {word}
                        </span>{' '}
                      </React.Fragment>
                    );
                  })}
                </p>

                {/* AI Model Attribution Disclaimer if AI-translated (Expert Mode only) */}
                {cardPrefs.expertMode && currentCitation.translationDisclaimer && (
                  <p className="text-[11px] text-amber-900/70 dark:text-amber-300/70 italic pt-1">
                    * {currentCitation.translationDisclaimer}
                  </p>
                )}

                {/* Subtle Intuitive Reading / Expert Mode Toggle (Visible ONLY in Expert Mode) */}
                {cardPrefs.expertMode && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-emerald-900/35 text-[11px] text-slate-400 dark:text-[#9BAFA7]/70">
                    <span className="italic">
                      {language === 'fr'
                        ? 'Mode Expert actif'
                        : language === 'ar'
                        ? 'الوضع الأكاديمي مفعّل'
                        : language === 'sv'
                        ? 'Expertläge aktivt'
                        : 'Expert Mode active'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextMode = !cardPrefs.expertMode;
                        StorageService.setCardPreferences({ expertMode: nextMode, showAudioSourceBadge: nextMode });
                        setCardPrefs((p) => ({ ...p, expertMode: nextMode, showAudioSourceBadge: nextMode }));
                        window.dispatchEvent(
                          new CustomEvent('hidaya-preferences-updated', {
                            detail: { expertMode: nextMode, showAudioSourceBadge: nextMode },
                          })
                        );
                      }}
                      className="hover:text-emerald-800 dark:hover:text-[#F4B900] transition-colors cursor-pointer underline underline-offset-2"
                    >
                      {language === 'fr'
                        ? 'Masquer les détails techniques'
                        : language === 'ar'
                        ? 'إخفاء التفاصيل التقنية'
                        : language === 'sv'
                        ? 'Dölj tekniska detaljer'
                        : 'Hide technical details'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 dark:bg-[#061B16]/50 border border-amber-900/10 dark:border-emerald-800/20 text-center space-y-2.5">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9BAFA7]">
                  {t.tafsirNoDataText}
                </p>
                <button
                  type="button"
                  onClick={() => setProvenanceModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-900 dark:text-[#F5F7F2] bg-white dark:bg-[#0B3027] border border-emerald-900/15 dark:border-emerald-700/40 hover:bg-[#006D53] hover:text-white transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-[#F4B900]" />
                  <span>{t.viewProvenanceBtn}</span>
                </button>
              </div>
            )}

            {/* Teen-Friendly Concept Glossary when Teen or Kids profile is active */}
            {readerProfile !== 'adult' && (
              <div className="pt-3 border-t border-emerald-900/10 dark:border-emerald-800/30 space-y-2">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                  {t.teenGlossaryTitle}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {ageBundle.teenGlossary.map((item) => (
                    <div
                      key={item.term}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#0B3027] border border-emerald-900/10 dark:border-emerald-800/30"
                    >
                      <span className="font-bold text-emerald-950 dark:text-[#F5F7F2] block">
                        {item.term}
                      </span>
                      <span className="text-slate-600 dark:text-[#9BAFA7]">{item.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CENTERED FLOATING POPUP MODAL: SOCIAL CREATION STUDIO (1:1 / 9:16 PNG, Video, PPTX & PDF) */}
        {showStudio && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setShowStudio(false)}
          >
            <div
              data-creation-studio="true"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FAF8F5] dark:bg-[#082019] border border-amber-500/30 dark:border-amber-500/30 p-4 sm:p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                <span className="text-sm font-bold text-amber-950 dark:text-[#F4B900] flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-600 dark:text-[#F4B900]" />
                  <span>
                    {language === 'ar'
                      ? 'استوديو المشاركة والتصميم'
                      : language === 'fr'
                      ? 'Studio de Partage & Création'
                      : language === 'sv'
                      ? 'Delnings- & Skaparstudio'
                      : 'Share & Creation Studio'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowStudio(false)}
                  className="w-8 h-8 flex items-center justify-center text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-[#9BAFA7] dark:hover:text-[#F5F7F2] rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close studio"
                  title="Fermer"
                >
                  ✕
                </button>
              </div>
              <React.Suspense fallback={<div className="p-8 text-center text-xs text-emerald-800/60 dark:text-[#9BAFA7]/60 animate-pulse">Loading Studio...</div>}>
                <SocialCreationStudio
                  verse={verse}
                  surahDisplayTitle={`${localizedDetails.surahPrefix} ${localizedDetails.surahNameDisplay} (${verse.id})`}
                  arabicText={verse.arabicText}
                  translationText={translationObj?.text || ''}
                  translatorName={translationObj?.translator || ''}
                  tafsirText={currentCitation?.text || ''}
                  tafsirScholar={currentCitation?.scholar || ''}
                  audioUrl={verse.audioUrl || ''}
                  language={language}
                  reflection={StorageService.getReflection(verse.id)}
                />
              </React.Suspense>
            </div>
          </div>
        )}

        {/* INLINE SOCIAL COMMENTS & REFLECTIONS THREAD */}
        {showComments && (
          <div
            data-comments-thread="true"
            className="p-4 sm:p-5 rounded-3xl bg-[#FAF8F5] dark:bg-[#061B16]/75 border border-emerald-900/10 dark:border-emerald-800/40 space-y-4 animate-in fade-in duration-300"
          >
            <div className="flex items-center justify-between pb-2 border-b border-emerald-900/10 dark:border-emerald-800/30">
              <h3 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-[#F5F7F2] flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#006D53] dark:text-[#F4B900]" />
                <span>{t.commentsThreadTitle}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-900/10 dark:bg-emerald-800/30 text-emerald-950 dark:text-emerald-200 font-mono tabular-nums">
                  {socialComments.length}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowComments(false)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-[#9BAFA7] dark:hover:text-[#F5F7F2] p-1.5 rounded-lg hover:bg-emerald-900/10 transition-colors cursor-pointer"
                aria-label="Close comments"
              >
                ✕
              </button>
            </div>

            {/* List of comments */}
            {socialComments.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-[#9BAFA7] italic py-2">
                {t.commentsEmpty}
              </p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {socialComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded-2xl bg-white dark:bg-[#0B3027] border border-slate-200/80 dark:border-emerald-800/30 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        {comment.mood && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-900/10 dark:bg-emerald-800/40 text-emerald-900 dark:text-[#F4B900] font-semibold text-[10px]">
                            {moodDict[comment.mood]}
                          </span>
                        )}
                        <span className="text-slate-400 dark:text-slate-500 tabular-nums">
                          {new Date(comment.createdAt).toLocaleDateString(language, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-800 dark:text-[#F5F7F2] leading-relaxed select-text whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add new comment form */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-200 dark:border-emerald-800/30 space-y-2.5">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={t.addCommentPlaceholder}
                rows={2}
                className="w-full p-3 rounded-2xl bg-white dark:bg-[#0B3027] border border-slate-200 dark:border-emerald-800/40 text-xs text-slate-800 dark:text-[#F5F7F2] focus:outline-none focus:ring-2 focus:ring-[#006D53] placeholder:text-slate-400 resize-none leading-relaxed"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {(['calm', 'grateful', 'hopeful', 'anxious', 'overwhelmed'] as ReflectionMood[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setNewCommentMood(newCommentMood === m ? undefined : m)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                        newCommentMood === m
                          ? 'bg-[#006D53] text-white'
                          : 'bg-white dark:bg-[#0B3027] text-slate-600 dark:text-[#9BAFA7] border border-slate-200 dark:border-emerald-800/30'
                      }`}
                    >
                      {moodDict[m]}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="min-h-[34px] px-3.5 py-1.5 rounded-xl bg-[#006D53] hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.postCommentBtn}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* REELS / SWIPE PREVIOUS & NEXT VERSE NAVIGATION */}
        {totalCards !== undefined && totalCards > 1 && (
          <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/35 flex items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={onPreviousVerse}
              disabled={cardIndex === 0}
              className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#061B16] border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2] hover:bg-[#006D53] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{t.prevVerseBtn}</span>
            </button>

            <span className="text-[11px] font-mono tabular-nums text-slate-400 dark:text-[#9BAFA7]">
              {cardIndex !== undefined ? cardIndex + 1 : 1} / {totalCards}
            </span>

            <button
              type="button"
              onClick={onNextVerse}
              disabled={cardIndex !== undefined && cardIndex >= totalCards - 1}
              className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#061B16] border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2] hover:bg-[#006D53] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t.nextVerseBtn}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        )}

      </div>

      <ScholarProvenanceModal
        isOpen={provenanceModalOpen}
        onClose={() => setProvenanceModalOpen(false)}
        citation={currentCitation}
        verse={verse}
        language={language}
      />

      {/* Ergonomic 1-Handed Thumb Action Rail (Instagram / TikTok Reels Bottom-Right Thumb Zone) */}
      {isActive && cardPrefs.showThumbRail !== false && !cardPrefs.tvMode && (
        <ThumbActionRail
          isMuted={isAudioMuted}
          onToggleMute={triggerGlobalMute}
          isBookmarked={isBookmarked}
          onToggleBookmark={() => onToggleBookmark(verse.id)}
          onOpenComments={handleToggleComments}
          onShare={handleShare}
          commentsCount={socialComments.length}
          isPlaying={isReciting}
          onTogglePlay={() => {
            window.dispatchEvent(
              new CustomEvent('hidaya-global-toggle-play', {
                detail: { action: isReciting ? 'pause' : 'play' },
              })
            );
          }}
          isContinuousReading={isContinuousReading}
          onToggleContinuousReading={onToggleContinuousReading}
          language={language}
        />
      )}
    </article>
  );
};
