export class Letter {
  x = 0;
  y = 0;
  radius = undefined;
  angle = (3 * Math.pi) / 2;
  id = "";

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.id = `letter_${new Date().getUTCMilliseconds()}_${Math.random()}`;

    const sprite = new Image();
    sprite.src = "letter.png";
    this.sprite = sprite;
    this.radius = this.sprite.width / 2;
  }
}

export function createLetter(worldX, worldY, planets) {
  const x = Math.round(Math.random() * worldX);
  const y = Math.round(Math.random() * worldY);

  const letter = new Letter(x, y);
  for (const planet of planets) {
    const dx = planet.x - letter.x;
    const dy = planet.y - letter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < planet.radius + letter.radius) {
      // Collision: try again
      return createLetter(worldX, worldY, planets);
    }
  }

  return letter;
}
