import { useCallback, useEffect, useState } from 'react';
import { useProgressStore } from '@/store/progress';

export interface JapaneseVoice extends SpeechSynthesisVoice {
  isLocal?: boolean;
}

/** Hook quản lý Web Speech API: chọn voice Nhật và phát âm. */
export function useTTS() {
  const [voices, setVoices] = useState<JapaneseVoice[]>([]);
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const settings = useProgressStore((s) => s.settings);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setSupported(true);

    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const ja = all.filter((v) => v.lang.toLowerCase().startsWith('ja'));
      setVoices(ja);
    };

    load();
    window.speechSynthesis.onvoiceschanged = load;
    // Safari/Chrome đôi khi cần gọi lại sau một khoảng trễ
    const t = window.setTimeout(load, 500);
    return () => {
      window.clearTimeout(t);
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  /** Voice Nhật ưu tiên: lựa chọn của user → giọng local (offline) → bất kỳ voice Nhật nào */
  const activeVoice = useCallback((): JapaneseVoice | null => {
    if (voices.length === 0) return null;
    if (settings.ttsVoiceURI) {
      const chosen = voices.find((v) => v.voiceURI === settings.ttsVoiceURI);
      if (chosen) return chosen;
    }
    return (
      voices.find((v) => v.localService) ??
      voices.find((v) => /Microsoft|Natural|Google/i.test(v.name)) ??
      voices[0]
    );
  }, [voices, settings.ttsVoiceURI]);

  const speak = useCallback(
    (text: string, opts?: { rate?: number; lang?: string }) => {
      if (!supported || !text) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const voice = activeVoice();
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        utter.lang = opts?.lang ?? 'ja-JP';
      }
      utter.rate = opts?.rate ?? settings.speechRate;
      utter.pitch = 1;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utter);
    },
    [supported, activeVoice, settings.speechRate]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { supported, voices, activeVoice: activeVoice(), speak, stop, speaking };
}
