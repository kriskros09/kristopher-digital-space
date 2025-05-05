type PlayAudioOptions = {
  onPlay?: () => void;
  onEnd?: () => void;
};

export function playAudio(url: string, { onPlay, onEnd }: PlayAudioOptions = {}) {
  const audio = new Audio(url);
  if (onPlay) audio.onplay = onPlay;
  if (onEnd) audio.onended = onEnd;
  audio.play();
  return audio;
} 