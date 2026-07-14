import { Volume2, VolumeX } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

export function SoundToggle() {
  const { settings, update } = useSettings();
  const label = settings.soundEnabled ? 'Matikan efek suara' : 'Aktifkan efek suara';

  return (
    <button
      type="button"
      onClick={() => update({ soundEnabled: !settings.soundEnabled })}
      className="flex items-center justify-center text-muted hover:text-gold transition-colors touch-target"
      aria-label={label}
      aria-pressed={settings.soundEnabled}
      title={label}
    >
      {settings.soundEnabled
        ? <Volume2 className="w-4 h-4" strokeWidth={1.5} />
        : <VolumeX className="w-4 h-4" strokeWidth={1.5} />}
    </button>
  );
}
