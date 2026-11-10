/**
 * Gộp nội dung "base" (JSON trong repo, đã precache bởi service worker) với các
 * bản sửa của admin lưu trên Supabase.
 *
 * Nguyên tắc:
 *  - Online   → base JSON + override từ DB
 *  - Offline  → chỉ base JSON (service worker cache) → app vẫn hoạt động 100%
 *  - DB lỗi   → fallback về base, không làm app sập
 */
import { supabase } from '@/auth/supabase';
import type { ContentKind } from '@/auth/types';

interface OverrideRow {
  item_id: string;
  payload: unknown;
  deleted: boolean;
}

/**
 * Áp dụng các override của admin lên danh sách nội dung gốc.
 *
 * @param kind  loại nội dung ('vocab' | 'grammar' | 'kanji')
 * @param base  nội dung gốc đọc từ content/*.json
 */
export async function applyOverrides<T extends { id: string }>(
  kind: ContentKind,
  base: T[]
): Promise<T[]> {
  if (!supabase) return base;

  let rows: OverrideRow[] = [];
  try {
    const { data, error } = await supabase
      .from('content_items')
      .select('item_id, payload, deleted')
      .eq('kind', kind);

    if (error || !data) return base;
    rows = data as OverrideRow[];
  } catch {
    // Mất mạng hoặc Supabase không khả dụng → dùng bản gốc
    return base;
  }

  if (rows.length === 0) return base;

  const byId = new Map(rows.map((r) => [r.item_id, r]));
  const baseIds = new Set(base.map((b) => b.id));

  // 1. Áp dụng override / bỏ qua mục đã xoá, theo thứ tự của base
  const merged: T[] = [];
  for (const item of base) {
    const ov = byId.get(item.id);
    if (!ov) {
      merged.push(item);
    } else if (!ov.deleted) {
      merged.push(ov.payload as T);
    }
  }

  // 2. Thêm mục mới mà admin tạo (không có trong base)
  for (const ov of rows) {
    if (!ov.deleted && !baseIds.has(ov.item_id)) {
      merged.push(ov.payload as T);
    }
  }

  return merged;
}

/** Lấy toàn bộ override của một loại nội dung (dùng ở trang admin) */
export async function fetchOverrides(
  kind: ContentKind
): Promise<Record<string, { payload: unknown; deleted: boolean }>> {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from('content_items')
    .select('item_id, payload, deleted')
    .eq('kind', kind);
  if (error || !data) return {};

  const out: Record<string, { payload: unknown; deleted: boolean }> = {};
  for (const row of data as OverrideRow[]) {
    out[row.item_id] = { payload: row.payload, deleted: row.deleted };
  }
  return out;
}

/** Lưu (hoặc xoá) một mục nội dung */
export async function saveOverride(
  kind: ContentKind,
  itemId: string,
  payload: unknown,
  deleted = false
): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Chưa cấu hình Supabase.' };

  const { error } = await supabase
    .from('content_items')
    .upsert(
      {
        kind,
        item_id: itemId,
        payload,
        deleted,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'kind,item_id' }
    );

  return { error: error?.message ?? null };
}

/** Xoá vĩnh viễn một bản ghi override (khôi phục về base JSON) */
export async function clearOverride(
  kind: ContentKind,
  itemId: string
): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Chưa cấu hình Supabase.' };
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('kind', kind)
    .eq('item_id', itemId);
  return { error: error?.message ?? null };
}
