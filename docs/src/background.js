import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";

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
        // Create new tile if it doesn't exist
        if (!this.tiles[tx][ty]) {
          const tile = this.createTile(tx, ty);
          this.tiles[tx][ty] = tile;
          container.addChild(tile);
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

  createStar() {
    const sx = Math.random() * this.tileSize;
    const sy = Math.random() * this.tileSize;
    const size = this.starMinSize + Math.random() * this.starMaxSize;
    const alpha = 0.2 + Math.random() * 0.6;

    const star = new PIXI.Graphics();
    star.beginFill(0xffffff, alpha);
    star.drawCircle(0, 0, size);
    star.endFill();
    star.x = sx;
    star.y = sy;

    return star;
  }

  createTile(tileX, tileY) {
    const { tileSize } = this;
    const tile = new PIXI.Container();
    const worldX = tileX * tileSize;
    const worldY = tileY * tileSize;

    const bg = new PIXI.Graphics()
      .beginFill(0x131313)
      .drawRect(0, 0, tileSize, tileSize)
      .endFill();
    bg.name = "bg";
    tile.addChild(bg);

    tile.name = `tile_${tileX}_${tileY}`;
    tile.cullable = true;
    tile.x = worldX;
    tile.y = worldY;
    const mask = new PIXI.Graphics()
      .beginFill(0xffffff)
      .drawRect(0, 0, tileSize, tileSize)
      .endFill();
    tile.addChild(mask);

    for (
      let i = 0;
      i < this.tileSize / (this.medianStarSize() + this.starMargin);
      i++
    ) {
      const star = this.createStar();
      tile.addChild(star);
    }
    tile.mask = mask;

    return tile;
  }

  medianStarSize() {
    return (this.starMaxSize - this.starMinSize) / 2 + this.starMinSize;
  }
}
