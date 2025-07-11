import { Entity } from "./entity";

export function detectEntityCollisions<T extends Entity>(
  entities: T[],
  x: number,
  y: number,
  radius: number
) {
  const collisions: T[] = [];

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const dx = x - entity.x;
    const dy = y - entity.y;
    const dist = Math.hypot(dx, dy);
    const minDist = radius + entity.radius;
    if (dist < minDist) {
      collisions.push(entity);
    }
  }

  return collisions;
}
