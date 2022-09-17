import { Base } from './base'

export const makeNotInteractive = (_) => {
  _.set({
    selectable: false, evented: false, hoverCursor: 'crosshair',
  })
}

export const makeInteractive = (_) => {
  _.set({
    selectable: true, evented: true, hoverCursor: 'move',
  })
}

export const adjustPosition = (object, pointer, adjust) => {
  const { width, height } = object.getBoundingRect()

  let [dx, dy] = (adjust || '0 0').split(' ')

  dx = Number(dx) || 0
  dy = Number(dy) || 0

  return [pointer.x + width * dx, pointer.y + height * dy]
}

export class PositionableObject extends Base {
  constructor (canvas, objectFn, options = {}) {
    super(canvas)

    this.__object = undefined
    this.__objectFn = objectFn
    this.__options = options
  }

  configure () {
    this._canvas.isDrawingMode = false
    this._canvas.perPixelTargetFind = false
    this._canvas.selection = false
    this._canvas.defaultCursor = 'crosshair'
    this._canvas.setCursor('crosshair')
    this._canvas.forEachObject(_ => makeNotInteractive(_))
  }

  __resolveObject () {
    this.__object = this.__objectFn()
  }

  // eslint-disable-next-line class-methods-use-this
  handleObjectAddedEvent (opts) {
    makeNotInteractive(opts.target)
  }

  handleMouseDownEvent (opts) {
    this.__resolveObject(opts)

    const [x, y] = adjustPosition(this.__object, opts.absolutePointer, this.__options.adjustCenter)

    this.__object.set('left', x)
    this.__object.set('top', y)

    this._canvas.add(this.__object)
  }

  handleMouseUpEvent () {
    this._canvas.defaultCursor = 'crosshair'
    this._canvas.setCursor('crosshair')
  }
}
