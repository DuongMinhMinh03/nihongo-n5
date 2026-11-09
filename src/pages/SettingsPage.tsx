import { useRef, useState } from 'react';
import { Button, Card, SectionTitle } from '@/components/ui';
import { useProgressStore } from '@/store/progress';
import { useTTS } from '@/hooks/useTTS';
import { cn } from '@/lib/cn';

export default function SettingsPage() {
  const settings = useProgressStore((s) => s.settings);
  const updateSettings = useProgressStore((s) => s.updateSettings);
  const resetAll = useProgressStore((s) => s.resetAll);
  const exportProgress = useProgressStore((s) => s.exportProgress);
  const importProgress = useProgressStore((s) => s.importProgress);
  const cards = useProgressStore((s) => s.cards);

  const { supported, voices, activeVoice, speak } = useTTS();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleExport = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nihongo-n5-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'ok', text: 'Đã xuất tiến độ ra file JSON.' });
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importProgress(String(reader.result));
      setMessage(
        ok
          ? { type: 'ok', text: 'Đã nhập tiến độ thành công.' }
          : { type: 'err', text: 'File không hợp lệ. Hãy chọn file JSON do ứng dụng xuất.' }
      );
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Cài đặt" subtitle="Tùy chỉnh trải nghiệm học của bạn" />

      {/* Giao diện */}
      <Card className="p-5">
        <p className="font-semibold">Giao diện</p>
        <div className="mt-3 flex gap-2">
          {([
            ['light', '☀️ Sáng'],
            ['dark', '🌙 Tối'],
            ['system', '💻 Theo hệ thống']
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => updateSettings({ theme: id })}
              className={cn(
                'rounded-xl border px-4 py-2 text-sm font-medium transition',
                settings.theme === id
                  ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200'
                  : 'border-slate-200 hover:border-brand-300 dark:border-slate-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* Mục tiêu */}
      <Card className="p-5">
        <p className="font-semibold">Mục tiêu học mỗi ngày</p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Số thẻ bạn muốn review mỗi ngày
        </p>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={settings.dailyGoal}
            onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })}
            className="h-2 flex-1 accent-brand-600"
          />
          <span className="w-14 text-right text-sm font-semibold">{settings.dailyGoal} thẻ</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[10, 20, 30, 50].map((n) => (
            <button
              key={n}
              onClick={() => updateSettings({ dailyGoal: n })}
              className={cn(
                'rounded-lg border px-3 py-1 text-sm',
                settings.dailyGoal === n
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30'
                  : 'border-slate-200 dark:border-slate-700'
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </Card>

      {/* Âm thanh */}
      <Card className="p-5">
        <p className="font-semibold">Âm thanh</p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">
              Giọng đọc tiếng Nhật
            </label>
            <select
              value={settings.ttsVoiceURI ?? ''}
              onChange={(e) => updateSettings({ ttsVoiceURI: e.target.value || null })}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="">Tự động (khuyến nghị)</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} — {v.lang}
                  {v.localService ? ' (offline)' : ' (online)'}
                </option>
              ))}
            </select>
            {!supported && (
              <p className="mt-1 text-xs text-red-500">
                Trình duyệt không hỗ trợ Web Speech API.
              </p>
            )}
            {supported && voices.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                Chưa có giọng tiếng Nhật. Xem trang <strong>Hướng dẫn</strong> để biết cách cài trên Windows.
              </p>
            )}
            {activeVoice && (
              <div className="mt-2 flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => speak('こんにちは。')} >
                  🔊 Thử giọng
                </Button>
                <span className="text-xs text-slate-500">
                  Đang dùng: {activeVoice.name}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">
              Tốc độ đọc: {settings.speechRate.toFixed(2)}×
            </label>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={settings.speechRate}
              onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })}
              className="mt-1 h-2 w-full accent-brand-600"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.showRomanization}
              onChange={(e) => updateSettings({ showRomanization: e.target.checked })}
              className="h-4 w-4 rounded accent-brand-600"
            />
            Hiển thị romaji (phiên âm Latin)
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.autoPlayAudio}
              onChange={(e) => updateSettings({ autoPlayAudio: e.target.checked })}
              className="h-4 w-4 rounded accent-brand-600"
            />
            Tự động phát âm khi mở thẻ mới
          </label>
        </div>
      </Card>

      {/* Dữ liệu */}
      <Card className="p-5">
        <p className="font-semibold">Dữ liệu tiến độ</p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Hiện có {Object.keys(cards).length} thẻ đã học. Dữ liệu lưu trong trình duyệt (localStorage).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExport}>
            📤 Xuất tiến độ (JSON)
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            📥 Nhập tiến độ
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
              e.target.value = '';
            }}
          />
          <Button
            variant="danger"
            onClick={() => {
              if (confirm('Xoá toàn bộ tiến độ học tập? Hành động này không thể hoàn tác.')) {
                resetAll();
                setMessage({ type: 'ok', text: 'Đã xoá toàn bộ tiến độ.' });
              }
            }}
          >
            🗑 Xoá tiến độ
          </Button>
        </div>
        {message && (
          <p
            className={cn(
              'mt-3 text-sm',
              message.type === 'ok' ? 'text-emerald-600' : 'text-red-500'
            )}
          >
            {message.text}
          </p>
        )}
      </Card>
    </div>
  );
}
