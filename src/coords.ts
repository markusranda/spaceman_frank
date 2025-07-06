export function getRandomCoordinateFarFrom(
  x: number,
  y: number,
  minDistance = 400,
  maxDistance = 1000
) {
  const angle = Math.random() * Math.PI * 2;
  const distance = minDistance + Math.random() * (maxDistance - minDistance);

  const newX = x + Math.cos(angle) * distance;
  const newY = y + Math.sin(angle) * distance;

  return { x: newX, y: newY };
}

export function getDistance(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
