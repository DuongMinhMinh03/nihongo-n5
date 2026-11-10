/**
 * Script thiết lập database Supabase tự động.
 *
 * Chạy:  npm run db:setup
 *
 * Yêu cầu (đặt trong file .env.local hoặc .env):
 *   SUPABASE_DB_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
 *
 * Cách lấy connection string:
 *   Supabase Dashboard → Project Settings → Database → Connection string → URI
 *   (chọn "Session pooler" nếu IP của bạn bị chặn)
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Client } from 'pg';
import { config as loadEnv } from 'dotenv';

// Nạp .env.local rồi .env (ưu tiên biến đã có trong môi trường)
loadEnv({ path: resolve(process.cwd(), '.env.local') });
loadEnv({ path: resolve(process.cwd(), '.env') });

const DB_URL = process.env.SUPABASE_DB_URL;

if (!DB_URL) {
  console.error(
    '\n❌ Chưa có SUPABASE_DB_URL.\n\n' +
      '   Thêm vào file .env.local ở thư mục gốc:\n' +
      '   SUPABASE_DB_URL=postgresql://postgres.xxx:password@aws-0-xx.pooler.supabase.com:5432/postgres\n\n' +
      '   Lấy connection string tại: Supabase → Project Settings → Database → Connection string\n'
  );
  process.exit(1);
}

async function main() {
  const sql = readFileSync(resolve(process.cwd(), 'supabase/schema.sql'), 'utf8');

  console.log('🔌 Đang kết nối tới Supabase...');
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
    // Supabase pooler yêu cầu prepared statement đơn
    options: '-c search_path=public'
  });

  await client.connect();
  console.log('✅ Đã kết nối');

  try {
    console.log('🚀 Đang chạy schema.sql...');
    await client.query(sql);
    console.log('✅ Schema đã được tạo thành công!');
  } catch (err) {
    console.error('\n❌ Lỗi khi chạy schema:\n');
    console.error((err as Error).message);
    console.error('\n💡 Gợi ý: chạy từng đoạn trong SQL Editor để biết chính xác lỗi ở đâu.\n');
    process.exitCode = 1;
  } finally {
    await client.end();
  }

  // Kiểm tra kết quả
  console.log('\n🔍 Kiểm tra các bảng đã tạo:');
  const client2 = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client2.connect();
  const { rows } = await client2.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('profiles', 'content_items', 'user_progress')
    order by table_name;
  `);
  await client2.end();

  if (rows.length === 3) {
    console.log('✅ Đủ 3 bảng: profiles, content_items, user_progress');
    console.log('\n🎉 Hoàn tất! Bây giờ điền VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY vào .env.local');
  } else {
    console.log(`⚠️  Mới tạo được ${rows.length}/3 bảng:`, rows.map((r) => r.table_name).join(', '));
  }
}

void main();
