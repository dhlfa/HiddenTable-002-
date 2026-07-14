import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  positionLabels?: string[];
}

/** Riffle-shuffle animation: two half-piles interleave a few times, then merge back into one deck. */
function ShuffleAnimation({ reducedMotion }: { reducedMotion: boolean }) {
  const passes = reducedMotion ? 0 : 3;
  const cascadeCards = [0, 1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative" style={{ width: 140, height: 150 }}>
        {/* ambient glow pulse behind the deck */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(200,167,91,0.25) 0%, transparent 70%)' }}
          animate={reducedMotion ? {} : { scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {cascadeCards.map((i) => {
          const mid = cascadeCards.length / 2;
          const leftPile = i < mid;
          const laneIndex = leftPile ? i : i - mid;
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: '50%', top: 6, marginLeft: -30, zIndex: i }}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
              animate={reducedMotion ? { opacity: 1 } : {
                x: leftPile
                  ? [0, -44, -44, 6, 0].map((v) => v - laneIndex * 1.5)
                  : [0, 44, 44, -6, 0].map((v) => v + laneIndex * 1.5),
                y: [0, -6, 10, 4, 0].map((v) => v + laneIndex * 2),
                rotate: leftPile ? [0, -14, -8, -2, 0] : [0, 14, 8, 2, 0],
                opacity: [0, 1, 1, 1, 1],
              }}
              transition={reducedMotion ? { duration: 0.2 } : {
                duration: 1.1,
                repeat: passes,
                repeatType: 'loop',
                delay: laneIndex * 0.05,
                ease: [0.45, 0, 0.2, 1],
              }}
            >
              <CardBack size="md" />
            </motion.div>
          );
        })}
        {/* sparkle motes drifting up from the deck while it shuffles */}
        {!reducedMotion && [0, 1, 2, 3].map((i) => (
          <motion.span
            key={`spark-${i}`}
            className="absolute text-gold/50"
            style={{ left: `${28 + i * 16}%`, bottom: 10, fontSize: 10 }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -60 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.45, ease: 'easeOut' }}
          >
            ✦
          </motion.span>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="mt-8 font-cormorant text-lg text-muted italic"
      >
        Deck sedang dikocok...
      </motion.p>
    </div>
  );
}

export function CardDeck({ onShuffleComplete, onCardSelect, requiredCount, selectedIndices, disabled = false, positionLabels }: CardDeckProps) {
  const { settings } = useSettings();
  const reducedMotion = useReducedMotion(settings.reduceMotion);
  const [phase, setPhase] = useState<DeckPhase>('idle');
  const [deckCards] = useState(() => shuffleArray(tarotCards));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [justSelected, setJustSelected] = useState<number | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPhase('shuffling');
    soundManager.play('shuffle');
    const shuffleTime = reducedMotion ? 200 : 3400;
    const t = setTimeout(() => { if (cancelled) return; setPhase('fanning'); onShuffleComplete?.(); }, shuffleTime);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => { if (clearTimerRef.current) clearTimeout(clearTimerRef.current); }, []);

  const handleCardClick = useCallback((index: number) => {
    if (disabled || phase !== 'fanning') return;
    if (selectedIndices.includes(index)) return;
    if (selectedIndices.length >= requiredCount) return;
    soundManager.play('flip');
    setJustSelected(index);
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => setJustSelected(null), 650);
    onCardSelect?.(String(deckCards[index].id), index);
  }, [disabled, phase, selectedIndices, requiredCount, onCardSelect, deckCards]);

  const SelectedTray = requiredCount > 1 ? (
    <div className="flex justify-center gap-3 mt-8 flex-wrap px-2">
      {Array.from({ length: requiredCount }).map((_, slot) => {
        const filled = slot < selectedIndices.length;
        return (
          <div key={slot} className="flex flex-col items-center gap-1.5">
            <div
              className="relative rounded-md border flex items-center justify-center transition-colors"
              style={{
                width: 44, height: 68,
                borderColor: filled ? 'rgba(200,167,91,0.5)' : 'rgba(245,240,230,0.12)',
                borderStyle: filled ? 'solid' : 'dashed',
                background: filled ? 'linear-gradient(135deg, #151C2E 0%, #0E1426 100%)' : 'transparent',
              }}
            >
              <AnimatePresence>
                {filled && (
                  <motion.div
                    initial={{ scale: 0.2, opacity: 0, rotate: -90, y: -30 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="absolute inset-0 flex items-center justify-center text-gold/40 font-cinzel text-base"
                  >
                    ✦
                  </motion.div>
                )}
              </AnimatePresence>
              {!filled && <span className="text-cream/15 font-cinzel text-sm">{slot + 1}</span>}
            </div>
            {positionLabels?.[slot] && (
              <span className="font-inter text-[9px] text-muted text-center leading-tight max-w-[64px]">{positionLabels[slot]}</span>
            )}
          </div>
        );
      })}
    </div>
  ) : null;

  if (reducedMotion) {
    return (
      <>
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
        {SelectedTray}
      </>
    );
  }

  if (phase === 'shuffling') {
    return <ShuffleAnimation reducedMotion={reducedMotion} />;
  }

  const total = deckCards.length;
  const isCompact = typeof window !== 'undefined' && window.innerWidth < 640;

  if (isCompact) {
    return (
      <>
        <div className="w-full overflow-x-auto pb-4 px-2 snap-x snap-mandatory" aria-label="22 kartu Major Arcana">
          <div className="flex w-max gap-3 mx-auto py-3">
            {deckCards.map((_, i) => {
              const isSelected = selectedIndices.includes(i);
              const isMaxed = selectedIndices.length >= requiredCount;
              const isDisabled = disabled || isSelected || (isMaxed && !isSelected);
              const isJustSelected = justSelected === i;
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => handleCardClick(i)}
                  disabled={isDisabled}
                  aria-label={`Pilih kartu ${i + 1} dari ${deckCards.length}`}
                  aria-pressed={isSelected}
                  whileTap={{ scale: 0.96 }}
                  animate={isJustSelected ? { y: [0, -22, -4], rotate: [0, -6, 0], scale: [1, 1.12, 1] } : { y: isSelected ? -8 : 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative snap-center shrink-0 rounded-md transition-all ${isSelected ? 'opacity-35' : isDisabled ? 'opacity-30' : 'opacity-100'}`}
                >
                  {isJustSelected && (
                    <motion.div
                      className="absolute -inset-2 rounded-lg pointer-events-none"
                      style={{ background: 'radial-gradient(circle, rgba(200,167,91,0.55) 0%, transparent 70%)' }}
                      initial={{ opacity: 0.9, scale: 0.6 }}
                      animate={{ opacity: 0, scale: 1.6 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  )}
                  <CardBack size="sm" />
                </motion.button>
              );
            })}
          </div>
        </div>
        {SelectedTray}
      </>
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
            const isJustSelected = justSelected === i;
            return (
              <motion.button key={i}
                type="button"
                aria-label={`Pilih kartu ${i + 1} dari ${deckCards.length}`}
                aria-pressed={isSelected}
                disabled={disabled || isDimmed}
                initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
                animate={isJustSelected
                  ? { opacity: 1, x, y: [y, y - 46, y - 14], rotate: [angle, angle - 10, 0], scale: [1, 1.22, 1.02] }
                  : { opacity: isDimmed ? 0.25 : 1, x: isHovered ? x * 1.15 : x, y: isHovered ? y - 12 : y, rotate: angle, scale: isHovered ? 1.04 : 1 }}
                transition={isJustSelected ? { duration: 0.6, ease: [0.16, 1, 0.3, 1] } : { duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleCardClick(i)}
                className="absolute left-1/2 top-0 origin-bottom border-0 bg-transparent p-0"
                style={{ marginLeft: -30, cursor: isDimmed || disabled ? 'default' : 'pointer', zIndex: isJustSelected ? 200 : isHovered ? 100 : i + 1 }}>
                {isHovered && (
                  <div className="absolute -inset-1 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, rgba(200,167,91,0.3), transparent)', border: '1px solid rgba(200,167,91,0.5)' }} />
                )}
                {isJustSelected && (
                  <motion.div
                    className="absolute -inset-3 rounded-lg pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(200,167,91,0.6) 0%, transparent 70%)' }}
                    initial={{ opacity: 1, scale: 0.5 }}
                    animate={{ opacity: 0, scale: 1.8 }}
                    transition={{ duration: 0.65, ease: 'easeOut' }}
                  />
                )}
                <CardBack size="sm" />
              </motion.button>
            );
          })}
        </div>
      </div>
      {SelectedTray}
    </div>
  );
}
