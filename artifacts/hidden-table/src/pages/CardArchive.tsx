import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { BackButton } from '../components/ui/BackButton';
import { SectionTitle } from '../components/ui/SectionTitle';
import { TarotCard } from '../components/cards/CardFaces';
import { tarotCards } from '../data/cards';
import { useEscapeKey } from '../hooks/useEscapeKey';
import type { TarotCardData } from '../types';

type Filter = 'All' | 'Major' | 'Fire' | 'Water' | 'Air' | 'Earth';
const filters: Filter[] = ['All', 'Major', 'Fire', 'Water', 'Air', 'Earth'];
const filterLabels: Record<Filter, string> = { All: 'Semua', Major: 'Major', Fire: 'Api', Water: 'Air', Air: 'Udara', Earth: 'Tanah' };

export function CardArchive() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [selected, setSelected] = useState<TarotCardData | null>(null);
  useEscapeKey(() => setSelected(null));

  const filtered = useMemo(() => tarotCards.filter((card) => {
    const matchesSearch = !search || card.name.toLowerCase().includes(search.toLowerCase()) ||
      card.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'All' || (filter === 'Major' && card.arcana === 'major') ||
      (filter !== 'Major' && card.element === filter);
    return matchesSearch && matchesFilter;
  }), [search, filter]);

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-6 md:py-8">
        <div className="max-w-5xl mx-auto">
          <BackButton />
          <SectionTitle className="mt-6 mb-2">Arsip Kartu</SectionTitle>
          <p className="text-center font-cormorant text-base text-muted italic mb-6">22 Major Arcana yang tersinkron dengan sistem pembacaan.</p>
          <div className="relative max-w-md mx-auto mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" strokeWidth={1.5} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama kartu atau kata kunci..."
              className="w-full glass-panel rounded-full pl-10 pr-4 py-2.5 text-sm text-cream font-inter placeholder:text-muted/50 focus:outline-none focus:border-gold/30 transition-colors" />
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-inter transition-all touch-target ${filter === f ? 'bg-gold/20 border border-gold/50 text-cream' : 'bg-midnight-light/40 border border-cream/10 text-muted hover:border-gold/20'}`}>{filterLabels[f]}</button>
            ))}
          </div>
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <AnimatePresence>
              {filtered.map((card) => (
                <motion.button key={card.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }} onClick={() => setSelected(card)}
                  className="glass-panel rounded-xl p-3 flex flex-col items-center gap-2 hover:border-gold/30 hover:shadow-gold-sm transition-all touch-target">
                  <div className="w-full aspect-[2/3] rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #151C2E 0%, #0E1426 100%)', border: `1px solid ${card.accentColor}30` }}>
                    <span className="font-cinzel text-2xl" style={{ color: `${card.accentColor}60` }}>✦</span>
                  </div>
                  <span className="font-cinzel text-xs text-cream text-center leading-tight">{card.name}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
          {filtered.length === 0 && <p className="text-center font-cormorant text-lg text-muted italic mt-8">Tidak ada kartu yang sesuai dengan pencarian.</p>}
        </div>
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}
              className="fixed inset-0 bg-midnight/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()} className="glass-panel rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto relative">
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-muted hover:text-cream transition-colors touch-target">
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <div className="flex flex-col items-center mb-4"><TarotCard card={selected} orientation="upright" revealed size="lg" /></div>
                <h3 className="font-cinzel text-xl text-cream text-center mb-1">{selected.name}</h3>
                <p className="font-inter text-xs text-gold/60 text-center mb-4 uppercase tracking-wider">
                  Major Arcana{selected.element ? ` · ${filterLabels[selected.element as Filter] ?? selected.element}` : ''}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                  {selected.keywords.map((kw) => (
                    <span key={kw} className="px-2.5 py-1 rounded-full text-[10px] font-inter bg-gold/10 border border-gold/20 text-gold-light">{kw}</span>
                  ))}
                </div>
                <div className="space-y-3">
                  <div><p className="font-cinzel text-xs text-gold-light mb-1">Posisi Tegak</p><p className="font-cormorant text-sm text-cream/70 leading-relaxed">{selected.upright}</p></div>
                  <div><p className="font-cinzel text-xs text-gold-light mb-1">Posisi Terbalik</p><p className="font-cormorant text-sm text-cream/70 leading-relaxed">{selected.reversed}</p></div>
                  <div><p className="font-cinzel text-xs text-gold-light mb-1">Simbolisme</p><p className="font-cormorant text-sm text-cream/70 leading-relaxed italic">{selected.symbolism}</p></div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
