/**
 * Tạo tài khoản admin qua Supabase Management API (không cần service_role key).
 *
 * Chạy:
 *   npm run db:make-admin:api -- admin@abc.com "Tên Admin" "MatKhau123"
 *
 * Cần trong .env.local:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx
 *   SUPABASE_PROJECT_REF=abcdefghijklm
 */
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: resolve(process.cwd(), '.env.local') });
loadEnv({ path: resolve(process.cwd(), '.env') });

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const REF =
  process.env.SUPABASE_PROJECT_REF ?? process.env.VITE_SUPABASE_URL?.match(/https:\/\/([a-z0-9-]+)\./i)?.[1];

const [email, fullName = 'Admin', password = 'Admin@12345'] = [
  process.argv[2],
  process.argv[3],
  process.argv[4]
];

if (!TOKEN || !REF) {
  console.error(
    '\n❌ Thiếu thông tin.\n\n' +
      'Cần trong .env.local:\n' +
      '   SUPABASE_ACCESS_TOKEN=sbp_xxx     (https://supabase.com/dashboard/account/tokens)\n' +
      '   SUPABASE_PROJECT_REF=abcdefghijklm  (lấy từ Project URL)\n'
  );
  process.exit(1);
}
if (!email) {
  console.error('\n❌ Thiếu email.\n   npm run db:make-admin:api -- admin@abc.com "Tên" "MatKhau"\n');
  process.exit(1);
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`https://api.supabase.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 400)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function sql(query: string) {
  return api(`/projects/${REF}/database/query`, {
    method: 'POST',
    body: JSON.stringify({ query })
  });
}

async function main() {
  console.log(`🔍 Đang tìm user "${email}" trong project "${REF}"...`);

  const users = (await api(`/projects/${REF}/auth/users?page=1&per_page=1000`)) as {
    users?: { id: string; email?: string }[];
  };
  const existing = (users.users ?? []).find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  let userId: string;

  if (existing) {
    userId = existing.id;
    console.log(`ℹ️  User đã tồn tại (${userId}) — sẽ cập nhật mật khẩu & role.`);
    await api(`/projects/${REF}/auth/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      })
    });
  } else {
    console.log('➕ Đang tạo user mới...');
    const created = (await api(`/projects/${REF}/auth/users`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      })
    })) as { id?: string };
    userId = created.id ?? '';
    if (!userId) throw new Error('Không lấy được user id từ response');
    console.log(`✅ Đã tạo user: ${userId}`);
  }

  // Đảm bảo profile tồn tại + role admin
  await sql(
    `insert into public.profiles (id, email, full_name, role)
     values ('${userId}', '${email.replace(/'/g, "''")}', '${fullName.replace(/'/g, "''")}', 'admin')
     on conflict (id) do update set role = 'admin', full_name = excluded.full_name;`
  );

  console.log('\n🎉 Xong! Tài khoản admin đã sẵn sàng.');
  console.log(`   Email:    ${email}`);
  console.log(`   Mật khẩu: ${password}`);
  console.log('\n   Bước tiếp theo: điền VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY vào .env.local');
  console.log('   rồi chạy `npm run dev` và đăng nhập.');
}

main().catch((e) => {
  console.error(`\n❌ Lỗi: ${(e as Error).message}\n`);
  process.exit(1);
});
