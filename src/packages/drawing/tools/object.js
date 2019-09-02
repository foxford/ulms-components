/* eslint-disable */

import { Base } from './base'

const makeNotInteractive = _ => Object.assign(_, { selectable: false, evented: false, hoverCursor: 'crosshair' })

export class PositionableObject extends Base {
  constructor (canvas, objectFn, options = {}) {
    super(canvas)
    this.__options = options
    this.__objectFn = objectFn
    this.__object = undefined

    this._canvas.forEachObject(_ => makeNotInteractive(_))
  }

  configure(props){
    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    this._canvas.defaultCursor = 'crosshair'
    this._canvas.setCursor('crosshair')
  }

  handleObjectAddedEvent (opts) {
    makeNotInteractive(opts.target)
  }

  handleMouseDownEvent(opts){
    this.__object = this.__objectFn()

    const { width, height } = this.__object.getBoundingRect()

    let [dx, dy] = (this.__options.adjustCenter || '0 0').split(' ')
    dx = Number(dx)
    dy = Number(dy)

    this.__object.set('left', opts.absolutePointer.x + (!this.__options.adjustCenter ? 0 : width * dx))
    this.__object.set('top', opts.absolutePointer.y + (!this.__options.adjustCenter ? 0 : height * dy))

    this._canvas.add(this.__object)
  }

  handleMouseUpEvent () {
    this._canvas.defaultCursor = 'crosshair'
    this._canvas.setCursor('crosshair')
  }
}
