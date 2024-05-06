/* globals test, expect */
import {
  fCalcIntermediateCoords,
  fLineX,
  fLineY,
  rangeBounds,
  rotation,
} from './_utils'

// eslint-disable-next-line max-len
const getProjectionPoint = (xy1, xyLower, xyUpper) => (xy2) =>
  fCalcIntermediateCoords(xy2, xy1)(xyLower, xyUpper)

const getRot = (xy1, options) => (xy2) => rotation(xy2, xy1, options)

test('`calcIntermediateCoords` is ok', () => {
  const getXY1 = getProjectionPoint([150, 150], [100, 100], [200, 200])

  /**
   *  y
   * |
   * |    .(0,300)                      .(175,300)     .(300,300)
   * |
   * |
   * |                .(100,200)__.(150,200)__.(200,200)
   * |                |                       |
   * |    .(0,175)    |        .(125,180)     |        .(300, 175)
   * |                .'                      .'
   * |                .(100,150)  .(150,150)  .(200,150)
   * |                |                       |
   * |                |             .(180,125)|
   * |                |                       |
   * |                .(100,100)__.(150,100)__.(200,100)
   * |
   * |    .(0,0)                        .(175,0)       .(300,0)
   * |
   * |__________________________________________________________ x
   *
   * `.'` is the point where line crosses bounds (point' projection)
   *
   */

  expect(getXY1([0, 0])).toEqual([100, 100])
  expect(getXY1([0, 300])).toEqual([100, 200])
  expect(getXY1([300, 300])).toEqual([200, 200])
  expect(getXY1([300, 0])).toEqual([200, 100])

  expect(getXY1([125, 180])).toEqual([125, 180])
  expect(getXY1([180, 125])).toEqual([180, 125])

  expect(getXY1([100, 100])).toEqual([100, 100])
  expect(getXY1([100, 150])).toEqual([100, 150])
  expect(getXY1([100, 200])).toEqual([100, 200])
  expect(getXY1([150, 200])).toEqual([150, 200])
  expect(getXY1([200, 200])).toEqual([200, 200])
  expect(getXY1([200, 150])).toEqual([200, 150])
  expect(getXY1([200, 100])).toEqual([200, 100])
  expect(getXY1([150, 100])).toEqual([150, 100])

  expect(getXY1([0, 175])).toEqual([100, fLineY([150, 150], [0, 175])(100)])
  expect(getXY1([175, 300])).toEqual([fLineX([150, 150], [175, 300])(200), 200])
  expect(getXY1([300, 175])).toEqual([200, fLineY([150, 150], [300, 175])(200)])
  expect(getXY1([175, 0])).toEqual([fLineX([150, 150], [175, 0])(100), 100])
})

test('`rangeBounds` is ok', () => {
  expect(rangeBounds([0, 0], [100, 100])).toEqual([0, 0])
  expect(rangeBounds([10, 10], [100, 100])).toEqual([10, 10])
  expect(rangeBounds([100, 100], [100, 100])).toEqual([100, 100])
  expect(rangeBounds([200, 200], [100, 100])).toEqual([100, 100])

  expect(rangeBounds([0, 0], [200, 200], [100, 100])).toEqual([100, 100])
  expect(rangeBounds([100, 100], [100, 100], [100, 100])).toEqual([100, 100])
  expect(rangeBounds([200, 200], [200, 200], [100, 100])).toEqual([200, 200])
  expect(rangeBounds([300, 300], [200, 200], [100, 100])).toEqual([200, 200])
})

test('`rotation` is ok', () => {
  const regularAxisRotation = getRot([150, 150], { invert: 1 })

  expect(regularAxisRotation([200, 200])).toEqual(45)
  expect(regularAxisRotation([200, 100])).toEqual(135)
  expect(regularAxisRotation([100, 100])).toEqual(225)
  expect(regularAxisRotation([100, 200])).toEqual(-45)

  const invertAxisRotation = getRot([150, 150], { invert: -1 })

  expect(invertAxisRotation([200, 100])).toEqual(45)
  expect(invertAxisRotation([200, 200])).toEqual(135)
  expect(invertAxisRotation([100, 200])).toEqual(225)
  expect(invertAxisRotation([100, 100])).toEqual(-45)
})
