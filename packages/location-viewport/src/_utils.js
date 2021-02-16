export const fLineY = ([x1, y1], [x2, y2]) => x => y1 + (y2 - y1) * (x - x1) / (x2 - x1)

export const fLineX = ([x1, y1], [x2, y2]) => y => x1 + (x2 - x1) * (y - y1) / (y2 - y1)

/**
 * Get coordinate according the range
 *
 * @function rangeBound
 * @param  {numer} a
 * @param  {number} high
 * @param  {number} low
 * @return {number}
 */
export const rangeBound = (a, high, low = 0) => (a >= low && a <= high) ? a : (a < low ? low : high)

// eslint-disable-next-line max-len
export const rangeBounds = (a, high, low = [0, 0]) => [rangeBound(a[0], high[0], low[0]), rangeBound(a[1], high[1], low[1])]

/**
 *  Calculates coordinate for the point out of specific range
 *
 *  Returns point' projection on the bound ranges
 *
 *  y
 * |
 * |                                     .(X2,Y2)
 * |
 * |     ----------------------.(upperBoundX,upperBoundY)
 * |    |                      |
 * |    |                 .(Xi,Yi)
 * |    |                      |
 * |    |                      |
 * |    |                      |
 * |    |                      |
 * |    |  .(X1,Y1)            |
 * |    |                      |
 * |    .----------------------
 * |     (lowerBoundX,lowerBoundY)
 * |
 * |
 * |_____________________________________________ x
 *
 * @function fCalcIntermediateCoords
 * @param {Array} xy2 last point for the line
 * @param {Array} xy1 first point for the line. (0,0) by default
 * @return {Function} (a,b) => xyi
 */
export const fCalcIntermediateCoords = ([x2, y2], xy1) => {
  const [x1, y1] = xy1 || [0, 0]

  const getY = fLineY([x1, y1], [x2, y2])
  const getX = fLineX([x1, y1], [x2, y2])

  return ([lowerBoundX, lowerBoundY], [upperBoundX, upperBoundY]) => {
    let result

    if (x2 >= upperBoundX && y2 >= upperBoundY) result = [upperBoundX, upperBoundY]
    if (x2 >= upperBoundX && y2 <= lowerBoundY) result = [upperBoundX, lowerBoundY]
    if (x2 <= lowerBoundX && y2 >= upperBoundY) result = [lowerBoundX, upperBoundY]
    if (x2 <= lowerBoundX && y2 <= lowerBoundY) result = [lowerBoundX, lowerBoundY]

    if (result) return result

    // use bound coordinates for the point' projection
    let x = x2
    let y = y2

    if (x2 > upperBoundX) { x = upperBoundX; y = getY(upperBoundX) }
    if (x2 < lowerBoundX) { x = lowerBoundX; y = getY(lowerBoundX) }
    if (y2 > upperBoundY) { y = upperBoundY; x = getX(upperBoundY) }
    if (y2 < lowerBoundY) { y = lowerBoundY; x = getX(lowerBoundY) }

    result = [x, y]

    return result
  }
}

/**
 *  Calculate vector' direction angle
 *
 * 4                           y                                  1
 *                            |        .(x2,y2)
 *                            |       /
 *                            |      /
 *                            |     /
 *                            | .а /
 *                            |/ \/
 *                            |  /
 *                            | /
 *                            |/
 *  __________________________.(x1,y1)___________________________ x
 *                            |\
 *                            | \
 *                            |  \
 *                            |   \
 *                            |\ / \
 *                            | .a' \
 *                            |      \
 * 3                          |        .(x2',y2')                 2
 * =============================================================================
 *
 * regular
 *                              y
 *                  .(100,200)|        .(200,200)
 *                      -45   |       /
 *                            |      /
 *                            |     /
 *                            | .45/
 *                            |/ \/
 *                            |  /
 *                            | /
 *                            |/
 *  __________________________.(150,150)___________________________ x
 *                            |\
 *                            | \
 *                            |  \
 *                            |   \
 *                            |\ / \
 *                            | .-45\
 *                       45   |      \
 *                  .(100,100)|        .(200,100)
 *
 * x1,y1 = 150,150
 * x2,y2 | 200,200 | 200,100 | 100,100 | 100,200
 * ----- | ------- | ------- | ------- | -------
 *   a   |   45    |   -45   |   45    |   -45
 *
 * angle at 1st and 4th quaters is equal to `defRotation + a`
 * angle at 2nd and 3rd quaters is equal to `defRotation + 180 + a`
 * =============================================================================
 *
 * inverted
 *                  .(100,100)|         .(200,100)
 *                      45    |        /
 *                            |       /
 *                            |      /
 *                            | -45 /
 *                            | .  /
 *                            |/ \/
 *                            |  /
 *                            | /
 *                            |/
 *  __________________________.(150,150)___________________________ x
 *                            |\
 *                            | \
 *                            |  \
 *                            |   \
 *                            |\ / \
 *                            | .45 \
 *                       -45  |      \
 *                  .(100,200)|       .(200,200)
 *                             y
 *
 * x1,y1 = 150,150
 * x2,y2 | 200,200 | 200,100 | 100,100 | 100,200
 * ----- | ------- | ------- | ------- | -------
 *   a   |   45    |   -45   |   45    |   -45
 *
 * angle at 1st and 4th quaters is equal to `defRotation - a`
 * angle at 2nd and 3rd quaters is equal to `defRotation + 180 - a`
 * =============================================================================
 *
 * @function rotation
 * @param  {Array} xy2
 * @param  {Array} xy1
 * @param  {Object} opts
 * @param  {number} opts.defRotation allows adjust rotation with any
 *  user-specific value like image's default angle, etc
 * @param  {number} opts.invert describes Y axis' direction
 * @return {number}
 */
export const rotation = (xy2, xy1, opts) => {
  const { defRotation = 0, invert = -1 } = opts
  const [x2, y2] = xy2
  const [x1, y1] = xy1

  const radToDeg = a => a * 180 / Math.PI
  const yDirection = invert === 1 ? 1 : -1
  const isInverted = invert === -1

  const at23Quater = (isInverted ? (y2 > y1) : (y2 < y1)) ? 180 : 0

  const angle = radToDeg(Math.atan((x2 - x1) / (y2 - y1)))

  return defRotation + at23Quater + yDirection * angle
}
