import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { tarotCards } from '../../data/cards';
import { CardBack } from './CardFaces';
import { useSettings } from '../../hooks/useSettings';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { soundManager } from '../../services/sound';
import { shuffleArray } from '../../utils/shuffle';

type DeckPhase = 'idle' | 'shuffling' | 'fanning';

interface CardDeckProps {
  onShuffleComplete?: () => void;
  onCardSelect?: (cardId: string, index: number) => void;
  requiredCount: number;
  selectedIndices: number[];
  disabled?: boolean;
}

export function CardDeck({ onShuffleComplete, onCardSelect, requiredCount, selectedIndices, disabled = false }: CardDeckProps) {
  const { settings } = useSettings();
  const reducedMotion = useReducedMotion(settings.reduceMotion);
  const [phase, setPhase] = useState<DeckPhase>('idle');
  const [deckCards] = useState(() => shuffleArray(tarotCards));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPhase('shuffling');
    soundManager.play('shuffle');
    const shuffleTime = reducedMotion ? 200 : 3000;
    const t = setTimeout(() => { if (cancelled) return; setPhase('fanning'); onShuffleComplete?.(); }, shuffleTime);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCardClick = useCallback((index: number) => {
    if (disabled || phase !== 'fanning') return;
    if (selectedIndices.includes(index)) return;
    if (selectedIndices.length >= requiredCount) return;
    soundManager.play('click');
    onCardSelect?.(String(deckCards[index].id), index);
  }, [disabled, phase, selectedIndices, requiredCount, onCardSelect, deckCards]);

  if (reducedMotion) {
    return (
      <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
        {deckCards.map((_, i) => {
          const isSelected = selectedIndices.includes(i);
          const isDisabled = disabled || isSelected || selectedIndices.length >= requiredCount;
          return (
            <button key={i} type="button" onClick={() => handleCardClick(i)} disabled={isDisabled}
              aria-label={`Pilih kartu ${i + 1} dari ${deckCards.length}`} aria-pressed={isSelected}
              className={`transition-opacity ${isDisabled ? 'opacity-30' : 'opacity-100'}`}>
              <CardBack size="sm" />
            </button>
          );
        })}
      </div>
    );
  }

  if (phase === 'shuffling') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          animate={{ x: [0, -50, 50, -30, 30, 0], y: [0, -15, -10, -20, -8, 0], rotate: [0, -4, 4, -2, 1, 0], scale: [1, 1.05, 1.03, 1.08, 1.02, 1] }}
          transition={{ duration: 3, times: [0, 0.2, 0.4, 0.6, 0.8, 1], ease: 'easeInOut' }}
          className="relative">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="absolute" style={{ top: -i * 2, left: i * 1 }}><CardBack size="md" /></div>
          ))}
          <CardBack size="md" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-8 font-cormorant text-lg text-muted italic">Deck sedang dikocok...</motion.p>
      </div>
    );
  }

  const total = deckCards.length;
  const isCompact = typeof window !== 'undefined' && window.innerWidth < 640;

  if (isCompact) {
    return (
      <div className="w-full overflow-x-auto pb-4 px-2 snap-x snap-mandatory" aria-label="22 kartu Major Arcana">
        <div className="flex w-max gap-3 mx-auto py-3">
          {deckCards.map((_, i) => {
            const isSelected = selectedIndices.includes(i);
            const isMaxed = selectedIndices.length >= requiredCount;
            const isDisabled = disabled || isSelected || (isMaxed && !isSelected);
            return (
              <motion.button
                key={i}
                type="button"
                onClick={() => handleCardClick(i)}
                disabled={isDisabled}
                aria-label={`Pilih kartu ${i + 1} dari ${deckCards.length}`}
                aria-pressed={isSelected}
                whileTap={{ scale: 0.96 }}
                className={`snap-center shrink-0 rounded-md transition-all ${isSelected ? '-translate-y-2 opacity-35' : isDisabled ? 'opacity-30' : 'opacity-100'}`}
              >
                <CardBack size="sm" />
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  const angleRange = 76;
  const startAngle = -angleRange / 2;
  const angleStep = total > 1 ? angleRange / (total - 1) : 0;
  const radius = 280;

  return (
    <div className="relative w-full max-w-2xl mx-auto py-8">
      <div className="flex justify-center">
        <div className="relative" style={{ height: 260 }}>
          {deckCards.map((_, i) => {
            const angle = startAngle + angleStep * i;
            const radians = (angle * Math.PI) / 180;
            const x = Math.sin(radians) * radius;
            const y = -Math.cos(radians) * radius + radius;
            const isSelected = selectedIndices.includes(i);
            const isMaxed = selectedIndices.length >= requiredCount;
            const isDimmed = isSelected || (isMaxed && !isSelected);
            const isHovered = hoveredIndex === i && !disabled && !isSelected && !isMaxed;
            return (
              <motion.button key={i}
                type="button"
                aria-label={`Pilih kartu ${i + 1} dari ${deckCards.length}`}
                aria-pressed={isSelected}
                disabled={disabled || isDimmed}
                initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
                animate={{ opacity: isDimmed ? 0.25 : 1, x: isHovered ? x * 1.15 : x, y: isHovered ? y - 12 : y, rotate: angle, scale: isHovered ? 1.04 : 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleCardClick(i)}
                className="absolute left-1/2 top-0 origin-bottom border-0 bg-transparent p-0"
                style={{ marginLeft: -30, cursor: isDimmed || disabled ? 'default' : 'pointer', zIndex: isHovered ? 100 : i + 1 }}>
                {isHovered && (
                  <div className="absolute -inset-1 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, rgba(200,167,91,0.3), transparent)', border: '1px solid rgba(200,167,91,0.5)' }} />
                )}
                <CardBack size="sm" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
