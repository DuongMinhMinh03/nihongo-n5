/**
 * Đọc bảng từ vựng trong file .docx mà không cần thư viện ngoài.
 *
 * File .docx là file ZIP: word/document.xml chứa toàn bộ nội dung.
 * Cách đọc:
 *   1. Giải nén ZIP (dùng `unzipper`/`adm-zip` nếu có, fallback sang PowerShell Expand-Archive).
 *   2. Bóc các thẻ <w:tr> (hàng) và <w:tc> (ô), ghép <w:t> thành text.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** Decode các entity XML cơ bản */
function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&');
}

/** Bóc text của một đoạn XML (mọi thẻ <w:t>) */
function extractText(xml: string): string {
  const parts: string[] = [];
  const re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\s*\/>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    if (m[1] !== undefined) parts.push(decodeXml(m[1]));
    else parts.push('\t');
  }
  return parts.join('');
}

/** Giải nén file .docx và trả về đường dẫn tới word/document.xml */
function extractDocumentXml(docxPath: string): string {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'docx-'));
  const zip = path.join(tmp, 'doc.zip');
  fs.copyFileSync(docxPath, zip);

  // PowerShell Expand-Archive chỉ nhận .zip — đã đảm bảo extension ở trên.
  execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      `Expand-Archive -LiteralPath '${zip}' -DestinationPath '${path.join(tmp, 'x')}' -Force`
    ],
    { stdio: 'ignore' }
  );

  return path.join(tmp, 'x', 'word', 'document.xml');
}

/**
 * Đọc bảng đầu tiên trong file .docx.
 * @returns mảng các hàng, mỗi hàng là mảng ô (string)
 */
export function readDocxTable(docxPath: string): string[][] {
  const xml = fs.readFileSync(extractDocumentXml(docxPath), 'utf8');

  const rows: string[][] = [];
  const rowRe = /<w:tr\b[\s\S]*?<\/w:tr>/g;
  let rm: RegExpExecArray | null;
  while ((rm = rowRe.exec(xml))) {
    const cells: string[] = [];
    const cellRe = /<w:tc>[\s\S]*?<\/w:tc>/g;
    let cm: RegExpExecArray | null;
    while ((cm = cellRe.exec(rm[0]))) {
      cells.push(extractText(cm[0]).replace(/\s+/g, ' ').trim());
    }
    if (cells.length) rows.push(cells);
  }
  return rows;
}
