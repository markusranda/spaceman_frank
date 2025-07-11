import { Container } from "pixi.js";
import { FRANK_STATE } from "../frank/const";
import { Frank } from "../frank/frank";
import { KageBunshin } from "../kage_bunshin";
import { sprites } from "../sprites/sprites";
import { SpaceItem } from "./space_item";
import { Universe } from "../universe/universe";

export class ItemKageBunshin extends SpaceItem {
  previousState = "";
  kageBunshins: KageBunshin[] = [];

  constructor() {
    super(
      "kage_bunshin",
      sprites["item_kage_bunshin"].texture,
      "Charge attack spawns a clone attacking in the same direction"
    );
  }

  override update(
    frank: Frank,
    universe: Universe,
    delta: number,
    container: Container
  ) {
    if (
      this.previousState === FRANK_STATE.preCharging &&
      frank.state === FRANK_STATE.charging
    ) {
      this.spawnKageBunshin(frank, container);
    }

    this.updateKageBunshins(universe, delta);
    this.previousState = frank.state;
  }

  spawnKageBunshin(frank: Frank, container: Container) {
    for (let i = 0; i < this.level; i++) {
      const { x, y } = this.getKageBunshinSpawnPosition(frank, i);
      const kageBunshin = new KageBunshin(
        x,
        y,
        frank.angle,
        frank.vx,
        frank.vy,
        frank.frankSprite.texture,
        frank.radius,
        frank.charger?.chargeDuration ?? 0
      );
      this.kageBunshins.push(kageBunshin);

      kageBunshin.addTo(container);
    }
  }

  updateKageBunshins(universe: Universe, delta: number) {
    for (let i = this.kageBunshins.length - 1; i >= 0; i--) {
      const kageBunshin = this.kageBunshins[i];
      if (!kageBunshin) {
        console.warn(`Failed to find kageBunshin at ${i}`);
        continue;
      }
      kageBunshin.update(universe, delta);

      if (kageBunshin.dead) {
        kageBunshin.destroy();
        this.kageBunshins.splice(i, 1);
      }
    }
  }

  getKageBunshinSpawnPosition(
    frank: Frank,
    index: number,
    total: number = this.level
  ): { x: number; y: number } {
    const spacing = frank.radius * 2.5;
    const cloneRadius = frank.radius;

    const middle = Math.floor(total / 2);
    const offsetIndex = index - middle;

    // Get side-to-side offset
    const perpAngle = frank.angle + Math.PI / 2;
    const sidewaysX = Math.cos(perpAngle) * spacing * offsetIndex;
    const sidewaysY = Math.sin(perpAngle) * spacing * offsetIndex;

    // Get forward offset
    const forwardDist = frank.radius + cloneRadius + 6; // How far in front of Frank
    const forwardX = Math.cos(frank.angle) * forwardDist;
    const forwardY = Math.sin(frank.angle) * forwardDist;

    return {
      x: frank.x + sidewaysX + forwardX,
      y: frank.y + sidewaysY + forwardY,
    };
  }
}
