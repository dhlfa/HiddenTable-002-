export function generateId(): string {
  return `tht-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
