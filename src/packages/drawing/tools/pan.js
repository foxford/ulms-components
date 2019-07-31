/* eslint-disable */

import Base from './base'

export default class PanTool extends Base {
  constructor (canvas) {
    super(canvas)

    this._isDown = false
    this._lastPosX = null
    this._lastPosY = null

    this._canvas.forEachObject((_) => {
      Object.assign(_, { selectable: false, evented: false })
    })
  }

  configure () {
    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    this._canvas.defaultCursor = 'grab'
    this._canvas.setCursor('grab')
  }

  handleMouseDownEvent (opts) {
    const { clientX, clientY } = opts.e

    this._isDown = true
    this._lastPosX = clientX
    this._lastPosY = clientY
    this._canvas.setCursor('grabbing')
  }

  handleMouseMoveEvent (opts) {
    if (!this._isDown) return

    const { clientX, clientY } = opts.e

    this._canvas.viewportTransform[4] += clientX - this._lastPosX;
    this._canvas.viewportTransform[5] += clientY - this._lastPosY;
    this._canvas.setCursor('grabbing')
    this._canvas.requestRenderAll()
    this._lastPosX = clientX
    this._lastPosY = clientY
  }

  handleMouseUpEvent () {
    this._isDown = false
    this._lastPosX = null
    this._lastPosY = null
    this._canvas.setCursor('grab')
  }

  handleObjectAddedEvent (opts) {
    Object.assign(opts.target, { selectable: false, evented: false })
  }
}
