import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, RotateCcw, Download, Upload } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { BackButton } from '../components/ui/BackButton';
import { SectionTitle } from '../components/ui/SectionTitle';
import { MysticButton } from '../components/ui/MysticButton';
import { useSettings } from '../hooks/useSettings';
import { useJournal } from '../hooks/useJournal';
import { useReadingSessionContext } from '../hooks/readingSessionContext';
import { useToast } from '../components/ui/Toast';
import { downloadBackup, importBackup } from '../services/backup';
import { useEscapeKey } from '../hooks/useEscapeKey';
import type { AnimationIntensity, Language, TextSize } from '../types';

export function SettingsPage() {
  const { settings, update, reset } = useSettings();
  const { clearAll } = useJournal();
  const readingSession = useReadingSessionContext();
  const { showToast } = useToast();
  const [confirmJournal, setConfirmJournal] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  useEscapeKey(() => { setConfirmJournal(false); setConfirmAll(false); });

  const resetAllData = () => {
    reset();
    clearAll();
    readingSession.reset();
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i);
      if (key?.startsWith('the-hidden-table:')) localStorage.removeItem(key);
    }
    for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('the-hidden-table:')) sessionStorage.removeItem(key);
    }
    setConfirmAll(false);
  };

  const handleExport = () => {
    downloadBackup();
    showToast('Cadangan berhasil diunduh.');
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const { restoredKeys } = await importBackup(file);
      showToast(`Cadangan dipulihkan (${restoredKeys} data). Memuat ulang…`);
      setTimeout(() => window.location.reload(), 1200);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memulihkan cadangan.', 'error');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-6 md:py-8">
        <div className="max-w-lg mx-auto">
          <BackButton label="Kembali" />
          <SectionTitle className="mt-6 mb-8">Pengaturan</SectionTitle>

          <div className="space-y-6">
            {/* Sound */}
            <div className="glass-panel rounded-xl p-5">
              <h3 className="font-cinzel text-sm text-gold-light mb-4">Suara</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="font-inter text-sm text-cream/80">Aktifkan Efek Suara</span>
                <button type="button" role="switch" aria-checked={settings.soundEnabled} aria-label="Aktifkan efek suara" onClick={() => update({ soundEnabled: !settings.soundEnabled })}
                  className={`relative w-12 h-6 rounded-full transition-colors touch-target ${settings.soundEnabled ? 'bg-gold/40' : 'bg-cream/10'}`}>
                  <motion.div animate={{ x: settings.soundEnabled ? 24 : 2 }} transition={{ duration: 0.2 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-cream" />
                </button>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-gold/60" strokeWidth={1.5} /> : <VolumeX className="w-4 h-4 text-muted" strokeWidth={1.5} />}
                  <span className="font-inter text-xs text-muted">Volume</span>
                </div>
                <input type="range" min="0" max="1" step="0.1" value={settings.volume} aria-label="Volume suara"
                  onChange={(e) => update({ volume: parseFloat(e.target.value) })}
                  className="w-full accent-gold" disabled={!settings.soundEnabled} />
              </div>
            </div>

            {/* Animation */}
            <div className="glass-panel rounded-xl p-5">
              <h3 className="font-cinzel text-sm text-gold-light mb-4">Animasi</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="font-inter text-sm text-cream/80">Kurangi Gerakan</span>
                <button type="button" role="switch" aria-checked={settings.reduceMotion} aria-label="Kurangi gerakan animasi" onClick={() => update({ reduceMotion: !settings.reduceMotion })}
                  className={`relative w-12 h-6 rounded-full transition-colors touch-target ${settings.reduceMotion ? 'bg-gold/40' : 'bg-cream/10'}`}>
                  <motion.div animate={{ x: settings.reduceMotion ? 24 : 2 }} transition={{ duration: 0.2 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-cream" />
                </button>
              </div>
              <div>
                <span className="font-inter text-xs text-muted block mb-2">Intensitas Animasi</span>
                <div className="flex gap-2">
                  {(['low', 'normal', 'high'] as AnimationIntensity[]).map((level) => (
                    <button key={level} onClick={() => update({ animationIntensity: level })}
                      className={`flex-1 py-2 rounded-lg text-xs font-inter transition-all touch-target ${settings.animationIntensity === level ? 'bg-gold/20 border border-gold/50 text-cream' : 'bg-midnight-light/40 border border-cream/10 text-muted'}`}>
                      {level === 'low' ? 'Rendah' : level === 'normal' ? 'Normal' : 'Tinggi'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Text Size */}
            <div className="glass-panel rounded-xl p-5">
              <h3 className="font-cinzel text-sm text-gold-light mb-4">Ukuran Teks</h3>
              <div className="flex gap-2">
                {(['small', 'normal', 'large'] as TextSize[]).map((size) => (
                  <button key={size} onClick={() => update({ textSize: size })}
                    className={`flex-1 py-2 rounded-lg text-xs font-inter transition-all touch-target ${settings.textSize === size ? 'bg-gold/20 border border-gold/50 text-cream' : 'bg-midnight-light/40 border border-cream/10 text-muted'}`}>
                    {size === 'small' ? 'Kecil' : size === 'normal' ? 'Normal' : 'Besar'}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="glass-panel rounded-xl p-5">
              <h3 className="font-cinzel text-sm text-gold-light mb-4">Bahasa</h3>
              <div className="flex gap-2">
                {(['en', 'id'] as Language[]).map((lang) => (
                  <button key={lang} onClick={() => update({ language: lang })}
                    className={`flex-1 py-2 rounded-lg text-xs font-inter uppercase transition-all touch-target ${settings.language === lang ? 'bg-gold/20 border border-gold/50 text-cream' : 'bg-midnight-light/40 border border-cream/10 text-muted'}`}>
                    {lang === 'en' ? 'English' : 'Indonesia'}
                  </button>
                ))}
              </div>
              <p className="font-inter text-[10px] text-muted mt-3">Bahasa ini memengaruhi gaya bahasa refleksi dari Sang Penjaga.</p>
            </div>

            {/* Backup */}
            <div className="glass-panel rounded-xl p-5">
              <h3 className="font-cinzel text-sm text-gold-light mb-4">Cadangkan &amp; Pulihkan</h3>
              <p className="font-inter text-xs text-muted mb-4">Semua data tersimpan secara lokal di perangkat ini. Unduh cadangan sebelum mengganti perangkat atau membersihkan cache browser.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <MysticButton variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-3.5 h-3.5" strokeWidth={1.5} /> Unduh Cadangan
                </MysticButton>
                <MysticButton variant="ghost" size="sm" onClick={handleImportClick}>
                  <Upload className="w-3.5 h-3.5" strokeWidth={1.5} /> Pulihkan dari File
                </MysticButton>
                <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
              </div>
            </div>

            {/* Data */}
            <div className="glass-panel rounded-xl p-5">
              <h3 className="font-cinzel text-sm text-gold-light mb-4">Data</h3>
              <div className="flex flex-col gap-3">
                <button onClick={() => setConfirmJournal(true)}
                  className="font-inter text-sm text-muted hover:text-red-400 transition-colors text-left touch-target">Hapus Jurnal Pembacaan</button>
                <button onClick={() => setConfirmAll(true)}
                  className="font-inter text-sm text-muted hover:text-red-400 transition-colors text-left touch-target">Reset Semua Data</button>
              </div>
            </div>

            <p className="font-inter text-[10px] text-muted/70 text-center leading-relaxed">
              The Hidden Table digunakan untuk refleksi dan hiburan semata, dan bukan pengganti saran medis, hukum, keuangan, atau psikologis profesional.
            </p>
          </div>
        </div>

        {/* Confirmations */}
        <AnimatePresence>
          {confirmJournal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmJournal(false)}
              className="fixed inset-0 bg-midnight/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()} className="glass-panel rounded-2xl p-6 max-w-sm w-full text-center">
                <p className="font-cormorant text-lg text-cream/80 italic mb-6">Hapus semua entri jurnal?</p>
                <div className="flex gap-3 justify-center">
                  <MysticButton variant="ghost" onClick={() => setConfirmJournal(false)}>Batal</MysticButton>
                  <MysticButton variant="danger" onClick={() => { clearAll(); setConfirmJournal(false); }}>Hapus</MysticButton>
                </div>
              </motion.div>
            </motion.div>
          )}
          {confirmAll && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmAll(false)}
              className="fixed inset-0 bg-midnight/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()} className="glass-panel rounded-2xl p-6 max-w-sm w-full text-center">
                <p className="font-cormorant text-lg text-cream/80 italic mb-6">Reset semua data? Termasuk pengaturan dan jurnal.</p>
                <div className="flex gap-3 justify-center">
                  <MysticButton variant="ghost" onClick={() => setConfirmAll(false)}>Batal</MysticButton>
                  <MysticButton variant="danger" onClick={resetAllData}>
                    <span className="inline-flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} /> Reset</span>
                  </MysticButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
