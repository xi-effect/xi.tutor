export type AngleMarkPoint = { x: number; y: number };

function signedMinorDelta(from: number, to: number): number {
  let delta = to - from;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  return delta;
}

export function getInteriorAngleArc(
  vertex: AngleMarkPoint,
  first: AngleMarkPoint,
  second: AngleMarkPoint,
  group = 1,
): { points: AngleMarkPoint[]; radius: number; bisector: AngleMarkPoint; theta: number } {
  const startAngle = Math.atan2(first.y - vertex.y, first.x - vertex.x);
  const endAngle = Math.atan2(second.y - vertex.y, second.x - vertex.x);
  const delta = signedMinorDelta(startAngle, endAngle);
  const theta = Math.abs(delta);
  const radius = 28 + Math.max(group, 1) * 22 + (theta < Math.PI / 3 ? 6 : 0);
  const steps = Math.max(6, Math.ceil(theta / (Math.PI / 16)));
  const points: AngleMarkPoint[] = [];
  for (let index = 0; index <= steps; index += 1) {
    const angle = startAngle + (delta * index) / steps;
    points.push({
      x: vertex.x + Math.cos(angle) * radius,
      y: vertex.y + Math.sin(angle) * radius,
    });
  }
  const midAngle = startAngle + delta / 2;
  return {
    points,
    radius,
    theta,
    bisector: { x: Math.cos(midAngle), y: Math.sin(midAngle) },
  };
}
