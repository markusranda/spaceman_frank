import { Container, Graphics } from "pixi.js";

interface TrailPoint {
  baseX: number;
  baseY: number;
  angleAtSpawn: number;
  ttl: number;
}

export class FrankWingTrail {
  private history: TrailPoint[] = [];
  private maxTTL = 500;
  private maxPoints = 130;
  private lateralOffset: number;
  private graphic: Graphics;

  constructor(lateralOffset: number) {
    this.lateralOffset = lateralOffset;
    this.graphic = new Graphics();
  }

  update(
    delta: number,
    frankX: number,
    frankY: number,
    frankAngle: number,
    shouldSpawn: boolean,
    container: Container
  ) {
    if (shouldSpawn) {
      this.history.push({
        baseX: frankX,
        baseY: frankY,
        angleAtSpawn: frankAngle,
        ttl: this.maxTTL,
      });

      if (this.history.length > this.maxPoints) {
        this.history.shift();
      }
    }

    for (const point of this.history) {
      point.ttl -= delta;
    }

    this.history = this.history.filter((p) => p.ttl > 0);
    this.draw(container);
  }

  private draw(container: Container) {
    if (!this.graphic.parent) {
      container.addChild(this.graphic);
    }

    this.graphic.clear();

    if (this.history.length < 2) return;

    const getWorldPos = (point: TrailPoint) => {
      const offsetAngle = point.angleAtSpawn + Math.PI / 2;
      const offsetX = Math.cos(offsetAngle) * this.lateralOffset;
      const offsetY = Math.sin(offsetAngle) * this.lateralOffset;
      return {
        x: point.baseX + offsetX,
        y: point.baseY + offsetY,
      };
    };

    for (let i = 1; i < this.history.length; i++) {
      const p1 = this.history[i - 1];
      const p2 = this.history[i];

      const world1 = getWorldPos(p1);
      const world2 = getWorldPos(p2);

      const alpha = (p1.ttl + p2.ttl) / (2 * this.maxTTL);

      this.graphic
        .moveTo(world1.x, world1.y)
        .lineTo(world2.x, world2.y)
        .stroke({
          width: 4,
          color: 0xffffff,
          alpha,
          cap: "round",
        });
    }
  }

  clearHistory() {
    this.history = [];
  }

  destroy(container: Container) {
    container.removeChild(this.graphic);
  }
}
