import type { ReactNode } from 'react';

interface RoundTableProps { children?: ReactNode; }

export function RoundTable({ children }: RoundTableProps) {
  return (
    <div className="relative rounded-full" style={{ width: 280, height: 280,
      background: 'radial-gradient(ellipse at center, #1a1f2e 0%, #0E1426 60%, #05070D 100%)',
      border: '2px solid rgba(200, 167, 91, 0.15)',
      boxShadow: 'inset 0 0 60px rgba(0,0,0,0.6), 0 0 30px rgba(200,167,91,0.08)' }}>
      <div className="absolute inset-3 rounded-full" style={{ border: '1px solid rgba(200, 167, 91, 0.08)' }} />
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
