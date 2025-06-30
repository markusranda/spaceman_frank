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

    const centerX = this.tileSize / 2;
    const centerY = this.tileSize / 2;
    const radius = this.tileSize * 0.25;

    // Fill base to blend gap before belts
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + this.tileSize * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = this.getBeltColor(0); // match first belt color
    ctx.fill();

    // Outer glow — extremely subtle and wide
    const outerGlow = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius * 4.5
    );
    outerGlow.addColorStop(0, "rgba(255, 255, 224, 0.07)");
    outerGlow.addColorStop(0.5, "rgba(255, 255, 224, 0.03)");
    outerGlow.addColorStop(1, "rgba(255, 255, 224, 0)");

    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Mid glow — smooth fade, no harsh edge
    const midGlow = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius * 2
    );
    midGlow.addColorStop(0, "rgba(255, 255, 240, 0.6)");
    midGlow.addColorStop(0.6, "rgba(255, 255, 230, 0.25)");
    midGlow.addColorStop(1, "rgba(255, 255, 224, 0)");

    ctx.fillStyle = midGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Core — smoother edge transition
    const coreGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    );
    coreGradient.addColorStop(0, "#ffffff");
    coreGradient.addColorStop(0.8, "#fffff0");
    coreGradient.addColorStop(1, "#ffffe0");

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
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
    // Hue starts near yellow-white, shifts slowly toward bluish/purple
    const startHue = 50; // warm yellow-white
    const endHue = 260; // cool violet
    const maxSteps = 10; // how far the shift spreads
    const t = Math.min(index / maxSteps, 1); // normalized progress

    const hue = startHue + (endHue - startHue) * t;
    const lightness = 85 - t * 20; // from 85% to 65%
    const saturation = 80; // keep it strong

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
}
