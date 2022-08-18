import { fabric } from 'fabric/dist/fabric.min'

import { calcDistance } from '../util'

import { Base } from './base'
import { makeNotInteractive } from './object'
import { WhiteboardLine } from './_primitives'

const MIN_DELTA = 0.2
const POINT_DELTA = 5

export class LineTool extends Base {
  constructor (canvas) {
    super(canvas)

    this.__draftLine = new fabric.Line([], {
      hasControls: false,
      hasBorders: false,
      selectable: false,
      _draft: true,
    })

    this.__isDrawing = false
    this.__shiftPressed = false
    this.__startPoint = null

    this._canvas.forEachObject(_ => makeNotInteractive(_))
  }

  configure (props) {
    this._color = props.lineColor
    this._width = props.lineWidth
    this._dash = props.dashArray

    this.__draftLine.set({
      fill: this._color,
      stroke: this._color,
      strokeWidth: this._width,
      strokeDashArray: this._dash,
    })

    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    this._canvas.defaultCursor = 'crosshair'
    this._canvas.setCursor('crosshair')

    // In order not to bypass objects every time, we pass only when the brush is initialized
    if (props.initial) {
      this._canvas.forEachObject(_ => makeNotInteractive(_))
    }
  }

  handleKeyDownEvent (e) {
    if (!this._active) return

    this.__shiftPressed = e.shiftKey
  }

  handleKeyUpEvent (e) {
    if (!this._active) return

    this.__shiftPressed = e.shiftKey
  }

  // eslint-disable-next-line class-methods-use-this
  handleObjectAddedEvent (opts) {
    makeNotInteractive(opts.target)
  }

  handleMouseDownEvent (opts) {
    if (!this._active) return

    this.__startPoint = this._canvas.getPointer(opts.e)
    this.__draftLine.set({
      'x1': this.__startPoint.x, 'y1': this.__startPoint.y, 'x2': this.__startPoint.x, 'y2': this.__startPoint.y,
    })

    this._canvas.add(this.__draftLine)
    this.__isDrawing = true
  }

  handleMouseMoveEvent (opts) {
    if (!this._active) return
    if (!this.__isDrawing) return

    const { x, y } = this._canvas.getPointer(opts.e)

    if (this.__shiftPressed) {
      const deltaX = Math.abs(this.__startPoint.x - x)
      const signX = Math.sign(this.__startPoint.x - x)
      const deltaY = Math.abs(this.__startPoint.y - y)
      const signY = Math.sign(this.__startPoint.y - y)
      const maxDelta = Math.max(deltaX, deltaY)
      const minDelta = Math.min(deltaX, deltaY)
      const delta = deltaX - deltaY

      if (Math.abs(delta) < (maxDelta * MIN_DELTA)) {
        this.__draftLine.set({ 'x2': this.this.__startPoint.x - signX * minDelta, 'y2': this.__startPoint.y - signY * minDelta })
      } else if (delta > 0) {
        this.__draftLine.set({ 'x2': x, 'y2': this.__startPoint.y })
      } else {
        this.__draftLine.set({ 'x2': this.__startPoint.x, 'y2': y })
      }
    } else {
      this.__draftLine.set({ 'x2': x, 'y2': y })
    }

    this._canvas.requestRenderAll()
  }

  handleMouseUpEvent (opts) {
    if (!this._active) return
    if (!this.__isDrawing) return

    // Skipping point click
    if (calcDistance(this.__startPoint, this._canvas.getPointer(opts.e)) > POINT_DELTA) {
      this._canvas.remove(this.__draftLine)
      this.__isDrawing = false
      this._canvas.renderAll()

      return
    }

    const line = new WhiteboardLine([
      this.__draftLine.x1,
      this.__draftLine.y1,
      this.__draftLine.x2,
      this.__draftLine.y2,
    ], {
      fill: this._color,
      stroke: this._color,
      strokeWidth: this._width,
      strokeDashArray: this._dash,
    })

    line.set({ '_new': true })

    this._canvas.add(line)

    this._canvas.remove(this.__draftLine)
    this.__isDrawing = false
    this._canvas.renderAll()
  }

  reset () {
    this._canvas.remove(this.__draftLine)
    this._canvas.renderAll()

    this.__isDrawing = false
    this.__shiftPressed = false
    this.__startPoint = null
  }
}
