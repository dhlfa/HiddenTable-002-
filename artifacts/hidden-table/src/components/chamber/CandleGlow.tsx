import { motion } from 'framer-motion';

interface CandleGlowProps { size?: number; }

export function CandleGlow({ size = 30 }: CandleGlowProps) {
  return (
    <div className="relative" style={{ width: size, height: size * 1.5 }}>
      <div className="absolute rounded-full -z-10" style={{ width: size * 2, height: size * 2, left: -size / 2, top: -size / 2,
        background: 'radial-gradient(circle, rgba(200,167,91,0.3) 0%, transparent 70%)' }} />
      <motion.div animate={{ scaleY: [1, 1.1, 0.95, 1.05, 1], scaleX: [1, 0.9, 1.05, 0.95, 1], rotate: [0, -1, 1, -0.5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: 0, width: size * 0.3, height: size * 0.5,
          background: 'linear-gradient(to top, #E3C778 0%, #C8A75B 50%, transparent 100%)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }} />
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: size * 0.4, width: size * 0.25, height: size * 1.1,
        background: 'linear-gradient(to bottom, #D4C9B0 0%, #9CA3AF 100%)', borderRadius: '2px' }} />
    </div>
  );
}
