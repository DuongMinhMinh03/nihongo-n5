import type { Vocab, Grammar, Kanji } from './schemas';

export type { Vocab, Grammar, Kanji };

export interface AppContent {
  vocab: Vocab[];
  grammar: Grammar[];
  kanji: Kanji[];
}

/**
 * Đường dẫn tới file nội dung tĩnh (nằm trong /public nên PWA cache được).
 *
 * Dùng `import.meta.env.BASE_URL` để đường dẫn luôn tuyệt đối so với gốc ứng dụng,
 * tránh lỗi 404 khi người dùng mở trực tiếp các route con (vd /grammar/grammar-01).
 */
export const CONTENT_PATHS = {
  vocab: `${import.meta.env.BASE_URL}content/vocab/n5.json`,
  grammar: `${import.meta.env.BASE_URL}content/grammar/n5.json`,
  kanji: `${import.meta.env.BASE_URL}content/kanji/n5.json`
} as const;

async function fetchJson<T>(path: string, parse: (raw: unknown) => T, label: string): Promise<T> {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parse(await res.json());
  } catch (err) {
    throw new Error(
      `Không tải được dữ liệu "${label}" (${path}). ${(err as Error).message}. ` +
        `Hãy chạy "npm run dev" tại thư mục gốc hoặc "npm run build" để sinh thư mục public/content.`
    );
  }
}

export async function loadVocab(): Promise<Vocab[]> {
  return fetchJson(CONTENT_PATHS.vocab, (raw) => {
    const arr = Array.isArray(raw) ? raw : [];
    return arr as Vocab[];
  }, 'vocab');
}

export async function loadGrammar(): Promise<Grammar[]> {
  return fetchJson(CONTENT_PATHS.grammar, (raw) => {
    const arr = Array.isArray(raw) ? raw : [];
    return arr as Grammar[];
  }, 'grammar');
}

export async function loadKanji(): Promise<Kanji[]> {
  return fetchJson(CONTENT_PATHS.kanji, (raw) => {
    const arr = Array.isArray(raw) ? raw : [];
    return arr as Kanji[];
  }, 'kanji');
}

export async function loadAllContent(): Promise<AppContent> {
  const [vocab, grammar, kanji] = await Promise.all([loadVocab(), loadGrammar(), loadKanji()]);
  return { vocab, grammar, kanji };
}
