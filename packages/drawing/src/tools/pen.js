/* eslint-disable */

import { Base } from './base'

export default class PenTool extends Base {
  constructor (canvas) {
    super(canvas)

    this._canvas.forEachObject((_) => {
      Object.assign(_, { evented: false, selectable: false })
    })
  }

  configure (props) {
    this._canvas.isDrawingMode = true
    this._canvas.freeDrawingBrush.color = props.lineColor
    this._canvas.freeDrawingBrush.width = props.lineWidth
    this._canvas.freeDrawingBrush.decimate = 2
    this._canvas.perPixelTargetFind = false
    this._canvas.selection = false
    this._canvas.defaultCursor = 'crosshair'
    this._canvas.setCursor('crosshair')
  }

  handleObjectAddedEvent (opts) {
    Object.assign(opts.target, { evented: false, selectable: false })
  }

  makeActive () {
    super.makeActive()

    this._canvas.freeDrawingBrush.setActiveValue(true)
    this._canvas.isDrawingMode = true
  }

  makeInactive () {
    super.makeInactive()

    this._canvas.freeDrawingBrush.setActiveValue(false)
    this._canvas.isDrawingMode = false
  }

  reset () {
    this._canvas.freeDrawingBrush.reset()
  }
}
