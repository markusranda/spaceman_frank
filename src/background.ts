import {
  BlurFilter,
  Container,
  Graphics,
  ObservablePoint,
  Sprite,
  Texture,
} from "pixi.js";
import { sprites } from "./sprites/sprites";
import { Frank } from "./frank/frank";

interface SpaceTile extends Container {
  _starfieldSprite: Sprite;
}

export class Background {
  tileSize = 512;
  tiles: SpaceTile[][] = [];
  starMinSize = 1;
  starMaxSize = 1.5;
  starMargin = 15;
  bgTexture: Texture | null = null;

  constructor(container: Container) {
    const sun = this.createSun();
    sun.x = 0;
    sun.y = 0;
    sun.cullable = true;
    sun.zIndex = 999999;
    container.addChild(sun);

    this.bgTexture = sprites["starfield_1"]?.texture;
  }

  update(
    frank: Frank,
    screenWidth: number,
    screenHeight: number,
    screenScale: ObservablePoint,
    container: Container
  ) {
    const { tileSize } = this;
    const viewHalfW = screenWidth * (1 / screenScale.x);
    const viewHalfH = screenHeight * (1 / screenScale.x);
    const bufferTiles = 2;
    const minX = frank.x - viewHalfW - tileSize * bufferTiles;
    const maxX = frank.x + viewHalfW + tileSize * bufferTiles;
    const minY = frank.y - viewHalfH - tileSize * bufferTiles;
    const maxY = frank.y + viewHalfH + tileSize * bufferTiles;
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
    const sun = new Container();

    const layers = [
      { radius: 65, color: "#fff", alpha: 0.4 },
      { radius: 60, color: "#fff", alpha: 1.0 },
      { radius: 55, color: "#fff", alpha: 1.0 },
      { radius: 50, color: "#fff", alpha: 1.0 },
    ];

    for (const layer of layers) {
      const circle = new Graphics();
      circle.circle(0, 0, layer.radius);
      circle.fill({ color: layer.color, alpha: layer.alpha });
      sun.addChild(circle);
    }

    // Blur
    const blur = new BlurFilter();
    blur.strength = 99;
    blur.quality = 99;
    sun.filters = [blur];

    const glow = new Graphics();
    glow.circle(0, 0, 100);
    glow.fill({ color: 0xffd200, alpha: 0.2 });
    glow.blendMode = "hard-light";
    sun.addChild(glow);

    return sun;
  }

  createTile(tileX: number, tileY: number) {
    if (!this.bgTexture)
      throw Error(
        "Can't create a new SpaceTile without the background texture"
      );

    const { tileSize } = this;
    const worldX = tileX * tileSize;
    const worldY = tileY * tileSize;

    // Create container
    const tile: SpaceTile = new Container() as SpaceTile;
    tile.label = `tile_${tileX}_${tileY}`;
    tile.cullable = true;
    tile.x = worldX;
    tile.y = worldY;

    // Add background sprite
    const sprite = new Sprite(this.bgTexture);
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
    const mask = new Graphics().rect(0, 0, tileSize, tileSize).fill(0xffffff);
    tile.addChild(mask);
    tile.mask = mask;

    return tile;
  }
}
