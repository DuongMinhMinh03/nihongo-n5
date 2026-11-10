import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/auth/supabase';
import { clearOverride, fetchOverrides, saveOverride } from '@/data/contentMerge';
import type { ContentKind } from '@/auth/types';

export interface AdminContentState<T extends { id: string }> {
  /** Danh sách đã merge (base + override) */
  items: T[];
  /** Các mục đang bị admin sửa (chưa publish) */
  dirty: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  /** Lưu 1 mục lên Supabase */
  save: (item: T) => Promise<boolean>;
  /** Đánh dấu xoá (soft delete) */
  remove: (id: string) => Promise<boolean>;
  /** Khôi phục về bản gốc trong JSON */
  restore: (id: string) => Promise<boolean>;
  /** Danh sách id đã bị sửa trong phiên này */
  changedIds: string[];
}

/**
 * Hook quản lý nội dung ở trang admin.
 *
 * - `base`   : nội dung gốc từ content/*.json
 * - `kind`   : loại nội dung
 * - `merge`  : hàm gộp base + override (dùng lại logic của app)
 */
export function useAdminContent<T extends { id: string }>(
  kind: ContentKind,
  base: T[],
  merge: (kind: ContentKind, base: T[]) => Promise<T[]>
): AdminContentState<T> {
  const [items, setItems] = useState<T[]>(base);
  const [changedIds, setChangedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const merged = await merge(kind, base);
      if (cancelled) return;
      setItems(merged);
      setLoading(false);

      // Đánh dấu những mục khác bản gốc → hiển thị badge "đã sửa"
      const overrides = await fetchOverrides(kind);
      if (cancelled) return;
      const changed = Object.keys(overrides).filter((id) => !overrides[id].deleted);
      setChangedIds(changed);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, base.length]);

  const save = useCallback(
    async (item: T) => {
      setSaving(true);
      setError(null);
      const { error: err } = await saveOverride(kind, item.id, item);
      setSaving(false);
      if (err) {
        setError(err);
        return false;
      }
      setItems((prev) => prev.map((x) => (x.id === item.id ? item : x)));
      setChangedIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
      return true;
    },
    [kind]
  );

  const remove = useCallback(
    async (id: string) => {
      setSaving(true);
      setError(null);
      const { error: err } = await saveOverride(
        kind,
        id,
        items.find((x) => x.id === id) ?? { id },
        true
      );
      setSaving(false);
      if (err) {
        setError(err);
        return false;
      }
      setItems((prev) => prev.filter((x) => x.id !== id));
      setChangedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      return true;
    },
    [kind, items]
  );

  const restore = useCallback(
    async (id: string) => {
      setSaving(true);
      setError(null);
      const { error: err } = await clearOverride(kind, id);
      setSaving(false);
      if (err) {
        setError(err);
        return false;
      }
      const merged = await merge(kind, base);
      setItems(merged);
      setChangedIds((prev) => prev.filter((x) => x !== id));
      return true;
    },
    [kind, base, merge]
  );

  return { items, dirty: changedIds.length > 0, loading, saving, error, save, remove, restore, changedIds };
}

/** Kiểm tra Supabase có sẵn không (dùng để hiển thị cảnh báo) */
export function useSupabaseReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(Boolean(supabase));
  }, []);
  return ready;
}
