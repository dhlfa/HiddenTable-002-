import { motion } from 'framer-motion';
import type { TarotCardData, Orientation } from '../../types';
import { cn } from '../../utils/cn';

type CardSize = 'sm' | 'md' | 'lg';

const sizeMap: Record<CardSize, { w: number; h: number; radius: string }> = {
  sm: { w: 60, h: 96, radius: 'rounded-md' },
  md: { w: 80, h: 128, radius: 'rounded-lg' },
  lg: { w: 120, h: 192, radius: 'rounded-xl' },
};

interface CardBackProps { size?: CardSize; }

export function CardBack({ size = 'md' }: CardBackProps) {
  const dims = sizeMap[size];
  return (
    <div className={cn('relative border border-gold/20 overflow-hidden', dims.radius)}
      style={{ width: dims.w, height: dims.h, background: 'linear-gradient(135deg, #0E1426 0%, #151C2E 50%, #0E1426 100%)' }}>
      <div className="absolute inset-2 border border-gold/10 rounded flex items-center justify-center">
        <div className="text-gold/20 font-cinzel text-2xl">✦</div>
      </div>
    </div>
  );
}

interface TarotCardProps {
  card?: TarotCardData;
  orientation?: Orientation;
  revealed?: boolean;
  size?: CardSize;
  className?: string;
}

export function TarotCard({ card, orientation = 'upright', revealed = false, size = 'md', className }: TarotCardProps) {
  const dims = sizeMap[size];
  if (!revealed || !card) return <CardBack size={size} />;
  return (
    <motion.div initial={{ rotateY: 180 }} animate={{ rotateY: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformStyle: 'preserve-3d', width: dims.w, height: dims.h }}
      className={cn('relative', className)}>
      <div className={cn('relative w-full h-full border overflow-hidden flex flex-col items-center justify-between p-2', dims.radius)}
        style={{ background: 'linear-gradient(135deg, #151C2E 0%, #0E1426 100%)',
          borderColor: `${card.accentColor}40`, transform: orientation === 'reversed' ? 'rotate(180deg)' : 'none' }}>
        <div className="text-center mt-1">
          <div className="font-cinzel text-lg leading-tight" style={{ color: card.accentColor }}>{card.name}</div>
        </div>
        <div className="flex-1 flex items-center justify-center" style={{ color: `${card.accentColor}60` }}>
          <span className="font-cinzel text-3xl">✦</span>
        </div>
        <div className="text-center mb-1">
          <span className="font-inter text-[8px] text-cream/40 uppercase tracking-wider">{orientation}</span>
        </div>
      </div>
    </motion.div>
  );
}


