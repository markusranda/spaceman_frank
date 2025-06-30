export class Background {
  constructor(stepSize = 200) {
    this.stepSize = stepSize;
    this.tileSize = 1024;
    this.tiles = new Map(); // Keyed by `${tx},${ty}`
  }

  tileToWorld(coord) {
    return coord * this.tileSize;
  }

  getOrCreateTile(tx, ty) {
    const key = `${tx},${ty}`;
    if (this.tiles.has(key)) return this.tiles.get(key);

    const canvas = document.createElement("canvas");
    canvas.width = this.tileSize;
    canvas.height = this.tileSize;
    const ctx = canvas.getContext("2d");

    this.drawBeltsInTile(ctx, tx, ty);

    this.tiles.set(key, canvas);
    return canvas;
  }

  drawBeltsInTile(ctx, tx, ty) {
    ctx.save();

    this.drawBeltSegments(ctx, tx, ty);
    if (tx === 0 && ty === 0) {
      this.drawSun(ctx);
    }

    ctx.restore();
  }

  draw(ctx, cam) {
    const buffer = 2;
    const tileW = this.tileSize;
    const startTileX = Math.floor((cam.x - cam.width / 2) / tileW) - buffer;
    const endTileX = Math.floor((cam.x + cam.width / 2) / tileW) + buffer;
    const startTileY = Math.floor((cam.y - cam.height / 2) / tileW) - buffer;
    const endTileY = Math.floor((cam.y + cam.height / 2) / tileW) + buffer;

    const tilesBefore = Math.max(this.tiles.size);
    for (let tx = startTileX; tx <= endTileX; tx++) {
      for (let ty = startTileY; ty <= endTileY; ty++) {
        const canvas = this.getOrCreateTile(tx, ty);
        const worldX = this.tileToWorld(tx);
        const worldY = this.tileToWorld(ty);
        const drawX = Math.floor(worldX - tileW / 2 - cam.x);
        const drawY = Math.floor(worldY - tileW / 2 - cam.y);
        ctx.drawImage(canvas, drawX, drawY);
      }
    }

    const newTiles = this.tiles.size - tilesBefore;
    if (newTiles > 0) console.log(`New tiles: ${newTiles}`);
  }

  drawSun(ctx) {
    ctx.save();

    const size = this.tileSize;
    const centerX = size / 2;
    const centerY = size / 2;

    // * 0.5 is absolute max
    const radius = size * 0.5;
    const outerRad = radius;
    const midRad = radius * 0.85;
    const coreRad = radius * 0.45;

    // Move origin to tile center
    ctx.translate(centerX, centerY);

    // Outer glow — very wide, subtle
    const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRad);
    outerGlow.addColorStop(0, "rgba(255, 255, 224, 0.05)");
    outerGlow.addColorStop(0.7, "rgba(255, 255, 224, 0.01)");
    outerGlow.addColorStop(1, "rgba(255, 255, 224, 0)");

    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, outerRad, 0, Math.PI * 2);
    ctx.fill();

    // Mid glow — tight and warm
    const midGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, midRad);
    midGlow.addColorStop(0, "rgba(255, 255, 240, 0.3)");
    midGlow.addColorStop(0.8, "rgba(255, 255, 230, 0.1)");
    midGlow.addColorStop(1, "rgba(255, 255, 224, 0)");

    ctx.fillStyle = midGlow;
    ctx.beginPath();
    ctx.arc(0, 0, midRad, 0, Math.PI * 2);
    ctx.fill();

    // Core — soft white-hot center, NO hard edges
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRad);
    core.addColorStop(0, "#ffffff");
    core.addColorStop(0.9, "#fffff0");
    core.addColorStop(1, "#ffffe0");

    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, coreRad, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawBeltSegments(ctx, tx, ty) {
    const tileSize = this.tileSize;

    // Tile center in world space
    const tileCenterX = this.tileToWorld(tx);
    const tileCenterY = this.tileToWorld(ty);

    // Tile world bounds
    const tileLeft = tileCenterX - tileSize / 2;
    const tileRight = tileCenterX + tileSize / 2;
    const tileTop = tileCenterY - tileSize / 2;
    const tileBottom = tileCenterY + tileSize / 2;

    // Distance from tile corner to (0,0)
    const tileMaxDist = Math.hypot(
      Math.max(Math.abs(tileLeft), Math.abs(tileRight)),
      Math.max(Math.abs(tileTop), Math.abs(tileBottom))
    );
    const tileMinDist = Math.hypot(
      Math.min(Math.abs(tileLeft), Math.abs(tileRight)),
      Math.min(Math.abs(tileTop), Math.abs(tileBottom))
    );

    // Belt configuration
    const minRadius = 0;
    const thickness = tileSize * 0.75;
    const beltGap = thickness;

    // Compute which belt indices intersect this tile
    const minIndex = Math.max(
      0,
      Math.floor((tileMinDist - minRadius - thickness) / beltGap)
    );
    const maxIndex = Math.ceil((tileMaxDist - minRadius + thickness) / beltGap);

    const centerX = -tileLeft;
    const centerY = -tileTop;

    for (let i = minIndex; i <= maxIndex; i++) {
      const radius = minRadius + i * beltGap;
      for (let i = minIndex; i <= maxIndex; i++) {
        const radius = minRadius + i * beltGap;

        if (i === 0) {
          // Fill inside the first belt to cover the center hole
          ctx.beginPath();
          ctx.arc(centerX, centerY, this.tileSize * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = this.getBeltColor(-1); // match first belt
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.getBeltColor(i);
        ctx.lineWidth = thickness;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = this.getBeltColor(i);
      ctx.lineWidth = thickness;
      ctx.stroke();
    }
  }

  getBeltColor(index) {
    const t = Math.max(0, Math.min(index / 80, 1));
    const lightness = 15 - t * 20; // from 25% (carbon) to 5% (almost black)
    const sat = 5; // nearly greyscale

    return `hsl(0, ${sat}%, ${lightness}%)`;
  }
}
