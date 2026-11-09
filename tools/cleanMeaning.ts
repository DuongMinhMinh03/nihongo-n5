/**
 * Chuẩn hoá nghĩa tiếng Việt lấy từ docx.
 *
 * Docx có nhiều lỗi gõ: khoảng trắng thừa trong ngoặc, dấu phẩy thừa,
 * nội dung trong ngoặc giải thích dài dòng. Ở đây ta:
 *   1. Gộp khoảng trắng.
 *   2. Bỏ khoảng trắng ngay sau "(" và trước ")".
 *   3. Bỏ dấu phẩy cuối cùng.
 *   4. Viết hoa chữ cái đầu nếu nghĩa là danh từ chung.
 */

const VI_LOWER_START =
  /^(chú, bác|cô, dì|người đàn ông trung niên|người|tôi|anh chị em|bạn|mẹ|bố|chị|em|anh|ông|bà|vợ|con|cái|quần áo|áo|bữa|cơm|giấy|tiếng Anh|chữ hán|cà phê)/;

export function cleanMeaningVi(raw: string): string {
  let s = raw.replace(/\s+/g, ' ').trim();

  // Bỏ khoảng trắng thừa quanh dấu ngoặc
  s = s.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
  // Gộp " (" thành "(" khi mở đầu nghĩa
  s = s.replace(/^\((.+?)\)\s*/, '$1 ');
  // Bỏ dấu phẩy cuối
  s = s.replace(/[,;]\s*$/, '');
  // Bỏ khoảng trắng trước dấu phẩy
  s = s.replace(/\s+,/g, ',');

  // Viết hoa chữ cái đầu nếu nghĩa bắt đầu bằng chữ thường
  if (s && /^[a-zàáảãạăâđêôơư]/.test(s) && !VI_LOWER_START.test(s)) {
    s = s[0].toUpperCase() + s.slice(1);
  }

  return s.trim();
}

/** Tách nghĩa chính và phần giải thích trong ngoặc */
export function splitMeaning(clean: string): { head: string; note: string } {
  const m = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(clean);
  if (!m) return { head: clean, note: '' };
  return { head: m[1].trim(), note: m[2].trim() };
}
