import { SpaceItem } from "./items/space_item";

export class GameStats {
  public planetsEaten = 0;
  public enemiesEaten = 0;
  public frankSize = 0;
  public frankItems: Record<string, SpaceItem> = {};
  public universeRadius = 0;

  constructor() {}
}
