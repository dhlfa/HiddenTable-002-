export function OldBook() {
  return (
    <div className="relative" style={{ width: 40, height: 30 }}>
      <div className="absolute inset-0 rounded-sm" style={{ background: 'linear-gradient(135deg, #8B6F3A 0%, #5a4520 100%)', border: '1px solid rgba(200, 167, 91, 0.2)' }} />
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 4, width: 2, height: 22, background: 'rgba(200, 167, 91, 0.3)' }} />
      <div className="absolute" style={{ top: 6, left: 8, right: 8, height: 1, background: 'rgba(200, 167, 91, 0.15)' }} />
    </div>
  );
}
