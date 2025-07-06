import { Frank } from "./frank/frank";

const audioCtx = new (window.AudioContext || window.AudioContext)();
let isPingPlaying = false;

export function playSpatialPing(
  x: number,
  y: number,
  duration: number,
  frank: Frank
) {
  if (isPingPlaying) return;
  isPingPlaying = true;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  // Calculate distance
  const dx = x - frank.x;
  const dy = y - frank.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Map distance to frequency
  const minFreq = 600;
  const maxFreq = 1800;
  const maxDistance = 500;
  const normalizedDistance = Math.min(distance, maxDistance) / maxDistance;
  const freq = maxFreq - (maxFreq - minFreq) * normalizedDistance;

  oscillator.type = "sine";
  oscillator.frequency.value = freq;

  // Gain ramp
  const now = audioCtx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
  gainNode.gain.setValueAtTime(0.1, now + duration / 1000 - 0.05);
  gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start(now);
  oscillator.stop(now + duration / 1000);

  oscillator.onended = () => {
    setTimeout(() => {
      isPingPlaying = false;
    }, 100);
  };
}
