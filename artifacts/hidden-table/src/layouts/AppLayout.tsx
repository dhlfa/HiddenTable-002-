import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { SoundToggle } from '../components/ui/SoundToggle';
import { Navigation } from '../components/ui/Navigation';
import { OnboardingModal } from '../components/ui/OnboardingModal';
import { ToastProvider } from '../components/ui/Toast';
import { useSettings } from '../hooks/useSettings';
import { soundManager } from '../services/sound';

const ONBOARDING_KEY = 'the-hidden-table:onboarding-seen';

export function AppLayout() {
  const { settings } = useSettings();
  const location = useLocation();
  const showNav = location.pathname !== '/';
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    soundManager.setEnabled(settings.soundEnabled);
    soundManager.setVolume(settings.volume);
  }, [settings.soundEnabled, settings.volume]);

  useEffect(() => {
    document.documentElement.setAttribute('data-text-size', settings.textSize);
  }, [settings.textSize]);

  useEffect(() => {
    try {
      if (!localStorage.getItem(ONBOARDING_KEY)) setShowOnboarding(true);
    } catch { /* ignore */ }
  }, []);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    try { localStorage.setItem(ONBOARDING_KEY, 'true'); } catch { /* ignore */ }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen relative">
        <AmbientBackground intensity={settings.animationIntensity} />
        <div className="absolute top-4 right-4 z-50 hidden md:block"><SoundToggle /></div>
        {showNav && <div className="md:hidden absolute top-4 right-4 z-50"><SoundToggle /></div>}
        {showNav && <Navigation />}
        <div className={showNav ? 'pb-20 md:pb-0 md:pt-20' : ''}>
          <Outlet />
        </div>
        {showOnboarding && <OnboardingModal onClose={dismissOnboarding} />}
      </div>
    </ToastProvider>
  );
}
