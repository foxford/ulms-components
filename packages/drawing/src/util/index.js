/**
 * calcDistance - вычисляет расстояние между двумя точками на доске
 * @param point1 - Point(x, y)
 * @param point2 - Point(x, y)
 * @return {number}
 */
export const calcDistance = (point1, point2) => {
  if (point1 && point2) {
    return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2)
  }

  return 0
}
