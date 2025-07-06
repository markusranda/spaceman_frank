import { Container } from "pixi.js";
import { FrankWingTrail } from "./trail_wings";

export class FrankTrailManager {
  private wings: FrankWingTrail[] = [];
  private wasSpawning = false;

  constructor() {
    const offsets = [-125, -75, -25, 25, 75, 125];

    for (const offset of offsets) {
      this.wings.push(new FrankWingTrail(offset));
    }
  }

  update(
    delta: number,
    frankX: number,
    frankY: number,
    frankAngle: number,
    container: Container,
    shouldSpawn: boolean
  ) {
    const justStartedSpawning = shouldSpawn && !this.wasSpawning;

    for (const wing of this.wings) {
      if (justStartedSpawning) wing.clearHistory();
      wing.update(delta, frankX, frankY, frankAngle, shouldSpawn, container);
    }

    this.wasSpawning = shouldSpawn;
  }

  clear(container: Container) {
    for (const wing of this.wings) {
      wing.destroy(container);
    }
    this.wings = [];
  }
}
