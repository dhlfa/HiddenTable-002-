import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Sun, BookMarked, Settings as SettingsIcon, Home } from 'lucide-react';
import { soundManager } from '../../services/sound';

interface NavItem {
  label: string;
  to: string;
  icon: typeof Sparkles;
  match: (path: string) => boolean;
}

const navItems: NavItem[] = [
  { label: 'Beranda', to: '/chamber', icon: Home, match: (p) => p === '/chamber' },
  { label: 'Pembacaan', to: '/reading', icon: Sparkles, match: (p) => p.startsWith('/reading') },
  { label: 'Kartu Harian', to: '/daily', icon: Sun, match: (p) => p === '/daily' },
  { label: 'Jurnal', to: '/journal', icon: BookMarked, match: (p) => p === '/journal' },
  { label: 'Pengaturan', to: '/settings', icon: SettingsIcon, match: (p) => p === '/settings' },
];

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (to: string) => {
    if (location.pathname === to) return;
    soundManager.play('click');
    navigate(to);
  };

  return (
    <>
      {/* Desktop top nav */}
      <nav
        aria-label="Navigasi utama"
        className="hidden md:flex fixed top-0 inset-x-0 z-40 justify-center pt-4 pointer-events-none"
      >
        <div className="glass-panel rounded-full px-2 py-2 flex items-center gap-1 pointer-events-auto">
          {navItems.map((item) => {
            const active = item.match(location.pathname);
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => handleNavigate(item.to)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-inter transition-all touch-target ${
                  active ? 'bg-gold/20 text-cream border border-gold/40' : 'text-muted hover:text-cream border border-transparent'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="font-cinzel tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Navigasi utama"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-midnight/90 backdrop-blur-md border-t border-cream/10 safe-bottom"
      >
        <div className="flex items-stretch justify-around">
          {navItems.map((item) => {
            const active = item.match(location.pathname);
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => handleNavigate(item.to)}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 touch-target transition-colors ${
                  active ? 'text-gold' : 'text-muted'
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-inter text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
