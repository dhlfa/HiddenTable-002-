import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/ui/PageTransition';
import { BackButton } from '../components/ui/BackButton';
import { MysticButton } from '../components/ui/MysticButton';
import { CardDeck } from '../components/cards/CardDeck';
import { TarotCard } from '../components/cards/CardFaces';
import { useReadingSessionContext } from '../hooks/readingSessionContext';
import { tarotCards } from '../data/cards';
import { getOrientation } from '../utils/orientation';
import type { SelectedCard } from '../types';
import { soundManager } from '../services/sound';

interface ChosenCard {
  index: number;
  cardId: number;
}

export function CardSelection() {
  const navigate = useNavigate();
  const session = useReadingSessionContext();
  const [shuffled, setShuffled] = useState(false);
  const [chosenCards, setChosenCards] = useState<ChosenCard[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const requiredCount = session.spread?.cardCount ?? 1;
  const selectedIndices = useMemo(() => chosenCards.map((item) => item.index), [chosenCards]);

  useEffect(() => {
    if (!session.spread) navigate('/reading', { replace: true });
  }, [session.spread, navigate]);

  useEffect(() => {
    if (chosenCards.length < requiredCount) {
      setAllSelected(false);
      return;
    }
    const timer = window.setTimeout(() => setAllSelected(true), 350);
    return () => window.clearTimeout(timer);
  }, [chosenCards.length, requiredCount]);

  const handleCardSelect = useCallback((cardId: string, index: number) => {
    const numericId = Number(cardId);
    if (!Number.isInteger(numericId)) return;

    setChosenCards((previous) => {
      if (previous.length >= requiredCount) return previous;
      if (previous.some((item) => item.index === index || item.cardId === numericId)) return previous;
      soundManager.play('flip');
      return [...previous, { index, cardId: numericId }];
    });
  }, [requiredCount]);

  const handleReveal = useCallback(() => {
    if (!session.spread || chosenCards.length !== requiredCount) return;

    const selected = chosenCards.flatMap<SelectedCard>((chosen, positionIndex) => {
      const card = tarotCards.find((item) => item.id === chosen.cardId);
      if (!card) return [];
      return [{
        card,
        orientation: getOrientation(),
        positionIndex,
        positionName: session.spread!.positions[positionIndex]?.name ?? `Card ${positionIndex + 1}`,
      }];
    });

    if (selected.length !== requiredCount) return;
    session.setSelectedCards(selected);
    soundManager.play('flip');
    navigate('/reading/result');
  }, [session, chosenCards, requiredCount, navigate]);

  const handleChooseAgain = useCallback(() => {
    setChosenCards([]);
    setAllSelected(false);
    soundManager.play('click');
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton to="/reading" label="Kembali ke Pertanyaan" />
          <div className="text-center mt-6 mb-4">
            <h2 className="font-cinzel text-xl md:text-2xl text-cream mb-1">{session.spread?.name}</h2>
            <p className="font-cormorant text-base text-muted italic">
              Pilih {requiredCount} kartu dari 22 Major Arcana
            </p>
          </div>
          <div className="flex justify-center mb-6">
            <div className="glass-panel rounded-full px-5 py-2 flex items-center gap-3">
              <span className="font-cinzel text-sm text-gold-light">{chosenCards.length} / {requiredCount}</span>
              <span className="text-xs font-inter text-muted">kartu dipilih</span>
            </div>
          </div>
          {!allSelected ? (
            <CardDeck
              onShuffleComplete={() => setShuffled(true)}
              onCardSelect={handleCardSelect}
              requiredCount={requiredCount}
              selectedIndices={selectedIndices}
              disabled={!shuffled}
            />
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center">
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8">
                {chosenCards.map((chosen, index) => (
                  <motion.div
                    key={chosen.cardId}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center gap-2"
                  >
                    <TarotCard size="sm" />
                    <p className="font-cinzel text-xs text-gold-light">{session.spread?.positions[index]?.name}</p>
                  </motion.div>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <MysticButton variant="ghost" onClick={handleChooseAgain}>Pilih Ulang</MysticButton>
                <MysticButton variant="primary" size="lg" onClick={handleReveal}>Buka Kartu</MysticButton>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
