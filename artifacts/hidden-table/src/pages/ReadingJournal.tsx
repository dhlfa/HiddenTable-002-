import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, X, Star } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { BackButton } from '../components/ui/BackButton';
import { SectionTitle } from '../components/ui/SectionTitle';
import { MysticButton } from '../components/ui/MysticButton';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { TarotCard } from '../components/cards/CardFaces';
import { useJournal } from '../hooks/useJournal';
import { useToast } from '../components/ui/Toast';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { formatDate } from '../utils/date';
import { spreads } from '../data/spreads';
import type { ReadingResult } from '../types';

export function ReadingJournal() {
  const navigate = useNavigate();
  const { entries, remove, clearAll, toggleFavorite, updateNote } = useJournal();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [spreadFilter, setSpreadFilter] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selected, setSelected] = useState<ReadingResult | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  useEscapeKey(() => { setSelected(null); setConfirmDeleteAll(false); });

  const filtered = useMemo(() => entries.filter((e) => {
    const matchesSearch = !search || e.question.toLowerCase().includes(search.toLowerCase()) || e.spreadName.toLowerCase().includes(search.toLowerCase());
    const matchesSpread = spreadFilter === 'all' || e.spreadId === spreadFilter;
    const matchesFavorite = !favoritesOnly || e.favorite;
    return matchesSearch && matchesSpread && matchesFavorite;
  }), [entries, search, spreadFilter, favoritesOnly]);

  const openEntry = (entry: ReadingResult) => {
    setSelected(entry);
    setNoteDraft(entry.note ?? '');
  };

  const handleSaveNote = () => {
    if (!selected) return;
    updateNote(selected.id, noteDraft);
    setSelected({ ...selected, note: noteDraft });
    showToast('Catatan disimpan.');
  };

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton label="Kembali" />
          <SectionTitle className="mt-6 mb-6">Jurnal Pembacaan</SectionTitle>

          <div className="relative max-w-md mx-auto mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" strokeWidth={1.5} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari pembacaan..."
              className="w-full glass-panel rounded-full pl-10 pr-4 py-2.5 text-sm text-cream font-inter placeholder:text-muted/50 focus:outline-none focus:border-gold/30 transition-colors" />
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button onClick={() => setSpreadFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-inter transition-all touch-target ${spreadFilter === 'all' ? 'bg-gold/20 border border-gold/50 text-cream' : 'bg-midnight-light/40 border border-cream/10 text-muted hover:border-gold/20'}`}>Semua</button>
            {spreads.map((s) => (
              <button key={s.id} onClick={() => setSpreadFilter(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-inter transition-all touch-target ${spreadFilter === s.id ? 'bg-gold/20 border border-gold/50 text-cream' : 'bg-midnight-light/40 border border-cream/10 text-muted hover:border-gold/20'}`}>{s.name}</button>
            ))}
            <button onClick={() => setFavoritesOnly((v) => !v)}
              className={`px-3 py-1.5 rounded-full text-xs font-inter transition-all touch-target inline-flex items-center gap-1 ${favoritesOnly ? 'bg-gold/20 border border-gold/50 text-cream' : 'bg-midnight-light/40 border border-cream/10 text-muted hover:border-gold/20'}`}>
              <Star className="w-3 h-3" strokeWidth={1.5} fill={favoritesOnly ? 'currentColor' : 'none'} /> Favorit
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-cormorant text-lg text-muted italic mb-4">
                {entries.length === 0 ? 'Belum ada pembacaan tersimpan.' : 'Tidak ada pembacaan yang sesuai dengan filter.'}
              </p>
              {entries.length === 0 && <MysticButton variant="outline" onClick={() => navigate('/reading')}>Mulai Pembacaan</MysticButton>}
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filtered.map((entry) => (
                  <motion.button key={entry.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} onClick={() => openEntry(entry)}
                    className="w-full glass-panel rounded-xl p-4 text-left hover:border-gold/30 transition-all touch-target">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-cinzel text-sm text-cream truncate flex items-center gap-1.5">
                          {entry.favorite && <Star className="w-3 h-3 text-gold flex-shrink-0" fill="currentColor" />}
                          {entry.question || 'Kartu Harian'}
                        </p>
                        <p className="font-inter text-xs text-muted mt-1">{entry.spreadName} · {formatDate(entry.date)}</p>
                        {entry.readingId && <p className="font-inter text-[10px] text-gold/40 mt-1">{entry.readingId}</p>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {entry.cards.slice(0, 3).map((c, i) => (
                          <div key={i} className="w-8 h-12 rounded border border-gold/20 flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #151C2E 0%, #0E1426 100%)' }}>
                            <span className="font-cinzel text-[8px]" style={{ color: `${c.card.accentColor}80` }}>✦</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}

          {entries.length > 0 && (
            <div className="text-center mt-8">
              <button onClick={() => setConfirmDeleteAll(true)}
                className="font-inter text-xs text-muted hover:text-red-400 transition-colors touch-target inline-flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Hapus Semua
              </button>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}
              className="fixed inset-0 bg-midnight/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()} className="glass-panel rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto relative">
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-muted hover:text-cream transition-colors touch-target" aria-label="Tutup">
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => { toggleFavorite(selected.id); setSelected({ ...selected, favorite: !selected.favorite }); }}
                  className="absolute top-4 left-4 text-muted hover:text-gold transition-colors touch-target"
                  aria-label={selected.favorite ? 'Hapus dari favorit' : 'Tandai sebagai favorit'}
                  aria-pressed={!!selected.favorite}
                >
                  <Star className="w-5 h-5" strokeWidth={1.5} fill={selected.favorite ? 'currentColor' : 'none'} style={{ color: selected.favorite ? '#C8A75B' : undefined }} />
                </button>
                <h3 className="font-cinzel text-lg text-cream mb-1 mt-2 pr-8 pl-2">{selected.question || 'Kartu Harian'}</h3>
                <p className="font-inter text-xs text-muted mb-4">{selected.spreadName} · {formatDate(selected.date)}</p>
                {selected.readingId && <p className="font-inter text-[10px] text-gold/40 mb-4">{selected.readingId}</p>}
                <div className="flex flex-wrap justify-center gap-3 mb-4">
                  {selected.cards.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <TarotCard card={c.card} orientation={c.orientation} revealed size="sm" />
                      <p className="font-cinzel text-[10px] text-gold-light">{c.positionName}</p>
                    </div>
                  ))}
                </div>
                {selected.reflection && (
                  <div className="mt-4">
                    <MarkdownRenderer content={selected.reflection} className="space-y-1" />
                  </div>
                )}
                <div className="mt-6">
                  <label htmlFor="journal-note" className="font-cinzel text-xs text-gold-light mb-2 block">Catatan Pribadi</label>
                  <textarea
                    id="journal-note"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value.slice(0, 500))}
                    onBlur={handleSaveNote}
                    rows={3}
                    placeholder="Tuliskan refleksi pribadi Anda tentang pembacaan ini..."
                    className="w-full glass-panel rounded-lg p-3 text-sm text-cream font-inter placeholder:text-muted/40 focus:outline-none focus:border-gold/30 transition-colors resize-none"
                  />
                </div>
                <div className="mt-6 flex justify-center">
                  <button onClick={() => { remove(selected.id); setSelected(null); showToast('Pembacaan dihapus.', 'info'); }}
                    className="font-inter text-xs text-muted hover:text-red-400 transition-colors touch-target inline-flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Hapus Pembacaan
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete All Confirmation */}
        <AnimatePresence>
          {confirmDeleteAll && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDeleteAll(false)}
              className="fixed inset-0 bg-midnight/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()} className="glass-panel rounded-2xl p-6 max-w-sm w-full text-center">
                <p className="font-cormorant text-lg text-cream/80 italic mb-6">Hapus semua pembacaan? Tindakan ini tidak dapat dibatalkan.</p>
                <div className="flex gap-3 justify-center">
                  <MysticButton variant="ghost" onClick={() => setConfirmDeleteAll(false)}>Batal</MysticButton>
                  <MysticButton variant="danger" onClick={() => { clearAll(); setConfirmDeleteAll(false); showToast('Semua pembacaan dihapus.', 'info'); }}>Hapus Semua</MysticButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
