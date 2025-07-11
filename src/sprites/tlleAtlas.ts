import { Assets, Rectangle, Texture } from "pixi.js";
import { SpaceTexture } from "../models/space_texture";

const TILE_SIZE = 64;

interface TileCoord {
  x: number;
  y: number;
}

const indexes: Record<string, TileCoord> = {
  item_charge_overclocker: { x: 0, y: 0 },
  item_kage_bunshin: { x: 1, y: 0 },
  item_rocket_thrusters: { x: 2, y: 0 },
  item_fuel_tank: { x: 3, y: 0 },
};

export async function buildTileAtlas(
  sprites: Record<string, SpaceTexture>,
  path: string
) {
  const tileset = await Assets.load<Texture>(path);
  if (!tileset) {
    throw new Error(`Missing tileset texture at path: "${path}"`);
  }

  for (const [name, coord] of Object.entries(indexes)) {
    const x = coord.x * TILE_SIZE;
    const y = coord.y * TILE_SIZE;
    const frame = new Rectangle(x, y, TILE_SIZE, TILE_SIZE);

    const texture = new Texture({ source: tileset.source, frame });

    // TODO Implement real cropped dimensions
    const croppedDimensions = { x: 0, y: 0, width: 64, height: 64 };

    // Add to sprites
    sprites[name] = { texture, croppedDimensions };
  }
}
