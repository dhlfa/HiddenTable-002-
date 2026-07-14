import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MysticButton } from './MysticButton';
import { useEscapeKey } from '../../hooks/useEscapeKey';

interface Step {
  title: string;
  body: string;
}

const steps: Step[] = [
  {
    title: 'Selamat Datang di The Hidden Table',
    body: 'Sebuah ruang tenang untuk merenung bersama 22 Major Arcana. Setiap pembacaan adalah cermin refleksi, bukan ramalan pasti.',
  },
  {
    title: 'Bagaimana Alurnya',
    body: 'Pilih tata letak (spread), tuliskan pertanyaan Anda, kocok kartu, lalu biarkan Sang Penjaga menyusun refleksinya untuk Anda.',
  },
  {
    title: 'Untuk Refleksi, Bukan Kepastian',
    body: 'Hasil pembacaan bersifat reflektif dan menghibur. Untuk keputusan penting terkait kesehatan, hukum, atau keuangan, selalu konsultasikan dengan ahli profesional.',
  },
];

export function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const isLast = index === steps.length - 1;
  useEscapeKey(onClose);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-midnight/85 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="glass-panel rounded-2xl p-6 md:p-8 max-w-md w-full text-center"
        >
          <div className="flex justify-center gap-1.5 mb-6">
            {steps.map((_, i) => (
              <span key={i} className={`h-1 rounded-full transition-all ${i === index ? 'w-6 bg-gold' : 'w-1.5 bg-cream/20'}`} />
            ))}
          </div>
          <h2 id="onboarding-title" className="font-cinzel text-xl text-cream mb-3">{steps[index].title}</h2>
          <p className="font-cormorant text-base text-cream/70 leading-relaxed mb-8">{steps[index].body}</p>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="font-inter text-xs text-muted hover:text-cream transition-colors touch-target"
            >
              Lewati
            </button>
            <MysticButton
              variant="primary"
              size="sm"
              onClick={() => (isLast ? onClose() : setIndex((i) => i + 1))}
            >
              {isLast ? 'Mulai' : 'Lanjut'}
            </MysticButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
