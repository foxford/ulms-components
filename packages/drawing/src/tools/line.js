import { fabric } from 'fabric/dist/fabric.min'

import { Base } from './base'
import { makeNotInteractive } from './object'
import { WhiteboardLine } from './_primitives'

const MIN_DELTA = 0.2
const POINT_DELTA = 5

export class LineTool extends Base {
  constructor (canvas) {
    super(canvas)

    this._draftLine = new fabric.Line([], {
      fill: 'red',
      stroke: 'red',
      strokeDashArray: [5, 5],
      strokeWidth: 3,
      hasControls: false,
      hasBorders: false,
      selectable: false,
    })
    this._draftLine.set('_draft', true)

    this._isDrawing = false
    this._shiftPressed = false
    this._startX = 0
    this._startY = 0

    this._canvas.forEachObject((_) => {
      Object.assign(_, { evented: false, selectable: false })
    })
  }

  __pointCkick (x, y) {
    return (Math.abs(this._startX - x) < POINT_DELTA)
      && (Math.abs(this._startY - y) < POINT_DELTA)
  }

  configure (props) {
    this._color = props.lineColor
    this._width = props.lineWidth
    this._dash = props.dashArray

    this._draftLine.set({
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

    this._shiftPressed = e.shiftKey
  }

  handleKeyUpEvent (e) {
    if (!this._active) return

    this._shiftPressed = e.shiftKey
  }

  // eslint-disable-next-line class-methods-use-this
  handleObjectAddedEvent (opts) {
    makeNotInteractive(opts.target)
  }

  handleMouseDownEvent (opts) {
    if (!this._active) return

    const { x, y } = this._canvas.getPointer(opts.e)

    this._startX = x
    this._startY = y
    this._draftLine.set({
      'x1': x, 'y1': y, 'x2': x, 'y2': y,
    })

    this._canvas.add(this._draftLine)
    this._isDrawing = true
  }

  handleMouseMoveEvent (opts) {
    if (!this._active) return
    if (!this._isDrawing) return

    const { x, y } = this._canvas.getPointer(opts.e)

    if (this._shiftPressed) {
      const deltaX = Math.abs(this._startX - x)
      const signX = Math.sign(this._startX - x)
      const deltaY = Math.abs(this._startY - y)
      const signY = Math.sign(this._startY - y)
      const maxDelta = Math.max(deltaX, deltaY)
      const minDelta = Math.min(deltaX, deltaY)
      const delta = deltaX - deltaY

      if (Math.abs(delta) < (maxDelta * MIN_DELTA)) {
        this._draftLine.set({ 'x2': this._startX - signX * minDelta, 'y2': this._startY - signY * minDelta })
      } else if (delta > 0) {
        this._draftLine.set({ 'x2': x, 'y2': this._startY })
      } else {
        this._draftLine.set({ 'x2': this._startX, 'y2': y })
      }
    } else {
      this._draftLine.set({ 'x2': x, 'y2': y })
    }

    this._canvas.requestRenderAll()
  }

  handleMouseUpEvent (opts) {
    if (!this._active) return
    if (!this._isDrawing) return

    const { x, y } = this._canvas.getPointer(opts.e)

    // Skipping point click
    if (this.__pointCkick(x, y)) {
      this._canvas.remove(this._draftLine)
      this._isDrawing = false
      this._canvas.renderAll()

      return
    }

    const line = new WhiteboardLine([
      this._draftLine.x1,
      this._draftLine.y1,
      this._draftLine.x2,
      this._draftLine.y2,
    ], {
      fill: this._color,
      stroke: this._color,
      strokeWidth: this._width,
      strokeDashArray: this._dash,
    })

    line.set({ '_new': true })

    this._canvas.add(line)

    this._canvas.remove(this._draftLine)
    this._isDrawing = false
    this._canvas.renderAll()
  }

  reset () {
    this._canvas.remove(this._draftLine)
    this._canvas.renderAll()

    this._isDrawing = false
    this._shiftPressed = false
    this._startX = 0
    this._startY = 0
  }
}
