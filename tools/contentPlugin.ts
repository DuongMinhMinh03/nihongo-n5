import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const CONTENT_DIR = path.resolve(process.cwd(), 'content');

/**
 * File nguồn thô (kết quả của `npm run import:jlpt`) không cần đưa vào app —
 * app chỉ dùng content/{vocab,grammar,kanji}/n5.json.
 */
const EXCLUDED = new Set([
  'vocab/imported-n5.json',
  'kanji/imported-n5.json'
]);

/**
 * File trung gian / file debug của các script trong `tools/`.
 * Chúng không phải dữ liệu app dùng được nên không nên đóng gói vào PWA
 * (làm tăng dung lượng precache và gây nhiễu).
 *
 *   - file bắt đầu bằng "."  → .need-*.tsv, .docx-*.json, .check-*.tsv …
 *   - đuôi .tsv / .bak      → bản export & backup
 */
function isBuildArtifact(rel: string): boolean {
  const name = rel.split('/').pop() ?? '';
  if (name.startsWith('.')) return true;
  if (/\.(tsv|bak)$/i.test(name)) return true;
  return false;
}

/**
 * Serve `content/**` ở dev và đưa vào `dist/content/**` khi build,
 * để service worker có thể precache toàn bộ dữ liệu tĩnh.
 */
export function contentPlugin(): Plugin {
  const collect = (dir: string): string[] => {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return collect(full);
      return [full];
    });
  };

  return {
    name: 'nihongo-content',
    apply: () => true,

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0];
        if (!url.startsWith('/content/')) return next();
        const file = path.join(CONTENT_DIR, url.replace('/content/', ''));
        if (!file.startsWith(CONTENT_DIR) || !fs.existsSync(file)) return next();
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(fs.readFileSync(file));
      });
    },

    /** Chỉ emit asset ở chế độ build (buildStart chạy cả trong dev serve). */
    buildStart() {
      if (this.meta?.watchMode) return;
      for (const file of collect(CONTENT_DIR)) {
        const rel = path.relative(CONTENT_DIR, file).split(path.sep).join('/');
        if (EXCLUDED.has(rel)) continue;
        if (isBuildArtifact(rel)) continue;
        this.emitFile({
          type: 'asset',
          fileName: `content/${rel}`,
          source: fs.readFileSync(file)
        });
      }
    }
  };
}
