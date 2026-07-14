import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface MysticButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-gradient-to-b from-gold/20 to-gold/5 border border-gold/40 text-cream hover:border-gold-light/60 hover:shadow-gold',
  ghost: 'bg-transparent border border-cream/15 text-cream/80 hover:border-gold/40 hover:text-cream',
  outline: 'bg-transparent border border-gold/30 text-gold hover:border-gold-light/60 hover:text-gold-light hover:shadow-gold-sm',
  danger: 'bg-transparent border border-red-900/40 text-red-400/90 hover:border-red-700/60 hover:text-red-400',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export const MysticButton = forwardRef<HTMLButtonElement, MysticButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, children, className, disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={disabled ? undefined : { y: -3 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={cn(
        'relative font-inter font-medium tracking-wide rounded-lg transition-all duration-300',
        'touch-target inline-flex items-center justify-center gap-2',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        variantClasses[variant], sizeClasses[size],
        fullWidth && 'w-full', className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  ),
);

MysticButton.displayName = 'MysticButton';
