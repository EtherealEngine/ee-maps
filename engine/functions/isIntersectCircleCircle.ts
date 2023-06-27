import computeSquared from './computeSquaredDistanceFromCircle'

export default function isIntersectCircleCircle(
  centerPointA: [number, number],
  radiusA: number,
  centerPointB: [number, number],
  radiusB: number
): boolean {
  console.log("ISINTERSECT__FN");
  const distanceSquared = computeSquared(centerPointA, centerPointB, radiusB)
  return distanceSquared < radiusA * radiusA
}
