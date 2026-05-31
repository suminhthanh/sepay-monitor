interface TtsItem {
  text: string;
  voiceName?: string;
}

const queue: TtsItem[] = [];
let speaking = false;

function processQueue() {
  if (speaking || queue.length === 0) return;

  const item = queue.shift()!;
  speaking = true;

  const utterance = new SpeechSynthesisUtterance(item.text);
  utterance.lang = "vi-VN";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  if (item.voiceName) {
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.name === item.voiceName);
    if (voice) utterance.voice = voice;
  }

  utterance.onend = () => {
    speaking = false;
    processQueue();
  };

  utterance.onerror = () => {
    speaking = false;
    processQueue();
  };

  window.speechSynthesis.speak(utterance);
}

export function enqueueTts(text: string, voiceName?: string) {
  queue.push({ text, voiceName });
  processQueue();
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis.getVoices();
}

export function getVietnameseVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("vi"));
}

export function cancelTts() {
  queue.length = 0;
  window.speechSynthesis.cancel();
  speaking = false;
}
