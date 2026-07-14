import type { SelectedCard, Spread, Language } from '../types';

const DEFAULT_API_URL =
  'https://script.google.com/macros/s/AKfycbweGNjDwsVjmElROrLfIdFQcrkRUiV7CIDxpN4pZMleYwgPtVxJ4F_Xwn_UKWRdQ443/exec';

const API_URL = (import.meta.env.VITE_HIDDEN_TABLE_API_URL || DEFAULT_API_URL).trim();

export interface ApiCardPayload {
  id: number;
  position: string;
  name: string;
  orientation: 'upright' | 'reversed';
  meaning: string;
  keywords: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  reading_id: string;
  result: string;
  question: string;
  category: string;
  spread: string;
  cards: unknown[];
}

export interface GenerateReadingParams {
  question: string;
  category: string;
  spread: Spread;
  cards: SelectedCard[];
  language: Language;
}

async function parseResponse<T extends { success: boolean; message?: string }>(response: Response): Promise<T> {
  const text = (await response.text()).trim();

  if (!response.ok) {
    throw new Error(`Server merespons dengan status ${response.status}.`);
  }
  if (!text) {
    throw new Error('Server tidak mengirimkan respons.');
  }
  if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
    throw new Error('Endpoint Apps Script mengembalikan halaman HTML, bukan data JSON. Periksa deployment Web App.');
  }

  let data: T;
  try {
    data = JSON.parse(text) as T;
  } catch {
    throw new Error('Format respons server tidak valid.');
  }

  if (!data.success) {
    throw new Error(data.message || 'Gagal membuat pembacaan.');
  }
  return data;
}

export async function generateReading(
  params: GenerateReadingParams,
  signal?: AbortSignal,
): Promise<ApiResponse> {
  const { question, category, spread, cards, language } = params;
  const cleanQuestion = question.trim().slice(0, 500);

  if (!cleanQuestion) throw new Error('Pertanyaan tidak boleh kosong.');
  if (cards.length !== spread.cardCount) {
    throw new Error('Jumlah kartu tidak sesuai dengan spread yang dipilih.');
  }

  const cardPayload: ApiCardPayload[] = cards.map((sc) => ({
    id: sc.card.id,
    position: sc.positionName,
    name: sc.card.name,
    orientation: sc.orientation,
    meaning: sc.orientation === 'upright' ? sc.card.upright : sc.card.reversed,
    keywords: sc.card.keywords.join(', '),
  }));

  const payload = {
    action: 'generateReading',
    question: cleanQuestion,
    category,
    spread: spread.name,
    language,
    cards: cardPayload,
  };

  if (import.meta.env.DEV) {
    console.info('[HiddenTable] Mengirim pembacaan', {
      action: payload.action,
      category,
      spread: spread.name,
      language,
      cardCount: cards.length,
    });
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
    redirect: 'follow',
    signal,
  });

  return parseResponse<ApiResponse>(response);
}
