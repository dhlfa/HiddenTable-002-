import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MysticButton } from '../components/ui/MysticButton';
import { useSettings } from '../hooks/useSettings';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function LandingPage() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const reducedMotion = useReducedMotion(settings.reduceMotion);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="mb-8">
        <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-32 md:h-32" fill="none">
          <circle cx="50" cy="50" r="45" stroke="rgba(200, 167, 91, 0.3)" strokeWidth="1" />
          <circle cx="50" cy="50" r="38" stroke="rgba(200, 167, 91, 0.15)" strokeWidth="0.5" />
          <path d="M50 15 L52 50 L50 85 L48 50 Z" fill="rgba(200, 167, 91, 0.4)" />
          <path d="M15 50 L50 48 L85 50 L50 52 Z" fill="rgba(200, 167, 91, 0.2)" />
          <circle cx="50" cy="50" r="3" fill="rgba(200, 167, 91, 0.6)" />
          <path d="M50 10 L51 14 L50 18 L49 14 Z" fill="rgba(200, 167, 91, 0.5)" />
        </svg>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, filter: 'blur(8px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="font-cinzel text-3xl md:text-5xl text-cream text-center tracking-wider mb-3">The Hidden Table</motion.h1>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="font-cormorant text-lg md:text-xl text-muted italic text-center mb-10 max-w-md">
        Duduklah di meja tempat kartu-kartu mengingat apa yang belum Anda tanyakan.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}>
        <MysticButton variant="primary" size="lg" onClick={() => navigate('/chamber')}
          className={reducedMotion ? '' : 'animate-glow-pulse'}>Masuk ke Ruang</MysticButton>
      </motion.div>
      <p className="font-inter text-[10px] text-muted/60 text-center mt-10 max-w-xs">
        Untuk refleksi dan hiburan semata — bukan pengganti nasihat profesional (medis, hukum, keuangan, atau psikologis).
      </p>
    </div>
  );
}
