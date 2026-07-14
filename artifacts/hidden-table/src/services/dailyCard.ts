import type { DailyCard, Orientation } from '../types';
import { tarotCards } from '../data/cards';
import { getTodayKey } from '../utils/date';

const STORAGE_KEY = 'the-hidden-table:daily-card';
const HISTORY_KEY = 'the-hidden-table:daily-card-history';
const MAX_HISTORY = 60;

function readHistory(): DailyCard[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) ? (parsed as DailyCard[]) : [];
  } catch {
    return [];
  }
}

function persistHistory(history: DailyCard[]): void {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY))); } catch { /* ignore */ }
}

function upsertHistory(daily: DailyCard): void {
  const history = readHistory();
  const withoutToday = history.filter((h) => h.date !== daily.date);
  persistHistory([daily, ...withoutToday]);
}

export function getOrCreateDailyCard(): DailyCard {
  const today = getTodayKey();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: DailyCard = JSON.parse(stored);
      if (parsed.date === today) return parsed;
    }
  } catch { /* ignore */ }

  const card = tarotCards[Math.floor(Math.random() * tarotCards.length)];
  const orientation: Orientation = Math.random() > 0.5 ? 'upright' : 'reversed';
  const reflection = orientation === 'upright' ? card.upright : card.reversed;
  const daily: DailyCard = { date: today, card, orientation, reflection };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(daily)); } catch { /* ignore */ }
  upsertHistory(daily);
  return daily;
}

function persistCurrent(daily: DailyCard): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(daily)); } catch { /* ignore */ }
  upsertHistory(daily);
}

export function toggleDailyCardFavorite(daily: DailyCard): DailyCard {
  const next: DailyCard = { ...daily, favorite: !daily.favorite };
  persistCurrent(next);
  return next;
}

export function updateDailyCardMood(daily: DailyCard, mood: string): DailyCard {
  const next: DailyCard = { ...daily, mood };
  persistCurrent(next);
  return next;
}

export function updateDailyCardNote(daily: DailyCard, note: string): DailyCard {
  const next: DailyCard = { ...daily, note };
  persistCurrent(next);
  return next;
}

export function getDailyCardHistory(): DailyCard[] {
  return readHistory();
}
