import { Base } from './base'
import { makeNotInteractive } from './object'

export default class PenTool extends Base {
  constructor(canvas) {
    super(canvas)

    this._canvas.forEachObject((_) => makeNotInteractive(_))
  }

  configure(props) {
    this._canvas.isDrawingMode = true
    this._canvas.freeDrawingBrush.color = props.lineColor
    this._canvas.freeDrawingBrush.width = props.lineWidth
    this._canvas.freeDrawingBrush.strokeDashArray = props.dashArray
    this._canvas.freeDrawingBrush.strokeLineCap = 'butt'
    this._canvas.freeDrawingBrush.strokeLineJoin = 'miter'
    this._canvas.freeDrawingBrush.strokeDashOffset = 0
    this._canvas.freeDrawingBrush.strokeMiterLimit = 4
    this._canvas.freeDrawingBrush.strokeUniform = true
    this._canvas.freeDrawingBrush.decimate = 2
    this._canvas.perPixelTargetFind = false
    this._canvas.selection = false
    if (!this._canvas._loading) {
      this._canvas.defaultCursor = 'crosshair'
      this._canvas.setCursor('crosshair')
    }
  }

  // eslint-disable-next-line class-methods-use-this
  handleObjectAddedEvent(options) {
    Object.assign(options.target, { evented: false, selectable: false })
  }

  makeActive() {
    super.makeActive()

    this._canvas.freeDrawingBrush.setActiveValue(true)
    this._canvas.isDrawingMode = true
  }

  makeInactive() {
    super.makeInactive()

    this._canvas.freeDrawingBrush.setActiveValue(false)
    this._canvas.isDrawingMode = false
  }

  reset() {
    this._canvas.freeDrawingBrush.reset()
  }
}
