"use client";

/**
 * @file src/components/ContinuousSessionAudioPlayer.tsx
 * @description Dedicated full-view Audio Contemplation Workspace (`inlinePage` mode)
 * or compact player with synchronized Word-by-Word highlighting across all consecutive
 * verses for Recitation, Translation, and Classical Tafsir.
 */

import { visibleVerseNumbers } from '../services/passageSelection';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Headphones,
  BookOpen,
  Quote,
  Search,
  X,
} from 'lucide-react';
import {
  QuranVerseFixture,
  Language,
  AudioPlaybackMode,
  ReciterId,
  PreferredScholar,
} from '../types';
import { AVAILABLE_RECITERS, getAudioUrlsForVerseRange } from '../services/audioReciters';
import { StorageService } from '../services/storage';

import { getLocalizedVerseDetails } from '../data/localizedVerseContent';
import { QURAN_FIXTURES } from '../data/quranFixtures';
import { AyahCartouche } from './AyahCartouche';
import { fetchAyahAudioPlaylist, StoredAudioMetadata } from '../lib/audio/audioResolverService';

interface ContinuousSessionAudioPlayerProps {
  verses: QuranVerseFixture[];
  language: Language;
  onActiveVerseChange?: (verseId: string) => void;
  onClose?: () => void;
  inlinePage?: boolean;
}

type PlaybackPhase = 'idle' | 'recitation' | 'translation' | 'tafsir';

const AUDIO_UI: Record<
  Language,
  {
    title: string;
    subtitle: string;
    modeQuranOnly: string;
    modeWithTranslation: string;
    modeWithTafsir: string;
    reciterLabel: string;
    queueLabel: string;
    tafsirHeading: string;
    phaseRecitation: string;
    phaseTranslation: string;
    phaseTafsir: string;
    searchPlaceholder: string;
    filterLabel: string;
  }
> = {
  en: {
    title: 'Audio Contemplation Sanctuary',
    subtitle: 'Listen to verified Quranic recitation with synchronized word-by-word reading, translation, and classical Tafsir.',
    modeQuranOnly: 'Quran only',
    modeWithTranslation: 'Quran + Trans',
    modeWithTafsir: 'Quran + Tafsir',
    reciterLabel: 'Select Reciter',
    queueLabel: 'Session Passages Queue',
    tafsirHeading: 'Level 3: Classical Tafsir',
    phaseRecitation: 'Reciting Arabic',
    phaseTranslation: 'Reading Translation',
    phaseTafsir: 'Explaining Tafsir',
    searchPlaceholder: 'Search or filter verses to listen...',
    filterLabel: 'Select Verse',
  },
  sv: {
    title: 'Ljud & Kontemplation',
    subtitle: 'Lyssna på verifierad Quran-recitation med synkroniserad ord-för-ord-läsning, översättning och klassisk Tafsir.',
    modeQuranOnly: 'Endast Quran',
    modeWithTranslation: 'Quran + Översättning',
    modeWithTafsir: 'Quran + Tafsir',
    reciterLabel: 'Välj recitatör',
    queueLabel: 'Valda passager i kö',
    tafsirHeading: 'Nivå 3: Klassisk Tafsir',
    phaseRecitation: 'Reciterar arabiska',
    phaseTranslation: 'Läser översättning',
    phaseTafsir: 'Förklarar Tafsir',
    searchPlaceholder: 'Sök eller filtrera verser att lyssna på...',
    filterLabel: 'Välj vers',
  },
  fr: {
    title: 'Sanctuaire Audio & Récitation',
    subtitle: 'Écoutez la récitation coranique vérifiée avec suivi mot-à-mot, traduction vocale et exégèse (Tafsir).',
    modeQuranOnly: 'Coran seul',
    modeWithTranslation: 'Coran + Trad',
    modeWithTafsir: 'Coran + Tafsir',
    reciterLabel: 'Choisir le récitateur',
    queueLabel: 'Passages de la session',
    tafsirHeading: 'Niveau 3 : Exégèse Classique (Tafsir)',
    phaseRecitation: 'Récitation arabe',
    phaseTranslation: 'Lecture traduction',
    phaseTafsir: 'Explication Tafsir',
    searchPlaceholder: 'Rechercher ou filtrer les versets à écouter...',
    filterLabel: 'Choisir le verset',
  },
  ar: {
    title: 'الاستماع والتدبر الصوتي',
    subtitle: 'استمع إلى التلاوة القرآنية المرتلة ومتابعة كلمة بكلمة مع الترجمة والتفسير المعتمد.',
    modeQuranOnly: 'تلاوة فقط',
    modeWithTranslation: 'تلاوة وترجمة',
    modeWithTafsir: 'تلاوة وتفسير',
    reciterLabel: 'اختر القارئ',
    queueLabel: 'قائمة الآيات المختارة',
    tafsirHeading: 'المستوى الثالث: التفسير المعتمد',
    phaseRecitation: 'تلاوة قرآنية',
    phaseTranslation: 'قراءة الترجمة',
    phaseTafsir: 'بيان التفسير',
    searchPlaceholder: 'ابحث في الآيات أو اختر للاستماع والتدبر...',
    filterLabel: 'اختر الآية',
  },
};

