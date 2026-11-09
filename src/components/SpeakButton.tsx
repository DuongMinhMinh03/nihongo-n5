import { useTTS } from '@/hooks/useTTS';
import { cn } from '@/lib/cn';

interface SpeakButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/** Nút phát âm thanh tiếng Nhật (dùng Web Speech API) */
export function SpeakButton({ text, label = 'Nghe', className, size = 'md' }: SpeakButtonProps) {
  const { speak, supported } = useTTS();
  const sizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-14 w-14 text-2xl'
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        'bg-brand-100 text-brand-700 transition hover:bg-brand-200 active:scale-95',
        'dark:bg-brand-900/50 dark:text-brand-200 dark:hover:bg-brand-900',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        sizes[size],
        className
      )}
    >
      🔊
    </button>
  );
}
