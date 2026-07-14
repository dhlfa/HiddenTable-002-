import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { LayoutGrid, Sun, BookMarked, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { RoundTable } from '../components/chamber/RoundTable';
import { CandleGlow } from '../components/chamber/CandleGlow';
import { OldBook } from '../components/chamber/OldBook';
import { HourglassIcon } from '../components/chamber/Hourglass';
import { AntiqueCompass } from '../components/chamber/Compass';
import { CardBack } from '../components/cards/CardFaces';
import { useSettings } from '../hooks/useSettings';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useIsMobile } from '../hooks/useIsMobile';
import { useJournal } from '../hooks/useJournal';
import { staggerContainer, staggerItem } from '../animations/presets';
import { formatDate } from '../utils/date';

interface MenuItem { label: string; to: string; icon: typeof Sparkles; }

const menuItems: MenuItem[] = [
  { label: 'Mulai Pembacaan', to: '/reading', icon: Sparkles },
  { label: 'Arsip Kartu', to: '/archive', icon: LayoutGrid },
  { label: 'Kartu Harian', to: '/daily', icon: Sun },
  { label: 'Jurnal Pembacaan', to: '/journal', icon: BookMarked },
  { label: 'Pengaturan', to: '/settings', icon: SettingsIcon },
];

export function MainChamber() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const reducedMotion = useReducedMotion(settings.reduceMotion);
  const isMobile = useIsMobile();
  const { entries } = useJournal();

  const lastReading = entries[0];
  const favoriteCount = useMemo(() => entries.filter((e) => e.favorite).length, [entries]);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-cinzel text-2xl md:text-3xl text-cream tracking-wide mb-2">The Hidden Table</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="font-cormorant text-base text-muted italic mb-8">Ruang ini menanti pertanyaan Anda.</motion.p>

        <div className="relative flex items-center justify-center mb-8 md:mb-12">
          <RoundTable>
            <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
              <motion.div initial={{ opacity: 0, y: 10 }}
                animate={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -3, 0] }}
                transition={reducedMotion ? { duration: 0.5 } : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute"><CardBack size="md" /></motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute" style={{ top: -10, left: -50 }}><CandleGlow size={30} /></motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute" style={{ top: -10, right: -50 }}><CandleGlow size={30} /></motion.div>
              <div className="absolute" style={{ bottom: -10, left: -40 }}><OldBook /></div>
              <div className="absolute" style={{ bottom: -10, right: -40 }}><HourglassIcon /></div>
              <div className="absolute" style={{ top: -30, left: '50%', transform: 'translateX(-50%)' }}><AntiqueCompass /></div>
            </div>
          </RoundTable>
        </div>

        {entries.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            onClick={() => navigate('/journal')}
            className="glass-panel rounded-xl px-4 py-3 mb-6 max-w-sm w-full text-left hover:border-gold/30 transition-colors touch-target"
          >
            <p className="font-inter text-[10px] text-gold/60 uppercase tracking-wider mb-1">Pembacaan Terakhir</p>
            <p className="font-cinzel text-sm text-cream truncate">{lastReading?.question || 'Kartu Harian'}</p>
            <p className="font-inter text-[11px] text-muted mt-0.5">
              {lastReading?.spreadName} · {lastReading ? formatDate(lastReading.date) : ''}
              {entries.length > 1 && ` · ${entries.length} pembacaan tersimpan`}
              {favoriteCount > 0 && ` · ${favoriteCount} favorit`}
            </p>
          </motion.button>
        )}

        {isMobile ? (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="w-full max-w-sm space-y-3">
            {menuItems.map((item) => (
              <motion.button key={item.to} variants={staggerItem} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(item.to)}
                className="w-full glass-panel rounded-xl p-4 flex items-center gap-4 hover:border-gold/30 transition-colors touch-target text-left">
                <item.icon className="w-5 h-5 text-gold/60 flex-shrink-0" strokeWidth={1.5} />
                <span className="font-cinzel text-base text-cream">{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            className="flex flex-wrap justify-center gap-3 max-w-3xl">
            {menuItems.map((item) => (
              <motion.button key={item.to} variants={staggerItem} whileHover={{ y: -4, scale: 1.05 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(item.to)}
                className="glass-panel rounded-xl px-5 py-3 flex items-center gap-2.5 hover:border-gold/40 hover:shadow-gold-sm transition-all touch-target whitespace-nowrap">
                <item.icon className="w-4 h-4 text-gold/60" strokeWidth={1.5} />
                <span className="font-cinzel text-sm text-cream">{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
