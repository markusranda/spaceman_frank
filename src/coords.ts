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

export function getIntersectionPoint(
  fx: number,
  fy: number,
  px: number,
  py: number,
  pr: number
) {
  const dx = fx - px;
  const dy = fy - py;
  const dist = Math.hypot(dx, dy);

  if (dist === 0) return { x: px, y: py }; // fallback for exact overlap

  const nx = dx / dist;
  const ny = dy / dist;

  // Contact point on the planet's edge
  const contactX = px + nx * pr;
  const contactY = py + ny * pr;

  return { x: contactX, y: contactY };
}
