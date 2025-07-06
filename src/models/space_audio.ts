export interface SpaceAudio {
  audio: HTMLAudioElement;
  gainNode: GainNode;
  audioCtx: AudioContext;
}

export interface SpaceAudioOptions {
  src: string;
  volume?: number;
  gain?: number;
  loop?: boolean;
}
