import { frank } from "./index.js";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export function updateListener() {}

export function playSpatialPing(x, y, duration) {
  const listener = audioCtx.listener;
  listener.setPosition(frank.x, frank.y, 0);

  updateListener();

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const panner = audioCtx.createPanner();

  panner.panningModel = "HRTF"; // good default
  panner.distanceModel = "inverse"; // volume dropoff model
  panner.setPosition(x, y, 0); // position in world

  gainNode.gain.value = 5;

  oscillator.type = "sine";
  oscillator.frequency.value = 1200;

  oscillator.connect(gainNode);
  gainNode.connect(panner);
  panner.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration / 1000);
}
