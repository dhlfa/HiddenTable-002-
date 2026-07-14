import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../../hooks/useSettings';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { usePageVisibility } from '../../hooks/usePageVisibility';

interface AmbientBackgroundProps {
  intensity?: 'low' | 'normal' | 'high';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function AmbientBackground({ intensity = 'normal' }: AmbientBackgroundProps) {
  const { settings } = useSettings();
  const reducedMotion = useReducedMotion(settings.reduceMotion);
  const isVisible = usePageVisibility();

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const maxParticles = isMobile ? 12 : 30;

  const intensityMultiplier =
    intensity === 'low' ? 0.5 : intensity === 'high' ? 1.3 : 1;
  const particleCount = Math.round(
    (reducedMotion ? 0 : maxParticles) * intensityMultiplier,
  );

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 8,
    }));
  }, [particleCount]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-midnight" />

      {/* Radial glow from center */}
      <motion.div
        animate={
          reducedMotion || !isVisible
            ? undefined
            : { opacity: [0.3, 0.5, 0.3] }
        }
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(36,54,95,0.25) 0%, rgba(14,20,38,0.15) 30%, transparent 70%)',
        }}
      />

      {/* Secondary radial warm glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(200,167,91,0.04) 0%, transparent 50%)',
        }}
      />

      {/* Mist layers */}
      {!reducedMotion && (
        <>
          <motion.div
            animate={isVisible ? { x: [0, 30, 0], y: [0, -10, 0], opacity: [0.15, 0.25, 0.15] } : {}}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 30% 50%, rgba(36,54,95,0.12) 0%, transparent 40%)',
            }}
          />
          <motion.div
            animate={isVisible ? { x: [0, -25, 0], y: [0, 15, 0], opacity: [0.1, 0.2, 0.1] } : {}}
            transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 70% 40%, rgba(36,54,95,0.1) 0%, transparent 40%)',
            }}
          />
        </>
      )}

      {/* Faint stars */}
      {!reducedMotion && (
        <div className="absolute inset-0">
          {Array.from({ length: isMobile ? 15 : 30 }).map((_, i) => (
            <motion.div
              key={`star-${i}`}
              animate={isVisible ? { opacity: [0.1, 0.3, 0.1] } : {}}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'easeInOut',
              }}
              className="absolute rounded-full bg-cream"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                width: '1px',
                height: '1px',
              }}
            />
          ))}
        </div>
      )}

      {/* Gold dust particles */}
      {!reducedMotion && isVisible && (
        <div className="absolute inset-0">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              animate={{
                y: [0, -100, -200],
                x: [0, 20, -10],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'linear',
              }}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: 'rgba(227,199,120,0.6)',
                boxShadow: '0 0 4px rgba(227,199,120,0.3)',
              }}
            />
          ))}
        </div>
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(5,7,13,0.6) 80%, rgba(5,7,13,0.9) 100%)',
        }}
      />
    </div>
  );
}
