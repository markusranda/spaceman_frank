import { FPS_PRINT_TIMEOUT, SPAWN_TIMER_MAX } from "./timers";

export class SpaceTimers {
  damageTimer = 0;
  spawnTimer = SPAWN_TIMER_MAX;
  victoryTimer = 0;
  debugEvolveTimer = 0;
  fpsTimer = FPS_PRINT_TIMEOUT;

  constructor() {}

  tick(delta: number) {
    (Object.keys(this) as (keyof this)[]).forEach((key) => {
      const val = this[key];
      if (typeof val === "number") {
        this[key] = Math.max(0, val - delta) as any;
      }
    });
  }
}
