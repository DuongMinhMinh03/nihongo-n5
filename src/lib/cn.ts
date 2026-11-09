/** Gộp className có điều kiện, không phụ thuộc thư viện ngoài */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Chuẩn hóa chuỗi tiếng Nhật để so sánh (bỏ khoảng trắng, chuẩn hóa dấu) */
export function normalizeJP(text: string): string {
  return text
    .replace(/[\s　]/g, '')
    .replace(/[。、!?！？「」『』,.!?"'()（）]/g, '')
    .toLowerCase();
}

/** Tách câu tiếng Nhật thành các từ (dựa trên kanji/kana/latin) */
export function tokenizeJP(text: string): string[] {
  return text.match(/[぀-ゟ゠-ヿ一-鿿]+|[a-zA-Z0-9]+/g) ?? [];
}

/** So khớp câu trả lời của người học với câu mẫu (bỏ qua dấu cách) */
export function compareSentence(input: string, target: string): number {
  const a = tokenizeJP(input);
  const b = tokenizeJP(target);
  if (a.length === 0 || b.length === 0) return 0;
  const matches = a.filter((token, i) => token === b[i]).length;
  return Math.round((matches / Math.max(a.length, b.length)) * 100);
}

/** Xáo trộn mảng (trả về bản sao, không mutate input) */
export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
