import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../components/ui/PageTransition';
import { BackButton } from '../components/ui/BackButton';
import { SectionTitle } from '../components/ui/SectionTitle';
import { MysticButton } from '../components/ui/MysticButton';
import { spreads } from '../data/spreads';
import { useReadingSessionContext } from '../hooks/readingSessionContext';
import { useSettings } from '../hooks/useSettings';
import { soundManager } from '../services/sound';
import type { Spread, ReadingCategory } from '../types';

const categories: ReadingCategory[] = ['General', 'Love', 'Career', 'Decision', 'Spiritual', 'Shadow Work'];

const exampleQuestions: Record<ReadingCategory, string[]> = {
  General: ['Apa yang perlu saya pahami saat ini?', 'Energi apa yang sedang mengelilingi saya?'],
  Love: ['Bagaimana dinamika hubungan kami?', 'Apa yang perlu saya pahami tentang kehidupan cinta saya?'],
  Career: ['Arah apa yang sebaiknya saya ambil dalam karier?', 'Apa yang menghambat perkembangan profesional saya?'],
  Decision: ['Jalan mana yang sebaiknya saya pilih?', 'Apa yang dapat membantu saya mengambil keputusan?'],
  Spiritual: ['Apa yang sedang berusaha disampaikan oleh batin saya?', 'Pelajaran spiritual apa yang sedang hadir?'],
  'Shadow Work': ['Apa yang belum saya lihat dengan jelas?', 'Apa yang ingin disampaikan sisi bayangan saya?'],
};

export function ReadingRoom() {
  const navigate = useNavigate();
  const session = useReadingSessionContext();
  const { settings } = useSettings();
  const [step, setStep] = useState<'spread' | 'question'>(session.spread ? 'question' : 'spread');
  const [selectedSpread, setSelectedSpread] = useState<Spread | null>(session.spread);
  const [question, setQuestion] = useState(session.question);
  const [category, setCategory] = useState<ReadingCategory>(session.category);
  const trimmedQuestion = question.trim();
  const isQuestionTooShort = trimmedQuestion.length < 3;

  const handleSelectSpread = useCallback((spread: Spread) => {
    soundManager.play('click');
    setSelectedSpread(spread);
    session.setSpread(spread);
    session.setSelectedCards([]);
    session.setResult(null);
    setStep('question');
  }, [session]);

  const handleStart = useCallback(() => {
    if (!selectedSpread || isQuestionTooShort) return;
    session.setQuestion(question.trim());
    session.setCategory(category);
    session.setLanguage(settings.language);
    session.setSelectedCards([]);
    session.setResult(null);
    soundManager.play('flip');
    navigate('/reading/cards');
  }, [selectedSpread, isQuestionTooShort, question, category, settings.language, session, navigate]);

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-6 md:py-8">
        <div className="max-w-3xl mx-auto">
          <BackButton to="/chamber" label="Kembali ke Ruang" />
          <SectionTitle className="mt-6 mb-8">{step === 'spread' ? 'Pilih Spread' : 'Pertanyaan Anda'}</SectionTitle>
          <AnimatePresence mode="wait">
            {step === 'spread' ? (
              <motion.div
                key="spread"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {spreads.map((spread) => (
                  <button
                    key={spread.id}
                    type="button"
                    onClick={() => handleSelectSpread(spread)}
                    className={`glass-panel rounded-xl p-4 text-left transition-all hover:border-gold/30 hover:shadow-gold-sm touch-target ${selectedSpread?.id === spread.id ? 'border-gold/50 shadow-gold-sm' : ''}`}
                  >
                    <h3 className="font-cinzel text-base text-cream mb-1">{spread.name}</h3>
                    <p className="font-cormorant text-sm text-muted italic">{spread.description}</p>
                    <p className="font-inter text-xs text-gold/60 mt-2">{spread.cardCount} kartu</p>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="question"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <label className="font-cinzel text-sm text-gold-light mb-3 block">Kategori</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-inter transition-all touch-target ${category === cat ? 'bg-gold/20 border border-gold/50 text-cream' : 'bg-midnight-light/40 border border-cream/10 text-muted hover:border-gold/20'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="reading-question" className="font-cinzel text-sm text-gold-light mb-3 block">Pertanyaan Anda</label>
                  <textarea
                    id="reading-question"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value.slice(0, 500))}
                    placeholder="Apa yang ingin Anda tanyakan kepada kartu?"
                    rows={3}
                    maxLength={500}
                    aria-describedby="reading-question-hint"
                    className="w-full glass-panel rounded-xl p-4 text-cream font-cormorant text-lg placeholder:text-muted/50 focus:outline-none focus:border-gold/30 transition-colors resize-none"
                  />
                  <div id="reading-question-hint" className="flex items-center justify-between text-xs text-muted mt-1 font-inter">
                    <span>{isQuestionTooShort ? 'Minimal 3 karakter.' : '\u00A0'}</span>
                    <span>{question.length} / 500</span>
                  </div>
                </div>
                <div>
                  <p className="font-cinzel text-xs text-gold/60 mb-2">Contoh Pertanyaan</p>
                  <div className="flex flex-col gap-2">
                    {exampleQuestions[category].map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => setQuestion(example)}
                        className="text-left font-cormorant text-sm text-muted hover:text-cream transition-colors italic"
                      >
                        “{example}”
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <MysticButton variant="ghost" onClick={() => setStep('spread')}>Kembali</MysticButton>
                  <MysticButton variant="primary" onClick={handleStart} disabled={isQuestionTooShort} fullWidth>
                    Kocok Kartu
                  </MysticButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
