import { calcDistance, snapCoord } from '../util'

import { Base } from './base'
import { makeNotInteractive } from './object'
import { WhiteboardLine } from './_primitives'

const MIN_DELTA = 0.2
const POINT_DELTA = 2

// eslint-disable-next-line import/prefer-default-export
export class LineTool extends Base {
  constructor(canvas) {
    super(canvas)

    this.__object = null

    this.__isDrawing = false
    this.__isOnCanvas = false
    this.__shiftPressed = false
    this.__cmdPressed = false
    this.__ctrlPressed = false
    this.__startPoint = null
    this.__currentPoint = null

    this._canvas.forEachObject((_) => makeNotInteractive(_))
  }

  _createObject() {
    this.__object = new WhiteboardLine([], {
      fill: this.__color,
      stroke: this.__color,
      strokeDashArray: this.__dash,
      strokeWidth: this.__width,
      hasControls: false,
      hasBorders: false,
      selectable: false,
      _noHistory: true, // Не сохраняем в undo/redo history
    })
  }

  configure(props) {
    this.__color = props.lineColor
    this.__width = props.lineWidth
    this.__dash = props.dashArray

    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    if (!this._canvas._loading) {
      this._canvas.defaultCursor = 'crosshair'
      this._canvas.setCursor('crosshair')
    }
    // In order not to bypass objects every time, we pass only when the brush is initialized
    if (props.initial) {
      this._canvas.forEachObject((_) => makeNotInteractive(_))
    }
  }

  #handleKeyEvent(event) {
    if (!this._active) return

    const changed =
      this.__shiftPressed !== event.shiftKey ||
      this.__cmdPressed !== event.metaKey ||
      this.__ctrlPressed !== event.ctrlKey

    this.__shiftPressed = event.shiftKey
    this.__cmdPressed = event.metaKey
    this.__ctrlPressed = event.ctrlKey

    if (changed) this._reshape()
  }

  handleKeyDownEvent(event) {
    this.#handleKeyEvent(event)
  }

  handleKeyUpEvent(event) {
    this.#handleKeyEvent(event)
  }

  #preparePoint(event) {
    const point = this._canvas.getPointer(event)

    if (!(this.__cmdPressed || this.__ctrlPressed)) {
      return point
    }

    point.x = snapCoord(point.x)
    point.y = snapCoord(point.y)

    return point
  }

  // eslint-disable-next-line class-methods-use-this
  handleObjectAddedEvent(options) {
    makeNotInteractive(options.target)
  }

  handleMouseDownEvent(options) {
    if (!this._active) return

    this.__startPoint = this.#preparePoint(options.e)

    this._createObject()

    this.__object.set({
      x1: this.__startPoint.x,
      y1: this.__startPoint.y,
      x2: this.__startPoint.x,
      y2: this.__startPoint.y,
    })
    this.__isDrawing = true
  }

  handleMouseMoveEvent(options) {
    if (!this._active) return
    if (!this.__isDrawing) return

    this.__currentPoint = this.#preparePoint(options.e)
    this._reshape()
  }

  _reshape() {
    if (!this.__isDrawing) return

    const { x, y } = this.__currentPoint

    if (
      this.__isOnCanvas ||
      calcDistance(this.__startPoint, { x, y }) > POINT_DELTA
    ) {
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

        if (Math.abs(delta) < maxDelta * MIN_DELTA) {
          diff = {
            ...diff,
            x2: this.__startPoint.x - signX * minDelta,
            y2: this.__startPoint.y - signY * minDelta,
          }
        } else if (delta > 0) {
          diff = {
            ...diff,
            x2: x,
            y2: this.__startPoint.y + 0.001,
          }
        } else {
          diff = {
            ...diff,
            x2: this.__startPoint.x + 0.001,
            y2: y,
          }
        }
      } else {
        diff = {
          ...diff,
          x2: x,
          y2: y,
        }
      }

      this.__object.set(diff)

      if (this.__object._id) {
        this._throttledSendMessage(this.__object._id, diff)
      }

      if (!this.__isOnCanvas) {
        this.__isOnCanvas = true
        this._canvas.add(this.__object)
      }

      this._canvas.requestRenderAll()
    }
  }

  handleMouseUpEvent() {
    if (!this._active) return
    if (!this.__isDrawing) return

    if (this.__isOnCanvas) {
      this.__object.set({ _noHistory: undefined })
      // Чтобы объект можно было выделить!
      this.__object.setCoords()
      // Фиксируем изменения в эвенте
      this._canvas.fire('object:modified', { target: this.__object })
    }

    this.__isDrawing = false
    this.__isOnCanvas = false
    this._canvas.renderAll()
  }

  reset() {
    this._canvas.renderAll()

    this.__isDrawing = false
    this.__isOnCanvas = false
    this.__startPoint = null
    this.__currentPoint = null
  }
}
