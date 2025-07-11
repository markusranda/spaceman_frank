import { Container, Texture } from "pixi.js";
import { Frank } from "../frank/frank";
import { Universe } from "../universe/universe";

export abstract class SpaceItem {
  id: string;
  texture: Texture;
  description: string;
  level = 1;

  constructor(id: string, texture: Texture, description: string) {
    this.id = id;
    this.texture = texture;
    this.description = description;
  }

  // Default stat modification hooks
  modifyAcceleration(current: number): number {
    return current;
  }

  modifyMaxSpeed(current: number): number {
    return current;
  }

  modifyChargeUpDuration(current: number): number {
    return current;
  }

  modifyChargeCooldown(current: number): number {
    return current;
  }

  modifyMaxFuel(current: number): number {
    return current;
  }

  // Default behavior hook
  update(
    _frank: Frank,
    _universe: Universe,
    _delta: number,
    _container: Container
  ): void {}
}
