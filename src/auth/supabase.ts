/**
 * Supabase client — singleton.
 *
 * Chỉ dùng ANON key ở phía client. Service role key KHÔNG BAO GIỜ được đưa vào
 * đây (nó sẽ bypass mọi Row Level Security).
 *
 * Nếu chưa cấu hình (biến môi trường rỗng) thì `supabase` là null và toàn bộ
 * chức năng đăng nhập / admin sẽ tự ẩn đi — app vẫn chạy bình thường offline.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

/** Ném lỗi thân thiện nếu chưa cấu hình Supabase */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Chưa cấu hình Supabase. Hãy tạo file .env.local với VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.'
    );
  }
  return supabase;
}
