/* eslint-disable */

import { Base } from './base'
import {makeNotInteractive} from "./object";

export default class PanTool extends Base {
  constructor (canvas) {
    super(canvas)

    this._isDown = false
    this._lastPosX = null
    this._lastPosY = null

    this._canvas.forEachObject(_ => makeNotInteractive(_))
  }

  configure () {
    this._canvas.isDrawingMode = false
    this._canvas.perPixelTargetFind = false
    this._canvas.selection = false
    this._canvas.defaultCursor = 'grab'
    this._canvas.setCursor('grab')
    this._canvas.forEachObject(_ => makeNotInteractive(_))
  }

  handleMouseDownEvent (opts) {
    if (!this._active) return

    const { x, y } = opts.pointer

    this._isDown = true
    this._lastPosX = x
    this._lastPosY = y
    this._canvas.setCursor('grabbing')
  }

  handleMouseMoveEvent (opts) {
    if (!this._active) return
    if (!this._isDown) return

    const { x, y } = opts.pointer

    this._canvas.viewportTransform[4] += x - this._lastPosX;
    this._canvas.viewportTransform[5] += y - this._lastPosY;
    this._canvas.setCursor('grabbing')
    this._canvas.requestRenderAll()
    this._lastPosX = x
    this._lastPosY = y
  }

  handleMouseUpEvent () {
    if (!this._active) return

    this._isDown = false
    this._lastPosX = null
    this._lastPosY = null
    this._canvas.setCursor('grab')
    this._canvas.forEachObject(_ => _.setCoords())
    this._canvas.requestRenderAll()
  }

  handleObjectAddedEvent (opts) {
    opts.target.set({ selectable: false, evented: false })
  }

  reset () {
    this._isDown = false
    this._lastPosX = null
    this._lastPosY = null
  }
}
