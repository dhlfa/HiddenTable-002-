import type { SelectedCard, Spread } from '../types';

export function generateOverallReflection(_question: string, cards: SelectedCard[], spread: Spread): string {
  const cardNames = cards.map((c) => `${c.card.name} (${c.orientation})`).join(', ');
  return `The cards drawn for the ${spread.name} spread — ${cardNames} — form a pattern that speaks to the question asked. Consider how each card's energy contributes to the whole, and where the emphasis falls.`;
}

export function generatePositionMeaning(selected: SelectedCard, positionName: string): string {
  const meaning = selected.orientation === 'upright' ? selected.card.upright : selected.card.reversed;
  return `In the position of ${positionName}, ${selected.card.name} (${selected.orientation}) suggests: ${meaning}`;
}

export function generatePatternBetweenCards(cards: SelectedCard[]): string {
  if (cards.length < 2) return 'With a single card, the pattern is the card itself.';
  const names = cards.map((c) => c.card.name).join(' → ');
  return `The flow from ${names} traces a narrative arc. Notice where the energy shifts, where it builds, and where it resolves.`;
}

export function generateReflection(question: string, cards: SelectedCard[]): string {
  const first = cards[0];
  if (!first) return 'No cards were drawn.';
  return `Reflecting on "${question}", the presence of ${first.card.name} invites you to sit with its energy. ${first.orientation === 'upright' ? first.card.upright : first.card.reversed}`;
}

export function generateConsiderations(cards: SelectedCard[]): string {
  const keywords = cards.flatMap((c) => c.card.keywords).slice(0, 6).join(', ');
  return `Consider these themes in your reflection: ${keywords}. Hold the question lightly and let the meaning arrive in its own time.`;
}
