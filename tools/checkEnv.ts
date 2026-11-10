/**
 * Kiểm tra cấu hình Supabase trong .env.local — chạy trước khi dev/build.
 *
 *   npm run db:check-env
 *
 * Script này KHÔNG gọi mạng, chỉ kiểm tra định dạng + kiểm tra key có
 * thực sự là JWT hợp lệ của Supabase hay không.
 */
import { resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: resolve(process.cwd(), '.env.local') });
loadEnv({ path: resolve(process.cwd(), '.env') });

let errors = 0;
let warns = 0;

function ok(m: string) {
  console.log(`  ✅ ${m}`);
}
function bad(m: string, hint?: string) {
  errors++;
  console.log(`  ❌ ${m}`);
  if (hint) console.log(`     💡 ${hint}`);
}
function warn(m: string) {
  warns++;
  console.log(`  ⚠️  ${m}`);
}

console.log('\n=== 1. File .env.local ===');
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) ok('Tồn tại .env.local');
else bad('Chưa có .env.local', 'Copy từ .env.example: Copy-Item .env.example .env.local');

console.log('\n=== 2. VITE_SUPABASE_URL ===');
const url = process.env.VITE_SUPABASE_URL?.trim() ?? '';
if (!url) {
  bad('Chưa điền', 'Supabase → Project Settings → API → Project URL');
} else if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(url)) {
  bad(`Định dạng URL không đúng: "${url}"`, 'Phải có dạng https://xxxxx.supabase.co');
} else {
  ok(url);
  const m = url.match(/https:\/\/([a-z0-9-]+)\./i);
  if (m) console.log(`     Project ref: ${m[1]}`);
}

console.log('\n=== 3. VITE_SUPABASE_ANON_KEY ===');
const key = process.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';
if (!key) {
  bad('Chưa điền', 'Supabase → Project Settings → API → anon public key');
} else {
  // Supabase anon key là JWT gồm 3 phần
  const parts = key.split('.');
  if (parts.length !== 3) {
    bad(
      `Key không phải JWT hợp lệ (${parts.length} phần, cần 3)`,
      'Bạn có thể đã copy nhầm "Publishable key" mới (sb_publishable_...) hoặc copy thiếu. Copy đúng "anon public" key.'
    );
  } else {
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      ok(`JWT hợp lệ (role: ${payload.role ?? '?'})`);
      if (payload.role && payload.role !== 'anon') {
        bad(`Key có role "${payload.role}" — KHÔNG phải anon key!`, 'Đổi lại anon public key. Tuyệt đối không dùng service_role ở web app.');
      }
      if (payload.ref) {
        console.log(`     Project ref trong key: ${payload.ref}`);
        const urlRef = url.match(/https:\/\/([a-z0-9-]+)\./i)?.[1];
        if (urlRef && urlRef !== payload.ref) {
          bad(`Key và URL thuộc 2 project khác nhau!`, `URL: ${urlRef} vs key: ${payload.ref}`);
        }
      }
    } catch {
      bad('Không giải mã được payload của key', 'Key có thể bị copy thiếu hoặc thừa ký tự. Hãy copy lại.');
    }
  }
}

console.log('\n=== 4. Script database (tùy chọn) ===');

// 4a. Access Token (cách khuyến nghị — dùng Management API)
const at = process.env.SUPABASE_ACCESS_TOKEN?.trim() ?? '';
const ref = process.env.SUPABASE_PROJECT_REF?.trim() ?? '';
if (at) {
  ok(at.startsWith('sbp_') ? 'SUPABASE_ACCESS_TOKEN có vẻ đúng (sbp_…)' : 'SUPABASE_ACCESS_TOKEN đã có');
  if (!at.startsWith('sbp_')) {
    warn('Token không bắt đầu bằng "sbp_" — kiểm tra lại trên dashboard/account/tokens');
  }
} else {
  warn('Chưa có SUPABASE_ACCESS_TOKEN — bỏ qua bước "npm run db:setup:api"');
  console.log('     💡 Lấy tại: supabase.com/dashboard/account/tokens → Generate new token');
}

if (ref) {
  ok(`SUPABASE_PROJECT_REF = ${ref}`);
  const urlRef = url.match(/https:\/\/([a-z0-9-]+)\./i)?.[1];
  if (urlRef && urlRef !== ref) {
    bad(`Project ref không khớp với URL`, `URL: ${urlRef} vs ref: ${ref}`);
  }
} else {
  warn('Chưa có SUPABASE_PROJECT_REF — bỏ qua bước "npm run db:setup:api"');
  console.log('     💡 Lấy từ Project URL: https://<ref>.supabase.co → <ref>');
}

// 4b. DB URL (cách thay thế)
const dbUrl = process.env.SUPABASE_DB_URL?.trim() ?? '';
if (!dbUrl) {
  warn('Chưa có SUPABASE_DB_URL — bỏ qua bước "npm run db:setup"');
  console.log('     💡 Chỉ cần 2 biến VITE_* để app chạy. DB URL chỉ cần cho script thiết lập.');
} else if (!dbUrl.startsWith('postgresql://')) {
  bad(`DB URL phải bắt đầu bằng postgresql://`, 'Sửa lại connection string');
} else {
  ok('SUPABASE_DB_URL có vẻ đúng định dạng');
  const host = dbUrl.match(/@([^/:]+)/)?.[1];
  if (host) console.log(`     Host: ${host}`);
  if (!host?.includes('supabase')) {
    warn('Host không chứa "supabase" — kiểm tra lại connection string');
  }
}

const svc = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';
if (svc) {
  const parts = svc.split('.');
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      if (payload.role === 'service_role') ok('SUPABASE_SERVICE_ROLE_KEY đúng (role: service_role)');
      else warn(`Key có role "${payload.role}" — kỳ vọng service_role`);
    } catch {
      bad('service_role key không giải mã được');
    }
  } else if (svc.startsWith('sb_publishable_')) {
    ok('SUPABASE_SERVICE_ROLE_KEY dùng dạng publishable key mới (sb_publishable_…)');
  } else {
    bad('service_role key không có vẻ là JWT');
  }
} else {
  warn('Chưa có SUPABASE_SERVICE_ROLE_KEY — bỏ qua bước "npm run db:make-admin"');
  console.log('     💡 Hoặc dùng "npm run db:make-admin:api" (chỉ cần Access Token).');
}

console.log('\n=== 5. File .env.example có bị commit nhầm? ===');
const gitignore = readFileSync(resolve(process.cwd(), '.gitignore'), 'utf8');
if (gitignore.includes('*.local')) ok('.gitignore có *.local → .env.local không bị commit');
else bad('.gitignore thiếu *.local', 'Thêm *.local vào .gitignore');

console.log(
  errors === 0
    ? '\n✅ Cấu hình hợp lệ! Chạy `npm run dev` được rồi.\n'
    : `\n❌ Còn ${errors} lỗi — sửa theo gợi ý 💡 ở trên rồi chạy lại.\n`
);
process.exit(errors === 0 ? 0 : 1);
