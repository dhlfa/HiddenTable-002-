export function AntiqueCompass() {
  return (
    <div className="relative" style={{ width: 36, height: 36 }}>
      <svg viewBox="0 0 36 36" className="w-full h-full" fill="none">
        <circle cx="18" cy="18" r="16" stroke="rgba(200, 167, 91, 0.3)" strokeWidth="1" fill="rgba(200, 167, 91, 0.05)" />
        <circle cx="18" cy="18" r="12" stroke="rgba(200, 167, 91, 0.15)" strokeWidth="0.5" fill="none" />
        <path d="M18 6 L20 18 L18 30 L16 18 Z" fill="rgba(200, 167, 91, 0.3)" />
        <path d="M6 18 L18 16 L30 18 L18 20 Z" fill="rgba(200, 167, 91, 0.15)" />
        <circle cx="18" cy="18" r="2" fill="rgba(200, 167, 91, 0.5)" />
      </svg>
    </div>
  );
}
