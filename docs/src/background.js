import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";
import { sprites } from "./sprites.js";

export class Background {
  tileSize = 512;
  tiles = [];
  starMinSize = 1;
  starMaxSize = 1.5;
  starMargin = 15;

  constructor(container) {
    const sun = this.createSun();
    sun.x = 0;
    sun.y = 0;
    sun.cullable = true;
    sun.zIndex = 999999;
    container.addChild(sun);

    this.bgTexture = sprites["starfield_1"];
  }

  update(frank, screenWidth, screenHeight, screenScale, container) {
    const { tileSize } = this;
    const viewHalfW = screenWidth * (1 / screenScale.x);
    const viewHalfH = screenHeight * (1 / screenScale.x);
    const minX = frank.x - viewHalfW - tileSize;
    const maxX = frank.x + viewHalfW + tileSize;
    const minY = frank.y - viewHalfH - tileSize;
    const maxY = frank.y + viewHalfH + tileSize;
    const tileMinX = Math.floor(minX / tileSize);
    const tileMaxX = Math.floor(maxX / tileSize);
    const tileMinY = Math.floor(minY / tileSize);
    const tileMaxY = Math.floor(maxY / tileSize);
    for (let ty = tileMinY; ty <= tileMaxY; ty++) {
      for (let tx = tileMinX; tx <= tileMaxX; tx++) {
        // Add column if missing
        if (!this.tiles[tx]) this.tiles[tx] = [];

        // Look for existing tile
        const tile = this.tiles[tx][ty];

        if (!tile) {
          const tile = this.createTile(tx, ty);
          this.tiles[tx][ty] = tile;
          container.addChild(tile);
        }

        // Scale the sprite based on zoom
        if (tile?._starfieldSprite) {
          const scale = 1 / screenScale.x;
          tile._starfieldSprite.scale.set(scale);
        }
      }
    }
  }

  createSun() {
    const sun = new PIXI.Container();

    const layers = [
      { radius: 65, color: "#fff", alpha: 0.4 },
      { radius: 60, color: "#fff", alpha: 1.0 },
      { radius: 55, color: "#fff", alpha: 1.0 },
      { radius: 50, color: "#fff", alpha: 1.0 },
    ];

    for (const layer of layers) {
      const circle = new PIXI.Graphics();
      circle.beginFill(layer.color, layer.alpha);
      circle.drawCircle(0, 0, layer.radius);
      circle.endFill();
      sun.addChild(circle);
    }

    // Blur
    const blur = new PIXI.BlurFilter(99, 99);
    sun.filters = [blur];

    const glow = new PIXI.Graphics();
    glow.beginFill(0xffd200, 0.2);
    glow.drawCircle(0, 0, 100);
    glow.endFill();
    glow.blendMode = "hard-light";
    sun.addChild(glow);

    return sun;
  }

  createTile(tileX, tileY) {
    const { tileSize } = this;
    const worldX = tileX * tileSize;
    const worldY = tileY * tileSize;

    // Create container
    const tile = new PIXI.Container();
    tile.name = `tile_${tileX}_${tileY}`;
    tile.cullable = true;
    tile.x = worldX;
    tile.y = worldY;

    // Add background sprite
    const sprite = new PIXI.Sprite(this.bgTexture);
    sprite.label = "starfield";
    sprite.anchor.set(0.5);
    sprite.x = tileSize / 2;
    sprite.y = tileSize / 2;
    // Save sprite refernce on tile for laters
    tile._starfieldSprite = sprite;

    // Rotate it to decrease repetiveness
    const rotationSteps = Math.floor(Math.random() * 4);
    sprite.rotation = rotationSteps * (Math.PI / 2);
    tile.addChild(sprite);

    // Mask
    const mask = new PIXI.Graphics()
      .beginFill(0xffffff)
      .drawRect(0, 0, tileSize, tileSize)
      .endFill();
    tile.addChild(mask);
    tile.mask = mask;

    return tile;
  }
}
