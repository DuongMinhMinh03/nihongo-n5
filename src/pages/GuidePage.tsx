import { Card, SectionTitle } from '@/components/ui';

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <SectionTitle
        title="Hướng dẫn sử dụng"
        subtitle="Cài đặt PWA, bật giọng tiếng Nhật trên Windows, mẹo học hiệu quả"
      />

      {/* Cài PWA */}
      <Card className="p-5">
        <p className="text-lg font-semibold">📱 Cài ứng dụng lên máy (PWA)</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Ứng dụng chạy hoàn toàn offline. Cài lên màn hình chính để dùng như app thật.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-700/50">
            <p className="font-medium">Trên Chrome / Edge (Windows)</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
              <li>Mở trang web ứng dụng</li>
              <li>
                Nhấp vào biểu tượng <strong>⋮</strong> (góc trên bên phải) hoặc biểu tượng cài đặt
                (móng kìa / thanh cài đặt) trên thanh địa chỉ
              </li>
              <li>Chọn <strong>"Cài ứng dụng"</strong> / <strong>"Install Nihongo N5"</strong></li>
              <li>Mở ứng dụng từ biểu tượng trên desktop</li>
            </ol>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-700/50">
            <p className="font-medium">Trên iPhone / iPad (Safari)</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
              <li>Mở trang web bằng Safari (không dùng Chrome trên iOS)</li>
              <li>Nhấn nút <strong>Chia sẻ</strong> (⬆️) ở thanh dưới cùng</li>
              <li>Chọn <strong>"Thêm vào Màn hình Chính"</strong></li>
              <li>Ứng dụng sẽ hoạt động offline sau lần mở đầu tiên</li>
            </ol>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-900 dark:border-brand-900 dark:bg-brand-900/20 dark:text-brand-100">
          💡 Lưu ý: Nếu bạn chưa có internet khi mở lần đầu, hãy truy cập trang web một lần khi đang
          online để ứng dụng tải và lưu toàn bộ dữ liệu vào bộ nhớ đệm của trình duyệt.
        </div>
      </Card>

      {/* Bật giọng Nhật */}
      <Card className="p-5">
        <p className="text-lg font-semibold">🔊 Bật giọng tiếng Nhật trên Windows</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Windows không cài sẵn giọng đọc tiếng Nhật. Cần thêm gói ngôn tiếng Nhật để ứng dụng phát
          âm được.
        </p>

        <ol className="mt-4 list-decimal space-y-3 pl-5">
          <li className="text-sm">
            Mở <strong>Cài đặt</strong> → <strong>Thời gian &amp; Ngôn ngữ</strong> →{' '}
            <strong>Ngôn ngữ &amp; khu vực</strong>
          </li>
          <li className="text-sm">
            Nhấn <strong>"Thêm ngôn ngữ"</strong> → tìm <strong>"日本語 (Japanese)"</strong> → nhấn
            <strong> Tiếp</strong>
          </li>
          <li className="text-sm">
            Chọn <strong>"Basic typing"</strong> (chỉ cần gõ, không cần nhận dạng giọng nói)
          </li>
          <li className="text-sm">
            Sau khi cài xong, nhấp vào <strong>"Ngôn ngữ Japanese"</strong> → <strong>Tùy chọn ngôn ngữ</strong> →
            <strong> Giọng nói</strong> → chọn giọng tiếng Nhật (ví dụ <em>Microsoft Haruka Desktop</em> hoặc
            <em>Microsoft Nanami</em>) → nhấn <strong>Tải xuống</strong>
          </li>
          <li className="text-sm">
            Khởi động lại trình duyệt (đóng mở Chrome/Edge)
          </li>
        </ol>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          🎧 <strong>Mẹo:</strong> Nếu bạn dùng <strong>Microsoft Edge</strong>, Edge có sẵn giọng đọc
          tiếng Nhật chất lượng cao qua mạng — không cần cài gói ngôn. Chỉ cần chọn trình duyệt Edge và
          tải lại trang.
        </div>

        <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-700/50">
          <p className="font-medium">Kiểm tra giọng đã bật</p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            Vào trang <strong>Cài đặt → Âm thanh</strong> để xem danh sách giọng tiếng Nhật. Nếu danh
            sách trống, hãy làm lại các bước trên.
          </p>
        </div>
      </Card>

      {/* Cách dùng */}
      <Card className="p-5">
        <p className="text-lg font-semibold">🎯 Cách học hiệu quả</p>
        <div className="mt-4 space-y-3">
          <Tip
            icon="🔁"
            title="Thẻ ghi nhớ (SRS)"
            body="Dùng thẻ ghi nhớ với lặp lại ngắt quãng SM-2. Thẻ bạn trả lời sai sẽ quay lại sau 10 phút; thẻ trả lời đúng được giãn dần 1 ngày → 3 ngày → 1 tuần → 1 tháng."
          />
          <Tip
            icon="📖"
            title="Từ vựng — 4 dạng bài"
            body="Đoán nghĩa (kanji → nghĩa), trắc nghiệm theo ngữ cảnh câu, điền từ vào chỗ trống, và nghe chọn từ. Mỗi lượt đúng sẽ cập nhật tiến độ SRS."
          />
          <Tip
            icon="📐"
            title="Ngữ pháp"
            body="Mỗi điểm ngữ pháp gồm lý thuyết tiếng Việt, công thức, ví dụ có bản dịch và phát âm, kèm bài trắc nghiệm và bài điền từ."
          />
          <Tip
            icon="✍️"
            title="Luyện viết kanji"
            body="Chọn Kanji → Viết tay. Vẽ theo ô vuông có nét dấu, ẩn mẫu khi đã thuộc. Xem onyomi/kunyomi và từ vựng liên quan sau khi luyện."
          />
          <Tip
            icon="📊"
            title="Thống kê"
            body="Theo dõi chuỗi học ngày, biểu đồ 14 ngày, trạng thái từ vựng/kanji và tỉ lệ đúng theo từng chủ đề."
          />
        </div>
      </Card>

      {/* Bảo trì */}
      <Card className="p-5">
        <p className="text-lg font-semibold">🛠 Bảo trì & mở rộng</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>
            Nội dung nằm trong thư mục <code className="rounded bg-slate-100 px-1 dark:bg-slate-700">content/</code>:
            thêm từ vào <code className="rounded bg-slate-100 px-1 dark:bg-slate-700">vocab/n5.json</code>,
            ngữ pháp vào <code className="rounded bg-slate-100 px-1 dark:bg-slate-700">grammar/n5.json</code>,
            kanji vào <code className="rounded bg-slate-100 px-1 dark:bg-slate-700">kanji/n5.json</code>.
          </li>
          <li>
            Kiểm tra dữ liệu hợp lệ trước khi build:{' '}
            <code className="rounded bg-slate-100 px-1 dark:bg-slate-700">npm run validate</code>
          </li>
          <li>
            Xuất dữ liệu sang Anki:{' '}
            <code className="rounded bg-slate-100 px-1 dark:bg-slate-700">npm run export:anki</code>
          </li>
          <li>
            Sao lưu tiến độ: vào <strong>Cài đặt → Xuất tiến độ</strong> để tải file JSON
          </li>
        </ul>
      </Card>
    </div>
  );
}

function Tip({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{body}</p>
      </div>
    </div>
  );
}
