// MAP {audio, gainNode, audioCtx}
export const audios = {};

export async function loadAudios() {
  const configs = {
    damage_1: { src: "assets/audio/damage_1.mp3", volume: 0.1 },
    damage_2: { src: "assets/audio/damage_2.mp3", volume: 0.1 },
    paper: { src: "assets/audio/paper.mp3", volume: 0.8 },
    thruster: {
      src: "assets/audio/thruster.mp3",
      volume: 0.1,
      gain: 0.0,
      loop: true,
    },
    eat_1: { src: "assets/audio/eat_1.mp3", volume: 0.1 },
    eat_2: { src: "assets/audio/eat_2.mp3", volume: 0.1 },
    eat_3: { src: "assets/audio/eat_3.mp3", volume: 0.1 },
    eat_4: { src: "assets/audio/eat_4.mp3", volume: 0.1 },
    eat_5: { src: "assets/audio/eat_5.mp3", volume: 0.1 },
    eat_6: { src: "assets/audio/eat_6.mp3", volume: 0.1 },
  };

  const entries = Object.entries(configs);
  for (const [key, config] of entries) {
    try {
      audios[key] = await loadAudio(config.src, config);
    } catch (err) {
      console.error(`Failed to load audio: ${key}`, err);
    }
  }
}

function loadAudio(src, options = {}) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.src = src;
    audio.preload = "auto";
    audio.loop = !!options.loop;
    audio.volume = options.volume ?? 1.0;

    audio.addEventListener(
      "canplaythrough",
      () => {
        const audioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(audio);
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = options.gain ?? 1.0;

        source.connect(gainNode).connect(audioCtx.destination);

        resolve({ audio, gainNode, audioCtx });
      },
      { once: true }
    );

    audio.addEventListener(
      "error",
      () => {
        reject(new Error(`Failed to load: ${src}`));
      },
      { once: true }
    );
  });
}
