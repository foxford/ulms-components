/**
 * calcDistance - вычисляет расстояние между двумя точками на доске
 * @param point1 - Point(x, y)
 * @param point2 - Point(x, y)
 * @return {number}
 */
export const calcDistance = (point1, point2) => {
  if (point1 && point2) {
    // eslint-disable-next-line unicorn/prefer-modern-math-apis
    return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2)
  }

  return 0
}

export function snapCoord(coord) {
  return Math.round(coord / 10) * 10
}
