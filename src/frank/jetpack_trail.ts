import { GlowFilter } from "pixi-filters";
import { Graphics } from "pixi.js";

export class JetpackTrail {
  graphics: Graphics;
  points: { x: number; y: number; alpha: number }[] = [];
  fading = false;
  fadeSpeed = 0.02;
  parentRadius = 0;
  color = 0;

  constructor(color: number, parentRadius: number) {
    this.graphics = new Graphics();
    this.graphics.label = "jetpack_trail";
    this.graphics.filters = [
      new GlowFilter({ distance: 15, outerStrength: 2 }),
    ];
    this.parentRadius = parentRadius;
    this.color = color;
  }

  addPoint(x: number, y: number) {
    this.points.push({ x, y, alpha: 1 });
  }

  startFading() {
    this.fading = true;
  }

  update() {
    if (this.fading) {
      for (const p of this.points) {
        p.alpha -= this.fadeSpeed;
      }
      this.points = this.points.filter((p) => p.alpha > 0);
    }
    this.redraw();
  }

  isDead() {
    return this.fading && this.points.length === 0;
  }

  redraw() {
    const g = this.graphics;
    g.clear();

    if (this.points.length < 2) return;

    g.setStrokeStyle({
      width: this.parentRadius,
      color: this.color,
      alpha: this.points[0].alpha,
      cap: "round",
      join: "round",
    });

    g.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      const p = this.points[i];
      g.lineTo(p.x, p.y);
    }

    g.stroke();
  }
}
