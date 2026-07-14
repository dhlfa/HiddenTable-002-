import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { SelectedCard, ReadingResult, Spread, ReadingCategory, Language } from '../types';

interface ReadingSession {
  spread: Spread | null;
  question: string;
  category: ReadingCategory;
  language: Language;
  selectedCards: SelectedCard[];
  result: ReadingResult | null;
  setSpread: (s: Spread | null) => void;
  setQuestion: (q: string) => void;
  setCategory: (c: ReadingCategory) => void;
  setLanguage: (l: Language) => void;
  setSelectedCards: (c: SelectedCard[]) => void;
  setResult: (r: ReadingResult | null) => void;
  reset: () => void;
}

interface PersistedReadingSession {
  spread: Spread | null;
  question: string;
  category: ReadingCategory;
  language: Language;
  selectedCards: SelectedCard[];
  result: ReadingResult | null;
}

const STORAGE_KEY = 'the-hidden-table:reading-session';

const emptySession: PersistedReadingSession = {
  spread: null,
  question: '',
  category: 'General',
  language: 'id',
  selectedCards: [],
  result: null,
};

function loadSession(): PersistedReadingSession {
  if (typeof window === 'undefined') return emptySession;
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return emptySession;
    const parsed = JSON.parse(stored) as Partial<PersistedReadingSession>;
    return {
      spread: parsed.spread ?? null,
      question: typeof parsed.question === 'string' ? parsed.question : '',
      category: parsed.category ?? 'General',
      language: parsed.language === 'en' ? 'en' : 'id',
      selectedCards: Array.isArray(parsed.selectedCards) ? parsed.selectedCards : [],
      result: parsed.result ?? null,
    };
  } catch {
    return emptySession;
  }
}

const defaultSession: ReadingSession = {
  ...emptySession,
  setSpread: () => {},
  setQuestion: () => {},
  setCategory: () => {},
  setLanguage: () => {},
  setSelectedCards: () => {},
  setResult: () => {},
  reset: () => {},
};

const Ctx = createContext<ReadingSession>(defaultSession);

export function ReadingSessionProvider({ children }: { children: ReactNode }) {
  const initial = loadSession();
  const [spread, setSpread] = useState<Spread | null>(initial.spread);
  const [question, setQuestion] = useState(initial.question);
  const [category, setCategory] = useState<ReadingCategory>(initial.category);
  const [language, setLanguage] = useState<Language>(initial.language);
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>(initial.selectedCards);
  const [result, setResult] = useState<ReadingResult | null>(initial.result);

  useEffect(() => {
    const snapshot: PersistedReadingSession = {
      spread,
      question,
      category,
      language,
      selectedCards,
      result,
    };
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Keep the active session in memory if sessionStorage is unavailable.
    }
  }, [spread, question, category, language, selectedCards, result]);

  const reset = useCallback(() => {
    setSpread(null);
    setQuestion('');
    setCategory('General');
    setLanguage('id');
    setSelectedCards([]);
    setResult(null);
    try { window.sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <Ctx.Provider value={{
      spread,
      question,
      category,
      language,
      selectedCards,
      result,
      setSpread,
      setQuestion,
      setCategory,
      setLanguage,
      setSelectedCards,
      setResult,
      reset,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useReadingSessionContext() {
  return useContext(Ctx);
}
