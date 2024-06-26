import { fabric } from 'fabric/dist/fabric.min'

import { LockProvider } from '../lock-provider'

import { Base } from './base'

const areSamePoints = ([xy1, xy2]) => xy1[0] === xy2[0] && xy1[1] === xy2[1]

const isContinuous = ([xy1, xy2]) => xy1[0] === xy2[0] || xy1[1] === xy2[1]

const getLineY =
  ([x1, y1], [x2, y2]) =>
  (x) =>
    y1 + ((y2 - y1) * (x - x1)) / (x2 - x1)

const getCircleY =
  ([x0, y0], r) =>
  (x) => {
    const coord = Math.sqrt(r ** 2 - (x - x0) ** 2)

    return [y0 - coord, y0 + coord]
  }

const getCirclePath = ([x0, y0], r) => {
  const getYByX = getCircleY([x0, y0], r)
  let circlePath = []

  for (let xx = x0 - r; xx <= x0 + r; xx++) {
    const maybeY = getYByX(xx)

    circlePath = [...circlePath, [xx, maybeY[0]], [xx, maybeY[1]]]
  }

  return circlePath.slice(1, -1)
  // remove same coords on edges
}

const getConcentricPath = (point, r, options) => {
  let resultPath = [point]
  // save initial point (center)

  for (let index = 0; index <= r; index += options.precision || 1) {
    if (index !== 0)
      resultPath = [...resultPath, ...getCirclePath(point, index)]
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

const aproximateByTuple = (accumulator, tuple) => {
  const realPath = getLinePathByTuple(tuple)

  // eslint-disable-next-line no-param-reassign
  accumulator = [...accumulator, ...realPath]

  return accumulator
}

function makeAproximatedVector(vector) {
  let uniquePath = [vector[0]]
  let previousPoint
  let eachTuple

  for (const [index, point] of vector.entries()) {
    if (index !== 0) {
      // skip initial point

      previousPoint = uniquePath.at(-1)
      eachTuple = [previousPoint, point]

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
  }

  return uniquePath
}

function adjustPath(vector, options) {
  let realPath = vector

  if (options.precision !== 1)
    realPath = vector.filter((_, index) => !(index % options.precision))

  return realPath
}

const gotIntersection = (path, predicate) =>
  // eslint-disable-next-line no-bitwise
  Boolean(~path.findIndex((xy) => predicate(xy[0], xy[1])))

function isNotTransparentOnArea(context, object, { r, x, y }, options) {
  const circlePath = getConcentricPath([x, y], r, options)

  return gotIntersection(
    circlePath,
    (_x, _y) => !context.isTargetTransparent(object, _x, _y),
  )
}

export default class EraserTool extends Base {
  constructor(canvas) {
    super(canvas)

    this._isDown = false
    this._isContinuousDraw = []
    this._width = 1
    this._precision = 1

    this._canvas.forEachObject((_) => {
      Object.assign(_, { selectable: false, evented: false })
    })
  }

  __applyEraseByPath(_) {
    const result = []

    const realPath = adjustPath(makeAproximatedVector(_), {
      precision: this._precision,
    })

    this._canvas.forEachObject((object) => {
      if (!object.isOnScreen()) return
      if (LockProvider.isLocked(object)) return

      for (const point of realPath) {
        const p = new fabric.Point(point[0], point[1])

        // eslint-disable-next-line no-continue
        if (!object.containsPoint(p)) continue

        if (!this._canvas.isTargetTransparent(object, point[0], point[1])) {
          result.push(object)
        }
      }
    })

    return result
  }

  __applyEraseByPoint([x, y]) {
    const result = []
    const point = new fabric.Point(x, y)

    this._canvas.forEachObject((object) => {
      if (!object.isOnScreen() || !object.containsPoint(point)) return
      if (LockProvider.isLocked(object)) return

      const isNotTransparent = isNotTransparentOnArea(
        this._canvas,
        object,
        {
          r: this._width,
          x,
          y,
        },
        { precision: this._precision },
      )

      if (isNotTransparent) {
        result.push(object)
      }
    })

    return result
  }

  __removeObjects(list) {
    if (list.length > 0) {
      this._canvas.remove(...list)
    }
  }

  configure(options) {
    this._canvas.isDrawingMode = false
    this._canvas.perPixelTargetFind = true
    this._canvas.selection = false
    if (!this._canvas._loading) {
      this._canvas.defaultCursor = 'cell'
      this._canvas.setCursor('cell')
    }

    this._width = options.eraserWidth || this._width
    this._precision = options.precision || this._precision
  }

  handleMouseDownEvent(options) {
    if (!this._active) return

    const { x, y } = this._canvas.getPointer(options.e, true)

    this._isDown = true
    this._isContinuousDraw = []
    // cleanup eraser path

    this._isContinuousDraw.push([x, y])
  }

  handleMouseMoveEvent(options) {
    if (!this._active) return
    if (!this._isDown) return

    const { x, y } = this._canvas.getPointer(options.e, true)

    this._isContinuousDraw.push([x, y])
    // push any tuple on position update
    // path will be applied later on mouseup event
  }

  handleMouseUpEvent() {
    if (!this._active) return

    this._isDown = false

    if (this._isContinuousDraw.length === 0) return

    let list

    if (this._isContinuousDraw.length === 1) {
      list = this.__applyEraseByPoint(this._isContinuousDraw[0])
      this._isContinuousDraw = []
    } else if (this._isContinuousDraw.length > 1) {
      list = this.__applyEraseByPath(this._isContinuousDraw)
      this._isContinuousDraw = []
    }

    if (list) this.__removeObjects(list)
  }

  reset() {
    this._isDown = false
    this._isContinuousDraw = []
  }
}
