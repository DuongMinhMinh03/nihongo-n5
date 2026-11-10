# Supabase — Hướng dẫn thiết lập backend cho Nihongo N5

Ứng dụng này dùng **Supabase (Free tier — 0đ)** cho 2 việc:

1. **Đăng nhập / phân quyền**: user và admin.
2. **Quản lý nội dung**: admin sửa từ vựng / ngữ pháp / kanji ngay trên web.

Nội dung gốc vẫn nằm trong repo (`content/*.json`) và được cache bởi service worker,
nên **app vẫn học offline hoàn toàn**. Khi online, các bản sửa của admin được
ghi đè lên bản gốc.

---

## 1. Tạo project (khoảng 2 phút, 0đ)

1. Vào <https://supabase.com/dashboard> → **New project**.
2. Chọn Organization, đặt tên (vd `nihongo-n5`), chọn region gần bạn nhất.
3. Đặt mật khẩu database (lưu lại, dùng để truy cập trực tiếp nếu cần).
4. Chờ ~1 phút để project được tạo.

---

## 2. Tạo bảng + chính sách bảo mật

Mở **SQL Editor** → dán toàn bộ nội dung file `supabase/schema.sql` → bấm **Run**.

File này tạo:

| Bảng | Mục đích |
|---|---|
| `profiles` | Thông tin user + `role` (`user` / `admin`) |
| `content_items` | Bản sửa nội dung của admin (ghi đè lên JSON gốc) |
| `user_progress` | Tiến độ học để đồng bộ giữa nhiều thiết bị |

Kèm theo là trigger tự tạo `profiles` khi có user đăng ký, và các Row Level
Security policy (chỉ admin sửa được nội dung, chỉ chủ sở hữu sửa được tiến độ).

---

## 3. Lấy URL + anon key

Vào **Project Settings → API** (hoặc **Data API** ở giao diện mới):

- **Project URL** → `https://xxxxx.supabase.co`
- **anon public** key (dạng `eyJ...`)

Tạo file `.env.local` ở thư mục gốc project:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> ⚠️ Chỉ dùng **anon key** ở phía client. Tuyệt đối không đưa **service_role key**
> vào `.env.local` hoặc vào mã nguồn — nó bypass mọi Row Level Security.

---

## 4. Tạo tài khoản admin đầu tiên

Bước này cần chạy SQL một lần (chỉ tài khoản đầu tiên):

1. Trên web app bấm **🔑 Đăng nhập → Đăng ký**, tạo tài khoản (ví dụ `admin@abc.com`).
2. Vào Supabase → **Authentication → Users**, thấy user vừa tạo, copy **User UID**.
3. Chạy lệnh SQL này (thay `<UID>` bằng UID vừa copy):

```sql
update public.profiles set role = 'admin' where id = '<UID>';
```

4. Đăng xuất rồi đăng nhập lại → vào `/admin` → thấy bảng quản trị.

> Ngoài ra bạn có thể tự cấp quyền admin cho người khác tại
> **Admin → Người dùng → Bỏ admin / Làm admin**.

---

## 5. Tuỳ chọn: bật đăng ký không cần xác nhận email

Mặc định Supabase yêu cầu xác nhận email trước khi đăng nhập. Để demo nhanh:

**Authentication → Sign In / Providers → Email** → tắt **Confirm email**.

---

## 6. Vận hành: sửa nội dung & publish

### Sửa trong web app

Vào `/admin` → chọn **Từ vựng / Ngữ pháp / Kanji** → bấm **Sửa** → lưu.
Thay đổi được ghi vào bảng `content_items` và **áp dụng ngay** cho mọi người
đang online (app tự gọi `applyOverrides` khi tải nội dung).

### Đưa thay đổi vào file JSON gốc (publish)

Để thay đổi tồn tại lâu dài và không phụ thuộc database:

1. `/admin` → **Publish** → bấm **⬇ Tải JSON đã merge** cho từng loại.
2. Thay file JSON vào `content/vocab/n5.json` (tương tự cho grammar/kanji).
3. Commit & push:

```bash
git add content/
git commit -m "content: cap nhat noi dung hoc"
git push
```

Cloudflare Pages tự build & deploy trong ~1–2 phút.

---

## 7. Vấn đề thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Trang login báo "Chưa cấu hình Supabase" | Thiếu `.env.local` | Tạo file + restart `npm run dev` |
| Đăng ký xong không đăng nhập được | Supabase yêu cầu xác nhận email | Tắt "Confirm email" hoặc vào email xác nhận |
| Vào `/admin` bị đá về trang chủ | User chưa có role admin | Chạy lệnh `update profiles ...` ở mục 4 |
| Sửa nội dung không thấy thay đổi | Trình duyệt cache SW | Hard reload (Ctrl+Shift+R) |
| Không đăng nhập được khi offline | Cần mạng cho lần đầu | Đã có session rồi thì dùng offline vẫn OK |

---

## 8. Kiến trúc tổng quan

```
┌─────────────────────────────┐
│  content/*.json (bundled)   │  ← service worker cache (offline)
└──────────────┬──────────────┘
               │  applyOverrides()
               ▼
┌─────────────────────────────┐
│  Supabase content_items     │  ← bản sửa của admin (online)
└──────────────┬──────────────┘
               ▼
        App hiển thị nội dung
```

Auth: `auth.users` → trigger → `profiles.role` → RLS policy kiểm tra quyền ở tầng DB.
