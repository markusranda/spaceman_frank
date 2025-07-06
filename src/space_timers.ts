import { FPS_PRINT_TIMEOUT, SPAWN_TIMER_MAX } from "./timers";

export class SpaceTimers {
  damageTimer = 0;
  spawnTimer = SPAWN_TIMER_MAX;
  victoryTimer = 0;
  debugEvolveTimer = 0;
  fpsTimer = FPS_PRINT_TIMEOUT;
  multiheadTimer = 100;
  chargeCooldownTimer = 0;

  constructor() {}
}
