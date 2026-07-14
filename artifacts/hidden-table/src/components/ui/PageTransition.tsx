import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../../hooks/useSettings';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface PageTransitionProps { children: ReactNode; }

const durations = { low: 0.2, normal: 0.4, high: 0.6 } as const;

export function PageTransition({ children }: PageTransitionProps) {
  const { settings } = useSettings();
  const reducedMotion = useReducedMotion(settings.reduceMotion);
  const duration = reducedMotion ? 0 : durations[settings.animationIntensity];

  return (
    <motion.div
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: reducedMotion ? 1 : 0 }}
      transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
