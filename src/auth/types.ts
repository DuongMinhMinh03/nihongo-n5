/**
 * Kiểu dữ liệu dùng chung cho các bảng của backend.
 * Khớp với SQL trong `supabase/schema.sql`.
 */

export type Role = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export type ContentKind = 'vocab' | 'grammar' | 'kanji';

/** Một bản ghi override của nội dung (admin sửa trong dashboard) */
export interface ContentItem {
  id: string;
  kind: ContentKind;
  item_id: string;
  payload: unknown;
  deleted: boolean;
  updated_by: string | null;
  updated_at: string;
}

/** Tiến độ học của một user, lưu trên cloud để đồng bộ giữa nhiều thiết bị */
export interface UserProgress {
  user_id: string;
  cards: Record<string, unknown>;
  log: unknown[];
  study_days: string[];
  updated_at: string;
}
