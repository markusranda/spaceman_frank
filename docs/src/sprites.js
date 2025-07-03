import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";

export const sprites = {};

export async function loadSprites() {
  const spritePaths = {
    frank: "assets/sprites/frank.png",
    max_speed: "assets/sprites/max.png",
    acceleration: "assets/sprites/acceleration.png",
    fuel_consumption: "assets/sprites/fuel.png",
    planet_1: "assets/sprites/planet_1.png",
    planet_2: "assets/sprites/planet_2.png",
    planet_3: "assets/sprites/planet_3.png",
    enemy_1: "assets/sprites/enemy_1.png",
    fireball: "assets/sprites/fireball.png",
    confetti_1: "assets/sprites/confetti_1.png",
    confetti_2: "assets/sprites/confetti_2.png",
    confetti_3: "assets/sprites/confetti_3.png",
    confetti_4: "assets/sprites/confetti_4.png",
  };

  const entries = Object.entries(spritePaths);
  for (const [key, path] of entries) {
    sprites[key] = await loadImage(path);
  }
}

async function loadImage(src) {
  return await PIXI.Assets.load(src);
}
