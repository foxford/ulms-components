/* eslint-disable */

import Base from './base'

class EraserTool extends Base {
  constructor (canvas) {
    super(canvas)

    this._isDown = false

    this._canvas.forEachObject((_) => {
      Object.assign(_, { selectable: false, evented: false })
    })
  }

  configure (options) {
    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    this._canvas.defaultCursor = 'default'
    this._canvas.setCursor('default')
  }

  handleMouseDownEvent (opts) {
    const { x, y } = this._canvas.getPointer(opts.e, true)

    this._isDown = true

    this._findObjects(x, y)
  }

  handleMouseMoveEvent (opts) {
    if (!this._isDown) return

    const { x, y } = this._canvas.getPointer(opts.e, true)

    this._findObjects(x, y)
  }

  handleMouseUpEvent () {
    this._isDown = false
  }

  _findObjects (x, y) {
    let result = []

    this._canvas.forEachObject((_) => {
      const isTransparent = this._canvas.isTargetTransparent(_, x, y)

      if (!isTransparent) {
        result.push(_)
      }
    })

    if (result.length > 0) {
      this._canvas.remove(...result)
    }
  }
}

export default EraserTool
