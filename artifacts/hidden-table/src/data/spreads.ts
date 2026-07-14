import type { Spread } from '../types';

export const spreads: Spread[] = [
  { id: 'one-card', name: 'Single Card', description: 'A single card for quick insight or daily guidance.', cardCount: 1, positions: [{ name: 'The Reflection', meaning: 'The core message or energy for this moment.' }] },
  { id: 'three-cards', name: 'Three Cards', description: 'Past, present, and possible direction.', cardCount: 3, positions: [
    { name: 'Past', meaning: 'What has shaped the situation.' },
    { name: 'Present', meaning: 'Where you stand now.' },
    { name: 'Possible Direction', meaning: 'A path that may unfold from here.' },
  ]},
  { id: 'five-cards', name: 'Five Cards', description: 'A deeper look at situation, influence, challenge, guidance, and direction.', cardCount: 5, positions: [
    { name: 'Current Situation', meaning: 'The present state of things.' },
    { name: 'Hidden Influence', meaning: 'An unseen force at work.' },
    { name: 'Challenge', meaning: 'The obstacle to be faced.' },
    { name: 'Guidance', meaning: 'What can help you move forward.' },
    { name: 'Possible Direction', meaning: 'A likely outcome if the path is followed.' },
  ]},
  { id: 'relationship', name: 'Relationship Spread', description: 'Two perspectives and the bridge between them.', cardCount: 3, positions: [
    { name: 'You', meaning: 'Your energy and position.' },
    { name: 'The Other', meaning: 'Their energy and position.' },
    { name: 'The Connection', meaning: 'The dynamic between you.' },
  ]},
  { id: 'career', name: 'Career Spread', description: 'Where you are, what blocks you, and how to advance.', cardCount: 3, positions: [
    { name: 'Current Path', meaning: 'Your present career trajectory.' },
    { name: 'Obstacle', meaning: 'What stands in your way.' },
    { name: 'Opportunity', meaning: 'A direction for growth.' },
  ]},
  { id: 'decision', name: 'Decision Spread', description: 'Weigh two options and see the likely outcome.', cardCount: 3, positions: [
    { name: 'Option A', meaning: 'The first path.' },
    { name: 'Option B', meaning: 'The second path.' },
    { name: 'Likely Outcome', meaning: 'What may result from the better choice.' },
  ]},
  { id: 'shadow', name: 'Shadow Reflection', description: 'Explore what is hidden, feared, and waiting to be integrated.', cardCount: 3, positions: [
    { name: 'The Shadow', meaning: 'What you have not yet faced.' },
    { name: 'The Gift', meaning: 'What the shadow offers when met.' },
    { name: 'The Integration', meaning: 'How to bring it into wholeness.' },
  ]},
];

export const getSpreadById = (id: string): Spread | undefined => spreads.find((s) => s.id === id);
