import { Base } from './base'

const areSamePoints = ([xy1, xy2]) => xy1[0] === xy2[0] && xy1[1] === xy2[1]

const isContinuous = ([xy1, xy2]) => xy1[0] === xy2[0] || xy1[1] === xy2[1]

const getLineY = ([x1, y1], [x2, y2]) => x => y1 + (y2 - y1) * (x - x1) / (x2 - x1)

const getCircleY = ([x0, y0], r) => (x) => {
  const coord = Math.sqrt(r ** 2 - (x - x0) ** 2)

  return [y0 - coord, y0 + coord]
}

const getCirclePath = ([x0, y0], r) => {
  const getYByX = getCircleY([x0, y0], r)
  let circlePath = []

  for (let xx = x0 - r; xx <= x0 + r; xx++) {
    const maybeY = getYByX(xx)

    circlePath = circlePath.concat([[xx, maybeY[0]], [xx, maybeY[1]]])
  }

  return circlePath.slice(1, -1)
  // remove same coords on edges
}

const getConcentricPath = (point, r, opts) => {
  let resultPath = [point]
  // save initial point (center)

  for (let i = 0; i <= r; i += opts.precision || 1) {
    if (i !== 0) resultPath = resultPath.concat(getCirclePath(point, i))
  }

  return resultPath
}

const getLinePathByTuple = (tuple) => {
  // TODO: maybe we should use precision parameter here
  const realPath = []
  const [xy1, xy2] = tuple
  const getYByX = getLineY(xy1, xy2)
  let result = xy1

  for (let x = xy1[0]; x < xy2[0]; x++) {
    if (x !== xy1[0]) result = [x, getYByX(x)]

    realPath.push(result)
  }

  realPath.push(xy2)
  // append last point

  return realPath
}

const aproximateByTuple = (acc, tuple) => {
  const realPath = getLinePathByTuple(tuple)

  // eslint-disable-next-line no-param-reassign
  acc = acc.concat(realPath)

  return acc
}

function makeAproximatedVector (vector) {
  let uniquePath = [vector[0]]
  let prevPoint
  let eachTuple

  vector.forEach((point, i) => {
    if (i !== 0) {
      // skip initial point

      prevPoint = uniquePath[uniquePath.length - 1]
      eachTuple = [prevPoint, point]

      if (!areSamePoints(eachTuple)) {
        const hasBreak = !isContinuous(eachTuple)
        // decide if there is no break between two points

        if (hasBreak) {
          uniquePath = aproximateByTuple(uniquePath, eachTuple)
          // here we calculate posible point coordinates across the break
        } else {
          uniquePath.push(point)
        }
      }
    }
  })

  return uniquePath
}

function adjustPath (vector, opts) {
  let realPath = vector

  if (opts.precision !== 1) realPath = vector.filter((_, i) => !(i % opts.precision))

  return realPath
}

const gotIntersection = (path, predicate) => Boolean(~path.findIndex(xy => predicate(xy[0], xy[1])))

function isNotTransparentOnArea (context, object, {
  r, x, y,
}, opts) {
  const circlePath = getConcentricPath([x, y], r, opts)

  return gotIntersection(circlePath, (_x, _y) => !context.isTargetTransparent(object, _x, _y))
}

export default class EraserTool extends Base {
  constructor (canvas) {
    super(canvas)

    this._isDown = false
    this._isContinuousDraw = []
    this._width = 1
    this._precision = 1

    this._canvas.forEachObject((_) => {
      Object.assign(_, { selectable: false, evented: false })
    })
  }

  __applyEraseByPath (_) {
    const result = []

    const realPath = adjustPath(makeAproximatedVector((_)), { precision: this._precision })

    this._canvas.forEachObject((object) => {
      realPath.forEach((point) => {
        if (!this._canvas.isTargetTransparent(object, point[0], point[1])) {
          result.push(object)
        }
      })
    })

    return result
  }

  __applyEraseByPoint ([x, y]) {
    const result = []

    this._canvas.forEachObject((_) => {
      const isNotTransparent = isNotTransparentOnArea(this._canvas, _, {
        r: this._width, x, y,
      }, { precision: this._precision })

      if (isNotTransparent) {
        result.push(_)
      }
    })

    return result
  }

  __removeObjects (list) {
    if (list.length > 0) {
      this._canvas.remove(...list)
    }
  }

  configure (options) {
    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    this._canvas.defaultCursor = 'cell'
    this._canvas.setCursor('cell')

    this._width = options.eraserWidth || this._width
    this._precision = options.precision || this._precision
  }

  handleMouseDownEvent (opts) {
    const { x, y } = this._canvas.getPointer(opts.e, true)

    this._isDown = true
    this._isContinuousDraw = []
    // cleanup eraser path

    this._isContinuousDraw.push([x, y])
  }

  handleMouseMoveEvent (opts) {
    if (!this._isDown) return

    const { x, y } = this._canvas.getPointer(opts.e, true)

    this._isContinuousDraw.push([x, y])
    // push any tuple on position update
    // path will be applied later on mouseup event
  }

  handleMouseUpEvent () {
    this._isDown = false
    if (!this._isContinuousDraw.length) return

    let list

    if (this._isContinuousDraw.length === 1) {
      list = this.__applyEraseByPoint(this._isContinuousDraw[0])
      this._isContinuousDraw = []
    } else

    if (this._isContinuousDraw.length > 1) {
      list = this.__applyEraseByPath(this._isContinuousDraw)
      this._isContinuousDraw = []
    }

    if (list) this.__removeObjects(list)
  }
}
