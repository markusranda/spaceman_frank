export class Mailbox {
  x = 0;
  y = 0;
  radius = undefined;

  constructor(x, y) {
    this.x = x;
    this.y = y;

    const sprite = new Image();
    sprite.src = "mailbox.png";
    this.sprite = sprite;
    this.radius = this.sprite.width / 2;
  }
}

export function createMailbox(worldX, worldY, planets) {
  const x = Math.round(Math.random() * worldX);
  const y = Math.round(Math.random() * worldY);

  const mailbox = new Mailbox(x, y);
  for (const planet of planets) {
    const dx = planet.x - mailbox.x;
    const dy = planet.y - mailbox.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < planet.radius + mailbox.radius) {
      // Collision: try again
      return createMailbox(worldX, worldY, planets);
    }
  }

  return mailbox;
}
