#!/usr/bin/env node
/**
 * Trợ giúp thiết lập Supabase cho Nihongo N5 — chạy 1 lần.
 *
 *   npm run setup:supabase
 *
 * Script này sẽ:
 *   1. Kiểm tra .env.local đã điền đủ biến chưa
 *   2. Chạy schema.sql tạo bảng + trigger + RLS
 *   3. Tạo tài khoản admin (nếu chưa có)
 *   4. In kết quả + hướng dẫn bước tiếp theo
 *
 * Cần bổ sung vào .env.local (trước khi chạy script):
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_DB_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const ENV_FILE = resolve(ROOT, '.env.local');

const REQUIRED = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_DB_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

function readEnvFile(): Record<string, string> {
  if (!existsSync(ENV_FILE)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    out[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return out;
}

function fail(msg: string): never {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

// ── Kiểm tra biến môi trường ────────────────────────────────────────────────
const env = readEnvFile();
const missing = REQUIRED.filter((k) => !env[k]);

if (missing.length > 0) {
  console.error('\n❌ Thiếu các biến sau trong .env.local:\n');
  for (const m of missing) console.error(`   · ${m}`);
  console.error(
    '\n📖 Mở trang hướng dẫn trong web:  http://localhost:5173/setup\n' +
      '   Hoặc xem: supabase/README.md\n'
  );
  process.exit(1);
}

console.log('✅ .env.local đã điền đủ 4 biến cần thiết.\n');

// ── 1. Chạy schema ──────────────────────────────────────────────────────────
console.log('━━━ 1/3  Tạo bảng + trigger + RLS ━━━');
const setup = spawnSync('npx', ['tsx', 'tools/dbSetup.ts'], {
  stdio: 'inherit',
  shell: true,
  cwd: ROOT
});
if (setup.status !== 0) fail('db:setup thất bại — xem lỗi ở trên.');

// ── 2. Tạo admin ───────────────────────────────────────────────────────────
console.log('\n━━━ 2/3  Tạo tài khoản admin ━━━');
const adminEmail = process.argv[2] ?? 'admin@n5.local';
const adminPass = process.argv[3] ?? 'Admin@12345';
const adminName = process.argv[4] ?? 'Admin';

const mk = spawnSync(
  'npx',
  ['tsx', 'tools/makeAdmin.ts', adminEmail, adminName, adminPass],
  { stdio: 'inherit', shell: true, cwd: ROOT }
);
if (mk.status !== 0) fail('db:make-admin thất bại — xem lỗi ở trên.');

// ── 3. Kiểm tra ────────────────────────────────────────────────────────────
console.log('\n━━━ 3/3  Kiểm tra hệ thống ━━━');
const doc = spawnSync('npx', ['tsx', 'tools/dbDoctor.ts'], {
  stdio: 'inherit',
  shell: true,
  cwd: ROOT
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (doc.status === 0) {
  console.log('🎉 HOÀN TẤT! Hệ thống đã sẵn sàng.\n');
  console.log('   Bước tiếp theo:');
  console.log('   1. Khởi động lại dev server:  npm run dev');
  console.log(`   2. Đăng nhập tại /login với ${adminEmail} / ${adminPass}`);
  console.log('   3. Vào /admin để quản lý nội dung\n');
} else {
  console.log('⚠️  Còn một vài vấn đề — xem phần 💡 trong kết quả kiểm tra.\n');
}
