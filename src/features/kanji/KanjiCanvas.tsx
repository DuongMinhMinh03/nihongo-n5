import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';

interface Props {
  /** Kanji cần vẽ mẫu */
  target: string;
  /** Số nét (để hiển thị gợi ý) */
  strokes?: number;
  className?: string;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Bàn vẽ luyện viết kanji.
 * - Vẽ bằng chuột hoặc cảm ứng
 * - Nền lưới ô vuông (mô phỏng giấy luyện viết)
 * - Nút xoá, nút xem mẫu
 */
export function KanjiCanvas({ target, strokes, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<Point | null>(null);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const size = Math.min(parent.clientWidth, 320);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    drawGrid(ctx, size);
    if (showGuide) drawGuide(ctx, size, target);
  }, [showGuide, target]);

  useEffect(() => {
    resize();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [resize]);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastRef.current = getPos(e);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const pos = getPos(e);
    const last = lastRef.current ?? pos;
    const rect = canvas.getBoundingClientRect();
    const isDark = document.documentElement.classList.contains('dark');

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = isDark ? '#f8fafc' : '#0f172a';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastRef.current = pos;
    if (!hasStrokes) setHasStrokes(true);
    void rect;
  };

  const end = () => {
    drawingRef.current = false;
    lastRef.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const size = canvas.clientWidth;
    ctx.clearRect(0, 0, size, size);
    drawGrid(ctx, size);
    if (showGuide) drawGuide(ctx, size, target);
    setHasStrokes(false);
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
          className="touch-none rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
          style={{ cursor: 'crosshair' }}
        />
        {showGuide && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="font-jp select-none text-[7rem] font-bold text-slate-200 dark:text-slate-700">
              {target}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={clear} disabled={!hasStrokes}>
          🗑 Xoá
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowGuide((v) => {
              const next = !v;
              requestAnimationFrame(resize);
              return next;
            });
          }}
        >
          {showGuide ? '👁 Ẩn mẫu' : '👁 Hiện mẫu'}
        </Button>
        {strokes !== undefined && (
          <span className="text-xs text-slate-500">Kanji này có {strokes} nét</span>
        )}
      </div>
    </div>
  );
}

function drawGrid(ctx: CanvasRenderingContext2D, size: number) {
  const isDark = document.documentElement.classList.contains('dark');
  ctx.save();
  ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.25)' : 'rgba(100,116,139,0.25)';
  ctx.lineWidth = 1;

  // Viền
  ctx.strokeRect(0.5, 0.5, size - 1, size - 1);

  // Đường trung tâm (nét dấu)
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2, size);
  ctx.moveTo(0, size / 2);
  ctx.lineTo(size, size / 2);
  ctx.stroke();

  // Đường chéo
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size, size);
  ctx.moveTo(size, 0);
  ctx.lineTo(0, size);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawGuide(ctx: CanvasRenderingContext2D, size: number, target: string) {
  // Vẽ mờ mẫu chữ bằng canvas (fallback khi không có font render tốt)
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.floor(size * 0.78)}px "Yu Gothic", Meiryo, "MS Gothic", sans-serif`;
  ctx.fillText(target, size / 2, size / 2);
  ctx.restore();
}
