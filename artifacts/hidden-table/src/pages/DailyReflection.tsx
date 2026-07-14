import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { BackButton } from '../components/ui/BackButton';
import { SectionTitle } from '../components/ui/SectionTitle';
import { MysticButton } from '../components/ui/MysticButton';
import { TarotCard } from '../components/cards/CardFaces';
import { CardBack } from '../components/cards/CardFaces';
import { getOrCreateDailyCard, toggleDailyCardFavorite, updateDailyCardMood, updateDailyCardNote, getDailyCardHistory } from '../services/dailyCard';
import { useJournal } from '../hooks/useJournal';
import { useSettings } from '../hooks/useSettings';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useToast } from '../components/ui/Toast';
import { soundManager } from '../services/sound';
import { getTodayDisplayDate, formatDate } from '../utils/date';
import { MOOD_OPTIONS } from '../types';
import type { DailyCard, ReadingResult } from '../types';

export function DailyReflection() {
  const { settings } = useSettings();
  const reducedMotion = useReducedMotion(settings.reduceMotion);
  const { save } = useJournal();
  const { showToast } = useToast();
  const [dailyCard, setDailyCard] = useState<DailyCard | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const dc = getOrCreateDailyCard();
    setDailyCard(dc);
    setNoteDraft(dc.note ?? '');
    const sessionKey = `the-hidden-table:daily-revealed:${dc.date}`;
    if (sessionStorage.getItem(sessionKey) === 'true') setRevealed(true);
  }, []);

  const handleReveal = () => {
    if (!dailyCard) return;
    soundManager.play('flip');
    setRevealed(true);
    sessionStorage.setItem(`the-hidden-table:daily-revealed:${dailyCard.date}`, 'true');
  };

  const handleToggleFavorite = () => {
    if (!dailyCard) return;
    setDailyCard(toggleDailyCardFavorite(dailyCard));
  };

  const handleMood = (mood: string) => {
    if (!dailyCard) return;
    setDailyCard(updateDailyCardMood(dailyCard, dailyCard.mood === mood ? '' : mood));
  };

  const handleNoteBlur = () => {
    if (!dailyCard) return;
    setDailyCard(updateDailyCardNote(dailyCard, noteDraft));
    showToast('Catatan disimpan.');
  };

  const handleSaveToJournal = () => {
    if (!dailyCard) return;
    const result: ReadingResult = {
      id: `daily-${dailyCard.date}`, date: new Date().toISOString(),
      question: 'Kartu Harian', category: 'General', spreadId: 'one-card', spreadName: 'Kartu Harian',
      cards: [{ card: dailyCard.card, orientation: dailyCard.orientation, positionIndex: 0, positionName: 'Refleksi' }],
      overallReflection: dailyCard.reflection, positionMeanings: [{ positionName: 'Refleksi', meaning: dailyCard.reflection }],
      patternBetweenCards: 'Dengan satu kartu, pola adalah kartu itu sendiri.',
      reflection: dailyCard.reflection, considerations: 'Pertimbangkan bagaimana energi kartu ini sudah hadir dalam keseharian Anda.',
      note: dailyCard.note,
    };
    save(result); setSaved(true); soundManager.play('click');
    showToast('Tersimpan ke jurnal.');
  };

  const history = showHistory ? getDailyCardHistory().filter((h) => h.date !== dailyCard?.date) : [];

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          <BackButton label="Kembali" />
          <SectionTitle className="mt-6">Kartu Harian</SectionTitle>
          <p className="text-center font-cormorant text-lg text-muted italic mb-8">{getTodayDisplayDate()}</p>
          <div className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              {!revealed ? (
                <motion.div key="unrevealed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
                  <motion.div animate={reducedMotion ? {} : { y: [0, -4, 0] }} transition={reducedMotion ? {} : { duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="mb-8"><CardBack size="lg" /></motion.div>
                  <MysticButton variant="primary" size="lg" onClick={handleReveal}>Ungkap Kartu Hari Ini</MysticButton>
                </motion.div>
              ) : (
                <motion.div key="revealed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center w-full">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.4, 0.2] }} transition={{ duration: 2, ease: 'easeOut' }} className="absolute"
                    style={{ width: 200, height: 200, background: `radial-gradient(circle, ${dailyCard?.card.accentColor}20 0%, transparent 70%)` }} />
                  <div className="relative">
                    <TarotCard card={dailyCard?.card} orientation={dailyCard?.orientation} revealed size="lg" />
                    <button onClick={handleToggleFavorite} aria-label={dailyCard?.favorite ? 'Hapus dari favorit' : 'Tandai sebagai favorit'}
                      aria-pressed={!!dailyCard?.favorite}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full glass-panel flex items-center justify-center touch-target text-muted hover:text-gold transition-colors">
                      <Star className="w-4 h-4" strokeWidth={1.5} fill={dailyCard?.favorite ? 'currentColor' : 'none'} style={{ color: dailyCard?.favorite ? '#C8A75B' : undefined }} />
                    </button>
                  </div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="text-center mt-6 max-w-md">
                    <h3 className="font-cinzel text-xl text-cream mb-1">{dailyCard?.card.name}</h3>
                    <p className="font-cormorant text-sm text-gold-light mb-4">{dailyCard?.orientation === 'reversed' ? 'Terbalik' : 'Tegak'}</p>
                    <p className="font-cormorant text-lg text-cream/70 leading-relaxed italic">{dailyCard?.reflection}</p>
                  </motion.div>

                  <div className="mt-8 w-full max-w-md">
                    <p className="font-cinzel text-xs text-gold-light mb-2 text-center">Bagaimana perasaan Anda hari ini?</p>
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {MOOD_OPTIONS.map((mood) => (
                        <button key={mood} onClick={() => handleMood(mood)}
                          className={`px-3 py-1.5 rounded-full text-xs font-inter transition-all touch-target ${dailyCard?.mood === mood ? 'bg-gold/20 border border-gold/50 text-cream' : 'bg-midnight-light/40 border border-cream/10 text-muted hover:border-gold/20'}`}>
                          {mood}
                        </button>
                      ))}
                    </div>
                    <label htmlFor="daily-note" className="font-cinzel text-xs text-gold-light mb-2 block text-center">Catatan Pribadi</label>
                    <textarea
                      id="daily-note"
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value.slice(0, 500))}
                      onBlur={handleNoteBlur}
                      rows={2}
                      placeholder="Apa yang ingin Anda ingat dari hari ini?"
                      className="w-full glass-panel rounded-lg p-3 text-sm text-cream font-inter placeholder:text-muted/40 focus:outline-none focus:border-gold/30 transition-colors resize-none"
                    />
                  </div>

                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <MysticButton variant="outline" size="md" onClick={handleSaveToJournal} disabled={saved}>{saved ? 'Tersimpan di Jurnal' : 'Simpan ke Jurnal'}</MysticButton>
                    <MysticButton variant="ghost" size="md" onClick={() => setShowHistory((v) => !v)}>{showHistory ? 'Sembunyikan Riwayat' : 'Lihat Riwayat'}</MysticButton>
                  </div>

                  {showHistory && (
                    <div className="mt-6 w-full max-w-md space-y-2">
                      {history.length === 0 ? (
                        <p className="text-center font-cormorant text-sm text-muted italic">Belum ada riwayat kartu harian lainnya.</p>
                      ) : history.map((h) => (
                        <div key={h.date} className="glass-panel rounded-lg p-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-cinzel text-xs text-cream">{h.card.name} {h.favorite && '★'}</p>
                            <p className="font-inter text-[10px] text-muted">{formatDate(h.date)}{h.mood ? ` · ${h.mood}` : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
