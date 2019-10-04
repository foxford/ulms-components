import {
  fCalcIntermediateCoords,
  fLineX,
  fLineY,
  rangeBounds,
  rotation,
} from '../../src/packages/location-viewport/_utils'

const tap = require('tap')

// eslint-disable-next-line max-len
const getProjectionPoint = (xy1, xyLower, xyUpper) => xy2 => fCalcIntermediateCoords(xy2, xy1)(xyLower, xyUpper)

tap.test('`calcIntermediateCoords` is ok', (test) => {
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

  tap.same(getXY1([0, 0]), [100, 100])
  tap.same(getXY1([0, 300]), [100, 200])
  tap.same(getXY1([300, 300]), [200, 200])
  tap.same(getXY1([300, 0]), [200, 100])

  tap.same(getXY1([125, 180]), [125, 180])
  tap.same(getXY1([180, 125]), [180, 125])

  tap.same(getXY1([100, 100]), [100, 100])
  tap.same(getXY1([100, 150]), [100, 150])
  tap.same(getXY1([100, 200]), [100, 200])
  tap.same(getXY1([150, 200]), [150, 200])
  tap.same(getXY1([200, 200]), [200, 200])
  tap.same(getXY1([200, 150]), [200, 150])
  tap.same(getXY1([200, 100]), [200, 100])
  tap.same(getXY1([150, 100]), [150, 100])

  tap.same(getXY1([0, 175]), [100, (fLineY([150, 150], [0, 175])(100))])
  tap.same(getXY1([175, 300]), [(fLineX([150, 150], [175, 300])(200)), 200])
  tap.same(getXY1([300, 175]), [200, (fLineY([150, 150], [300, 175])(200))])
  tap.same(getXY1([175, 0]), [(fLineX([150, 150], [175, 0])(100)), 100])

  test.end()
})

tap.test('`rangeBounds` is ok', (test) => {
  tap.same(rangeBounds([0, 0], [100, 100]), [0, 0])
  tap.same(rangeBounds([10, 10], [100, 100]), [10, 10])
  tap.same(rangeBounds([100, 100], [100, 100]), [100, 100])
  tap.same(rangeBounds([200, 200], [100, 100]), [100, 100])

  tap.same(rangeBounds([0, 0], [200, 200], [100, 100]), [100, 100])
  tap.same(rangeBounds([100, 100], [100, 100], [100, 100]), [100, 100])
  tap.same(rangeBounds([200, 200], [200, 200], [100, 100]), [200, 200])
  tap.same(rangeBounds([300, 300], [200, 200], [100, 100]), [200, 200])

  test.end()
})

tap.test('`rotation` is ok', (test) => {
  const getRot = (xy1, opts) => xy2 => rotation(xy2, xy1, opts)
  const regularAxisRotation = getRot([150, 150], { invert: 1 })

  tap.same(regularAxisRotation([200, 200]), 45)
  tap.same(regularAxisRotation([200, 100]), 135)
  tap.same(regularAxisRotation([100, 100]), 225)
  tap.same(regularAxisRotation([100, 200]), -45)

  const invertAxisRotation = getRot([150, 150], { invert: -1 })

  tap.same(invertAxisRotation([200, 100]), 45)
  tap.same(invertAxisRotation([200, 200]), 135)
  tap.same(invertAxisRotation([100, 200]), 225)
  tap.same(invertAxisRotation([100, 100]), -45)

  test.end()
})
