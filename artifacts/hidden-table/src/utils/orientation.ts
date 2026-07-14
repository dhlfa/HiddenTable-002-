import type { Orientation } from '../types';

export function getOrientation(): Orientation {
  return Math.random() > 0.5 ? 'upright' : 'reversed';
}
