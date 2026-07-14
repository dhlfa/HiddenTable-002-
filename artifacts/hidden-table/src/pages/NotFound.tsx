import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/ui/PageTransition';
import { MysticButton } from '../components/ui/MysticButton';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen px-4 flex items-center justify-center">
        <div className="glass-panel rounded-2xl p-8 max-w-md w-full text-center">
          <p className="font-cinzel text-xs tracking-[0.3em] text-gold/60 mb-3">404</p>
          <h1 className="font-cinzel text-2xl text-cream mb-3">Jalan Ini Tidak Ada</h1>
          <p className="font-cormorant text-lg text-muted italic mb-7">
            Ruang yang Anda cari tidak ditemukan atau sudah berpindah.
          </p>
          <MysticButton variant="primary" onClick={() => navigate('/chamber', { replace: true })}>
            Kembali ke Ruang Utama
          </MysticButton>
        </div>
      </div>
    </PageTransition>
  );
}
