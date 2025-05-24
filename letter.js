export class Letter {
  x = 0;
  y = 0;
  radius = undefined;
  angle = (3 * Math.pi) / 2;

  constructor(x, y) {
    this.x = x;
    this.y = y;

    const sprite = new Image();
    sprite.src = "letter.png";
    this.sprite = sprite;
    this.radius = this.sprite.width / 2;
  }
}

export function createLetter(worldX, worldY, objects) {
  const x = Math.round(Math.random() * worldX);
  const y = Math.round(Math.random() * worldY);

  const letter = new Letter(x, y);
  for (const obj of objects) {
    const dx = obj.x - letter.x;
    const dy = obj.y - letter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < obj.radius + letter.radius) {
      // Collision: try again
      return createLetter(worldX, worldY, objects);
    }
  }

  return letter;
}
