import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface SectionTitleProps { children: ReactNode; className?: string; }

export function SectionTitle({ children, className }: SectionTitleProps) {
  return <h2 className={cn('font-cinzel text-xl md:text-2xl text-cream text-center', className)}>{children}</h2>;
}
