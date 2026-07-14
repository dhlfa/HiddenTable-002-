import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps { to?: string; label?: string; }

export function BackButton({ to = '/', label = 'Back' }: BackButtonProps) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)} className="flex items-center gap-2 text-muted hover:text-gold transition-colors touch-target">
      <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
      <span className="font-inter text-sm">{label}</span>
    </button>
  );
}