export const ContinuousSessionAudioPlayer: React.FC<ContinuousSessionAudioPlayerProps> = ({
  verses,
  language,
  onActiveVerseChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<AudioPlaybackMode>('quran_translation');
  const [reciterId, setReciterId] = useState<ReciterId>(() => StorageService.getPreferredReciter());
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackPhase, setPlaybackPhase] = useState<PlaybackPhase>('idle');
  const [filterQuery, setFilterQuery] = useState('');
  const [playbackNotice, setPlaybackNotice] = useState<'blocked' | 'missing' | null>(null);
  const phaseRef = useRef<PlaybackPhase>('idle');

  // Multi-verse track progression for consecutive verses (up to 3 consecutive verses)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [recitationRatio, setRecitationRatio] = useState(0);
  const [translationRatio, setTranslationRatio] = useState(0);
  const [tafsirRatio, setTafsirRatio] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const secondaryCleanupRef = useRef<(() => void) | null>(null);

  const t = AUDIO_UI[language] || AUDIO_UI.en;

  // Resilient verses pool: use passed verses or fall back to verified fixtures so audio section is NEVER blank
  const activeVerses = useMemo(() => {
    return verses && verses.length > 0 ? verses : QURAN_FIXTURES;
  }, [verses]);

  // Filtered verses pool matching local audio search query
  const displayedVerses = useMemo(() => {
    if (!filterQuery.trim()) return activeVerses;
    const q = filterQuery.toLowerCase().trim();
    return activeVerses.filter((v) => {
      const enTrans = v.translations.en?.text || '';
      const localizedTrans = v.translations[language]?.text || '';
      const surahName = v.surahNameTransliterated.toLowerCase();
      const surahArabic = v.surahNameArabic;
      const topics = (v.topics || []).join(' ').toLowerCase();
      return (
        v.id.includes(q) ||
        surahName.includes(q) ||
        surahArabic.includes(q) ||
        enTrans.toLowerCase().includes(q) ||
        localizedTrans.toLowerCase().includes(q) ||
        topics.includes(q)
      );
    });
  }, [activeVerses, filterQuery, language]);

  const currentVerse = displayedVerses[currentIndex] || displayedVerses[0];

  // Consecutive verses audio tracks (handles single ayah "134" or ranges "5-6" / "133-135")
  const rangeAudioUrls = useMemo(() => {
    if (!currentVerse) return [];
    return visibleVerseNumbers(currentVerse).flatMap(number => getAudioUrlsForVerseRange(currentVerse.surahNumber, String(number), reciterId));
  }, [currentVerse, reciterId]);

  const activeAudioUrl = rangeAudioUrls[currentTrackIndex] || rangeAudioUrls[0] || '';
  const totalTracks = Math.max(1, rangeAudioUrls.length);

  // Preferred Tafsir scholar citation
  const preferredScholar: PreferredScholar = StorageService.getPreferredScholar();
  const localizedDetails = useMemo(() => {
    if (!currentVerse) return null;
    return getLocalizedVerseDetails(currentVerse, language);
  }, [currentVerse, language]);

  const currentTafsirCitation = useMemo(() => {
    const citations = (localizedDetails?.tafsirCitations || []).filter(
      (c) => Boolean(c.text && c.text.trim()) && (c.languageCode === language || (language === 'ar' && c.languageCode === 'ar'))
    );
    if (citations.length === 0) return null;
    return citations.find((citation) => citation.scholar === preferredScholar) || citations[0] || null;
  }, [localizedDetails, preferredScholar, language]);

  // Texts strictly matching the selected language with zero cross-language leaks
  const translationText = useMemo(() => {
    if (!currentVerse) return '';
    return currentVerse.translations[language]?.text || '';
  }, [currentVerse, language]);

  const tafsirText = currentTafsirCitation?.text || '';

  // Synchronize playback mode when available content changes in the selected language
  useEffect(() => {
    if (playbackMode === 'quran_tafsir' && !tafsirText) {
      setPlaybackMode(translationText ? 'quran_translation' : 'quran_only');
    } else if (playbackMode === 'quran_translation' && !translationText) {
      setPlaybackMode('quran_only');
    }
  }, [playbackMode, translationText, tafsirText]);

  // Word tokenization and per-ayah segmentation for word-by-word synchronous highlighting + circular verse symbols
  const { tokenizedArabicSegments, totalArabicWordsCount } = useMemo(() => {
    const rawText = currentVerse?.arabicText || '';
    const vNumStr = currentVerse?.verseNumber || '1';
    const cleanText = (str: string) =>
      str
        .replace(/[\u06DD\u06DE]/g, '')
        .replace(/[\u0660-\u0669]+/g, '')
        .trim();

    const subParts = rawText
      .split('۝')
      .map((s) => cleanText(s))
      .filter(Boolean);
    const rangeMatch = vNumStr.match(/^(\d+)\s*-\s*(\d+)$/);
    const startNum = rangeMatch ? parseInt(rangeMatch[1], 10) : parseInt(vNumStr, 10);

    const segments: { verseNumber: string; text: string }[] = [];
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

    let globalIdx = 0;
    const tokenized = segments.map((seg) => {
      const words = seg.text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => ({
          word,
          globalIdx: globalIdx++,
        }));
      return {
        verseNumber: seg.verseNumber,
        words,
      };
    });

    return { tokenizedArabicSegments: tokenized, totalArabicWordsCount: globalIdx };
  }, [currentVerse?.arabicText, currentVerse?.verseNumber]);

  const translationWords = useMemo(
    () => translationText.trim().split(/\s+/).filter(Boolean),
    [translationText]
  );

  const tafsirWords = useMemo(
    () => tafsirText.trim().split(/\s+/).filter(Boolean),
    [tafsirText]
  );

  // Active word indices
  const activeArabicWordIndex = useMemo(() => {
    if (playbackPhase !== 'recitation' || totalArabicWordsCount === 0) return -1;
    const idx = Math.floor(recitationRatio * totalArabicWordsCount);
    return Math.min(totalArabicWordsCount - 1, Math.max(0, idx));
  }, [playbackPhase, recitationRatio, totalArabicWordsCount]);

  const activeTranslationWordIndex = useMemo(() => {
    if (playbackPhase !== 'translation' || translationWords.length === 0) return -1;
    const idx = Math.floor(translationRatio * translationWords.length);
    return Math.min(translationWords.length - 1, Math.max(0, idx));
  }, [playbackPhase, translationRatio, translationWords.length]);

  const activeTafsirWordIndex = useMemo(() => {
    if (playbackPhase !== 'tafsir' || tafsirWords.length === 0) return -1;
    const idx = Math.floor(tafsirRatio * tafsirWords.length);
    return Math.min(tafsirWords.length - 1, Math.max(0, idx));
  }, [playbackPhase, tafsirRatio, tafsirWords.length]);

  useEffect(() => {
    if (currentVerse && onActiveVerseChange) {
      onActiveVerseChange(currentVerse.id);
    }
  }, [currentVerse, onActiveVerseChange]);

  const stopAllSpeech = useCallback(() => {
    playRequestIdRef.current += 1;
    audioRef.current?.pause();
    secondaryCleanupRef.current?.();
    secondaryCleanupRef.current = null;
    phaseRef.current = 'idle';
  }, []);

  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, [stopAllSpeech]);

  useEffect(() => {
    const stop = (event: Event) => {
      if ((event as CustomEvent).detail === audioRef.current) return;
      stopAllSpeech();
      setIsPlaying(false);
      setPlaybackPhase('idle');
    };
    window.addEventListener('hidaya-playback-owner', stop);
    return () => window.removeEventListener('hidaya-playback-owner', stop);
  }, [stopAllSpeech]);

  // Clean reset when changing verse index
  useEffect(() => {
    stopAllSpeech();
    setCurrentTrackIndex(0);
    setRecitationRatio(0);
    setTranslationRatio(0);
    setTafsirRatio(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [currentIndex, stopAllSpeech]);

  const handleNext = useCallback(() => {
    stopAllSpeech();
    if (currentIndex < displayedVerses.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
      setPlaybackPhase('idle');
      setCurrentIndex(0);
    }
  }, [currentIndex, displayedVerses.length, stopAllSpeech]);

  const handlePrev = useCallback(() => {
    stopAllSpeech();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [currentIndex, stopAllSpeech]);

  const activeLanguageRef = useRef(language);
  const playRequestIdRef = useRef(0);
  const cachedPlaylistMetaRef = useRef<Record<string, StoredAudioMetadata>>({});

  // Prefetch stored audio playlist metadata while verse is active/reciting
  // so that when recitation finishes, metadata is already in-memory and Safari can transition without async delay.
  useEffect(() => {
    if (!currentVerse) return;
    const vNumbers = visibleVerseNumbers(currentVerse);
    if (!vNumbers.length) return;

    const controller = new AbortController();
    const transSource = currentVerse.translations[language]?.translator;
    const tafsirSource = currentTafsirCitation?.scholar;

    if (translationText && transSource) {
      const cacheKey = `${currentVerse.id}_${language}_translation_${transSource}`;
      if (!cachedPlaylistMetaRef.current[cacheKey]) {
        void fetchAyahAudioPlaylist({
          verseNumbers: vNumbers,
          surahNumber: currentVerse.surahNumber,
          ayahNumber: currentVerse.verseNumber,
          language,
          type: 'translation',
          source: transSource,
          ayahId: currentVerse.id,
          signal: controller.signal,
        }).then((meta) => {
          if (!controller.signal.aborted && meta.status === 'available') {
            cachedPlaylistMetaRef.current[cacheKey] = meta;
          }
        });
      }
    }

    if (tafsirText && tafsirSource) {
      const cacheKey = `${currentVerse.id}_${language}_tafsir_${tafsirSource}`;
      if (!cachedPlaylistMetaRef.current[cacheKey]) {
        void fetchAyahAudioPlaylist({
          verseNumbers: vNumbers,
          surahNumber: currentVerse.surahNumber,
          ayahNumber: currentVerse.verseNumber,
          language,
          type: 'tafsir',
          source: tafsirSource,
          ayahId: currentVerse.id,
          signal: controller.signal,
        }).then((meta) => {
          if (!controller.signal.aborted && meta.status === 'available') {
            cachedPlaylistMetaRef.current[cacheKey] = meta;
          }
        });
      }
    }

    return () => {
      controller.abort();
    };
  }, [currentVerse, language, translationText, tafsirText, currentTafsirCitation]);

  // On language change, stop previous audio, clear stale content, and ignore late responses
  useEffect(() => {
    activeLanguageRef.current = language;
    playRequestIdRef.current += 1;
    stopAllSpeech();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setPlaybackNotice(null);
    setPlaybackPhase('idle');
    setCurrentTrackIndex(0);
    setRecitationRatio(0);
    setTranslationRatio(0);
    setTafsirRatio(0);
  }, [language, currentVerse?.id, filterQuery, playbackMode, reciterId, stopAllSpeech]);

  // Plays stored neural audio first; skips unavailable segments without automatic browser-speech fallback
  const playStoredAudio = useCallback(
    async (
      type: 'translation' | 'tafsir',
      text: string,
      onProgress: (ratio: number) => void,
      onComplete: () => void
    ) => {
      onProgress(0);
      const reqId = ++playRequestIdRef.current;
      const targetLang = language;

      if (!text || !text.trim() || !currentVerse) {
        onComplete();
        return;
      }

      try {
        const source = type === 'tafsir' ? currentTafsirCitation?.scholar : currentVerse.translations[targetLang]?.translator;
        const cacheKey = `${currentVerse.id}_${targetLang}_${type}_${source || ''}`;
        const meta = cachedPlaylistMetaRef.current[cacheKey] || await fetchAyahAudioPlaylist({
          verseNumbers: visibleVerseNumbers(currentVerse),
          surahNumber: currentVerse.surahNumber,
          ayahNumber: currentVerse.verseNumber,
          language: targetLang,
          type,
          source,
          ayahId: currentVerse.id,
        });

        if (reqId !== playRequestIdRef.current || activeLanguageRef.current !== targetLang) {
          return;
        }

        if (
          meta.status === 'available' &&
          meta.record?.audioUrl &&
          meta.record?.languageCode?.toLowerCase() === targetLang.toLowerCase() &&
          audioRef.current
        ) {
          const sec = audioRef.current;
          phaseRef.current = type;
          let index = 0;
          const urls = meta.audioUrls || [meta.record.audioUrl];
          sec.src = urls[index];
          sec.playbackRate = playbackRate;
          sec.muted = isMuted;

          const onTimeUpdate = () => {
            if (sec.duration > 0) {
              onProgress((index + Math.min(1, sec.currentTime / sec.duration)) / urls.length);
            }
          };

          const cleanup = () => {
            sec.removeEventListener('timeupdate', onTimeUpdate);
            sec.removeEventListener('ended', onEnded);
            sec.removeEventListener('error', onError);
          };

          const playCurrent = async () => {
            try { await sec.play(); }
            catch (error) {
              if (reqId !== playRequestIdRef.current) return;
              if ((error as DOMException)?.name === 'NotAllowedError') {
                setIsPlaying(false);
                setPlaybackNotice('blocked');
                return;
              }
              cleanup();
              setPlaybackNotice('missing');
              onComplete();
            }
          };
          const onEnded = () => {
            if (reqId !== playRequestIdRef.current) return;
            index += 1;
            if (index < urls.length) {
              sec.src = urls[index];
              void playCurrent();
              return;
            }
            cleanup();
            onProgress(1);
            onComplete();
          };
          const onError = () => {
            cleanup();
            if (reqId !== playRequestIdRef.current) return;
            setPlaybackNotice('missing');
            onComplete();
          };
          secondaryCleanupRef.current = cleanup;
          sec.addEventListener('timeupdate', onTimeUpdate);
          sec.addEventListener('ended', onEnded);
          sec.addEventListener('error', onError);
          await playCurrent();
          return;
        }
      } catch (err) {
        console.warn(`Error resolving stored ${type} audio:`, err);
      }

      if (reqId === playRequestIdRef.current) { setPlaybackNotice('missing'); onComplete(); }
    },
    [currentVerse, language, playbackRate, isMuted, currentTafsirCitation]
  );

  const startRecitation = useCallback(() => {
    if (!audioRef.current || !rangeAudioUrls[0]) return;
    stopAllSpeech();
    setPlaybackNotice(null);
    phaseRef.current = 'recitation';
    setCurrentTrackIndex(0);
    audioRef.current.src = rangeAudioUrls[0];
    const request = playRequestIdRef.current;
    window.dispatchEvent(new CustomEvent('hidaya-playback-owner', { detail: audioRef.current }));
    setPlaybackPhase('recitation');
    audioRef.current.playbackRate = playbackRate;
    audioRef.current
      .play()
      .then(() => { if (request === playRequestIdRef.current) setIsPlaying(true); })
      .catch(() => { if (request === playRequestIdRef.current) { setIsPlaying(false); setPlaybackPhase('idle'); } });
  }, [playbackRate, stopAllSpeech, rangeAudioUrls]);

  const handleAudioEnded = useCallback(() => {
    if (!isPlaying || phaseRef.current !== 'recitation') return;

    // Advance to next verse in consecutive range (e.g. Ayah 5 -> Ayah 6)
    if (currentTrackIndex < totalTracks - 1) {
      setCurrentTrackIndex((prev) => prev + 1);
      if (audioRef.current) {
        audioRef.current.src = rangeAudioUrls[currentTrackIndex + 1];
        void audioRef.current.play().catch(() => { setIsPlaying(false); setPlaybackNotice('blocked'); });
      }
      return;
    }

    // Finished reciting all Arabic verses in range
    setRecitationRatio(1);

    if (playbackMode === 'quran_only' || (!translationText && !tafsirText)) {
      handleNext();
      return;
    }

    if (playbackMode === 'quran_translation') {
      if (translationText) {
        setPlaybackPhase('translation');
        playStoredAudio(
          'translation',
          translationText,
          (ratio) => setTranslationRatio(ratio),
          () => {
            handleNext();
          }
        );
      } else {
        handleNext();
      }
      return;
    }

    if (playbackMode === 'quran_tafsir') {
      if (translationText) {
        setPlaybackPhase('translation');
        playStoredAudio(
          'translation',
          translationText,
          (ratio) => setTranslationRatio(ratio),
          () => {
            if (tafsirText) {
              setPlaybackPhase('tafsir');
              playStoredAudio(
                'tafsir',
                tafsirText,
                (ratio) => setTafsirRatio(ratio),
                () => {
                  handleNext();
                }
              );
            } else {
              handleNext();
            }
          }
        );
      } else if (tafsirText) {
        setPlaybackPhase('tafsir');
        playStoredAudio(
          'tafsir',
          tafsirText,
          (ratio) => setTafsirRatio(ratio),
          () => {
            handleNext();
          }
        );
      } else {
        handleNext();
      }
    }
  }, [
    isPlaying,
    currentTrackIndex,
    totalTracks,
    rangeAudioUrls,
    playbackMode,
    translationText,
    tafsirText,
    playStoredAudio,
    handleNext,
  ]);

  const handleTimeUpdate = () => {
    if (phaseRef.current !== 'recitation') return;
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration || 0;
      if (dur > 0) {
        const trackRatio = Math.min(1, Math.max(0, cur / dur));
        const combined = Math.min(1, Math.max(0, (currentTrackIndex + trackRatio) / totalTracks));
        setRecitationRatio(combined);
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startRecitation();
    }
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    // Resume on the same element directly in the user gesture, including Safari denial.
    if (phaseRef.current !== 'idle' && audioRef.current?.src) {
      setIsPlaying(true);
      setPlaybackNotice(null);
      void audioRef.current.play().catch(() => { setIsPlaying(false); setPlaybackNotice('blocked'); });
      return;
    }
    setIsPlaying(true);
    startRecitation();
  };

  const handleSelectReciter = (id: ReciterId) => {
    setReciterId(id);
    StorageService.setPreferredReciter(id);
  };

  const cycleSpeed = () => {
    const speeds = [1, 0.75, 1.25];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;

    }
  };

  if (!currentVerse) return <div><input aria-label={t.searchPlaceholder} value={filterQuery} onChange={(event) => setFilterQuery(event.target.value)} /><p role="status">{({ en: 'No matching passages', sv: 'Inga matchande verser', fr: 'Aucun passage correspondant', ar: 'لا توجد آيات مطابقة' })[language]}</p></div>;

  const activeReciter =
    AVAILABLE_RECITERS.find((r) => r.id === reciterId) || AVAILABLE_RECITERS[0];

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="w-full max-w-3xl mx-auto space-y-6 animate-fadeIn"
    >
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        onError={() => { if (phaseRef.current !== 'recitation') return; stopAllSpeech(); setIsPlaying(false); setPlaybackPhase('idle'); setPlaybackNotice('missing'); }}
      />

      <p className="text-xs text-slate-500" role="note">{({ en: 'Highlighting is approximate, based on playback duration; word timestamps are unavailable.', sv: 'Markeringen är ungefärlig och baseras på ljudets längd; tidsstämplar för ord saknas.', fr: 'Le surlignage est approximatif, basé sur la durée audio ; les horodatages des mots ne sont pas disponibles.', ar: 'تمييز الكلمات تقريبي حسب مدة التسجيل؛ لا تتوفر توقيتات الكلمات.' })[language]}</p>
      {playbackNotice && <p role="status" className="text-sm text-amber-700">{playbackNotice === 'blocked'
        ? ({ en: 'Tap Play to continue the recording.', sv: 'Tryck på Spela för att fortsätta inspelningen.', fr: 'Appuyez sur Lire pour continuer l’enregistrement.', ar: 'اضغط تشغيل لمتابعة التسجيل.' })[language]
        : ({ en: 'No playable recording for this passage in the selected language. Missing recordings are skipped.', sv: 'Ingen spelbar inspelning för detta avsnitt på det valda språket. Saknade inspelningar hoppas över.', fr: 'Aucun enregistrement disponible pour ce passage dans la langue choisie. Les enregistrements manquants sont ignorés.', ar: 'لا يتوفر تسجيل قابل للتشغيل لهذا المقطع باللغة المختارة. يتم تجاوز التسجيلات المفقودة.' })[language]}</p>}
      {/* Main Audio Sanctuary Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0A1E17] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-emerald-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-50">
                {t.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.subtitle}</p>
            </div>
          </div>

          {/* Phase Badge */}
          {isPlaying && playbackPhase !== 'idle' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>
                {playbackPhase === 'recitation'
                  ? t.phaseRecitation
                  : playbackPhase === 'translation'
                  ? t.phaseTranslation
                  : t.phaseTafsir}
              </span>
            </div>
          )}
        </div>

        {/* Search & Filter Verses within Audio Contemplation */}
        <div className="relative">
          <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-emerald-800 dark:text-emerald-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => {
              setFilterQuery(e.target.value);
              setCurrentIndex(0);
            }}
            aria-label={t.searchPlaceholder}
            placeholder={t.searchPlaceholder}
            className="w-full py-2.5 ps-10 pe-10 text-xs sm:text-sm rounded-2xl bg-[#FAF8F5] dark:bg-[#071711] border border-emerald-900/15 dark:border-emerald-800/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500 transition-colors"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => {
                setFilterQuery('');
                setCurrentIndex(0);
              }}
              className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Clear filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mode Selector (Quran Only · Quran + Trans · Quran + Tafsir) */}
        <div className="flex items-center gap-1.5 p-1 bg-emerald-900/5 dark:bg-emerald-950/60 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/40">
          <button
            type="button"
            onClick={() => {
              setPlaybackMode('quran_only');
              if (isPlaying) {
                stopAllSpeech();
                setCurrentTrackIndex(0);
                startRecitation();
              }
            }}
            aria-pressed={playbackMode === 'quran_only'}
            className={`flex-1 min-h-[40px] py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              playbackMode === 'quran_only'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100'
            }`}
          >
            {t.modeQuranOnly}
          </button>
          {translationText && (
            <button
              type="button"
              onClick={() => {
                setPlaybackMode('quran_translation');
                if (isPlaying) {
                  stopAllSpeech();
                  setCurrentTrackIndex(0);
                  startRecitation();
                }
              }}
              aria-pressed={playbackMode === 'quran_translation'}
              className={`flex-1 min-h-[40px] py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                playbackMode === 'quran_translation'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100'
              }`}
            >
              {t.modeWithTranslation}
            </button>
          )}
          {tafsirText && (
            <button
              type="button"
              onClick={() => {
                setPlaybackMode('quran_tafsir');
                if (isPlaying) {
                  stopAllSpeech();
                  setCurrentTrackIndex(0);
                  startRecitation();
                }
              }}
              aria-pressed={playbackMode === 'quran_tafsir'}
              className={`flex-1 min-h-[40px] py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                playbackMode === 'quran_tafsir'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100'
              }`}
            >
              {t.modeWithTafsir}
            </button>
          )}
        </div>

        {/* Active Multi-Level Card Display with Synchronized Word-by-Word Highlighting */}
        <div className="p-5 sm:p-7 rounded-2xl bg-[#FAF8F5] dark:bg-[#071711] border border-emerald-900/10 dark:border-emerald-800/30 space-y-5">
          {/* Card Top Sub-Header */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-emerald-900/10 dark:border-emerald-800/30 pb-3">
            <span className="font-semibold text-emerald-900 dark:text-emerald-300 inline-flex items-center gap-2">
              <AyahCartouche
                number={currentVerse.verseNumber}
                size="md"
                className="text-amber-700 dark:text-amber-400"
              />
              <span>
                {localizedDetails?.surahPrefix || 'Surah'}{' '}
                {localizedDetails?.surahNameDisplay || currentVerse.surahNameTransliterated}{' '}
                {totalTracks > 1 ? `(${currentTrackIndex + 1}/${totalTracks})` : ''}
              </span>
            </span>
            <span className="tabular-nums">
              {currentIndex + 1} / {displayedVerses.length} · {activeReciter.name}
            </span>
          </div>

          {/* LEVEL 1: Verified Uthmani Arabic Script with synchronized word highlighting & circular verse symbols */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block tracking-wider uppercase">
              Level 1 · Uthmani Script
            </span>
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-right text-2xl sm:text-3xl text-emerald-950 dark:text-emerald-50 leading-loose select-text"
            >
              {tokenizedArabicSegments.map((seg, segIdx) => (
                <React.Fragment key={segIdx}>
                  {seg.words.map(({ word, globalIdx }) => {
                    const isWordActive =
                      playbackPhase === 'recitation' && globalIdx === activeArabicWordIndex;
                    return (
                      <React.Fragment key={globalIdx}>
                        <span
                          className={`inline-block rounded-lg px-0.5 transition-colors duration-150 ${
                            isWordActive
                              ? 'bg-amber-400/35 dark:bg-amber-400/30 text-emerald-950 dark:text-amber-200 underline decoration-amber-500 decoration-2 underline-offset-8'
                              : ''
                          }`}
                        >
                          {word}
                        </span>{' '}
                      </React.Fragment>
                    );
                  })}
                  <span className="inline-flex items-center align-middle mx-1 text-amber-700 dark:text-amber-400 select-none">
                    <AyahCartouche number={seg.verseNumber} size="inline" />
                  </span>{' '}
                </React.Fragment>
              ))}
            </p>
          </div>

          {/* LEVEL 2: Certified Translation with synchronized word highlighting */}
          {translationText && (
            <div className="space-y-1 pt-3 border-t border-emerald-900/10 dark:border-emerald-800/30">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 block tracking-wider uppercase">
                Level 2 · Translation ({currentVerse.translations[language]?.translator || 'Certified Translation'})
              </span>
              <blockquote className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed italic">
                &ldquo;
                {translationWords.map((word, idx) => {
                  const isWordActive =
                    playbackPhase === 'translation' && idx === activeTranslationWordIndex;
                  return (
                    <React.Fragment key={idx}>
                      <span
                        className={`inline-block rounded-md px-0.5 transition-colors duration-150 ${
                          isWordActive
                            ? 'bg-amber-400/35 dark:bg-amber-400/30 text-emerald-950 dark:text-amber-200 underline decoration-amber-500 decoration-2 underline-offset-4'
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
            </div>
          )}

          {/* LEVEL 3: Classical Tafsir with synchronized word highlighting (included in 'quran_tafsir' mode) */}
          {playbackMode === 'quran_tafsir' && currentTafsirCitation && tafsirText && (
            <div className="space-y-2 pt-3 border-t border-emerald-900/10 dark:border-emerald-800/30 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {currentTafsirCitation.scholar} · {currentTafsirCitation.sourceBook}
                  </span>
                </span>
                <Quote className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 opacity-70" />
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {tafsirWords.map((word, idx) => {
                  const isWordActive =
                    playbackPhase === 'tafsir' && idx === activeTafsirWordIndex;
                  return (
                    <React.Fragment key={idx}>
                      <span
                        className={`inline-block rounded-md px-0.5 transition-colors duration-150 ${
                          isWordActive
                            ? 'bg-amber-400/35 dark:bg-amber-400/30 text-emerald-950 dark:text-amber-200 underline decoration-amber-500 decoration-2 underline-offset-4'
                            : ''
                        }`}
                      >
                        {word}
                      </span>{' '}
                    </React.Fragment>
                  );
                })}
              </p>
            </div>
          )}
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <button
            type="button"
            onClick={cycleSpeed}
            className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-800/40 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer tabular-nums hover:border-emerald-600 transition-colors"
          >
            {playbackRate}x
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-emerald-800/40 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer hover:border-emerald-600 transition-colors"
              aria-label="Previous verse"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-emerald-800 hover:bg-emerald-700 text-amber-300 flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ms-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex >= displayedVerses.length - 1}
              className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-emerald-800/40 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer hover:border-emerald-600 transition-colors"
              aria-label="Next verse"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const nextMute = !isMuted;
              setIsMuted(nextMute);
              if (audioRef.current) audioRef.current.muted = nextMute;
            }}
            className="min-h-[42px] min-w-[42px] p-2 rounded-xl border border-slate-200 dark:border-emerald-800/40 flex items-center justify-center text-slate-700 dark:text-slate-300 cursor-pointer hover:border-emerald-600 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Reciter Selection */}
        <div className="pt-4 border-t border-slate-100 dark:border-emerald-900/30 space-y-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            {t.reciterLabel}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AVAILABLE_RECITERS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectReciter(r.id)}
                className={`p-2.5 rounded-xl border text-start text-xs transition-all cursor-pointer ${
                  r.id === reciterId
                    ? 'bg-emerald-800 text-white border-emerald-700 font-semibold shadow-2xs'
                    : 'bg-[#FAF8F5] dark:bg-emerald-950/40 border-emerald-900/10 dark:border-emerald-800/30 text-slate-700 dark:text-slate-300 hover:border-emerald-600'
                }`}
              >
                <span className="block truncate">{r.name}</span>
                <span className="text-[10px] opacity-75 block truncate">{r.style}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Playlist Queue */}
        <div className="pt-4 border-t border-slate-100 dark:border-emerald-900/30 space-y-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            {t.queueLabel} ({displayedVerses.length})
          </span>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pe-1">
            {displayedVerses.map((v, idx) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-full p-3 rounded-xl text-start flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  idx === currentIndex
                    ? 'bg-emerald-900/10 dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 font-semibold border border-emerald-900/20 dark:border-emerald-700/40'
                    : 'hover:bg-slate-50 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-400 border border-transparent'
                }`}
              >
                <span>
                  {idx + 1}. Surah {v.surahNameTransliterated} ({v.id})
                </span>
                <span className="font-arabic text-sm text-amber-700 dark:text-amber-400">
                  {v.surahNameArabic}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
