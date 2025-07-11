import { Assets, Texture } from "pixi.js";
import { SpaceTexture } from "./models/space_texture";

export const sprites: Record<string, SpaceTexture> = {};

export async function loadSprites() {
  const spritePaths = {
    frank: "assets/sprites/frank.png",
    max_speed: "assets/sprites/max.png",
    acceleration: "assets/sprites/acceleration.png",
    fuel_consumption: "assets/sprites/fuel.png",
    planet_1: "assets/sprites/planet_1.png",
    planet_2: "assets/sprites/planet_2.png",
    planet_3: "assets/sprites/planet_3.png",
    planet_shadow: "assets/sprites/planet_shadow.png",
    planet_mask: "assets/sprites/planet_mask.png",
    planet_treasure: "assets/sprites/planet_treasure.png",
    enemy_1: "assets/sprites/enemy_1.png",
    fireball: "assets/sprites/fireball.png",
    confetti_1: "assets/sprites/confetti_1.png",
    confetti_2: "assets/sprites/confetti_2.png",
    confetti_3: "assets/sprites/confetti_3.png",
    confetti_4: "assets/sprites/confetti_4.png",
    starfield_1: "assets/sprites/starfield_1.png",
    stomach: "assets/sprites/stomach.png",
    stomach_mask: "assets/sprites/stomach_mask.png",
    jetpack: "assets/sprites/jetpack.png",
    jetpack_mask: "assets/sprites/jetpack_mask.png",
    crack_animation: "assets/sprites/crack_animation.json",
  };

  const entries = Object.entries(spritePaths);
  for (const [key, path] of entries) {
    if (path.endsWith(".json")) {
      // Aseprite spritesheet
      const sheet = await Assets.load(path); // Automatically loads the image too
      const baseTexture = sheet.textures;

      // Load all frames from the sheet
      const frames = Object.keys(baseTexture);
      frames.forEach((frameName, index) => {
        const tex = baseTexture[frameName];
        const spaceTex: SpaceTexture = {
          texture: tex,
          croppedDimensions: {
            x: 0,
            y: 0,
            width: tex.width,
            height: tex.height,
          },
        };
        // Optional: append frame index to key for multiple frames
        sprites[`${key}_${index}`] = spaceTex;
      });
    } else {
      // Single-frame sprite
      const texture = await Assets.load<Texture>(path);
      const bounds = await getAlphaBounds(path);
      sprites[key] = {
        texture: texture,
        croppedDimensions: bounds,
      } as SpaceTexture;
    }
  }
}

async function getAlphaBounds(path: string) {
  return new Promise((resolve, reject) => {
    try {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw Error("couldn't get context");
        ctx.drawImage(image, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        let minX = canvas.width,
          minY = canvas.height,
          maxX = 0,
          maxY = 0;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4 + 3;
            if (data[i] > 0) {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (minX > maxX || minY > maxY)
          resolve({ x: 0, y: 0, width: 0, height: 0 });
        else
          resolve({
            x: minX,
            y: minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1,
          });
      };
      image.onerror = reject;
      image.src = path;
    } catch (error) {
      throw Error(`Failed to get alpha bounds - ${error}`);
    }
  });
}
