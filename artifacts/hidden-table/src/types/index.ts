export type Orientation = 'upright' | 'reversed';

export interface TarotCardData {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  element?: string;
  keywords: string[];
  upright: string;
  reversed: string;
  symbolism: string;
  accentColor: string;
}

export interface SpreadPosition {
  name: string;
  meaning: string;
}

export interface Spread {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
}

export interface SelectedCard {
  card: TarotCardData;
  orientation: Orientation;
  positionIndex: number;
  positionName: string;
}

export interface PositionMeaning {
  positionName: string;
  meaning: string;
}

export interface ReadingResult {
  id: string;
  date: string;
  question: string;
  category: string;
  spreadId: string;
  spreadName: string;
  cards: SelectedCard[];
  overallReflection: string;
  positionMeanings: PositionMeaning[];
  patternBetweenCards: string;
  reflection: string;
  considerations: string;
  readingId?: string;
  favorite?: boolean;
  note?: string;
}

export interface DailyCard {
  date: string;
  card: TarotCardData;
  orientation: Orientation;
  reflection: string;
  favorite?: boolean;
  mood?: string;
  note?: string;
}

export type ReadingCategory =
  | 'General' | 'Love' | 'Career' | 'Decision' | 'Spiritual' | 'Shadow Work';

export type Language = 'en' | 'id';

export type AnimationIntensity = 'low' | 'normal' | 'high';

export type TextSize = 'small' | 'normal' | 'large';

export interface Settings {
  soundEnabled: boolean;
  volume: number;
  reduceMotion: boolean;
  animationIntensity: AnimationIntensity;
  language: Language;
  textSize: TextSize;
}

export const MOOD_OPTIONS = ['Tenang', 'Bersemangat', 'Ragu', 'Berharap', 'Cemas', 'Bersyukur'] as const;
export type Mood = typeof MOOD_OPTIONS[number];
