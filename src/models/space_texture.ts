import { Texture } from "pixi.js";

export interface SpaceTexture {
  texture: Texture;
  croppedDimensions: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}
