import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/auth/supabase';
import type { Profile, Role } from '@/auth/types';

/**
 * Dịch các lỗi Supabase sang tiếng Việt kèm hướng dẫn cụ thể.
 */
function translateAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes('invalid api key') || m.includes('invalid claim')) {
    return (
      '❌ API key không hợp lệ. Bạn đã copy sai key trong .env.local. ' +
      'Lấy đúng "anon public key" tại Supabase → Project Settings → API, ' +
      'dán vào VITE_SUPABASE_ANON_KEY rồi KHỞI ĐỘNG LẠI dev server.'
    );
  }
  if (m.includes('fetch failed') || m.includes('network')) {
    return 'Không kết nối được tới Supabase. Kiểm tra kết nối mạng hoặc URL có đúng không.';
  }
  if (m.includes('email not confirmed')) {
    return 'Email chưa được xác nhận. Hãy vào hộp thư bấm link xác nhận, hoặc tắt "Confirm email" trong Supabase → Authentication → Sign In / Providers.';
  }
  if (m.includes('invalid login credentials')) {
    return 'Email hoặc mật khẩu không đúng. Nếu bạn mới đăng ký, hãy thử đăng nhập lại sau khi xác nhận email.';
  }
  if (m.includes('user already registered')) {
    return 'Email này đã được đăng ký. Hãy chuyển sang tab "Đăng nhập".';
  }
  if (m.includes('password should be')) {
    return 'Mật khẩu quá yếu — cần ít nhất 6 ký tự.';
  }
  if (m.includes('database error')) {
    return (
      'Lỗi database khi tạo tài khoản. Có thể trigger tạo profile chưa chạy. ' +
      'Hãy chạy lại toàn bộ nội dung supabase/schema.sql trong SQL Editor.'
    );
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Quá nhiều lần thử. Hãy đợi vài phút rồi thử lại.';
  }
  return message;
}

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  role: Role | null;
  loading: boolean;
  /** true nếu chưa cấu hình Supabase → ẩn toàn bộ chức năng login */
  disabled: boolean;

  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, fullName: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      profile: null,
      role: null,
      loading: true,
      disabled: !isSupabaseConfigured,

      init: async () => {
        if (!supabase) {
          set({ loading: false, disabled: true });
          return;
        }
        const {
          data: { session }
        } = await supabase.auth.getSession();

        // Phải chờ nạp xong profile/role rồi mới tắt loading — nếu không,
        // RequireAdmin sẽ thấy role === null và đá người dùng về trang chủ.
        if (session) {
          await get().refreshProfile();
        }
        set({ session, loading: false });
      },

      signIn: async (email, password) => {
        if (!supabase)
          return 'Chưa cấu hình Supabase. Hãy tạo file .env.local với VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY rồi khởi động lại dev server.';
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) return translateAuthError(error.message);
        const {
          data: { session }
        } = await supabase.auth.getSession();
        set({ session });
        await get().refreshProfile();
        return null;
      },

      signUp: async (email, password, fullName) => {
        if (!supabase)
          return 'Chưa cấu hình Supabase. Hãy tạo file .env.local với VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY rồi khởi động lại dev server.';
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } }
        });
        if (error) return translateAuthError(error.message);
        return null;
      },

      signOut: async () => {
        if (supabase) await supabase.auth.signOut();
        set({ session: null, profile: null, role: null });
      },

      refreshProfile: async () => {
        if (!supabase) return;
        const {
          data: { session }
        } = await supabase.auth.getSession();
        if (!session) {
          set({ profile: null, role: null });
          return;
        }
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, created_at')
          .eq('id', session.user.id)
          .single();

        if (error || !data) {
          // Profile chưa được tạo (trigger chưa chạy) → coi như user thường
          set({
            profile: null,
            role: 'user'
          });
          return;
        }
        set({ profile: data as Profile, role: (data.role as Role) ?? 'user' });
      }
    }),
    {
      name: 'nihongo-n5-auth',
      // Chỉ lưu session; profile/role luôn được lấy mới từ server
      partialize: (s) => ({ session: s.session }),
      version: 1
    }
  )
);

/** Hook tiện ích: có đăng nhập không, là admin không */
export function useIsAdmin(): boolean {
  return useAuth((s) => s.role === 'admin');
}
