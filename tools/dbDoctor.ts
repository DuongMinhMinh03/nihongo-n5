/**
 * Kiểm tra sức khoẻ hệ thống Supabase (diagnostics).
 *
 * Chạy:  npm run db:doctor
 *
 * Kiểm tra:
 *   1. Có đủ biến môi trường không
 *   2. Kết nối DB được không
 *   3. 3 bảng đã tạo chưa
 *   4. Trigger + RLS policies đã bật chưa
 *   5. Có user nào chưa (gợi ý lệnh tạo admin)
 */
import { resolve } from 'node:path';
import { Client } from 'pg';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: resolve(process.cwd(), '.env.local') });
loadEnv({ path: resolve(process.cwd(), '.env') });

const DB_URL = process.env.SUPABASE_DB_URL;
const APP_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

let failures = 0;

function ok(msg: string) {
  console.log(`  ✅ ${msg}`);
}
function fail(msg: string, hint?: string) {
  failures += 1;
  console.log(`  ❌ ${msg}`);
  if (hint) console.log(`     💡 ${hint}`);
}
function warn(msg: string) {
  console.log(`  ⚠️  ${msg}`);
}

console.log('\n=== 1. Biến môi trường ===');
if (APP_URL) ok(`VITE_SUPABASE_URL = ${APP_URL}`);
else fail('Thiếu VITE_SUPABASE_URL', 'Thêm vào .env.local');
if (ANON_KEY) ok(`VITE_SUPABASE_ANON_KEY = ${ANON_KEY.slice(0, 12)}…`);
else fail('Thiếu VITE_SUPABASE_ANON_KEY', 'Thêm vào .env.local');
if (process.env.SUPABASE_SERVICE_ROLE_KEY) ok('SUPABASE_SERVICE_ROLE_KEY có sẵn (dùng cho db:make-admin)');
else warn('Chưa có SUPABASE_SERVICE_ROLE_KEY — cần cho `npm run db:make-admin`');
if (!DB_URL) {
  fail('Thiếu SUPABASE_DB_URL', 'Bắt buộc cho `npm run db:setup` và db:doctor');
}

if (!DB_URL) {
  console.log(`\n=== Kết quả: ${failures} lỗi ===\n`);
  process.exit(1);
}

console.log('\n=== 2. Kết nối database ===');
const client = new Client({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  ok('Kết nối thành công');
} catch (e) {
  fail(`Không kết nối được: ${(e as Error).message}`, 'Kiểm tra lại connection string / mật khẩu / IP allowlist');
  console.log(`\n=== Kết quả: ${failures} lỗi ===\n`);
  process.exit(1);
}

console.log('\n=== 3. Bảng dữ liệu ===');
const { rows: tables } = await client.query(`
  select table_name from information_schema.tables
  where table_schema = 'public'
    and table_name in ('profiles','content_items','user_progress')
    order by table_name
`);
const tableNames = tables.map((t) => t.table_name);
for (const t of ['profiles', 'content_items', 'user_progress']) {
  if (tableNames.includes(t)) ok(`Bảng "${t}" tồn tại`);
  else fail(`Thiếu bảng "${t}"`, 'Chạy `npm run db:setup`');
}

console.log('\n=== 4. Triggers ===');
const { rows: triggers } = await client.query(`
  select tgname from pg_trigger
  where tgrelid::regclass::text like 'public.%'
    and not tgisinternal
  order by tgname
`);
const trigNames = triggers.map((t) => t.tgname);
for (const t of [
  'on_auth_user_created',
  'on_profile_role_guard',
  'on_content_items_updated_by'
]) {
  if (trigNames.includes(t)) ok(`Trigger "${t}" đã bật`);
  else fail(`Thiếu trigger "${t}"`, 'Chạy lại `npm run db:setup`');
}

console.log('\n=== 5. RLS policies ===');
const { rows: policies } = await client.query(`
  select tablename, policyname from pg_policies
  where schemaname = 'public'
  order by tablename, policyname
`);
if (policies.length === 0) {
  fail('Chưa có policy nào', 'Chạy `npm run db:setup`');
} else {
  ok(`${policies.length} policy đang hoạt động:`);
  for (const p of policies) console.log(`     · ${p.tablename}.${p.policyname}`);
}

console.log('\n=== 6. RLS có đang bật không ===');
const { rows: rls } = await client.query(`
  select relname, relrowsecurity from pg_class
  where relnamespace = 'public'::regnamespace
    and relname in ('profiles','content_items','user_progress')
  order by relname
`);
for (const r of rls) {
  if (r.relrowsecurity) ok(`RLS đang bật trên "${r.relname}"`);
  else fail(`RLS CHƯA bật trên "${r.relname}"`, 'Chạy `npm run db:setup`');
}

console.log('\n=== 7. Người dùng & admin ===');
const { rows: profiles } = await client.query(`
  select email, role, created_at from public.profiles order by created_at
`);
if (profiles.length === 0) {
  warn('Chưa có user nào. Chạy: npm run db:make-admin -- admin@abc.com "Tên" "MatKhau"');
} else {
  console.log(`     Tổng ${profiles.length} user:`);
  for (const p of profiles) {
    const tag = p.role === 'admin' ? '🛠 admin' : '👤 user ';
    console.log(`     ${tag}  ${p.email}`);
  }
  if (!profiles.some((p) => p.role === 'admin')) {
    warn('Chưa có admin nào. Chạy: npm run db:make-admin -- admin@abc.com "Tên" "MatKhau"');
  }
}

console.log('\n=== 8. Nội dung trong content_items ===');
const { rows: counts } = await client.query(`
  select kind, count(*)::int as n,
         count(*) filter (where deleted)::int as deleted
  from public.content_items group by kind order by kind
`);
if (counts.length === 0) {
  ok('Chưa có bản sửa nào (admin chưa chỉnh nội dung) — OK');
} else {
  for (const c of counts) {
    ok(`${c.kind}: ${c.n} bản ghi (${c.deleted} đã xoá)`);
  }
}

await client.end();

console.log(
  failures === 0
    ? '\n🎉 Mọi thứ đều ổn! Có thể đăng nhập.\n'
    : `\n⚠️  Còn ${failures} vấn đề — xem phần 💡 ở trên.\n`
);
process.exit(failures === 0 ? 0 : 1);
