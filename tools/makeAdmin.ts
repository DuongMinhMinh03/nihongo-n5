/**
 * Tạo tài khoản admin đầu tiên trên Supabase (tự động).
 *
 * Chạy:  npm run db:make-admin -- admin@abc.com "Tên của bạn" "MatKhau123"
 *
 * Yêu cầu (trong .env.local):
 *   SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...   ← key service_role (chỉ dùng ở script này, KHÔNG đưa vào app)
 *
 * ⚠️ service_role key có toàn quyền. Script này chạy local, key chỉ nằm trong
 *    .env.local (đã bị .gitignore) và không bao giờ được bundle vào web app.
 */
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: resolve(process.cwd(), '.env.local') });
loadEnv({ path: resolve(process.cwd(), '.env') });

const URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const [email, fullName, password] = [
  process.argv[2],
  process.argv[3] ?? 'Admin',
  process.argv[4] ?? 'Admin@12345'
];

if (!URL || !SERVICE_KEY) {
  console.error(
    '\n❌ Thiếu thông tin.\n\n' +
      'Cần có trong .env.local:\n' +
      '   SUPABASE_URL=https://xxx.supabase.co\n' +
      '   SUPABASE_SERVICE_ROLE_KEY=eyJ...\n\n' +
      '   Lấy service_role key tại: Supabase → Project Settings → API → service_role\n'
  );
  process.exit(1);
}

if (!email) {
  console.error(
    '\n❌ Thiếu email.\n\n' +
      '   Cách dùng: npm run db:make-admin -- admin@abc.com "Tên Admin" "MatKhau123"\n'
  );
  process.exit(1);
}

async function main() {
  const supabase = createClient(URL!, SERVICE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  console.log(`🔍 Đang kiểm tra email "${email}"...`);

  // Tìm user đã tồn tại chưa
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (listErr) {
    console.error('❌ Không đọc được danh sách user:', listErr.message);
    process.exit(1);
  }

  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  let userId: string;

  if (existing) {
    userId = existing.id;
    console.log(`ℹ️  User đã tồn tại (${userId}) — sẽ cập nhật mật khẩu & role.`);
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });
    if (error) {
      console.error('❌ Không cập nhật được user:', error.message);
      process.exit(1);
    }
  } else {
    console.log('➕ Đang tạo user mới...');
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // bỏ yêu cầu xác nhận email
      user_metadata: { full_name: fullName }
    });
    if (error || !data.user) {
      console.error('❌ Không tạo được user:', error?.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`✅ Đã tạo user: ${userId}`);
  }

  // Đảm bảo profile tồn tại (trigger có thể chưa chạy nếu schema chưa được setup)
  const { error: pErr } = await supabase
    .from('profiles')
    .upsert({ id: userId, email, full_name: fullName }, { onConflict: 'id' });

  if (pErr) {
    console.log(`⚠️  Không tạo được profile: ${pErr.message}`);
    console.log('   (Nếu báo "relation profiles does not exist" → chạy `npm run db:setup` trước)');
  }

  // Cấp quyền admin
  const { error: rErr } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);

  if (rErr) {
    console.error('❌ Không cấp được role admin:', rErr.message);
    process.exit(1);
  }

  console.log('\n🎉 Xong! Tài khoản admin đã sẵn sàng.');
  console.log(`   Email:    ${email}`);
  console.log(`   Mật khẩu: ${password}`);
  console.log('\n   Bước tiếp theo: điền VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY vào .env.local');
  console.log('   rồi chạy `npm run dev` và đăng nhập.');
}

void main();
