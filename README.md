# Nihongo N5 — Ứng dụng học Tiếng Nhật JLPT N5 (PWA offline)

Ứng dụng web học **từ vựng, ngữ pháp và kanji** cho kỳ thi JLPT N5.
Chạy **hoàn toàn offline** trên Chrome/Edge của Windows — không cần backend, không cần API key, **0 đồng**.

![Tech stack](https://img.shields.io/badge/React_18-TypeScript-Vite-blue) ![Offline](https://img.shields.io/badge/PWA-offline-green)

---

## 📑 Mục lục

- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt & chạy](#-cài-đặt--chạy)
- [🔐 Đăng nhập & bảng quản trị](#-đăng-nhập--bảng-quản-trị)
- [🌐 Đưa ứng dụng lên mạng (0 đồng)](#-đưa-ứng-dụng-lên-mạng-0-đồng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cách bật giọng tiếng Nhật trên Windows](#-cách-bật-giọng-tiếng-nhật-trên-windows)
- [Cài ứng dụng PWA](#-cài-ứng-dụng-pwa)
- [Thêm nội dung mới](#-thêm-nội-dung-mới)
- [Công cụ hỗ trợ](#-công-cụ-hỗ-trợ)
- [Kiểm thử & build](#-kiểm-thử--build)
- [Câu hỏi thường gặp](#-câu-hỏi-thường-gặp)

---

## ✨ Tính năng

| Khu vực | Mô tả |
| --- | --- |
| **Thẻ ghi nhớ (SRS)** | Thuật toán **SM-2** với 4 nút *Quên rồi / Khó / Được / Dễ*. Mỗi thẻ có `easeFactor`, `interval`, `repetitions`, `nextReview`. Thẻ quên sẽ quay lại sau 10 phút. |
| **Từ vựng** | 4 dạng bài: **Đoán nghĩa** (kanji → nghĩa), **Trắc nghiệm** (chọn từ theo ngữ cảnh câu), **Điền từ** (cloze trong câu ví dụ), **Nghe chọn từ** (TTS → chọn đáp án). |
| **Ngữ pháp** | Bài lý thuyết tiếng Việt + công thức + ví dụ có bản dịch & phát âm, kèm bài trắc nghiệm, bài điền từ và bài tập viết câu (so khớp token). |
| **Kanji** | Bài **Đọc** (chọn Hiragana/Onyomi), **Nghĩa**, và **luyện viết tay** trên `<canvas>` (chuột + cảm ứng, có ô vuông nét dấu, ẩn/hiện mẫu). Bảng tra nhanh có search + filter. |
| **Luyện nghe** | Nghe TTS tiếng Nhật rồi chọn từ hoặc nghĩa đúng. Không dùng SpeechRecognition (Chrome Windows không hỗ trợ ja). |
| **Thống kê** | Chuỗi học (streak), biểu đồ 14 ngày, trạng thái thẻ (mới / đang học / đang ôn / đã thuộc), tỉ lệ đúng theo từng chủ đề. |
| **Tra cứu nhanh** | Bảng tra từ vựng với search theo kanji / hiragana / romaji / nghĩa và filter theo chủ đề. |
| **Mục tiêu & dữ liệu** | Đặt mục tiêu thẻ/ngày, **export / import** tiến độ ra file JSON. |
| **Giao diện** | Tiếng Việt, dark mode (Sáng/Tối/Theo hệ thống), responsive (sidebar desktop + bottom nav mobile), font hệ thống cho kanji. |

### Nội dung seed có sẵn

- **669 từ vựng** N5 (kanji, hiragana, romaji, nghĩa tiếng Việt, từ loại, chủ đề, câu ví dụ JP/VI)
- **119 điểm ngữ pháp** N5 chia theo **25 bài** (Minna no Nihongo) — lý thuyết, công thức, ghi chú, hội thoại, ví dụ, trắc nghiệm, điền từ, tập viết câu
- **103 kanji** cơ bản (onyomi, kunyomi, số nét, bộ phận, từ vựng liên quan)

Ngoài phần seed chính trong `content/vocab/n5.json`, bạn có thể nạp thêm từ nguồn OpenJLPT
bằng `npm run import:jlpt` (xem [Công cụ hỗ trợ](#-công-cụ-hỗ-trợ)).

---

## 🛠 Công nghệ sử dụng

| Công nghệ | Vai trò |
| --- | --- |
| **Vite 5** | Dev server & build |
| **React 18** | UI |
| **TypeScript** | Kiểu dữ liệu chặt chẽ |
| **TailwindCSS** | Utility-first CSS, dark mode qua class |
| **Zustand** | State + `persist` middleware → `localStorage` |
| **React Router 6** | Điều hướng |
| **Zod** | Validate schema cho dữ liệu JSON |
| **vite-plugin-pwa** | Manifest + Service Worker (Workbox) |
| **Web Speech API** | TTS tiếng Nhật (`speechSynthesis`) |

> Không có dependency runtime nào nặng: bundle chính ~187 kB (61 kB gzip).

---

## 🚀 Cài đặt & chạy

### Yêu cầu

- **Node.js 18+** (khuyến nghị 20 LTS) — kiểm tra bằng `node -v`
- Trình duyệt **Chrome** hoặc **Edge** trên Windows

### Các lệnh

```bash
# 1. Cài dependencies
npm install

# 2. Chạy ở chế độ phát triển (http://localhost:5173)
npm run dev

# 3. Build bản production (ra thư mục dist/)
npm run build

# 4. Xem bản build (kiểm tra offline + service worker)
npm run preview

# 5. Kiểm tra lỗi TypeScript
npm run typecheck

# 6. Kiểm tra dữ liệu JSON có hợp lệ theo schema không
npm run validate

# 7. Thiết lập database Supabase (tạo bảng + trigger + RLS) — tự động
npm run db:setup

# 8. Tạo tài khoản admin đầu tiên — tự động
npm run db:make-admin -- admin@abc.com "Tên Admin" "MatKhau123"

# 9. Kiểm tra sức khoẻ toàn bộ hệ thống
npm run db:doctor
```

### Chạy hoàn toàn offline

`npm run build` sinh ra thư mục `dist/` chứa:

```
dist/
├── index.html
├── manifest.webmanifest
├── sw.js                    ← Service Worker (precache toàn bộ app shell)
├── icon-192.png / icon-512.png
├── assets/…                 ← JS/CSS
└── content/
    ├── vocab/n5.json        ← được precache
    ├── grammar/n5.json
    └── kanji/n5.json
```

Để dùng offline lâu dài, hãy **cài app lên desktop** (xem [Cài ứng dụng PWA](#-cài-ứng-dụng-pwa)).
Service worker sẽ cache toàn bộ app shell + dữ liệu JSON ngay lần truy cập đầu tiên.

---

## 🔐 Đăng nhập & bảng quản trị

Ứng dụng hỗ trợ **2 vai trò** (`user` và `admin`) dùng **Supabase Free tier (0đ)**.
Phần học vẫn mở cho tất cả (kể cả khách) — đăng nhập chỉ là tùy chọn để **đồng bộ tiến độ giữa nhiều thiết bị**.

| Khu vực | Quyền |
| --- | --- |
| `/` , `/vocab`, `/grammar`, `/kanji`, `/listen`, `/stats` | Mở cho tất cả (offline vẫn dùng được) |
| `/login` | Đăng nhập / đăng ký (mời hoặc tự do) |
| `/admin` | Chỉ **admin** — sửa nội dung, quản lý user, publish |

### Thiết lập nhanh (khoảng 5 phút)

**Cách A — dùng script (khuyến nghị, ít thao tác nhất)**

1. Tạo project miễn phí tại <https://supabase.com/dashboard>
   (Organization → New organization → New project, chọn region **Singapore**).
2. Copy `.env.example` → `.env.local`, điền 4 giá trị:

   | Biến | Lấy ở đâu |
   | --- | --- |
   | `VITE_SUPABASE_URL` | Project Settings → API → Project URL |
   | `VITE_SUPABASE_ANON_KEY` | Project Settings → API → anon public key |
   | `SUPABASE_DB_URL` | Project Settings → Database → Connection string → URI |
   | `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role |

   > 💡 `SUPABASE_DB_URL` phải có dạng
   > `postgresql://postgres.<project-ref>:<mật-khẩu-đã-encode>@aws-0-<region>.pooler.supabase.com:5432/postgres`
   > (mật khẩu percent-encode: `@` → `%40`, `!` → `%21`, `#` → `%23`).
   > Nếu không có DB URL, dùng **Cách A′** bên dưới.

3. Chạy 4 lệnh:

   ```bash
   npm run check:env                                       # kiểm tra .env.local
   npm run db:setup                                        # tạo bảng + trigger + RLS
   npm run db:make-admin -- admin@abc.com "Tên" "MatKhau"    # tạo tài khoản admin
   npm run db:doctor                                       # kiểm tra toàn bộ
   ```

4. `npm run dev` → vào `/login` → đăng nhập.

**Cách A′ — không cần DB connection string (dùng Management API)**

Thay vì lấy `SUPABASE_DB_URL`, tạo Personal Access Token tại
<https://supabase.com/dashboard/account/tokens> → Generate new token (`sbp_…`),
rồi điền vào `.env.local`:

```env
SUPABASE_ACCESS_TOKEN=sbp_xxx
SUPABASE_PROJECT_REF=<project-ref>   # lấy từ VITE_SUPABASE_URL
```

Sau đó chạy:

```bash
npm run db:setup:api        # áp schema.sql qua Management API
npm run db:make-admin:api -- admin@abc.com "Tên" "MatKhau"
```

**Cách B — làm thủ công trên web**

1. Tạo project miễn phí tại <https://supabase.com/dashboard>.
2. **SQL Editor** → dán toàn bộ `supabase/schema.sql` → **Run**.
3. **Project Settings → API** → copy **Project URL** + **anon public key**.
4. Tạo file `.env.local` ở thư mục gốc:

   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

5. `npm run dev` → vào `/login` → **Đăng ký** tài khoản admin.
6. Vào **Authentication → Users** trên Supabase, copy **User UID**, chạy:

   ```sql
   update public.profiles set role = 'admin' where id = '<UID>';
   ```

   > Hoặc đơn giản hơn: chạy `npm run db:make-admin -- <email> "Tên" "MatKhau"`
   > (script tự tạo user **đã xác nhận email** và tự cấp role `admin`).

7. Đăng xuất → đăng nhập lại → vào `/admin`.

> Trang hướng dẫn trực quan trong web: **`/setup`** (có sẵn nút copy & kiểm tra kết nối).
> Chi tiết đầy đủ (bảng, RLS, xử lý sự cố, publish): **`supabase/README.md`**.

### Bảng quản trị có gì?

- **Tổng quan** — số từ / ngữ pháp / kanji / user, số admin.
- **Từ vựng** — bảng 669 từ, sửa kanji / hiragana / romaji / nghĩa / từ loại / ví dụ / tags; xoá mềm; khôi phục về bản gốc.
- **Ngữ pháp** — 119 điểm, editor 6 tab: thông tin, ghi chú, ví dụ, hội thoại, trắc nghiệm, điền từ.
- **Kanji** — 103 kanji: onyomi, kunyomi, nét, bộ phận, từ ví dụ.
- **Người dùng** — xem danh sách, cấp/gỡ quyền admin, xoá tài khoản.
- **Publish** — tải file JSON đã merge (base + thay đổi) để commit lên GitHub.

### Cách nội dung được áp dụng

```
content/*.json (bundled, cache offline)  +  content_items (bản sửa của admin)
                          ↓  applyOverrides()
                    nội dung hiển thị
```

- **Online**: nội dung = JSON gốc **ghi đè** bằng bản sửa của admin.
- **Offline / Supabase lỗi**: nội dung = JSON gốc trong cache → app không bao giờ trắng màn hình.
- **Quyền được kiểm tra ở tầng database (RLS)**, không chỉ ẩn nút trên UI — user thường **không thể** tự nâng quyền lên admin.

> ⚠️ Nếu chưa cấu hình `.env.local`, app vẫn chạy bình thường và tự ẩn các chức năng login/admin.

---

## 🌐 Đưa ứng dụng lên mạng (0 đồng)

App là **static site thuần** (không backend, không database) nên có thể đưa lên mạng **miễn phí vĩnh viễn**.

### Vì sao chọn Cloudflare Pages?

| Tiêu chí | Cloudflare Pages | Netlify | Vercel | GitHub Pages |
| --- | --- | --- | --- | --- |
| Phí | 0đ | 0đ | 0đ | 0đ |
| **Băng thông / tháng** | **Không giới hạn** | 100 GB | 100 GB | Không giới hạn |
| Tên miền miễn phí | ✅ `*.pages.dev` | ✅ `*.netlify.app` | ✅ `*.vercel.app` | ❌ chỉ `*.github.io` |
| SPA fallback (`_redirects`) | ✅ | ✅ | ⚠️ cần `vercel.json` | ⚠️ phải hack |
| Repo private | ✅ | ✅ | ✅ | ❌ bắt buộc công khai |

Cloudflare Pages cho URL ở **tên miền gốc** → `base: '/'` luôn đúng, không phụ thuộc tên repo,
và **không giới hạn băng thông** nên dùng lâu dài không phát sinh phí.

### Bước 1 — Đẩy code lên GitHub

```bash
git remote add origin https://github.com/<tên-bạn>/nihongo-n5.git
git push -u origin main
```

### Bước 2 — Kết nối với Cloudflare Pages

1. Vào <https://dash.cloudflare.com> → **Workers & Pages** → **Create application** → **Pages**
2. Chọn **Connect to Git** → chọn repo `nihongo-n5`
3. Cấu hình build:
   | Mục | Giá trị |
   | --- | --- |
   | Framework preset | `Vite` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Environment variable | `NODE_VERSION` = `20` |
   | Environment variable | `VITE_SUPABASE_URL` = *(nếu dùng đăng nhập)* |
   | Environment variable | `VITE_SUPABASE_ANON_KEY` = *(nếu dùng đăng nhập)* |
4. Bấm **Save and Deploy** → sau ~1 phút có link `https://nihongo-n5.pages.dev`

Mỗi lần `git push` là tự động deploy lại phiên bản mới.

### Bước 3 — Gắn tên miền riêng (tùy chọn)

Pages → **Custom domains** → thêm domain của bạn → trỏ CNAME về `nihongo-n5.pages.dev`.
(Mua domain ở Namecheap / Cloudflare Registrar khoảng 10–15 USD/năm cho `.com`.)

### Cách nhanh nhất — Netlify Drop (không cần Git)

1. Chạy `npm run build`
2. Mở <https://app.netlify.com/drop> → kéo thả thư mục `dist` vào
3. Có link `xxx.netlify.app` ngay

> Nhược điểm: mỗi lần sửa nội dung phải build + kéo-thả lại.

### ⚠️ Những cấu hình đã chuẩn bị sẵn cho việc deploy

| File / vị trí | Thay đổi | Lý do |
| --- | --- | --- |
| `vite.config.ts` → `base: '/'` | đã sửa | asset phải resolve đúng trên mọi route (vd `/grammar`), nếu để `'./'` thì mở trang con sẽ trắng màn hình |
| `src/data/loader.ts` → `CONTENT_PATHS` dùng `import.meta.env.BASE_URL` | đã sửa | `fetch('content/…')` tương đối sẽ 404 khi ở route con |
| `public/_redirects` | đã tạo | server trả `index.html` cho mọi đường dẫn (SPA fallback) — Cloudflare Pages và Netlify đều đọc file này |
| `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | đã tạo | manifest trỏ tới icon nhưng file chưa tồn tại → cài app không có icon |
| `vite.config.ts` → `start_url: '/'`, `scope: '/'` | đã sửa | không phụ thuộc đường dẫn tương đối |

### Lưu ý về dữ liệu tiến độ

Tiến độ học nằm trong `localStorage` của trình duyệt (key `nihongo-n5-progress`):

- ✅ Không cần database, không tốn phí
- ⚠️ **Mỗi người học / mỗi thiết bị một bộ tiến độ riêng**, không đồng bộ
- ⚠️ Xóa dữ liệu trình duyệt là mất tiến độ → nên **export ra file JSON** thỉnh thoảng
  (Cài đặt → Xuất tiến độ)

---

## 📁 Cấu trúc dự án

```
d:\2HOCPHAN\Nihongo\
├── content/                    # Dữ liệu tĩnh (được service worker cache)
│   ├── vocab/n5.json           # 669 từ vựng
│   ├── vocab/imported-n5.json  # từ gốc từ OpenJLPT (nguồn cho import)
│   ├── grammar/n5.json         # 119 điểm ngữ pháp / 25 bài
│   ├── kanji/n5.json           # 103 kanji
│   ├── kanji/imported-n5.json  # kanji gốc từ OpenJLPT
│   └── export/                 # Output của script export Anki
├── public/                     # Icon, favicon, _redirects (SPA fallback)
├── src/
│   ├── data/
│   │   ├── schemas.ts          # Zod schema: Vocab, Grammar, Kanji, CardProgress
│   │   └── loader.ts           # Fetch + parse dữ liệu (dùng BASE_URL để deploy ở subpath)
│   ├── store/
│   │   ├── progress.ts         # Zustand persist: SRS cards, log, streak, settings
│   │   ├── content.tsx         # Zustand: nội dung đã tải + theme
│   │   └── srs.ts              # Thuật toán SM-2
│   ├── features/
│   │   ├── flashcard/          # Học theo thẻ ghi nhớ
│   │   ├── quiz/               # 4 dạng bài từ vựng
│   │   ├── kanji/              # Canvas luyện viết
│   │   ├── listen/             # Bài nghe TTS
│   │   └── stats/              # Biểu đồ & thống kê
│   ├── pages/                  # Home, Vocab, Grammar, Kanji, Listen, Stats, Settings, Guide
│   ├── components/
│   │   ├── ui/                 # UI kit (Button, Card, Badge, ProgressBar…)
│   │   ├── Layout.tsx          # Sidebar + bottom nav
│   │   └── SpeakButton.tsx     # Nút phát âm
│   ├── hooks/useTTS.ts         # Chọn voice ja-JP ưu tiên localService
│   └── lib/cn.ts               # Tiện ích: shuffle, normalizeJP, compareSentence
├── tools/
│   ├── importFromJLPT.ts       # Tải dataset JLPT N5 (OpenJLPT + JLPT Sensei)
│   ├── extraVocab.ts           # Nghĩa tiếng Việt + ví dụ cho từ vựng bổ sung
│   ├── extraKanji.ts           # Nghĩa tiếng Việt + từ ví dụ cho kanji bổ sung
│   ├── seedExtraVocab.ts       # Gộp từ vựng bổ sung vào content/vocab/n5.json
│   ├── seedExtraKanji.ts       # Gộp kanji bổ sung vào content/kanji/n5.json
│   ├── exportAnki.ts           # Xuất TSV cho Anki
│   ├── validateContent.ts      # Kiểm tra JSON theo Zod schema
│   ├── checkContent.ts         # Phát hiện ký tự lẫn trong dữ liệu
│   ├── makeIcons.ts            # Sinh icon PNG cho PWA
│   └── contentPlugin.ts        # Vite plugin: serve & emit content/*.json
└── vite.config.ts              # Cấu hình Vite + PWA
```

---

## 🔊 Cách bật giọng tiếng Nhật trên Windows

Windows **không cài sẵn** giọng đọc tiếng Nhật. Cần làm theo một trong hai cách:

### Cách A — Dùng Microsoft Edge (nhanh nhất)

Edge có sẵn giọng tiếng Nhật chất lượng cao qua mạng.
Chỉ cần mở app bằng **Edge** — không cần cài gì thêm.
*(Lưu ý: giọng online cần Internet. Để offline hoàn toàn, hãy dùng Cách B.)*

### Cách B — Cài gói ngôn tiếng Nhật (offline, khuyến nghị)

1. Mở **Cài đặt** → **Thời gian & Ngôn ngữ** → **Ngôn ngữ & khu vực**
2. Nhấn **"Thêm ngôn ngữ"** → tìm **"日本語 (Japanese)"** → **Tiếp**
3. Chọn **"Basic typing"** (chỉ cần gõ, không cần nhận dạng giọng nói)
4. Sau khi cài xong, nhấp vào **"Ngôn ngữ Japanese"** → **Tùy chọn ngôn ngữ** → **Giọng nói**
   → chọn giọng (ví dụ *Microsoft Haruka Desktop*, *Microsoft Nanami*, *Microsoft Yu*) → **Tải xuống**
5. **Khởi động lại trình duyệt** (đóng mở Chrome/Edge)

### Kiểm tra đã bật chưa

Vào **Cài đặt → Âm thanh** trong app:

- Danh sách **"Giọng đọc tiếng Nhật"** hiện các voice → đã thành công
- Danh sách trống → chưa cài giọng, làm lại từ bước 2
- Ghi "(offline)" = giọng local, dùng được khi **mất mạng**
- Ghi "(online)" = giọng của Edge, cần Internet

### Cách ứng dụng chọn voice

`src/hooks/useTTS.ts` chọn theo thứ tự ưu tiên:

1. Voice bạn chọn thủ công trong **Cài đặt**
2. Voice `localService: true` (giọng Windows cài sẵn → **offline**)
3. Voice có tên chứa `Microsoft` / `Natural` / `Google`
4. Voice ja-JP bất kỳ

---

## 📲 Cài ứng dụng PWA

### Chrome / Edge trên Windows

1. Mở trang web ứng dụng
2. Nhấp biểu tượng **⋮** (góc trên phải) hoặc **biểu tượng cài đặt** trên thanh địa chỉ
3. Chọn **"Cài ứng dụng"** / **"Install Nihongo N5"**
4. Mở app từ biểu tượng trên desktop → chạy như app thật, không còn thanh địa chỉ

### iPhone / iPad (Safari)

1. Mở bằng **Safari** (không dùng Chrome trên iOS)
2. Nhấn **Chia sẻ** (⬆️) → **"Thêm vào Màn hình Chính"**

### Sau khi cài

- Mở app **một lần khi đang online** để tải & cache toàn bộ dữ liệu
- Từ đó app chạy 100% offline
- Khi có bản cập nhật mới, service worker tự cập nhật (`registerType: 'autoUpdate'`)

---

## ➕ Thêm nội dung mới

### 1. Thêm từ vựng

Mở `content/vocab/n5.json`, thêm phần tử theo schema:

```jsonc
{
  "id": "n5-v346",              // duy nhất
  "level": "N5",
  "kanji": "桜",                // kanji hiển thị chính
  "hiragana": "さくら",
  "romaji": "sakura",
  "meaning_vi": "hoa anh đào",
  "pos": "noun",                // noun / verb-u / adj-i / adj-na / pronoun
  "tags": ["thời gian", "mùa"], // dùng để filter, nhóm chủ đề
  "example": {
    "jp": "春に桜が咲きます。",
    "vi": "Mùa xuân hoa anh đào nở."
  },
  "related": ["春", "花"]
}
```

> **Mẹo:** Thay vì sửa JSON thủ công, hãy thêm vào `tools/extraVocab.ts` rồi chạy `npm run seed:extra` —
> script sẽ tự tra hiragana/romaji từ nguồn import, tự sinh `id` và không ghi đè dữ liệu cũ.

### 2. Thêm ngữ pháp

Mở `content/grammar/n5.json`:

```jsonc
{
  "id": "n5-g016",
  "level": "N5",
  "point": "〜ませんか",
  "title_vi": "Câu hỏi lịch sự — ませんか",
  "explanation_vi": "Cấu trúc: verb-ます形 bỏ ます + ませんか…",
  "pattern": "Verb-ます形 (bỏ ます) + ませんか",
  "examples": [
    { "jp": "一緒に行きませんか。", "vi": "Đi cùng nhé?" }
  ],
  "quiz": [
    {
      "question": "「行ませんか。」 nghĩa là gì?",
      "options": ["Đi nhé?", "Tôi sẽ đi.", "Đừng đi.", "Tôi đã đi."],
      "answer_index": 0
    }
  ],
  "cloze": [
    { "sentence": "一緒に行き___か。", "answer": "ません" }
  ]
}
```

### 3. Thêm kanji

Mở `content/kanji/n5.json`:

```jsonc
{
  "id": "n5-k104",
  "kanji": "桜",
  "onyomi": ["オウ"],
  "kunyomi": ["さくら"],
  "strokes": 9,
  "meaning_vi": "hoa anh đào",
  "radical": "木",
  "example_words": [
    { "word": "桜", "vi": "hoa anh đào" },
    { "word": "桜の木", "vi": "cây anh đào" }
  ]
}
```

### 4. Kiểm tra & build lại

```bash
npm run validate     # kiểm tra JSON theo Zod schema
npm run build        # build lại, service worker cache lại nội dung mới
```

> **Lưu ý:** Sau khi build lại, hãy đóng và mở lại app (hoặc vào DevTools → Application → Service Workers → "Update on reload") để nhận nội dung mới.

### Schema đầy đủ

Xem `src/data/schemas.ts` — đây là nguồn sự thật (source of truth) cho validation.

---

## 🔧 Công cụ hỗ trợ

### `npm run validate` — kiểm tra dữ liệu

Dùng Zod schema để kiểm tra toàn bộ `content/*.json`, phát hiện ID trùng, thiếu trường, sai kiểu.

### `npm run check:content` — phát hiện ký tự lẫn

Rà soát nội dung tiếng Nhật xem có ký tự Latin/Hangul bị lẫn vào không (lỗi hay gặp khi sao chép từ nguồn khác).

### `npm run import:jlpt` — nhập dataset JLPT

```bash
npm run import:jlpt          # cả từ vựng + kanji
npm run import:jlpt -- vocab # chỉ từ vựng
npm run import:jlpt -- kanji # chỉ kanji
```

Tải từ nguồn **[OpenJLPT](https://github.com/evanclan/OpenJLPT)** (JSON, giấy phép rõ ràng, 674 từ + 84 kanji N5),
dự phòng là [jlptsensei.com](https://jlptsensei.com/jlpt/vocabulary/n5/) (HTML — có thể bị captcha chặn).

Kết quả lưu ra:
- `content/vocab/imported-n5.json` — kanji, hiragana, romaji, nghĩa **tiếng Anh**, ví dụ JA/EN
- `content/kanji/imported-n5.json` — onyomi, kunyomi, số nét, bộ sưu tập, nghĩa **tiếng Anh**

### `npm run seed:extra` — gộp nội dung bổ sung

```bash
npm run import:jlpt    # 1. tải nguồn gốc trước
npm run seed:extra     # 2. gộp nghĩa tiếng Việt + ví dụ đã biên soạn
npm run validate       # 3. kiểm tra
```

- `tools/extraVocab.ts` — nghĩa tiếng Việt + câu ví dụ cho ~110 từ N5 thông dụng
  (chào hỏi, thời gian, màu sắc, số đếm, địa điểm, hành động thường ngày…)
- `tools/extraKanji.ts` — nghĩa tiếng Việt + từ ví dụ cho 41 kanji (số 1–10, phương hướng…)

Script tự tra `hiragana` / `romaji` / `onyomi` / `kunyomi` từ file `imported-n5.json`,
nên bạn chỉ cần viết **nghĩa tiếng Việt + ví dụ**.
Nếu một từ không có trong nguồn import, thêm vào bảng `KANA_OVERRIDES` trong `tools/seedExtraVocab.ts`.

> Chạy lại `npm run seed:extra` nhiều lần là an toàn — script **không ghi đè** các mục đã có
> và tự đánh số lại `id` cho duy nhất.

### `npm run export:anki` — xuất sang Anki

```bash
npm run export:anki
```

Sinh ra:
- `content/export/anki-vocab.tsv` — kanji, hiragana, romaji, nghĩa, ví dụ JP, ví dụ VI, tags
- `content/export/anki-kanji.tsv` — kanji, onyomi, kunyomi, số nét, nghĩa, bộ phận

**Cách import vào Anki:** `File → Import` → chọn file `.tsv` → phân tách bằng **Tab** → gán thẻ "Japanese N5".

### `npm run gen:icons` — sinh lại icon PWA

```bash
npm run gen:icons
```

Sinh `public/icon-192.png`, `public/icon-512.png` và `public/icon-maskable-512.png` từ code
(không cần cài thư viện ngoài).

---

## ✅ Kiểm thử & build

```bash
npm run typecheck   # TypeScript strict, không lỗi
npm run validate    # dữ liệu hợp lệ
npm run build       # build production + generate service worker
```

Sau khi `npm run build`, kiểm tra service worker đã cache đủ:

```bash
npm run preview
# mở http://localhost:4173
# DevTools → Application → Service Workers → xem danh sách precache
# DevTools → Application → Cache Storage → xem content/vocab/n5.json…
```

Tắt mạng rồi tải lại trang → app vẫn hoạt động đầy đủ.

---

## ❓ Câu hỏi thường gặp

**Q: Có tốn phí gì không?**
> Không. Toàn bộ app là file tĩnh, không có server, không có API key. Chạy local **0 đồng**; đưa lên mạng cũng **0 đồng** với Cloudflare Pages (xem [Đưa ứng dụng lên mạng](#-đưa-ứng-dụng-lên-mạng-0-đồng)).

**Q: Có cần Internet không?**
> Chỉ cần Internet **lần đầu** để tải app + cache dữ liệu. Sau đó dùng offline hoàn toàn. Riêng giọng Edge (online) cần mạng — nếu muốn offline thì cài giọng local theo hướng dẫn ở trên.

**Q: Tiến độ lưu ở đâu?**
> Trong `localStorage` của trình duyệt (key `nihongo-n5-progress`). Xóa dữ liệu trình duyệt là mất tiến độ — nên **export ra file JSON** thỉnh thoảng (Cài đặt → Xuất tiến độ).
> Khi đưa app lên mạng, **mỗi người học có tiến độ riêng** trên thiết bị của họ (không dùng chung database).

**Q: Có nhận dạng giọng nói (speech recognition) không?**
> Không. Chrome trên Windows không hỗ trợ nhận dạng giọng nói tiếng Nhật. Thay vào đó app dùng bài **"nghe TTS → chọn đáp án"**, vẫn luyện được kỹ năng nghe.

**Q: Thứ tự nét kanji có đúng không?**
> Bản mẫu hiện tại là chữ mờ + lưới nét dấu để bạn tự luyện. Nếu muốn thứ tự nét chính xác, hãy thêm SVG từ
> [kanjivg-data](https://github.com/KanjiVG/kanjivg) vào `content/kanji/strokes/<kanji>.svg` rồi nối vào component `KanjiCanvas`.

**Q: Làm sao thêm nhiều từ hơn?**
> Xem [Thêm nội dung mới](#-thêm-nội-dung-mới). Nhanh nhất: `npm run import:jlpt` để lấy 674 từ gốc,
> rồi viết nghĩa tiếng Việt trong `tools/extraVocab.ts` và chạy `npm run seed:extra`.

**Q: Lỗi "Không tải được dữ liệu" khi mở app?**
> Chạy `npm run dev` tại thư mục gốc (dev server có middleware phục vụ `content/`), hoặc `npm run build` rồi `npm run preview`. Nếu build từ nhầm thư mục, `content/*.json` sẽ không được copy vào `dist/`.

---

## 📄 Giấy phép & nguồn dữ liệu

- Dữ liệu từ vựng & kanji N5 do người dùng biên soạn (nghĩa tiếng Việt, ví dụ), dựa trên bộ dữ liệu **OpenJLPT** ([evanclan/OpenJLPT](https://github.com/evanclan/OpenJLPT)) — giấy phép rõ ràng, cho phép sử dụng lại.
- Script `importFromJLPT.ts` lấy dữ liệu từ OpenJLPT, dự phòng từ [jlptsensei.com](https://jlptsensei.com/jlpt/vocabulary/n5/) — vui lòng tuân thủ điều khoản sử dụng của nguồn.
- Font kanji dùng font hệ thống Windows: **Yu Gothic**, **Meiryo**, **MS Gothic**.

---

Chúc bạn học N5 hiệu quả! 🎌
