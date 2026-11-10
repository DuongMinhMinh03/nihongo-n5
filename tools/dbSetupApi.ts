/**
 * Tạo bảng + trigger + RLS trên Supabase bằng SQL Editor tự động.
 *
 * Dùng Supabase Management API (cần Personal Access Token) — không cần
 * connection string Postgres. Cũng không cần service_role key.
 *
 * Cách lấy Personal Access Token:
 *   https://supabase.com/dashboard/account/tokens → Generate new token
 *
 * Chạy:
 *   npm run db:setup:api
 *
 * Hoặc dùng access token từ biến môi trường:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx
 *   SUPABASE_PROJECT_REF=abcdefghijklmnop
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: resolve(process.cwd(), '.env.local') });
loadEnv({ path: resolve(process.cwd(), '.env') });

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const REF =
  process.env.SUPABASE_PROJECT_REF ?? process.env.VITE_SUPABASE_URL?.match(/https:\/\/([a-z0-9-]+)\./i)?.[1];

if (!TOKEN || !REF) {
  console.error(
    '\n❌ Thiếu thông tin.\n\n' +
      'Cần trong .env.local:\n' +
      '   SUPABASE_ACCESS_TOKEN=sbp_xxx     (https://supabase.com/dashboard/account/tokens)\n' +
      '   SUPABASE_PROJECT_REF=abcdefghijklm  (lấy từ Project URL)\n'
  );
  process.exit(1);
}

async function main() {
  const sql = readFileSync(resolve(process.cwd(), 'supabase/schema.sql'), 'utf8');

  console.log(`🔌 Đang gửi schema.sql tới project "${REF}"...`);

  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  const text = await res.text();

  if (!res.ok) {
    console.error(`\n❌ Supabase API trả về ${res.status}\n`);
    try {
      const j = JSON.parse(text);
      console.error(j.message ?? j.error ?? text);
    } catch {
      console.error(text);
    }
    process.exit(1);
  }

  console.log('✅ Schema đã được áp dụng!');
  try {
    const j = JSON.parse(text);
    if (Array.isArray(j)) console.log(j);
  } catch {
    /* bỏ qua */
  }

  // Kiểm tra
  const check = await fetch(
    `https://api.supabase.com/v1/projects/${REF}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `select table_name from information_schema.tables
                where table_schema='public'
                  and table_name in ('profiles','content_items','user_progress')
                order by table_name;`
      })
    }
  );
  const rows = JSON.parse(await check.text());
  console.log(`\n📋 Các bảng đã tạo: ${rows.map((r: { table_name: string }) => r.table_name).join(', ')}`);
  console.log('\n🎉 Xong! Tiếp theo: npm run db:make-admin -- <email> "<tên>" "<mật khẩu>"');
}

void main();
