import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/auth/supabase';
import type { Profile, Role } from '@/auth/types';

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
        set({ session, loading: false });
        if (session) await get().refreshProfile();
      },

      signIn: async (email, password) => {
        if (!supabase)
          return 'Chưa cấu hình Supabase. Hãy tạo file .env.local với VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY rồi khởi động lại dev server.';
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) return error.message;
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
        if (error) return error.message;
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
