export function getRandomCoordinateFarFrom(
  x,
  y,
  minDistance = 400,
  maxDistance = 1000
) {
  const angle = Math.random() * Math.PI * 2;
  const distance = minDistance + Math.random() * (maxDistance - minDistance);

  const newX = x + Math.cos(angle) * distance;
  const newY = y + Math.sin(angle) * distance;

  return { x: newX, y: newY };
}
