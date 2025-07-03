import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";

export class Background {
  tileSize = 1024;
  tilesPerAxis = 512;

  constructor() {
    this.tileCount = this.tilesPerAxis * this.tilesPerAxis;
    this.tiles = new Array(this.tileCount).fill(null);
    this.tileBuffer = 2;
  }

  update(frank, screenWidth, screenHeight, container) {
    const { tileSize, tileBuffer } = this;

    const viewHalfW = screenWidth / 2;
    const viewHalfH = screenHeight / 2;

    const minX = frank.x - viewHalfW - tileBuffer * tileSize;
    const maxX = frank.x + viewHalfW + tileBuffer * tileSize;
    const minY = frank.y - viewHalfH - tileBuffer * tileSize;
    const maxY = frank.y + viewHalfH + tileBuffer * tileSize;

    const tileMinX = Math.floor(minX / tileSize);
    const tileMaxX = Math.floor(maxX / tileSize);
    const tileMinY = Math.floor(minY / tileSize);
    const tileMaxY = Math.floor(maxY / tileSize);

    for (let ty = tileMinY; ty <= tileMaxY; ty++) {
      for (let tx = tileMinX; tx <= tileMaxX; tx++) {
        const index = this.getTileIndex(tx, ty);
        if (index === -1 || this.tiles[index]) continue;

        const tile = this.createTile(tx, ty);
        this.tiles[index] = tile;
        container.addChild(tile);
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
    const size = 0.5 + Math.random() * 1.5;
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
    console.log(`Creating new tile at ${tileX}, ${tileY}`);
    const { tileSize } = this;
    const tile = new PIXI.Container();
    tile.name = `tile_${tileX}_${tileY}`;
    tile.cullable = true;

    const worldX = tileX * tileSize - tileSize / 2;
    const worldY = tileY * tileSize - tileSize / 2;

    tile.x = worldX;
    tile.y = worldY;

    // Fill tile with belt background tint
    const radius = Math.sqrt(worldX ** 2 + worldY ** 2);
    const beltColor = this.getColorForRadius(radius);

    const bg = new PIXI.Graphics();
    bg.beginFill(beltColor, 0.15);
    bg.drawRect(0, 0, tileSize, tileSize);
    bg.endFill();
    tile.addChild(bg);

    if (tileX === 0 && tileY === 0) {
      const sun = this.createSun();
      sun.x += tileSize / 2;
      sun.y += tileSize / 2;
      tile.addChild(sun);
    } else {
      const starCount = 25 + Math.floor((radius / 2000) * 10);
      for (let i = 0; i < starCount; i++) {
        const star = this.createStar();

        tile.addChild(star);
      }
    }

    return tile;
  }

  getTileIndex(tileX, tileY) {
    const half = this.tilesPerAxis >> 1;
    const x = tileX + half;
    const y = tileY + half;
    if (x < 0 || x >= this.tilesPerAxis || y < 0 || y >= this.tilesPerAxis)
      return -1;
    return y * this.tilesPerAxis + x;
  }

  getColorForRadius(radius) {
    const maxRadius = 5000;
    const t = Math.min(radius / maxRadius, 1);
    const hue = 45;
    const saturation = 100;
    const lightness = 40 * (1 - t);

    return this.hslToHex(hue, saturation, lightness);
  }

  hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = (x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, "0");
    return parseInt(`0x${toHex(r)}${toHex(g)}${toHex(b)}`, 16);
  }

  destroy() {
    for (const tile of this.tiles) {
      if (tile && tile.parent) {
        tile.parent.removeChild(tile);
        tile.destroy({ children: true });
      }
    }
    this.tiles.fill(null);
  }
}
