import { calcDistance } from '../util'

import { Base } from './base'
import { makeNotInteractive } from './object'
import { WhiteboardArrowLine } from './_primitives'

const MIN_DELTA = 0.2
const POINT_DELTA = 2

export class ArrowTool extends Base {
  constructor (canvas) {
    super(canvas)

    this.__object = null

    this.__isDrawing = false
    this.__isOnCanvas = false
    this.__shiftPressed = false
    this.__startPoint = null

    this._canvas.forEachObject(_ => makeNotInteractive(_))
  }

  configure (props) {
    this.__color = props.lineColor
    this.__width = props.lineWidth
    this.__dash = props.dashArray

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

    this.__object = new WhiteboardArrowLine([], {
      fill: this.__color,
      stroke: this.__color,
      strokeDashArray: this.__dash,
      strokeWidth: this.__width,
      hasControls: false,
      hasBorders: false,
      selectable: false,
      _noHistory: true, // Не сохраняем в undo/redo history
    })

    this.__object.set({
      x1: this.__startPoint.x,
      y1: this.__startPoint.y,
      x2: this.__startPoint.x,
      y2: this.__startPoint.y,
    })
    this.__isDrawing = true
  }

  handleMouseMoveEvent (opts) {
    if (!this._active) return
    if (!this.__isDrawing) return

    const { x, y } = this._canvas.getPointer(opts.e)

    if (this.__isOnCanvas || calcDistance(this.__startPoint, { x, y }) > POINT_DELTA) {
      let diff = {
        x1: this.__startPoint.x,
        y1: this.__startPoint.y,
      }

      if (this.__shiftPressed) {
        const deltaX = Math.abs(this.__startPoint.x - x)
        const signX = Math.sign(this.__startPoint.x - x)
        const deltaY = Math.abs(this.__startPoint.y - y)
        const signY = Math.sign(this.__startPoint.y - y)
        const maxDelta = Math.max(deltaX, deltaY)
        const minDelta = Math.min(deltaX, deltaY)
        const delta = deltaX - deltaY

        if (Math.abs(delta) < (maxDelta * MIN_DELTA)) {
          diff = {
            ...diff, x2: this.__startPoint.x - signX * minDelta, y2: this.__startPoint.y - signY * minDelta,
          }
        } else if (delta > 0) {
          diff = {
            ...diff, x2: x, y2: this.__startPoint.y + 0.001,
          }
        } else {
          diff = {
            ...diff, x2: this.__startPoint.x + 0.001, y2: y,
          }
        }
      } else {
        diff = {
          ...diff, x2: x, y2: y,
        }
      }

      this.__object.set(diff)

      this.__object._id && this._throttledSendMessage(this.__object._id, diff)
      if (!this.__isOnCanvas) {
        this.__isOnCanvas = true
        this._canvas.add(this.__object)
      }

      this._canvas.requestRenderAll()
    }
  }

  handleMouseUpEvent () {
    if (!this._active) return
    if (!this.__isDrawing) return

    if (this.__isOnCanvas) {
      this.__object.set({ _noHistory: undefined })
      // Фиксируем изменения в эвенте
      this._canvas.fire('object:modified', { target: this.__object })
    }

    this.__isDrawing = false
    this.__isOnCanvas = false
    this._canvas.renderAll()
  }

  reset () {
    this._canvas.renderAll()

    this.__isDrawing = false
    this.__isOnCanvas = false
    this.__object = null
  }
}
