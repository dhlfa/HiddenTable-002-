import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Star } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { BackButton } from '../components/ui/BackButton';
import { SectionTitle } from '../components/ui/SectionTitle';
import { MysticButton } from '../components/ui/MysticButton';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { TarotCard } from '../components/cards/CardFaces';
import { useReadingSessionContext } from '../hooks/readingSessionContext';
import { useJournal } from '../hooks/useJournal';
import { useSettings } from '../hooks/useSettings';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useToast } from '../components/ui/Toast';
import { soundManager } from '../services/sound';
import { generateId } from '../utils/id';
import { formatDate } from '../utils/date';
import { generateReading } from '../services/hiddenTableApi';
import type { ReadingResult } from '../types';

type Phase = 'revealing' | 'loading' | 'result' | 'error';

const loadingMessages = [
  'Sang Penjaga sedang mempelajari kartu…',
  'Pola mulai muncul…',
  'Refleksi Anda sedang disiapkan…',
];

export function ReadingResult() {
  const navigate = useNavigate();
  const session = useReadingSessionContext();
  const { save, toggleFavorite } = useJournal();
  const { settings } = useSettings();
  const reducedMotion = useReducedMotion(settings.reduceMotion);
  const { showToast } = useToast();

  const [phase, setPhase] = useState<Phase>('revealing');
  const [revealedCount, setRevealedCount] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [apiResult, setApiResult] = useState<string | null>(null);
  const [readingId, setReadingId] = useState<string | undefined>(undefined);
  const [isOffline, setIsOffline] = useState(false);
  const [saved, setSaved] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);

  const cards = session.selectedCards;
  const hasFetchedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!cards.length) { navigate('/reading'); return; }
    if (reducedMotion) { setRevealedCount(cards.length); return; }
    if (revealedCount >= cards.length) return;
    const t = setTimeout(() => { soundManager.play('flip'); setRevealedCount((c) => c + 1); }, 800);
    return () => clearTimeout(t);
  }, [revealedCount, cards.length, reducedMotion, navigate, cards]);

  const callApi = useCallback(() => {
    if (!session.spread || !cards.length) return;
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    setPhase('loading');
    setErrorMessage('');
    setLoadingMessageIndex(0);

    const msgInterval = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % loadingMessages.length);
    }, 3500);

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 90000);

    generateReading({
      question: session.question,
      category: session.category,
      spread: session.spread,
      cards,
      language: session.language,
    }, controller.signal)
      .then((data) => {
        clearTimeout(timeout);
        clearInterval(msgInterval);
        setApiResult(data.result);
        setReadingId(data.reading_id);
        setIsOffline(false);
        setPhase('result');
        soundManager.play('success');
      })
      .catch((err: unknown) => {
        clearTimeout(timeout);
        clearInterval(msgInterval);
        const message = err instanceof DOMException && err.name === 'AbortError'
          ? 'Waktu permintaan habis. Periksa koneksi lalu coba lagi.'
          : err instanceof Error
            ? err.message
            : 'Terjadi kesalahan yang tidak diketahui.';
        console.error('[HiddenTable] API request failed:', message);
        setErrorMessage(message);
        setPhase('error');
        soundManager.play('error');
      });
  }, [session.spread, session.question, session.category, session.language, cards]);

  useEffect(() => {
    if (revealedCount >= cards.length && cards.length > 0 && phase === 'revealing') {
      const t = setTimeout(() => callApi(), 500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [revealedCount, cards.length, phase, callApi]);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const handleRetry = useCallback(() => {
    setErrorMessage('');
    hasFetchedRef.current = false;
    callApi();
  }, [callApi]);

  const handleSaveToJournal = useCallback(() => {
    if (!session.spread || !apiResult) return;
    const result: ReadingResult = {
      id: readingId || generateId(),
      date: new Date().toISOString(),
      question: session.question,
      category: session.category,
      spreadId: session.spread.id,
      spreadName: session.spread.name,
      cards,
      overallReflection: '',
      positionMeanings: [],
      patternBetweenCards: '',
      reflection: apiResult,
      considerations: '',
      readingId,
      favorite,
    };
    save(result);
    setSaved(true);
    setSavedId(result.id);
    soundManager.play('click');
    showToast('Tersimpan ke jurnal.');
  }, [session, cards, apiResult, readingId, favorite, save, showToast]);

  const handleToggleFavorite = useCallback(() => {
    setFavorite((f) => !f);
    if (savedId) toggleFavorite(savedId);
  }, [savedId, toggleFavorite]);

  const buildShareText = useCallback(() => {
    const cardLines = cards.map((c) => `- ${c.positionName}: ${c.card.name} (${c.orientation === 'upright' ? 'Tegak' : 'Terbalik'})`).join('\n');
    return [
      `The Hidden Table — ${session.spread?.name ?? 'Pembacaan'}`,
      session.question ? `Pertanyaan: "${session.question}"` : '',
      '',
      cardLines,
      '',
      apiResult ?? '',
    ].filter(Boolean).join('\n');
  }, [cards, session.spread, session.question, apiResult]);

  const handleShare = useCallback(async () => {
    const text = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'The Hidden Table', text });
        return;
      } catch {
        // Fall through to clipboard if share is cancelled or unsupported.
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('Teks pembacaan disalin ke clipboard.');
    } catch {
      showToast('Tidak dapat membagikan atau menyalin teks.', 'error');
    }
  }, [buildShareText, showToast]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildShareText());
      showToast('Teks pembacaan disalin.');
    } catch {
      showToast('Tidak dapat menyalin teks.', 'error');
    }
  }, [buildShareText, showToast]);

  const handleOfflineFallback = useCallback(() => {
    if (!session.spread) return;
    const fallback = [
      '## Gambaran Utama',
      '',
      'Sang Penjaga tidak dapat menjangkau arus yang lebih dalam. Berikut adalah refleksi yang diambil dari kartu itu sendiri.',
      '',
      '## Makna Setiap Posisi',
      '',
      ...cards.map((c) => `- **${c.positionName}** — ${c.card.name} (${c.orientation}): ${c.orientation === 'upright' ? c.card.upright : c.card.reversed}`),
      '',
      '## Hubungan Antarkartu',
      '',
      `Aliran dari ${cards.map((c) => c.card.name).join(' → ')} membentuk sebuah narasi. Perhatikan di mana energi berubah, di mana ia memuncak, dan di mana ia mereda.`,
      '',
      '## Pesan Refleksi',
      '',
      'Hasil ini dibuat secara offline karena koneksi ke The Keeper terputus. Coba lagi nanti untuk mendapatkan tafsir yang lebih dalam.',
      '',
      '## Hal yang Dapat Dipertimbangkan',
      '',
      `Pertimbangkan tema-tema berikut: ${cards.flatMap((c) => c.card.keywords).slice(0, 6).join(', ')}.`,
    ].join('\n');

    setApiResult(fallback);
    setIsOffline(true);
    setPhase('result');
  }, [session.spread, cards]);

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-6 md:py-8">
        <div className="max-w-3xl mx-auto">
          <BackButton to="/chamber" label="Kembali ke Ruang" />
          <SectionTitle className="mt-6 mb-2">{session.spread?.name || 'Reading'}</SectionTitle>
          {session.question && (
            <p className="text-center font-cormorant text-lg text-muted italic mb-6">"{session.question}"</p>
          )}

          {/* Revealed cards */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8">
            {cards.map((sc, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: i < revealedCount ? 1 : 0.3, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-2">
                <TarotCard card={sc.card} orientation={sc.orientation} revealed={i < revealedCount} size="md" />
                <p className="font-cinzel text-xs text-gold-light text-center max-w-[100px]">{sc.positionName}</p>
                <p className="font-inter text-[10px] text-muted text-center max-w-[100px]">{sc.card.name}</p>
              </motion.div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Loading */}
            {phase === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center py-8">
                <motion.div animate={reducedMotion ? {} : { rotate: 360 }}
                  transition={reducedMotion ? {} : { duration: 8, repeat: Infinity, ease: 'linear' }} className="mb-6">
                  <svg viewBox="0 0 60 60" className="w-12 h-12" fill="none">
                    <circle cx="30" cy="30" r="25" stroke="rgba(200,167,91,0.15)" strokeWidth="1" />
                    <path d="M30 8 L32 30 L30 52 L28 30 Z" fill="rgba(200,167,91,0.4)" />
                    <path d="M8 30 L30 28 L52 30 L30 32 Z" fill="rgba(200,167,91,0.2)" />
                    <circle cx="30" cy="30" r="2" fill="rgba(200,167,91,0.6)" />
                  </svg>
                </motion.div>
                <AnimatePresence mode="wait">
                  <motion.p key={loadingMessageIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}
                    className="font-cormorant text-lg text-muted italic text-center">
                    {loadingMessages[loadingMessageIndex]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            )}

            {/* Error */}
            {phase === 'error' && (
              <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass-panel rounded-xl p-6 text-center max-w-md mx-auto">
                <p className="font-cormorant text-lg text-cream/80 italic mb-2">Sang Penjaga tidak dapat menyelesaikan refleksi ini.</p>
                <p className="font-inter text-sm text-muted mb-6">{errorMessage || 'Silakan coba lagi.'}</p>
                <div className="flex flex-col gap-3 items-center">
                  <MysticButton variant="primary" onClick={handleRetry}>Coba Lagi</MysticButton>
                  <button onClick={handleOfflineFallback}
                    className="font-inter text-xs text-muted hover:text-gold transition-colors touch-target">
                    Baca offline (terbatas)
                  </button>
                </div>
              </motion.div>
            )}

            {/* Result */}
            {phase === 'result' && apiResult && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                {isOffline && (
                  <div className="glass-panel rounded-lg p-3 mb-4 text-center">
                    <p className="font-inter text-xs text-gold/60">⚠ Refleksi ini dibuat secara offline. Hasil mungkin terbatas.</p>
                  </div>
                )}
                <div className="glass-panel rounded-xl p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-cinzel text-sm text-gold-light">Sang Penjaga Berbicara</span>
                    {readingId && <span className="font-inter text-[10px] text-muted ml-auto">{readingId}</span>}
                  </div>
                  <MarkdownRenderer content={apiResult} className="space-y-1" />
                  {readingId && <p className="font-inter text-[10px] text-muted mt-6 text-center">{formatDate(new Date().toISOString())}</p>}
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  <MysticButton variant="outline" onClick={handleSaveToJournal} disabled={saved}>
                    {saved ? 'Tersimpan di Jurnal' : 'Simpan ke Jurnal'}
                  </MysticButton>
                  {saved && (
                    <MysticButton variant="ghost" onClick={handleToggleFavorite} aria-pressed={favorite}>
                      <Star className="w-3.5 h-3.5" strokeWidth={1.5} fill={favorite ? 'currentColor' : 'none'} style={{ color: favorite ? '#C8A75B' : undefined }} />
                      {favorite ? 'Favorit' : 'Tandai Favorit'}
                    </MysticButton>
                  )}
                  <MysticButton variant="ghost" onClick={handleShare}>
                    <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Bagikan
                  </MysticButton>
                  <MysticButton variant="ghost" onClick={handleCopy}>
                    <Copy className="w-3.5 h-3.5" strokeWidth={1.5} /> Salin Teks
                  </MysticButton>
                  <MysticButton variant="ghost" onClick={() => { session.reset(); navigate('/reading'); }}>Pembacaan Baru</MysticButton>
                  <MysticButton variant="ghost" onClick={() => navigate('/chamber')}>Kembali ke Beranda</MysticButton>
                </div>
                <p className="text-center font-inter text-[10px] text-muted mt-6 max-w-md mx-auto">
                  Pembacaan tarot untuk refleksi dan hiburan. Tidak menggantikan saran profesional.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
