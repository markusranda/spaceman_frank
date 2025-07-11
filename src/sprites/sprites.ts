import { Assets, Texture } from "pixi.js";
import { SpaceTexture } from "../models/space_texture";
import { getAlphaBounds } from "./cropper";
import { spritePaths, tilesetPaths } from "./paths";
import { buildTileAtlas } from "./tlleAtlas";

export const sprites: Record<string, SpaceTexture> = {};

export async function loadSprites() {
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

  for (const path of Object.values(tilesetPaths)) {
    await buildTileAtlas(sprites, path);
  }
}
